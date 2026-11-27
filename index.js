/**
 * Host half of `dsh-image-canvas`.
 *
 * The browser cannot call an image provider directly: the API key would live in
 * page memory, and the provider's CORS headers decide whether the request is
 * allowed at all. So every byte this plugin persists, and every call it sends
 * upstream, goes through this Node half:
 *
 *   - `/image-canvas/settings` reads and writes the provider settings; the key
 *     itself never travels back to the browser, only its presence and mask.
 *   - `/image-canvas/state` persists the whole canvas document (nodes, edges,
 *     viewport) so reopening DSH restores the board.
 *   - `/image-canvas/assets` is a content-addressed image store: an upload is
 *     named by its SHA-256, so the same picture is stored once and can be
 *     cached forever by the browser.
 *   - `/image-canvas/generate` forwards text-to-image and image-to-image calls
 *     to an OpenAI-compatible provider and stores whatever comes back.
 *
 * Only `node:` builtins are imported, so the bundle needs no dependency tree.
 *
 * @module dsh-image-canvas
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** Route prefix owned by this plugin. */
const PREFIX = '/image-canvas'
/** Largest upload accepted for one asset. */
const ASSET_MAX_BYTES = 24 * 1024 * 1024
/** Largest persisted canvas document; a board of many nodes stays far below. */
const STATE_MAX_BYTES = 24 * 1024 * 1024
/** Upstream image generation is slow; keep well above the provider's own cap. */
const GENERATE_TIMEOUT_MS = 300_000
/** Unreferenced assets are deleted only after this age, so a fresh upload survives. */
const ASSET_GRACE_MS = 24 * 60 * 60 * 1000

const DEFAULT_BASE_URL = 'https://sub-proxy-us.65535.space'
const DEFAULT_MODEL = 'gpt-image-2.5-flare'

/**
 * Where the model catalogue comes from.
 *
 * The provider publishes an OpenAI-compatible `/v1/models`, but it carries no
 * prices and lists video models too. Its console API carries both: each entry
 * is tagged `image` / `video` / `chat` and priced in micro-USD. Asking the
 * console therefore yields exactly the models this canvas can call, with the
 * price the user actually pays once the account's group multiplier is applied.
 *
 * The group matters: without `?group=`, usage-priced models report 0 and
 * per-request models report the un-discounted rate. The console is read
 * anonymously, so no credential ever leaves this machine for it.
 */
const CATALOG_BASE = 'https://my.65535.space/api/catalog'
/** The console's default group when the account has not named one. */
const CATALOG_DEFAULT_GROUP = '任务专用分组'
const CATALOG_TIMEOUT_MS = 12_000
const CATALOG_MAX_BYTES = 512 * 1024
/** The list changes when the provider adds models, not minute to minute. */
const CATALOG_TTL_MS = 30 * 60 * 1000
const CATALOG_FAILURE_TTL_MS = 60 * 1000

/**
 * Fallback list for when the catalogue cannot be read.
 *
 * These are the models this third-party proxy has served for this plugin; they
 * exist so a network problem leaves a usable picker rather than an empty one.
 */
const FALLBACK_MODELS = [
  { value: 'gpt-image-2.5-flare', label: 'gpt-image-2.5-flare' },
  { value: 'gpt-image-2.5-sunburst', label: 'gpt-image-2.5-sunburst' },
  { value: 'gpt-image-2', label: 'gpt-image-2' },
  { value: 'gemini-3-pro-image', label: 'gemini-3-pro-image' },
]

const catalogCache = { at: 0, key: '', models: undefined }

/** Turn micro-USD into the shortest readable dollar amount. */
function formatPrice(micro) {
  if (typeof micro !== 'number' || !Number.isFinite(micro) || micro <= 0) return ''
  // A micro-USD integer is exact at six decimals, so print that many and strip
  // the padding: 6000 -> $0.006, 38000 -> $0.038, 38500 -> $0.0385. Rounding to
  // a fixed number of decimals would silently turn $0.0385 into $0.039.
  const text = (micro / 1_000_000)
    .toFixed(6)
    .replace(/0+$/u, '')
    .replace(/\.$/u, '')
  return `$${text}`
}

/**
 * The per-request cost of a catalogue entry, or '' when it cannot be stated.
 *
 * `size_prices` wins when present: those entries price each resolution tier
 * separately, so a single number would be wrong. The cheapest tier is reported
 * with a `+` to say "from", which is honest without inventing a range.
 */
function priceOfEntry(entry) {
  const tiers = entry?.size_prices
  if (tiers !== null && typeof tiers === 'object' && !Array.isArray(tiers)) {
    const values = Object.values(tiers).filter((value) => typeof value === 'number' && value > 0)
    if (values.length > 0) {
      const cheapest = formatPrice(Math.min(...values))
      return cheapest === '' ? '' : values.length > 1 ? `${cheapest}+` : cheapest
    }
  }
  return formatPrice(entry?.per_request_micro)
}

/** One catalogue entry as the picker needs it, or undefined to skip it. */
function toModelOption(entry) {
  if (entry === null || typeof entry !== 'object') return undefined
  const id = typeof entry.id === 'string' ? entry.id : ''
  if (id === '') return undefined
  // Only image models belong in this picker; the same endpoint also lists
  // video and chat models, which this canvas cannot call.
  const tags = Array.isArray(entry.tags) ? entry.tags : []
  if (!tags.includes('image')) return undefined
  if (entry.online === false) return undefined
  const price = priceOfEntry(entry)
  return { value: id, label: price === '' ? id : `${id} · ${price}/次`, price }
}

/** Read the whole catalogue once, from cache while it is still fresh. */
async function fetchCatalogModels(group) {
  const key = group
  const now = Date.now()
  const fresh =
    catalogCache.models !== undefined &&
    catalogCache.key === key &&
    now - catalogCache.at < CATALOG_TTL_MS
  if (fresh) return catalogCache.models

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CATALOG_TIMEOUT_MS)
  try {
    const url = group === '' ? CATALOG_BASE : `${CATALOG_BASE}?group=${encodeURIComponent(group)}`
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json', 'user-agent': 'dsh-image-canvas-catalog' },
    })
    if (!response.ok) throw new Error(`目录返回 ${response.status}`)
    const body = JSON.parse(await readCapped(response, CATALOG_MAX_BYTES))
    const entries = Array.isArray(body?.data) ? body.data : []
    const models = entries.map(toModelOption).filter((entry) => entry !== undefined)
    if (models.length === 0) throw new Error('目录里没有可用的生图模型。')
    catalogCache.at = Date.now()
    catalogCache.key = key
    catalogCache.models = models
    return models
  } catch (error) {
    // Keep a previously good list rather than degrading to the fallback: a
    // transient failure must not shrink the picker the user was just using.
    if (catalogCache.models !== undefined && catalogCache.key === key) return catalogCache.models
    catalogCache.at = Date.now() - CATALOG_TTL_MS + CATALOG_FAILURE_TTL_MS
    catalogCache.key = key
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/** Models the configured provider can serve, with the catalogue as the source. */
async function modelsForProvider(baseUrl) {
  let host = ''
  try {
    host = new URL(baseUrl).hostname.toLowerCase()
  } catch {
    return FALLBACK_MODELS
  }
  // Only this proxy's console is known; other endpoints keep the fallback list
  // because their catalogue address is unknown and guessing one is worse.
  if (!host.endsWith('65535.space')) return FALLBACK_MODELS
  try {
    return await fetchCatalogModels(CATALOG_DEFAULT_GROUP)
  } catch {
    return FALLBACK_MODELS
  }
}

/**
 * The credential record this plugin owns.
 *
 * The DSH credential store requires `<scope>/<id>`; a key written in any other
 * shape makes the whole store unreadable at boot, which takes the entire app
 * down rather than just this plugin. The shape is therefore checked when the
 * module loads, so a future edit that breaks it fails loudly here and never
 * reaches the store.
 */
const CREDENTIAL_KEY = 'image-canvas/api-key'

if (!/^[^/\s]+\/[^/\s]+$/u.test(CREDENTIAL_KEY)) {
  throw new Error(
    `image-canvas: CREDENTIAL_KEY must be "<scope>/<id>" (received "${CREDENTIAL_KEY}"); ` +
      'an invalid key corrupts the DSH credential store and prevents DSH from starting.',
  )
}

/** Data directory for this plugin, under the DSH home. */
function defaultDataDir() {
  const home = process.env.DSH_HOME?.trim() || join(homedir(), '.dsh')
  return join(home, 'data', 'image-canvas')
}

function assetDir(dataDir) {
  return join(dataDir, 'assets')
}

function settingsPath(dataDir) {
  return join(dataDir, 'settings.json')
}

function statePath(dataDir) {
  return join(dataDir, 'state.json')
}

function secretPath(dataDir) {
  return join(dataDir, 'secret.json')
}

async function ensureDir(path) {
  await mkdir(path, { recursive: true })
}

/** Read and parse a JSON file, or return `fallback` when it is absent or corrupt. */
async function readJson(path, fallback) {
  try {
    const text = await readFile(path, 'utf8')
    const value = JSON.parse(text)
    return value ?? fallback
  } catch {
    return fallback
  }
}

/** Write JSON atomically enough for a single-process reader. */
async function writeJson(path, value, mode) {
  const body = `${JSON.stringify(value)}
`
  await writeFile(path, body, mode === undefined ? 'utf8' : { encoding: 'utf8', mode })
}

/** A short sanitized description of an unknown error, safe to show in the UI. */
function describeError(error) {
  if (error instanceof Error) return error.message
  return String(error)
}

/** Answer one request with JSON. */
function sendJson(response, status, value) {
  const body = `${JSON.stringify(value)}
`
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  response.end(body)
}

/** Answer one request with a binary body; a HEAD answer keeps the real length. */
function sendBytes(response, status, bytes, type, cacheControl, headOnly) {
  response.writeHead(status, {
    'content-type': type,
    'content-length': bytes.length,
    'cache-control': cacheControl ?? 'no-store',
    'x-content-type-options': 'nosniff',
  })
  response.end(headOnly === true ? undefined : bytes)
}

/* -------------------------------------------------------------------------- *
 * Update check
 *
 * DSH's own plugin updater asks npm for a newer version, so a plugin that is
 * distributed outside npm (this one ships as a GitHub Release tarball) would
 * never be told a new version exists. This block closes that gap: it asks
 * GitHub for the newest release of this repository and compares it with the
 * version in the installed manifest.
 *
 * Nothing here takes a URL, repository or version from the caller — the
 * question is fixed at build time, so the route cannot be aimed elsewhere.
 * -------------------------------------------------------------------------- */

/** The release feed this check reads. Fixed, not caller-supplied. */
const UPDATE_REPO = 'gaochangsheng0828/dsh-image-canvas'
const UPDATE_API = `https://api.github.com/repos/${UPDATE_REPO}/releases/latest`
const UPDATE_PAGE = `https://github.com/${UPDATE_REPO}/releases/latest`
/**
 * CDN-served alternatives, used when the REST API is rate limited.
 *
 * The REST API allows 60 anonymous requests per hour per address, shared with
 * every other project on that address; the Atom feed is not part of that
 * budget. Both are fixed strings, so nothing here can be pointed elsewhere.
 */
const UPDATE_ATOM = `https://github.com/${UPDATE_REPO}/releases.atom`
const UPDATE_DOWNLOAD_BASE = `https://github.com/${UPDATE_REPO}/releases/download`

/** A successful answer is trusted this long; releases are not hourly news. */
const UPDATE_TTL_MS = 6 * 60 * 60 * 1000
/** A failure is retried soon: the network may simply have been down. */
const UPDATE_FAILURE_TTL_MS = 2 * 60 * 1000
/** Ceiling for one upstream request. */
const UPDATE_TIMEOUT_MS = 10_000
/** The answer is one small JSON document; anything larger is not it. */
const UPDATE_MAX_BYTES = 256 * 1024

/** Installed version, read once from this package's own manifest. */
let ownVersionCache

/**
 * Read the installed version from this package's manifest.
 *
 * @param refresh - when true the memo is discarded first. A forced check uses
 *   this so that a package replaced on disk while the Host was running is
 *   compared by its real version, not by the one cached at boot.
 */
function readOwnVersion(refresh) {
  if (refresh === true) ownVersionCache = undefined
  if (ownVersionCache !== undefined) return ownVersionCache
  try {
    const url = new URL('./package.json', import.meta.url)
    const body = JSON.parse(readFileSync(url, 'utf8'))
    ownVersionCache = typeof body.version === 'string' ? body.version : undefined
  } catch {
    // Left undefined so the next call tries again: a transient read error must
    // not silently disable the update check for the life of the process.
    ownVersionCache = undefined
  }
  return ownVersionCache
}

/** Split a semver string into comparable parts, or undefined when malformed. */
function parseVersion(text) {
  if (typeof text !== 'string') return undefined
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/u.exec(text)
  if (match === null) return undefined
  return [Number(match[1]), Number(match[2]), Number(match[3]), match[4] ?? '']
}

/** Compare prerelease fields the way semver defines, not as plain strings. */
function comparePrerelease(left, right) {
  if (left === right) return 0
  if (left === '') return 1
  if (right === '') return -1
  const a = left.split('.')
  const b = right.split('.')
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const x = a[i]
    const y = b[i]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const numericX = /^\d+$/u.test(x)
    const numericY = /^\d+$/u.test(y)
    if (numericX && numericY) {
      const dx = Number(x)
      const dy = Number(y)
      if (dx !== dy) return dx < dy ? -1 : 1
      continue
    }
    if (numericX !== numericY) return numericX ? -1 : 1
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

/** Negative when `a` is older than `b`, 0 when equal, NaN when unparseable. */
function compareVersions(a, b) {
  const left = parseVersion(a)
  const right = parseVersion(b)
  if (left === undefined || right === undefined) return Number.NaN
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i]
  }
  return comparePrerelease(left[3], right[3])
}

/** Read a response body under a hard size cap. */
async function readCapped(response, cap) {
  const chunks = []
  let total = 0
  for await (const chunk of response.body) {
    total += chunk.length
    if (total > cap) throw new Error('上游响应过大。')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

/**
 * The newest release, from the REST API.
 *
 * This carries the release notes and the tarball asset, but anonymous callers
 * share a 60 requests/hour budget per address, which a shared or corporate
 * address can exhaust without this plugin being at fault. `fetchLatestViaAtom`
 * is the fallback for exactly that case.
 */
async function fetchLatestViaApi(signal) {
  const response = await fetch(UPDATE_API, {
    signal,
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'dsh-image-canvas-update-check',
    },
  })
  if (!response.ok) {
    const error = new Error(`GitHub API 返回 ${response.status}`)
    error.status = response.status
    throw error
  }
  const body = JSON.parse(await readCapped(response, UPDATE_MAX_BYTES))
  const tag = typeof body.tag_name === 'string' ? body.tag_name : ''
  const version = tag.replace(/^v/u, '').trim()
  if (version === '') throw new Error('最新 release 没有 tag。')
  return {
    version,
    tag,
    page: typeof body.html_url === 'string' && body.html_url !== '' ? body.html_url : UPDATE_PAGE,
    publishedAt: typeof body.published_at === 'string' ? body.published_at : undefined,
    notes: typeof body.body === 'string' ? body.body.trim() : '',
    tarball: (Array.isArray(body.assets) ? body.assets : []).find(
      (asset) => typeof asset?.name === 'string' && asset.name.endsWith('.tgz'),
    )?.browser_download_url,
    source: 'api',
  }
}

/**
 * The newest release, from the releases Atom feed.
 *
 * `releases.atom` is served from GitHub's CDN and is not part of the REST rate
 * limit, so it keeps working when the API answers 403. It has no assets or
 * notes, so the download link is derived from the tag — which is the URL
 * GitHub itself uses for a release asset of that name.
 */
async function fetchLatestViaAtom(signal) {
  const response = await fetch(UPDATE_ATOM, {
    signal,
    headers: {
      accept: 'application/atom+xml',
      'user-agent': 'dsh-image-canvas-update-check',
    },
  })
  if (!response.ok) throw new Error(`GitHub Atom 返回 ${response.status}`)
  const xml = await readCapped(response, UPDATE_MAX_BYTES)
  // The first <entry> is the newest release. Its <id> ends in the tag, which is
  // more reliable to parse than the human-readable <title>.
  const entries = xml.split(/<entry>/u).slice(1)
  for (const entry of entries) {
    const idMatch = /<id>[^<]*\/([^/<]+)<\/id>/u.exec(entry)
    const tag = idMatch?.[1] ?? ''
    const version = tag.replace(/^v/u, '').trim()
    if (version === '') continue
    const linkMatch = /<link[^>]+href="([^"]+)"/u.exec(entry)
    const updatedMatch = /<updated>([^<]+)<\/updated>/u.exec(entry)
    return {
      version,
      tag,
      page: linkMatch?.[1] ?? UPDATE_PAGE,
      publishedAt: updatedMatch?.[1],
      notes: '',
      tarball: `${UPDATE_DOWNLOAD_BASE}/${tag}/dsh-image-canvas-${version}.tgz`,
      source: 'atom',
    }
  }
  throw new Error('Atom 订阅里没有可识别的 release。')
}

/** One upstream lookup: the newest release tag, or a thrown error. */
async function fetchLatestRelease() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPDATE_TIMEOUT_MS)
  const signal = controller.signal
  try {
    try {
      return await fetchLatestViaApi(signal)
    } catch (apiError) {
      // A rate limit is the expected reason to fall back; any other API failure
      // tries the CDN too, because a working answer beats a precise error.
      return await fetchLatestViaAtom(signal)
    }
  } finally {
    clearTimeout(timer)
  }
}

/** Cached result of the last check, so the panel can poll cheaply. */
const updateCache = { at: 0, result: undefined }

/**
 * Answer the update question, from cache when it is still fresh.
 *
 * @param force - when true, the cache is ignored, but the caller is rate
 *   limited by the panel instead, so a held-down button cannot hammer GitHub.
 */
async function checkForUpdate(force) {
  const now = Date.now()
  const ttl = updateCache.result?.ok === true ? UPDATE_TTL_MS : UPDATE_FAILURE_TTL_MS
  if (force !== true && updateCache.result !== undefined && now - updateCache.at < ttl) {
    return updateCache.result
  }

  const current = readOwnVersion(force === true)
  let result
  try {
    const latest = await fetchLatestRelease()
    const newer = current !== undefined && compareVersions(current, latest.version) < 0
    result = {
      ok: true,
      current: current ?? null,
      latest: latest.version,
      newer,
      page: latest.page,
      tarball: latest.tarball ?? null,
      publishedAt: latest.publishedAt ?? null,
      notes: latest.notes,
      source: latest.source ?? 'api',
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    result = {
      ok: false,
      current: current ?? null,
      error: describeError(error),
      page: UPDATE_PAGE,
      source: 'none',
      checkedAt: new Date().toISOString(),
    }
  }

  updateCache.at = Date.now()
  updateCache.result = result
  return result
}

/** Read a request body up to `limit` bytes, rejecting anything larger. */
async function readBody(request, limit) {
  const chunks = []
  let total = 0
  for await (const chunk of request) {
    total += chunk.length
    if (total > limit) {
      const error = new Error(`请求体超过 ${Math.round(limit / 1024 / 1024)} MB 上限。`)
      error.status = 413
      throw error
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

/** Parse a JSON request body. */
async function readJsonBody(request, limit) {
  const raw = await readBody(request, limit)
  if (raw.length === 0) return {}
  try {
    return JSON.parse(raw.toString('utf8'))
  } catch {
    const error = new Error('请求体不是合法 JSON。')
    error.status = 400
    throw error
  }
}

/**
 * Whether a request may use this plugin's routes.
 *
 * The page and these routes share an origin, so a same-origin `Origin` is the
 * normal case; a `null` Origin (a navigation, a probe) is admitted because the
 * routes only serve the machine they run on. A cross-site browser request is
 * refused outright, which is what stops another page from driving uploads or
 * spending the user's provider credits.
 */
function isTrusted(request) {
  const host = request.headers.host
  if (host === undefined) return false
  let requestHost
  try {
    requestHost = new URL(`http://${host}`).hostname
  } catch {
    return false
  }
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const loopback = (name) =>
    name === '127.0.0.1' || name === '::1' || name === '[::1]' || name === 'localhost'
  if (!loopback(requestHost)) return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/** Sniff an image's media type from its leading bytes. */
function sniffImageType(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: 'image/png', ext: 'png' }
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' }
  }
  if (bytes.length >= 12 && bytes.toString('latin1', 0, 4) === 'RIFF' && bytes.toString('latin1', 8, 12) === 'WEBP') {
    return { mime: 'image/webp', ext: 'webp' }
  }
  if (bytes.length >= 6 && bytes.toString('latin1', 0, 3) === 'GIF') {
    return { mime: 'image/gif', ext: 'gif' }
  }
  return undefined
}

/**
 * Read pixel dimensions from PNG, JPEG, WebP and GIF headers.
 *
 * The canvas has to size a card before the image finishes decoding, and the
 * provider does not always honour the requested size, so the real numbers are
 * measured here instead of copied from the request.
 */
function measureImage(bytes) {
  const type = sniffImageType(bytes)
  if (type === undefined) return undefined
  if (type.ext === 'png' && bytes.length >= 24) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), ...type }
  }
  if (type.ext === 'gif' && bytes.length >= 10) {
    return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8), ...type }
  }
  if (type.ext === 'webp' && bytes.length >= 30) {
    const kind = bytes.toString('latin1', 12, 16)
    if (kind === 'VP8X') {
      const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16))
      const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16))
      return { width, height, ...type }
    }
    if (kind === 'VP8 ') {
      return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff, ...type }
    }
    if (kind === 'VP8L') {
      const bits = bytes.readUInt32LE(21)
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, ...type }
    }
  }
  if (type.ext === 'jpg') {
    let offset = 2
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1
        continue
      }
      const marker = bytes[offset + 1]
      if (marker === undefined) break
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2
        continue
      }
      if (marker === 0x01 || marker === 0xff) {
        offset += marker === 0xff ? 1 : 2
        continue
      }
      const length = bytes.readUInt16BE(offset + 2)
      const isStartOfFrame =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      if (isStartOfFrame) {
        return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5), ...type }
      }
      offset += 2 + length
    }
  }
  return { width: 0, height: 0, ...type }
}

/** Content address of one image, plus what it needs to be served later. */
function describeAsset(bytes) {
  const measured = measureImage(bytes)
  if (measured === undefined) return undefined
  const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 32)
  return {
    id: `${digest}.${measured.ext}`,
    mime: measured.mime,
    width: measured.width,
    height: measured.height,
    size: bytes.length,
  }
}

/** Store one image under its content address and return its descriptor. */
async function storeAsset(dataDir, bytes) {
  const asset = describeAsset(bytes)
  if (asset === undefined) {
    const error = new Error('只接受 PNG、JPEG、WebP 或 GIF 图片。')
    error.status = 415
    throw error
  }
  await ensureDir(assetDir(dataDir))
  const target = join(assetDir(dataDir), asset.id)
  try {
    await stat(target)
  } catch {
    await writeFile(target, bytes)
  }
  return asset
}

/** Resolve one asset id to its bytes; the id must be a bare stored file name. */
async function readAsset(dataDir, id) {
  if (!/^[0-9a-f]{32}\.(png|jpg|webp|gif)$/u.test(id)) return undefined
  try {
    return await readFile(join(assetDir(dataDir), id))
  } catch {
    return undefined
  }
}

/** Delete assets the canvas no longer references once they have aged out. */
async function pruneAssets(dataDir, keepIds) {
  // An empty reference set means the board lost its content — a fresh document,
  // a load failure on the page, or a save from a client that never loaded. The
  // age check below saves most of it, but a bulk delete is not worth the risk:
  // report nothing to prune and let the next save with real cards decide.
  if (keepIds.size === 0) return 0
  let names
  try {
    names = await readdir(assetDir(dataDir))
  } catch {
    return 0
  }
  const cutoff = Date.now() - ASSET_GRACE_MS
  let removed = 0
  for (const name of names) {
    if (keepIds.has(name)) continue
    const path = join(assetDir(dataDir), name)
    try {
      const info = await stat(path)
      if (info.mtimeMs > cutoff) continue
      await unlink(path)
      removed += 1
    } catch {
      // A file another save is rewriting is simply left for the next pass.
    }
  }
  return removed
}

/** Collect every asset id a canvas document still refers to. */
function referencedAssets(state) {
  const keep = new Set()
  const nodes = Array.isArray(state?.nodes) ? state.nodes : []
  for (const node of nodes) {
    if (node === null || typeof node !== 'object') continue
    if (typeof node.assetId === 'string') keep.add(node.assetId)
    if (Array.isArray(node.history)) {
      for (const entry of node.history) {
        if (typeof entry?.assetId === 'string') keep.add(entry.assetId)
      }
    }
    if (Array.isArray(node.references)) {
      for (const entry of node.references) {
        if (typeof entry === 'string') keep.add(entry)
        if (typeof entry?.assetId === 'string') keep.add(entry.assetId)
      }
    }
  }
  return keep
}

/** Build a multipart body for the image-edit endpoint. */
function multipartBody(fields, files) {
  const boundary = `----image-canvas${createHash('sha256').update(String(Date.now())).digest('hex').slice(0, 16)}`
  const parts = []
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined) continue
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${String(value)}\r\n`))
  }
  files.forEach((file, index) => {
    const field = files.length === 1 ? 'image' : 'image[]'
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="reference-${index + 1}.${file.ext}"\r\nContent-Type: ${file.mime}\r\n\r\n`,
      ),
    )
    parts.push(file.bytes, Buffer.from('\r\n'))
  })
  parts.push(Buffer.from(`--${boundary}--\r\n`))
  return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` }
}

/** Decode one provider image entry into bytes. */
async function providerImageBytes(entry, signal) {
  if (typeof entry?.b64_json === 'string' && entry.b64_json !== '') {
    return Buffer.from(entry.b64_json, 'base64')
  }
  if (typeof entry?.url === 'string' && entry.url !== '') {
    const response = await fetch(entry.url, { signal })
    if (!response.ok) throw new Error(`图片下载失败：HTTP ${String(response.status)}`)
    return Buffer.from(await response.arrayBuffer())
  }
  if (typeof entry?.image === 'string' && entry.image !== '') {
    return Buffer.from(entry.image, 'base64')
  }
  return undefined
}

/**
 * Register the plugin.
 *
 * `webServer` is a hard dependency: without it there is nowhere to mount the
 * routes and the browser half would have nothing to talk to.
 */
export const inject = ['webServer']

export function apply(ctx) {
  const dataDir = defaultDataDir()

  /** Resolve the stored API key, preferring the credential store. */
  async function readKey() {
    const credentials = ctx.get('credentials')
    if (credentials !== undefined) {
      let failure
      try {
        const record = await credentials.readRecord(CREDENTIAL_KEY)
        if (record?.kind === 'api-key' && typeof record.key === 'string' && record.key !== '') return record.key
        // An absent record is a real answer: the file is the only remaining source.
        failure = undefined
      } catch (error) {
        // A broken credential backend is not the same as an unconfigured key.
        failure = error
      }
      if (failure !== undefined) {
        ctx.logger?.('image-canvas')?.warn?.(
          `credential store unavailable (${CREDENTIAL_KEY}); falling back to the local file: ${describeError(failure)}`,
        )
      }
    }
    const stored = await readJson(secretPath(dataDir), {})
    return typeof stored?.apiKey === 'string' ? stored.apiKey : ''
  }

  /**
   * Persist the API key.
   *
   * The credential record is the primary home. A failure there is reported to
   * the caller instead of being swallowed: a key that silently lands in the
   * local file while the user believes it is in the credential store is how a
   * mislabelled record gets diagnosed as "the key vanished".
   */
  async function writeKey(value) {
    const credentials = ctx.get('credentials')
    if (credentials !== undefined) {
      try {
        if (value === '') {
          // Deleting is best-effort: an absent record is already the desired state.
          try {
            await credentials.deleteRecord(CREDENTIAL_KEY)
          } catch {
            await credentials.modifyRecord(CREDENTIAL_KEY, async () => undefined)
          }
        } else {
          await credentials.modifyRecord(CREDENTIAL_KEY, async () => ({ kind: 'api-key', key: value }))
        }
        // Remove a stale fallback so one key has exactly one home.
        await ensureDir(dataDir)
        await writeJson(secretPath(dataDir), {}, 0o600)
        return 'credentials'
      } catch (error) {
        // The store refused the write. Keep exactly one authoritative value in
        // the local file: the new key when setting, an empty file when clearing.
        // A failure must never leave the previous key stranded as "current".
        await ensureDir(dataDir)
        await writeJson(secretPath(dataDir), value === '' ? {} : { apiKey: value }, 0o600)
        ctx.logger?.('image-canvas')?.warn?.(
          `credential write failed (${CREDENTIAL_KEY}); using the local file instead: ${describeError(error)}`,
        )
        return {
          store: value === '' ? 'none' : 'file',
          warning: value === '' ? undefined : `凭据库写入失败，密钥已改存到本机文件：${describeError(error)}`,
        }
      }
    }
    await ensureDir(dataDir)
    await writeJson(secretPath(dataDir), value === '' ? {} : { apiKey: value }, 0o600)
    return { store: value === '' ? 'none' : 'file' }
  }

  /** The provider settings the browser is allowed to see. */
  async function readSettings() {
    const stored = await readJson(settingsPath(dataDir), {})
    const key = await readKey()
    const baseUrl = typeof stored.baseUrl === 'string' && stored.baseUrl !== '' ? stored.baseUrl : DEFAULT_BASE_URL
    // With no key there is nothing to call, and the catalogue is keyed to the
    // account, so the picker stays empty and the UI explains why.
    const models = key === '' ? [] : await modelsForProvider(baseUrl)
    const byName = typeof stored.model === 'string' && stored.model !== '' ? stored.model : DEFAULT_MODEL
    // A stored model that this provider no longer offers would be sent upstream
    // and fail there; report the default instead so the picker has a valid value.
    const model =
      models.length === 0 || models.some((entry) => entry.value === byName)
        ? byName
        : (models[0]?.value ?? DEFAULT_MODEL)
    return {
      baseUrl,
      model,
      defaultSize: typeof stored.defaultSize === 'string' ? stored.defaultSize : '',
      hasKey: key !== '',
      keyMask: key === '' ? '' : `${key.slice(0, 4)}…${key.slice(-4)}`,
      // The model picker must offer only what the configured provider can serve.
      // With no key there is nothing to call, so the list is empty and the UI
      // explains what to do instead of showing unusable names.
      models,
    }
  }

  /**
   * Forward one generation request and store every image that comes back.
   *
   * The endpoint follows the OpenAI images API, which is what the configured
   * third-party proxy speaks. A reference image switches the call from
   * `/v1/images/generations` to `/v1/images/edits`.
   */
  async function generate(request) {
    const settings = await readSettings()
    const key = await readKey()
    if (key === '') {
      const error = new Error('尚未配置 API Key，请先在上方设置里填写。')
      error.status = 400
      throw error
    }
    const prompt = typeof request?.prompt === 'string' ? request.prompt.trim() : ''
    if (prompt === '') {
      const error = new Error('提示词不能为空。')
      error.status = 400
      throw error
    }
    const references = []
    for (const id of Array.isArray(request?.references) ? request.references : []) {
      if (typeof id !== 'string') continue
      const bytes = await readAsset(dataDir, id)
      const type = bytes === undefined ? undefined : sniffImageType(bytes)
      if (bytes === undefined || type === undefined) continue
      references.push({ bytes, ext: type.ext, mime: type.mime })
    }
    const model = typeof request?.model === 'string' && request.model !== '' ? request.model : settings.model
    const size = typeof request?.size === 'string' && request.size !== '' ? request.size : undefined
    const count = Number.isInteger(request?.n) && request.n > 0 && request.n <= 4 ? request.n : 1

    const fields = { model, prompt, n: String(count), response_format: 'b64_json' }
    if (size !== undefined) fields.size = size

    const base = settings.baseUrl.replace(/\/+$/u, '')
    const url = references.length === 0 ? `${base}/v1/images/generations` : `${base}/v1/images/edits`
    let body
    let contentType
    if (references.length === 0) {
      body = Buffer.from(JSON.stringify(fields))
      contentType = 'application/json'
    } else {
      const built = multipartBody(fields, references)
      body = built.body
      contentType = built.contentType
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS)
    let payload
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': contentType },
        body,
        signal: controller.signal,
      })
      const text = await response.text()
      if (!response.ok) {
        const error = new Error(`上游返回 HTTP ${String(response.status)}：${text.slice(0, 400)}`)
        error.status = 502
        throw error
      }
      try {
        payload = JSON.parse(text)
      } catch {
        const error = new Error('上游返回的不是 JSON，无法解析。')
        error.status = 502
        throw error
      }
      const entries = Array.isArray(payload?.data) ? payload.data : []
      const stored = []
      for (const entry of entries) {
        const bytes = await providerImageBytes(entry, controller.signal)
        if (bytes === undefined) continue
        stored.push(await storeAsset(dataDir, bytes))
      }
      if (stored.length === 0) {
        const error = new Error('上游没有返回图片数据（既无 b64_json 也无 url）。')
        error.status = 502
        throw error
      }
      return { images: stored, model, size: size ?? null, mode: references.length === 0 ? 'text' : 'image' }
    } catch (error) {
      if (error?.name === 'AbortError') {
        const timeout = new Error(`上游 ${Math.round(GENERATE_TIMEOUT_MS / 1000)} 秒内没有返回，已放弃等待。`)
        timeout.status = 504
        throw timeout
      }
      throw error
    } finally {
      clearTimeout(timer)
    }
  }

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: PREFIX,
        handler: async (request, response) => {
          try {
            if (!isTrusted(request)) {
              sendJson(response, 403, { error: '请求来源不受信任。' })
              return
            }
            const url = new URL(request.url ?? '/', 'http://127.0.0.1')
            const route = url.pathname.slice(PREFIX.length) || '/'
            const method = request.method ?? 'GET'

            if (route === '/settings' && method === 'GET') {
              sendJson(response, 200, await readSettings())
              return
            }

            if (route === '/settings' && method === 'PUT') {
              const body = await readJsonBody(request, 64 * 1024)
              const current = await readJson(settingsPath(dataDir), {})
              const next = {
                baseUrl:
                  typeof body.baseUrl === 'string' && body.baseUrl.trim() !== ''
                    ? body.baseUrl.trim().replace(/\/+$/u, '')
                    : (current.baseUrl ?? DEFAULT_BASE_URL),
                model: typeof body.model === 'string' && body.model.trim() !== '' ? body.model.trim() : (current.model ?? DEFAULT_MODEL),
                defaultSize: typeof body.defaultSize === 'string' ? body.defaultSize : (current.defaultSize ?? ''),
              }
              await ensureDir(dataDir)
              await writeJson(settingsPath(dataDir), next)
              // Report where the key landed, so a fallback to the local file is
              // visible instead of being discovered later as "the key vanished".
              let keyStore = null
              let keyWarning
              if (typeof body.apiKey === 'string' && body.apiKey.trim() !== '') {
                const outcome = await writeKey(body.apiKey.trim())
                keyStore = typeof outcome === 'string' ? outcome : outcome.store
                if (typeof outcome === 'object' && outcome.warning !== undefined) keyWarning = outcome.warning
              }
              if (body.clearKey === true) {
                const outcome = await writeKey('')
                keyStore = typeof outcome === 'string' ? outcome : outcome.store
              }
              const settings = await readSettings()
              if (keyWarning !== undefined) settings.keyWarning = keyWarning
              if (keyStore !== null) settings.keyStore = keyStore
              sendJson(response, 200, settings)
              return
            }

            if (route === '/state' && method === 'GET') {
              sendJson(response, 200, await readJson(statePath(dataDir), { nodes: [], edges: [], view: null }))
              return
            }

            if (route === '/state' && method === 'PUT') {
              const state = await readJsonBody(request, STATE_MAX_BYTES)
              if (state === null || typeof state !== 'object' || !Array.isArray(state.nodes)) {
                sendJson(response, 400, { error: '画布文档缺少 nodes 数组。' })
                return
              }
              await ensureDir(dataDir)
              await writeJson(statePath(dataDir), state)
              const pruned = await pruneAssets(dataDir, referencedAssets(state))
              sendJson(response, 200, { ok: true, pruned, savedAt: Date.now() })
              return
            }

            if (route === '/update-check' && method === 'GET') {
              const force = url.searchParams.get('force') === '1'
              sendJson(response, 200, await checkForUpdate(force))
              return
            }

            if (route === '/assets' && method === 'POST') {
              const bytes = await readBody(request, ASSET_MAX_BYTES)
              const asset = await storeAsset(dataDir, bytes)
              sendJson(response, 200, {
                ...asset,
                url: `${PREFIX}/assets/${asset.id}`,
              })
              return
            }

            if (route.startsWith('/assets/') && (method === 'GET' || method === 'HEAD')) {
              const id = route.slice('/assets/'.length)
              const bytes = await readAsset(dataDir, id)
              if (bytes === undefined) {
                sendJson(response, 404, { error: '素材不存在。' })
                return
              }
              const type = sniffImageType(bytes)
              sendBytes(
                response,
                200,
                bytes,
                type?.mime ?? 'application/octet-stream',
                'public, max-age=31536000, immutable',
                method === 'HEAD',
              )
              return
            }

            if (route === '/generate' && method === 'POST') {
              const body = await readJsonBody(request, ASSET_MAX_BYTES)
              const result = await generate(body)
              sendJson(response, 200, {
                ...result,
                images: result.images.map((image) => ({ ...image, url: `${PREFIX}/assets/${image.id}` })),
              })
              return
            }

            sendJson(response, 404, { error: `未知接口：${method} ${route}` })
          } catch (error) {
            const status = typeof error?.status === 'number' ? error.status : 500
            sendJson(response, status, { error: describeError(error) })
          }
        },
      }),
    'image-canvas: HTTP routes',
  )
}
