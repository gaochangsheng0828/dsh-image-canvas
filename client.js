window.__ModuleLoader__.load({
  id: 'dsh-image-canvas',
  factory(require) {
    const React = require('react')
    // react-dom is only needed to lift a modal out of the panel; when the module
    // table does not expose it, the modal still renders where it is declared.
    let ReactDOM
    try {
      ReactDOM = require('react-dom')
    } catch {
      ReactDOM = undefined
    }
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    /* ------------------------------------------------------------------ *
     * Vocabulary
     * ------------------------------------------------------------------ */

    const NS = 'image-canvas'
    const API = '/image-canvas'

    const DICT = {
      zh: {
        'panel.title': '无限画布',
        'panel.hint': '拖动空白处平移 · 滚轮缩放 · 双击空白处添加节点',
        'action.upload': '上传',
        'action.addNode': '添加节点',
        'action.fit': '适应视图',
        'action.save': '保存',
        'action.export': '导出',
        'action.import': '导入',
        'action.settings': '设置',
        'action.preview': '预览',
        'action.crop': '裁切',
        'action.download': '下载',
        'action.delete': '删除',
        'action.close': '关闭',
        'action.cancel': '取消',
        'action.generate': '生成',
        'action.regenerate': '重新生成',
        'action.asReference': '作为参考生图',
        'action.removeReference': '移除参考',
        'action.prev': '上一张',
        'action.next': '下一张',
        'action.dismiss': '知道了',
        'update.available': '有新版本',
        'update.open': '去下载',
        'update.recheck': '重新检查',
        'update.checking': '检查中…',
        'update.later': '稍后',
        'action.copy': '复制图片',
        'action.copyLink': '复制图片地址',
        'action.paste': '粘贴',
        'action.openNew': '在新标签打开',
        'action.saveAs': '另存为…',
        'notice.copied': '已复制到剪贴板',
        'notice.copyFailed': '复制失败，已改为下载',
        'action.expand': '放大编辑',
        'action.apply': '应用',
        'status.loading': '载入中…',
        'status.saved': '已保存',
        'status.saving': '保存中…',
        'status.saveFailed': '保存失败',
        'status.generating': '生成中…',
        'status.failed': '失败',
        'status.noKey': '未配置 API Key',
        'prompt.placeholder': '描述你想要生成的画面，@ 引用素材',
        'prompt.empty': '提示词不能为空',
        'prompt.needText': '请先写提示词',
        'menu.title': '添加节点',
        'menu.search': '搜索',
        'menu.text': '文本',
        'menu.image': '图片',
        'menu.resources': '添加资源',
        'menu.upload': '上传',
        'menu.none': '没有匹配的条目',
        'node.text': '文本',
        'node.textPlaceholder': '写点什么，例如某个角色的设定或画面风格',
        'node.image': '图片节点',
        'node.asset': '素材',
        'node.try': '尝试：',
        'node.img2img': '图生图',
        'node.hd': '图片高清',
        'node.style': '风格',
        'node.color': '配色',
        'node.compose': '构图',
        'node.insertFragment': '插入',
        'node.references': '@ 引用素材',
        'label.ratio': '比例',
        'label.resolution': '分辨率',
        'label.count': '张数',
        'label.model': '模型',
        'label.size': '尺寸',
        'label.references': '参考图',
        'label.baseUrl': '接口地址',
        'label.apiKey': 'API Key',
        'label.defaultSize': '默认尺寸',
        'label.keyConfigured': '已配置',
        'label.keyMissing': '未配置',
        'empty.title': '开始你的第一张画布',
        'empty.body': '双击空白处，从菜单里选择「文本」「图片」或「上传」。按住图片节点右侧的圆点拖线，可以把这张图接到另一张图片节点上当参考图；也可以直接在提示词里用 @ 引用素材。',
        'empty.shortcut': '图片文件可以直接拖进画布，或用 Ctrl+V 粘贴。',
        'crop.title': '裁切',
        'preview.zoomHint': '滚轮缩放 · 拖动平移 · 双击复位',
        'preview.zoomIn': '放大',
        'preview.zoomOut': '缩小',
        'preview.reset': '复位',
        'history.label': '生成历史',
        'history.empty': '还没有生成记录',
        'history.current': '当前',
        'history.remove': '从历史移除',
        'crop.size': '输出尺寸',
        'crop.apply': '应用裁切',
        'crop.reset': '重置',
        'crop.ratio': '比例',
        'crop.free': '自由',
        'settings.title': '生图接口设置',
        'settings.baseUrlHint': 'OpenAI 兼容接口的根地址，例如 https://sub-proxy-us.65535.space',
        'settings.modelHint': '留空则使用默认模型',
        'settings.keyHint': '密钥只保存在本机，不会写进画布文件。',
        'settings.keyStripLabel': '生图密钥',
        'settings.saveKey': '保存',
        'settings.savingKey': '保存中',
        'settings.keySaved': '密钥已更新',
        'settings.keySavedFallback': '密钥已存到本机文件',
        'settings.keyFailed': '密钥保存失败',
        'settings.keyPlaceholder': '粘贴新的 API Key 换绑',
        'settings.keyPlaceholderEmpty': '粘贴 API Key 后点保存',
        'settings.saved': '设置已保存',
        'settings.save': '保存设置',
        'settings.clearKey': '清除密钥',
        'error.upload': '上传失败',
        'error.generate': '生成失败',
        'error.load': '载入画布失败',
        'error.tooLarge': '超过 24 MB 上限',
        'error.import': '导入失败',
        'error.importShape': '文件不是有效的画布工程（缺少 nodes 数组）',
        'error.readOnly': '画布没有载入成功，为避免覆盖原有内容，编辑已锁定。请刷新后重试。',
        'confirm.deleteTitle': '删除这个节点？',
        'confirm.deleteBody': '节点和它的连线会一起删除，已经保存的图片素材仍然留在磁盘上。',
      },
      en: {
        'panel.title': 'Infinite canvas',
        'panel.hint': 'Drag empty space to pan · scroll to zoom · double-click empty space to add a node',
        'action.upload': 'Upload',
        'action.addNode': 'Add node',
        'action.fit': 'Fit',
        'action.save': 'Save',
        'action.export': 'Export',
        'action.import': 'Import',
        'action.settings': 'Settings',
        'action.preview': 'Preview',
        'action.crop': 'Crop',
        'action.download': 'Download',
        'action.delete': 'Delete',
        'action.close': 'Close',
        'action.cancel': 'Cancel',
        'action.generate': 'Generate',
        'action.regenerate': 'Generate again',
        'action.asReference': 'Use as reference',
        'action.removeReference': 'Remove reference',
        'action.prev': 'Previous',
        'action.next': 'Next',
        'action.dismiss': 'Dismiss',
        'update.available': 'New version available:',
        'update.open': 'Get it',
        'update.recheck': 'Check again',
        'update.checking': 'Checking…',
        'update.later': 'Later',
        'action.copy': 'Copy image',
        'action.copyLink': 'Copy image address',
        'action.paste': 'Paste',
        'action.openNew': 'Open in new tab',
        'action.saveAs': 'Save as…',
        'notice.copied': 'Copied to clipboard',
        'notice.copyFailed': 'Copy failed; downloaded instead',
        'action.expand': 'Expand editor',
        'action.apply': 'Apply',
        'status.loading': 'Loading…',
        'status.saved': 'Saved',
        'status.saving': 'Saving…',
        'status.saveFailed': 'Save failed',
        'status.generating': 'Generating…',
        'status.failed': 'Failed',
        'status.noKey': 'No API key',
        'prompt.placeholder': 'Describe the image you want, @ to reference material',
        'prompt.empty': 'The prompt is empty',
        'prompt.needText': 'Write a prompt first',
        'menu.title': 'Add node',
        'menu.search': 'Search',
        'menu.text': 'Text',
        'menu.image': 'Image',
        'menu.resources': 'Add material',
        'menu.upload': 'Upload',
        'menu.none': 'Nothing matches',
        'node.text': 'Text',
        'node.textPlaceholder': 'Write something — a character sheet, or a style note',
        'node.image': 'Image node',
        'node.asset': 'Material',
        'node.try': 'Try:',
        'node.img2img': 'Image to image',
        'node.hd': 'Image upscale',
        'node.style': 'Style',
        'node.color': 'Palette',
        'node.compose': 'Composition',
        'node.insertFragment': 'Insert',
        'node.references': '@ Reference material',
        'label.ratio': 'Ratio',
        'label.resolution': 'Resolution',
        'label.count': 'Count',
        'label.model': 'Model',
        'label.size': 'Size',
        'label.references': 'References',
        'label.baseUrl': 'Endpoint',
        'label.apiKey': 'API key',
        'label.defaultSize': 'Default size',
        'label.keyConfigured': 'Configured',
        'label.keyMissing': 'Not set',
        'empty.title': 'Start your first board',
        'empty.body': 'Double-click empty space and pick Text, Image or Upload. Drag from the dot on an image node onto another image node to feed it in as a reference, or reference material with @ inside the prompt.',
        'empty.shortcut': 'You can also drop image files onto the canvas, or paste with Ctrl+V.',
        'crop.title': 'Crop',
        'preview.zoomHint': 'Scroll to zoom · drag to pan · double-click to reset',
        'preview.zoomIn': 'Zoom in',
        'preview.zoomOut': 'Zoom out',
        'preview.reset': 'Reset',
        'history.label': 'History',
        'history.empty': 'Nothing generated yet',
        'history.current': 'Current',
        'history.remove': 'Remove from history',
        'crop.size': 'Output size',
        'crop.apply': 'Apply crop',
        'crop.reset': 'Reset',
        'crop.ratio': 'Ratio',
        'crop.free': 'Free',
        'settings.title': 'Image provider',
        'settings.baseUrlHint': 'Root URL of an OpenAI-compatible endpoint, e.g. https://sub-proxy-us.65535.space',
        'settings.modelHint': 'Leave empty to use the default model',
        'settings.keyHint': 'The key stays on this machine and is never written into the board file.',
        'settings.keyStripLabel': 'Image API key',
        'settings.saveKey': 'Save',
        'settings.savingKey': 'Saving',
        'settings.keySaved': 'Key updated',
        'settings.keySavedFallback': 'Key stored in local file',
        'settings.keyFailed': 'Key not saved',
        'settings.keyPlaceholder': 'Paste a new API key',
        'settings.keyPlaceholderEmpty': 'Paste your API key, then Save',
        'settings.saved': 'Settings saved',
        'settings.save': 'Save settings',
        'settings.clearKey': 'Clear key',
        'error.upload': 'Upload failed',
        'error.generate': 'Generation failed',
        'error.load': 'Could not load the board',
        'error.tooLarge': 'is larger than the 24 MB limit',
        'error.import': 'Could not import',
        'error.importShape': 'That file is not a board document (no nodes array)',
        'error.readOnly': 'The board did not load. Editing stays locked so the stored content cannot be overwritten — refresh and try again.',
        'confirm.deleteTitle': 'Delete this node?',
        'confirm.deleteBody': 'The node and its connections are removed; saved image assets stay on disk.',
      },
    }

    /**
     * Ratios and resolutions the provider really accepts.
     *
     * The third-party proxy takes a literal `WxH`; `2K` means the long edge at
     * roughly 2048 px. Every pair here is a size this endpoint has been known to
     * take, so the picker never offers a combination it cannot send.
     */
    const RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3']
    const RESOLUTIONS = ['1K', '2K']
    const RATIO_BASE = {
      '1:1': [1024, 1024],
      '4:3': [1360, 1020],
      '3:4': [1020, 1360],
      '16:9': [1360, 768],
      '9:16': [768, 1360],
      '3:2': [1360, 908],
      '2:3': [908, 1360],
    }

    /** Turn the ratio/resolution pickers into the `WxH` the provider wants. */
    function sizeFor(ratio, resolution) {
      const base = RATIO_BASE[ratio]
      if (base === undefined) return ''
      if (resolution !== '2K') return `${String(base[0])}x${String(base[1])}`
      const scale = 2
      return `${String(base[0] * scale)}x${String(base[1] * scale)}`
    }

    /** Recover a picker pair from a stored `size` string. */
    function pickersFrom(size) {
      if (typeof size !== 'string') return { ratio: '1:1', resolution: '1K' }
      const match = /^(\d+)x(\d+)$/u.exec(size)
      if (match === null) return { ratio: '1:1', resolution: '1K' }
      const width = Number(match[1])
      const height = Number(match[2])
      const ratio = RATIOS.reduce((best, entry) => {
        const [w, hgt] = RATIO_BASE[entry]
        const distance = Math.abs(width / height - w / hgt)
        return distance < best.distance ? { entry, distance } : best
      }, { entry: '1:1', distance: Infinity }).entry
      const [w, hgt] = RATIO_BASE[ratio]
      return { ratio, resolution: width > w * 1.5 || height > hgt * 1.5 ? '2K' : '1K' }
    }

    /** Prompt snippets behind the 风格 / 配色 / 构图 buttons. */
    const FRAGMENTS = {
      style: [
        '写实摄影，自然光，50mm 镜头',
        '日系动画赛璐璐上色，干净线条',
        '水彩手绘，纸张纹理，留白',
        '电影感宽银幕，浅景深，调色偏青橙',
        '3D 渲染，柔和体积光，Pixar 质感',
        '国风水墨，飞白笔触，淡彩晕染',
      ],
      color: [
        '低饱和莫兰迪色系',
        '高饱和撞色，红蓝对比',
        '暖阳光橙 + 深棕阴影',
        '夜景冷蓝 + 霓虹粉',
        '单色渐变，深空蓝调',
        '复古胶片褪色，米黄偏暖',
      ],
      compose: [
        '人物居中，三分法构图',
        '低角度仰拍，强调气势',
        '俯视航拍，大场景留白',
        '特写半身，背景虚化',
        '对称构图，画面平衡',
        '前景遮挡，层次纵深',
      ],
    }

    const MIN_ZOOM = 0.08
    const MAX_ZOOM = 4
    const NODE_MIN_WIDTH = 240
    const NODE_MAX_WIDTH = 720
    const IMAGE_WIDTH = 340
    const TEXT_WIDTH = 280
    const UPLOAD_MAX_BYTES = 24 * 1024 * 1024
    const HEAD_HEIGHT = 30
    const DOT_TOP = 32

    const clamp = (value, low, high) => Math.min(high, Math.max(low, value))
    const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    const errText = (error) => (error instanceof Error ? error.message : String(error))

    function assetUrl(id) {
      return `${API}/assets/${id}`
    }

    async function requestJson(path, options) {
      const response = await fetch(`${API}${path}`, options)
      const text = await response.text()
      let payload
      try {
        payload = text === '' ? {} : JSON.parse(text)
      } catch {
        payload = { error: `响应不是 JSON（HTTP ${String(response.status)}）` }
      }
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${String(response.status)}`)
      return payload
    }

    /** Measure one stored asset by loading it; resolves 0×0 rather than rejecting. */
    function measureAsset(assetId) {
      return new Promise((resolve) => {
        const image = new Image()
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
        image.onerror = () => resolve({ width: 0, height: 0 })
        image.src = assetUrl(assetId)
      })
    }

    /**
     * Normalize a stored node into the current shape.
     *
     * Early boards used a separate `gen` node for prompting; that role moved into
     * the image node, so a saved `gen` becomes an image node that keeps its
     * prompt, size and history instead of disappearing on load. A node that only
     * ever held an uploaded picture and has no prompt or generation history is
     * reclassified as material, so it stops showing generation tools it can
     * never use.
     */
    function migrateNode(node) {
      if (node.kind === 'text') {
        return {
          ...node,
          kind: 'text',
          x: typeof node.x === 'number' ? node.x : 60,
          y: typeof node.y === 'number' ? node.y : 60,
          baseWidth: typeof node.baseWidth === 'number' ? node.baseWidth : TEXT_WIDTH,
          history: [],
          status: 'ready',
          error: '',
        }
      }
      const history = Array.isArray(node.history) ? node.history : typeof node.assetId === 'string' ? [node.assetId] : []
      const generated = Array.isArray(node.history) && node.history.length > 1
      const hasPrompt = typeof node.prompt === 'string' && node.prompt.trim() !== ''
      const wasAsset = node.kind === 'asset'
      // Only a node that came from an upload is material; a deliberately emptied
      // image node keeps its editor.
      const kind = wasAsset || ((node.kind === 'image' || node.kind === 'gen') && !hasPrompt && !generated && node.assetId !== undefined)
        ? 'asset'
        : 'image'
      return {
        ...node,
        kind,
        x: typeof node.x === 'number' ? node.x : 60,
        y: typeof node.y === 'number' ? node.y : 60,
        baseWidth: typeof node.baseWidth === 'number' ? node.baseWidth : IMAGE_WIDTH,
        history,
        // A card saved mid-generation must not come back as a spinner.
        status: 'ready',
        error: '',
      }
    }

    /* ------------------------------------------------------------------ *
     * Styles
     * ------------------------------------------------------------------ */

    const CSS = `
.icv-root{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;position:relative}
.icv-bar{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);flex:none;flex-wrap:wrap}
.icv-bar-title{font-weight:600;font-size:13px;margin-right:4px}
.icv-spacer{flex:1}
.icv-btn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border-radius:7px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}
.icv-btn:hover{border-color:var(--dsw-alias-border-l2)}
.icv-btn:disabled{opacity:.5;cursor:default}
.icv-btn-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}
.icv-btn-primary:hover{filter:brightness(1.06)}
.icv-btn-ghost{background:transparent;border-color:transparent}
.icv-btn-ghost:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}
.icv-btn-danger{color:var(--dsw-alias-state-error-primary)}
.icv-btn-primary.icv-btn-danger{background:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary);color:#fff}
.icv-notice{display:flex;align-items:center;gap:8px;padding:6px 10px;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2);border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.icv-update{color:var(--dsw-alias-state-success-primary)}
.icv-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.icv-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.icv-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:999px;font-size:11px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}
.icv-chip-ok{color:var(--dsw-alias-state-success-primary)}
.icv-chip-warn{color:var(--dsw-alias-state-warn-primary)}
.icv-chip-error{color:var(--dsw-alias-state-error-primary)}
.icv-stage{position:relative;flex:1;min-height:0;overflow:hidden;touch-action:none;cursor:grab;background-color:var(--dsw-alias-bg-base);
  background-image:radial-gradient(var(--dsw-alias-border-l1) 1px, transparent 1px);background-size:24px 24px}
.icv-stage[data-panning="true"]{cursor:grabbing}
.icv-stage[data-linking="true"]{cursor:crosshair}
.icv-world{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.icv-edges{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none}
.icv-edge{fill:none;stroke:var(--dsw-alias-border-l2);stroke-width:1.6}
.icv-edge-active{stroke:var(--dsw-alias-brand-primary);stroke-width:2;stroke-dasharray:6 4}
.icv-edge-hit{fill:none;stroke:transparent;stroke-width:16;pointer-events:stroke;cursor:pointer}
.icv-node{position:absolute;display:flex;flex-direction:column;border-radius:12px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);box-shadow:0 6px 22px rgba(0,0,0,.16);cursor:default;box-sizing:border-box}
.icv-node[data-selected="true"]{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary),0 8px 26px rgba(0,0,0,.2)}
.icv-node:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.icv-node-head{display:flex;align-items:center;gap:6px;padding:5px 8px;font-size:11px;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l1);cursor:grab;user-select:none;background:var(--dsw-alias-bg-layer-2);border-radius:11px 11px 0 0;min-height:${String(HEAD_HEIGHT)}px;box-sizing:border-box}
.icv-node-head:active{cursor:grabbing}
.icv-node-kind{display:inline-flex;align-items:center;gap:5px;font-weight:600;color:var(--dsw-alias-label-primary)}
.icv-node-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary);flex:none}
.icv-node-body{display:flex;flex-direction:column;min-height:0}
.icv-thumb{display:block;width:100%;object-fit:contain;background:var(--dsw-alias-bg-layer-2);cursor:zoom-in}
.icv-thumb-wrap{position:relative;cursor:pointer;background:var(--dsw-alias-bg-layer-2)}
.icv-thumb-wrap[data-empty="true"]{min-height:170px}
.icv-thumb-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--dsw-alias-label-secondary);font-size:11px;text-align:center;padding:22px 14px;line-height:1.6}
.icv-thumb-empty svg{opacity:.55}
.icv-template{position:absolute;left:0;right:0;bottom:0;padding:10px 12px;display:flex;flex-direction:column;gap:6px;background:linear-gradient(to top, var(--dsw-alias-bg-layer-2) 55%, transparent);pointer-events:none}
.icv-template-label{font-size:11px;color:var(--dsw-alias-label-secondary)}
.icv-template-row{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--dsw-alias-label-primary);pointer-events:auto;cursor:pointer;background:none;border:0;padding:3px 0;font:inherit;text-align:left}
.icv-template-row:hover{color:var(--dsw-alias-brand-primary)}
.icv-prompt{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l1);background:transparent;color:inherit;font:inherit;font-size:12px;line-height:1.55;padding:9px 34px 9px 9px;resize:none;min-height:64px;max-height:220px;outline:none}
.icv-prompt::placeholder{color:var(--dsw-alias-label-secondary)}
.icv-prompt-wrap{position:relative;border-bottom:1px solid var(--dsw-alias-border-l1)}
.icv-prompt-expand{position:absolute;top:6px;right:6px;width:22px;height:22px;border:0;border-radius:5px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.icv-prompt-expand:hover{color:var(--dsw-alias-brand-primary)}
.icv-fragments{display:flex;align-items:center;gap:5px;padding:7px 9px;flex-wrap:wrap;border-bottom:1px solid var(--dsw-alias-border-l1)}
.icv-frag{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:7px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;cursor:pointer;position:relative}
.icv-frag:hover{border-color:var(--dsw-alias-brand-primary)}
.icv-frag-swatch{width:10px;height:10px;border-radius:3px;flex:none}
.icv-frag-pop{position:absolute;top:100%;left:0;margin-top:4px;z-index:6;min-width:230px;max-width:280px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);box-shadow:0 10px 30px rgba(0,0,0,.28);padding:4px;display:flex;flex-direction:column;gap:1px}
.icv-frag-item{display:block;width:100%;text-align:left;border:0;background:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1.5;padding:6px 8px;border-radius:6px;cursor:pointer}
.icv-frag-item:hover{background:var(--dsw-alias-bg-layer-2)}
.icv-controls{display:flex;align-items:center;gap:5px;padding:7px 9px;flex-wrap:nowrap;border-bottom:1px solid var(--dsw-alias-border-l1);overflow:hidden}
.icv-select{height:26px;padding:0 4px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;max-width:120px;min-width:0}
.icv-node-foot{display:flex;align-items:center;gap:4px;padding:7px 9px;flex-wrap:wrap}
.icv-refs{display:flex;align-items:center;gap:4px;padding:0 9px 7px;flex-wrap:wrap}
.icv-ref{position:relative;width:34px;height:34px;border-radius:6px;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.icv-ref img{width:100%;height:100%;object-fit:cover;display:block}
.icv-ref-x{position:absolute;top:0;right:0;width:14px;height:14px;border:0;border-radius:0 0 0 6px;background:rgba(0,0,0,.6);color:#fff;font-size:10px;line-height:14px;text-align:center;padding:0;cursor:pointer}
.icv-text{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l1);background:transparent;color:inherit;font:inherit;font-size:12.5px;line-height:1.7;padding:10px 9px;resize:vertical;min-height:120px;outline:none}
.icv-text::placeholder{color:var(--dsw-alias-label-secondary)}
.icv-node[data-kind="text"]{background:var(--dsw-alias-bg-layer-1)}
.icv-node[data-kind="text"] .icv-node-head{border-bottom:0}
.icv-node[data-kind="text"] .icv-text{min-height:132px}
.icv-port-hidden{display:none !important}
.icv-thumb-wrap:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.icv-history{padding:0 9px 8px;display:flex;flex-direction:column;gap:5px}
.icv-history-head{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.icv-history-count{font-variant-numeric:tabular-nums}
.icv-history-strip{display:flex;gap:5px;overflow-x:auto;padding-bottom:2px;scrollbar-width:thin}
.icv-history-thumb{position:relative;flex:none;width:46px;height:46px;border-radius:6px;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);cursor:pointer;padding:0}
.icv-history-thumb img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.icv-history-thumb[data-active="true"]{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}
.icv-history-thumb:hover{border-color:var(--dsw-alias-border-l2)}
.icv-history-x{position:absolute;top:0;right:0;width:14px;height:14px;border:0;border-radius:0 0 0 6px;background:rgba(0,0,0,.62);color:#fff;font-size:10px;line-height:14px;padding:0;cursor:pointer;opacity:0;transition:opacity .12s}
.icv-history-thumb:hover .icv-history-x{opacity:1}
.icv-node-error{padding:6px 8px;font-size:11px;line-height:1.5;color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2);border-top:1px solid var(--dsw-alias-border-l1);word-break:break-word;max-height:92px;overflow:auto}
.icv-busy{display:flex;align-items:center;justify-content:center;gap:8px;height:120px;color:var(--dsw-alias-label-secondary);font-size:12px;background:var(--dsw-alias-bg-layer-2)}
.icv-spin{width:14px;height:14px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-brand-primary);animation:icv-spin .8s linear infinite;flex:none}
@keyframes icv-spin{to{transform:rotate(360deg)}}
.icv-port{position:absolute;width:11px;height:11px;border-radius:50%;background:var(--dsw-alias-bg-layer-1);border:2px solid var(--dsw-alias-border-l2);cursor:crosshair;z-index:4}
.icv-port:hover{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary)}
.icv-port-out{right:-6px;top:${String(DOT_TOP - 5)}px}
.icv-port-in{left:-6px;top:${String(DOT_TOP - 5)}px;cursor:default}
.icv-resize{position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize;background:linear-gradient(135deg, transparent 0 50%, var(--dsw-alias-border-l2) 50% 100%);border-bottom-right-radius:11px;opacity:.75}
.icv-resize:hover{opacity:1;background:linear-gradient(135deg, transparent 0 50%, var(--dsw-alias-brand-primary) 50% 100%)}
.icv-minimap{position:absolute;right:12px;bottom:12px;width:168px;height:112px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);opacity:.94;overflow:hidden;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.14)}
.icv-minimap-node{position:absolute;border-radius:2px;background:var(--dsw-alias-border-l2)}
.icv-minimap-view{position:absolute;border:1px solid var(--dsw-alias-brand-primary);border-radius:2px;background:transparent}
.icv-hint{position:absolute;left:12px;bottom:12px;font-size:11px;color:var(--dsw-alias-label-secondary);pointer-events:none;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:6px;padding:3px 8px;opacity:.9}
.icv-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;pointer-events:none}
.icv-empty h3{margin:0;font-size:15px}
.icv-empty p{margin:0;max-width:440px;font-size:12px;line-height:1.75;color:var(--dsw-alias-label-secondary)}
.icv-overlay{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.62)}
.icv-modal{display:flex;flex-direction:column;max-width:min(1040px,94vw);max-height:92vh;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 18px 60px rgba(0,0,0,.45);overflow:hidden}
.icv-modal-head{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:13px;font-weight:600;flex:none}
.icv-modal-body{display:flex;flex-direction:column;min-height:0;overflow:auto;padding:14px;gap:12px}
.icv-modal-foot{display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap;flex:none}
.icv-field{display:flex;flex-direction:column;gap:4px;font-size:12px;min-width:220px}
.icv-field label{color:var(--dsw-alias-label-secondary);font-size:11px}
.icv-input{height:28px;padding:0 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:inherit;font:inherit;font-size:12px;box-sizing:border-box;width:100%}
.icv-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.icv-crop-stage{position:relative;align-self:center;line-height:0;user-select:none;touch-action:none}
.icv-crop-stage img{display:block;max-width:min(880px,86vw);max-height:64vh;pointer-events:none}
.icv-crop-shade{position:absolute;background:rgba(0,0,0,.55);pointer-events:none}
.icv-crop-rect{position:absolute;border:1px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.45);cursor:move;touch-action:none;box-sizing:border-box}
.icv-crop-handle{position:absolute;width:12px;height:12px;border-radius:2px;background:#fff;border:1px solid rgba(0,0,0,.4);box-sizing:border-box}
.icv-crop-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(to right, rgba(255,255,255,.32) 1px, transparent 1px),linear-gradient(to bottom, rgba(255,255,255,.32) 1px, transparent 1px);background-size:33.333% 33.333%}
.icv-lightbox-view{position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(0,0,0,.28);width:min(1100px,90vw);height:74vh;touch-action:none;cursor:zoom-in}
.icv-lightbox-view[data-zoomed="true"]{cursor:grab}
.icv-lightbox-view[data-dragging="true"]{cursor:grabbing}
.icv-lightbox-img{display:block;max-width:100%;max-height:100%;object-fit:contain;transform-origin:center center;transition:transform .06s linear;will-change:transform;pointer-events:none;user-select:none}
.icv-lightbox-view[data-dragging="true"] .icv-lightbox-img{transition:none}
.icv-lightbox-zoom{position:absolute;right:10px;bottom:10px;display:flex;align-items:center;gap:2px;padding:3px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);opacity:.92}
.icv-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.icv-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:var(--dsw-alias-label-secondary)}
.icv-type{white-space:pre-wrap;font-size:12px;line-height:1.6}
.icv-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.icv-ctxmenu{position:fixed;z-index:90;min-width:196px;padding:5px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);box-shadow:0 16px 44px rgba(0,0,0,.4);display:flex;flex-direction:column;gap:1px}
.icv-ctxmenu-item{display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border:0;border-radius:7px;background:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer;text-align:left}
.icv-ctxmenu-item:hover,.icv-ctxmenu-item:focus-visible{background:var(--dsw-alias-bg-layer-2);outline:none}
.icv-ctxmenu-danger{color:var(--dsw-alias-state-error-primary)}
.icv-ctxmenu-hint{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-secondary)}
.icv-ctxmenu-sep{height:1px;margin:4px 6px;background:var(--dsw-alias-border-l1)}
.icv-keybar{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);flex:none;flex-wrap:wrap}
.icv-keystrip{display:flex;align-items:center;gap:6px;padding:3px 4px 3px 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-2);flex:none;max-width:100%}
.icv-keystrip-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;padding-right:2px}
.icv-keystrip-badge-ok{color:var(--dsw-alias-state-success-primary)}
.icv-keystrip-input{height:24px;width:150px;font-size:11px}
.icv-keystrip .icv-btn{height:24px;padding:0 8px;font-size:11px}
.icv-addmenu{position:absolute;z-index:70;width:300px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);box-shadow:0 16px 44px rgba(0,0,0,.34);padding:8px;display:flex;flex-direction:column;gap:2px;max-height:min(70vh,520px);overflow:auto}
.icv-addmenu-head{display:flex;align-items:center;justify-content:space-between;padding:4px 6px 8px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.icv-addmenu-search{display:flex;align-items:center;gap:6px;padding:0 6px}
.icv-addmenu-item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;text-align:left}
.icv-addmenu-item:hover,.icv-addmenu-item:focus-visible{background:var(--dsw-alias-bg-layer-2);outline:none}
.icv-addmenu-sep{height:1px;margin:6px 4px;background:var(--dsw-alias-border-l1)}
.icv-addmenu-group{padding:4px 6px 2px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.icv-addmenu-empty{padding:10px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.icv-refpop{position:absolute;z-index:70;width:min(320px,80vw);max-height:240px;overflow:auto;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);box-shadow:0 14px 36px rgba(0,0,0,.3);padding:5px;display:flex;flex-direction:column;gap:1px}
.icv-refpop-item{display:flex;align-items:center;gap:8px;width:100%;padding:6px;border:0;border-radius:7px;background:none;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;text-align:left}
.icv-refpop-item:hover{background:var(--dsw-alias-bg-layer-2)}
.icv-refpop-thumb{width:30px;height:30px;border-radius:5px;object-fit:cover;flex:none;background:var(--dsw-alias-bg-layer-2)}
.icv-refpop-sub{font-size:11px;color:var(--dsw-alias-label-secondary)}
.icv-expanded{width:min(760px,94vw)}
.icv-expanded .icv-prompt{min-height:220px;max-height:52vh;font-size:14px;line-height:1.7;padding:14px}
.icv-expanded .icv-controls{padding:10px 14px}
.icv-expanded .icv-fragments{padding:10px 14px}
`

    /* ------------------------------------------------------------------ *
     * Icons and small controls
     * ------------------------------------------------------------------ */

    const ICONS = {
      upload: 'M12 16V4m0 0 4 4m-4-4-4 4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2',
      spark: 'M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
      fit: 'M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4',
      save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
      export: 'M12 4v11m0 0 4-4m-4 4-4-4M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1',
      gear: 'M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.6a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4z',
      crop: 'M6 3v13a2 2 0 0 0 2 2h13M3 6h13a2 2 0 0 1 2 2v13',
      image: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5',
      close: 'M6 6l12 12M18 6 6 18',
      link: 'M10 13a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L11 6.3M14 11a4 4 0 0 0-5.7 0L6 13.3a4 4 0 0 0 5.7 5.7l1.3-1.3',
      chevronLeft: 'M15 6l-6 6 6 6',
      chevronRight: 'M9 6l6 6-6 6',
      import: 'M12 15V4m0 0 4 4m-4-4-4 4M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1',
      text: 'M5 6h14M5 6v2M19 6v2M12 6v13M9 19h6',
      plus: 'M12 5v14M5 12h14',
      search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.6-3.6',
      expand: 'M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4',
      sparkleImage: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M18 3l.8 1.7L21 5.5l-2.2.8L18 8l-.8-1.7L15 5.5l2.2-.8z',
      imagePlus: 'M4 5h12v9H4zM4 11l3-3 3 3 2.5-2.5L16 12M18 15v6M15 18h6',
      palette: 'M12 3a9 9 0 1 0 0 18h1.6a1.8 1.8 0 0 0 1.3-3.1 1.8 1.8 0 0 1 1.3-3.1H19a2 2 0 0 0 2-2A9 9 0 0 0 12 3zM8 9h.01M12 7h.01M16 9h.01M7.5 13.5h.01',
      upscale: 'M9 15L15 9M15 9H10.2M15 9v4.8M4 4h16v16H4z',
      layout: 'M4 4h16v16H4zM4 10h16M10 10v10',
      key: 'M14.5 9.5a4 4 0 1 0-3.9 5H12l1.5 1.5L15 14.5l1 1L17.5 14l1-1-2.6-2.6a4 4 0 0 0-1.4-.9z',
      check: 'M4 12.5 9 17.5 20 6.5',
      copy: 'M9 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1',
      zoomIn: 'M11 5v12M5 11h12M20 20l-4.3-4.3',
      zoomOut: 'M5 11h12M20 20l-4.3-4.3',
      history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 8v4l3 2',
    }

    function Icon({ name, size }) {
      const edge = typeof size === 'number' ? size : 15
      return h(
        'svg',
        {
          width: edge,
          height: edge,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          style: { flex: 'none' },
        },
        h('path', { d: ICONS[name] ?? ICONS.spark }),
      )
    }

    function Button({ children, primary, ghost, danger, icon, title, onClick, disabled, small }) {
      const classes = ['icv-btn']
      if (primary) classes.push('icv-btn-primary')
      if (ghost) classes.push('icv-btn-ghost')
      if (danger) classes.push('icv-btn-danger')
      return h(
        'button',
        {
          type: 'button',
          className: classes.join(' '),
          onClick,
          disabled,
          title,
          style: small ? { height: '24px', padding: '0 8px', fontSize: '11px' } : undefined,
        },
        icon === undefined ? null : h(Icon, { name: icon }),
        children === undefined || children === null ? null : h('span', null, children),
      )
    }

    function IconButton({ name, title, onClick, disabled }) {
      return h(
        'button',
        { type: 'button', className: 'icv-icon-btn', title, 'aria-label': title, onClick, disabled },
        h(Icon, { name }),
      )
    }

    function Overlay({ label, onClose, children }) {
      const panelRef = useRef(null)
      const previousFocus = useRef(null)
      useEffect(() => {
        previousFocus.current = document.activeElement
        const node = panelRef.current
        // Focus the dialog itself so the first Tab lands inside it and Escape
        // reaches the handler below regardless of what had focus before.
        node?.focus?.()
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onClose()
            return
          }
          if (event.key !== 'Tab' || node === null) return
          const focusable = node.querySelectorAll(
            'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',
          )
          if (focusable.length === 0) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          // Keep Tab inside the dialog instead of walking the board behind it.
          if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
        window.addEventListener('keydown', onKey, true)
        return () => {
          window.removeEventListener('keydown', onKey, true)
          previousFocus.current?.focus?.()
        }
      }, [onClose])
      const node = h(
        'div',
        {
          className: 'icv-overlay',
          role: 'dialog',
          'aria-modal': true,
          'aria-label': label,
          ref: panelRef,
          tabIndex: -1,
          onPointerDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        children,
      )
      // A fixed overlay inside the panel would be clipped by the panel's own
      // stacking context, so lift it to the document body when that is possible.
      return typeof ReactDOM?.createPortal === 'function' ? ReactDOM.createPortal(node, document.body) : node
    }

    /* ------------------------------------------------------------------ *
     * Lightbox
     * ------------------------------------------------------------------ */

    const LIGHTBOX_MIN_ZOOM = 0.5
    const LIGHTBOX_MAX_ZOOM = 12

    /**
     * Full-size picture viewer.
     *
     * A generated image is often inspected for detail, so the wheel zooms in
     * around the pointer instead of scrolling the page: whatever is under the
     * cursor stays under the cursor. Once zoomed in, dragging pans the picture,
     * and a double click fits it back to the window.
     */
    function Lightbox({ node, t, onClose, onCrop, onUseAsReference }) {
      const src = assetUrl(node.assetId)
      const viewportRef = useRef(null)
      const [zoom, setZoom] = useState(1)
      const [offset, setOffset] = useState({ x: 0, y: 0 })
      const [dragging, setDragging] = useState(false)
      const viewRef = useRef({ zoom: 1, offset: { x: 0, y: 0 } })
      viewRef.current = { zoom, offset }

      const reset = () => {
        setZoom(1)
        setOffset({ x: 0, y: 0 })
      }

      useEffect(() => {
        const viewport = viewportRef.current
        if (viewport === null) return
        const onWheel = (event) => {
          event.preventDefault()
          const rect = viewport.getBoundingClientRect()
          const px = event.clientX - rect.left
          const py = event.clientY - rect.top
          const current = viewRef.current
          const factor = Math.exp(-event.deltaY * 0.0018)
          const next = clamp(current.zoom * factor, LIGHTBOX_MIN_ZOOM, LIGHTBOX_MAX_ZOOM)
          if (Math.abs(next - current.zoom) < 1e-4) return
          // Keep the point under the cursor fixed: the offset is measured from the
          // viewport centre, so scale it by the same ratio as the zoom.
          const ratio = next / current.zoom
          const offsetX = (current.offset.x - (px - rect.width / 2)) * ratio + (px - rect.width / 2)
          const offsetY = (current.offset.y - (py - rect.height / 2)) * ratio + (py - rect.height / 2)
          setZoom(next)
          setOffset({ x: offsetX, y: offsetY })
        }
        viewport.addEventListener('wheel', onWheel, { passive: false })
        return () => viewport.removeEventListener('wheel', onWheel)
      }, [])

      const beginPan = (event) => {
        if (event.button !== 0 || zoom <= 1) return
        event.preventDefault()
        event.stopPropagation()
        const startX = event.clientX
        const startY = event.clientY
        const origin = offset
        setDragging(true)
        const move = (moveEvent) => {
          setOffset({ x: origin.x + (moveEvent.clientX - startX), y: origin.y + (moveEvent.clientY - startY) })
        }
        const up = () => {
          setDragging(false)
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      }

      const download = async () => {
        try {
          const response = await fetch(src)
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = node.assetId
          anchor.click()
          setTimeout(() => URL.revokeObjectURL(url), 4000)
        } catch {
          window.open(src, '_blank')
        }
      }

      return h(
        Overlay,
        { label: t('action.preview'), onClose },
        h(
          'div',
          { className: 'icv-modal' },
          h(
            'div',
            { className: 'icv-modal-head' },
            h(Icon, { name: 'image' }),
            h('span', null, t('action.preview')),
            h('div', { className: 'icv-spacer' }),
            h('span', { className: 'icv-mono' }, `${String(node.width ?? '?')} × ${String(node.height ?? '?')}`),
            h(IconButton, { name: 'close', title: t('action.close'), onClick: onClose }),
          ),
          h(
            'div',
            {
              ref: viewportRef,
              className: 'icv-lightbox-view',
              'data-zoomed': zoom > 1 ? 'true' : 'false',
              'data-dragging': dragging ? 'true' : 'false',
              onPointerDown: beginPan,
              onDoubleClick: reset,
              title: t('preview.zoomHint'),
            },
            h('img', {
              className: 'icv-lightbox-img',
              src,
              alt: '',
              draggable: false,
              style: { transform: `translate(${String(offset.x)}px, ${String(offset.y)}px) scale(${String(zoom)})` },
            }),
            h(
              'div',
              { className: 'icv-lightbox-zoom', onPointerDown: (event) => event.stopPropagation() },
              h(IconButton, {
                name: 'zoomOut',
                title: t('preview.zoomOut'),
                onClick: () => setZoom((value) => clamp(value / 1.4, LIGHTBOX_MIN_ZOOM, LIGHTBOX_MAX_ZOOM)),
              }),
              h(
                'button',
                {
                  type: 'button',
                  className: 'icv-btn icv-btn-ghost',
                  style: { height: '26px', padding: '0 8px', fontSize: '11px', minWidth: '56px' },
                  title: t('preview.reset'),
                  onClick: reset,
                },
                `${String(Math.round(zoom * 100))}%`,
              ),
              h(IconButton, {
                name: 'zoomIn',
                title: t('preview.zoomIn'),
                onClick: () => setZoom((value) => clamp(value * 1.4, LIGHTBOX_MIN_ZOOM, LIGHTBOX_MAX_ZOOM)),
              }),
            ),
          ),
          h(
            'div',
            { className: 'icv-modal-foot' },
            h(Button, { icon: 'save', onClick: download }, t('action.download')),
            h(Button, { icon: 'crop', onClick: () => onCrop(node) }, t('action.crop')),
            h(Button, { icon: 'link', onClick: () => onUseAsReference(node) }, t('action.asReference')),
            h('div', { className: 'icv-spacer' }),
            h('span', { className: 'icv-mono' }, t('preview.zoomHint')),
            h('span', { className: 'icv-mono' }, node.assetId ?? ''),
          ),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * Cropper
     * ------------------------------------------------------------------ */

    const CROP_RATIOS = [
      { id: 'free', value: 0 },
      { id: '1:1', value: 1 },
      { id: '4:3', value: 4 / 3 },
      { id: '3:4', value: 3 / 4 },
      { id: '16:9', value: 16 / 9 },
      { id: '9:16', value: 9 / 16 },
      { id: '3:2', value: 3 / 2 },
      { id: '2:3', value: 2 / 3 },
    ]

    function Cropper({ node, t, onClose, onApply }) {
      const imgRef = useRef(null)
      const [box, setBox] = useState({ width: 0, height: 0 })
      const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 })
      const [ratio, setRatio] = useState(0)
      const [busy, setBusy] = useState(false)
      const [error, setError] = useState('')
      const rectRef = useRef(rect)
      rectRef.current = rect
      const boxRef = useRef(box)
      boxRef.current = box

      useEffect(() => {
        const image = imgRef.current
        if (image === null) return
        const apply = () => {
          const width = image.clientWidth
          const height = image.clientHeight
          if (width === 0 || height === 0) return
          setBox({ width, height })
          setRect({ x: 0, y: 0, w: width, h: height })
        }
        if (image.complete) apply()
        else image.addEventListener('load', apply, { once: true })
        const observer = new ResizeObserver(apply)
        observer.observe(image)
        return () => observer.disconnect()
      }, [node.assetId])

      const settle = (next, bounds, locked) => {
        const min = 16
        let w = clamp(next.w, min, bounds.width)
        let h = clamp(next.h, min, bounds.height)
        if (locked > 0) {
          if (w / h > locked) w = h * locked
          else h = w / locked
          if (w > bounds.width) {
            w = bounds.width
            h = w / locked
          }
          if (h > bounds.height) {
            h = bounds.height
            w = h * locked
          }
        }
        const x = clamp(next.x, 0, Math.max(0, bounds.width - w))
        const y = clamp(next.y, 0, Math.max(0, bounds.height - h))
        return { x, y, w, h }
      }

      const beginDrag = (event, mode) => {
        event.preventDefault()
        event.stopPropagation()
        const bounds = boxRef.current
        const start = rectRef.current
        const startX = event.clientX
        const startY = event.clientY
        const locked = ratio
        const move = (moveEvent) => {
          const dx = moveEvent.clientX - startX
          const dy = moveEvent.clientY - startY
          const next = { ...start }
          if (mode === 'move') {
            next.x = start.x + dx
            next.y = start.y + dy
          } else {
            if (mode.includes('e')) next.w = start.w + dx
            if (mode.includes('s')) next.h = start.h + dy
            if (mode.includes('w')) {
              next.w = start.w - dx
              next.x = start.x + dx
            }
            if (mode.includes('n')) {
              next.h = start.h - dy
              next.y = start.y + dy
            }
            if (locked > 0) {
              // Corner handles change both edges, so drive the ratio from
              // whichever axis actually moved rather than from a single edge.
              if (mode.includes('e') || mode.includes('w')) {
                next.h = next.w / locked
                if (mode.includes('n')) next.y = start.y + (start.h - next.h)
              } else {
                next.w = next.h * locked
                if (mode.includes('w')) next.x = start.x + (start.w - next.w)
              }
            }
          }
          setRect(settle(next, bounds, locked))
        }
        const up = () => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      }

      const chooseRatio = (value) => {
        setRatio(value)
        const bounds = boxRef.current
        if (value === 0) {
          setRect(settle(rectRef.current, bounds, 0))
          return
        }
        let w = bounds.width
        let h = w / value
        if (h > bounds.height) {
          h = bounds.height
          w = h * value
        }
        setRect({ x: (bounds.width - w) / 2, y: (bounds.height - h) / 2, w, h })
      }

      const apply = async () => {
        setBusy(true)
        setError('')
        try {
          const image = imgRef.current
          const bounds = boxRef.current
          if (image === null || bounds.width === 0) throw new Error('图片尚未加载')
          const current = rectRef.current
          const scaleX = image.naturalWidth / bounds.width
          const scaleY = image.naturalHeight / bounds.height
          const sx = Math.round(current.x * scaleX)
          const sy = Math.round(current.y * scaleY)
          const sw = Math.max(1, Math.round(current.w * scaleX))
          const sh = Math.max(1, Math.round(current.h * scaleY))
          const canvas = document.createElement('canvas')
          canvas.width = sw
          canvas.height = sh
          const context = canvas.getContext('2d')
          if (context === null) throw new Error('浏览器不支持 canvas 2d')
          context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh)
          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((value) => (value === null ? reject(new Error('裁切结果为空')) : resolve(value)), 'image/png')
          })
          await onApply(blob)
          onClose()
        } catch (caught) {
          setError(errText(caught))
        } finally {
          setBusy(false)
        }
      }

      const handles = [
        ['nw', { left: -6, top: -6, cursor: 'nwse-resize' }],
        ['n', { left: 'calc(50% - 6px)', top: -6, cursor: 'ns-resize' }],
        ['ne', { right: -6, top: -6, cursor: 'nesw-resize' }],
        ['e', { right: -6, top: 'calc(50% - 6px)', cursor: 'ew-resize' }],
        ['se', { right: -6, bottom: -6, cursor: 'nwse-resize' }],
        ['s', { left: 'calc(50% - 6px)', bottom: -6, cursor: 'ns-resize' }],
        ['sw', { left: -6, bottom: -6, cursor: 'nesw-resize' }],
        ['w', { left: -6, top: 'calc(50% - 6px)', cursor: 'ew-resize' }],
      ]

      const naturalWidth = imgRef.current?.naturalWidth ?? 0
      const naturalHeight = imgRef.current?.naturalHeight ?? 0
      const outputWidth = box.width === 0 ? 0 : Math.round((rect.w / box.width) * naturalWidth)
      const outputHeight = box.height === 0 ? 0 : Math.round((rect.h / box.height) * naturalHeight)

      const shades = [
        { left: 0, top: 0, width: '100%', height: rect.y },
        { left: 0, top: rect.y + rect.h, width: '100%', height: Math.max(0, box.height - rect.y - rect.h) },
        { left: 0, top: rect.y, width: rect.x, height: rect.h },
        { left: rect.x + rect.w, top: rect.y, width: Math.max(0, box.width - rect.x - rect.w), height: rect.h },
      ]

      return h(
        Overlay,
        { label: t('crop.title'), onClose },
        h(
          'div',
          { className: 'icv-modal' },
          h(
            'div',
            { className: 'icv-modal-head' },
            h(Icon, { name: 'crop' }),
            h('span', null, t('crop.title')),
            h('div', { className: 'icv-spacer' }),
            error === '' ? null : h('span', { className: 'icv-chip icv-chip-error' }, error),
          ),
          h(
            'div',
            { className: 'icv-modal-body' },
            h(
              'div',
              { className: 'icv-row' },
              h('span', { className: 'icv-mono' }, t('crop.ratio')),
              ...CROP_RATIOS.map((entry) =>
                h(
                  'button',
                  {
                    key: entry.id,
                    type: 'button',
                    className: `icv-btn${ratio === entry.value ? ' icv-btn-primary' : ' icv-btn-ghost'}`,
                    style: { height: '24px', padding: '0 8px', fontSize: '11px' },
                    onClick: () => chooseRatio(entry.value),
                  },
                  entry.label ?? (entry.id === 'free' ? t('crop.free') : entry.id),
                ),
              ),
            ),
            h(
              'div',
              { className: 'icv-crop-stage' },
              h('img', { ref: imgRef, src: assetUrl(node.assetId), alt: '', draggable: false }),
              ...shades.map((style, index) => h('div', { key: `s${String(index)}`, className: 'icv-crop-shade', style })),
              h(
                'div',
                {
                  className: 'icv-crop-rect',
                  style: { left: rect.x, top: rect.y, width: rect.w, height: rect.h },
                  onPointerDown: (event) => beginDrag(event, 'move'),
                },
                h('div', { className: 'icv-crop-grid' }),
                ...handles.map(([mode, style]) =>
                  h('div', {
                    key: mode,
                    className: 'icv-crop-handle',
                    style,
                    onPointerDown: (event) => beginDrag(event, mode),
                  }),
                ),
              ),
            ),
          ),
          h(
            'div',
            { className: 'icv-modal-foot' },
            h('span', { className: 'icv-mono' }, `${t('crop.size')} ${String(outputWidth)} × ${String(outputHeight)} px`),
            h('div', { className: 'icv-spacer' }),
            h(Button, { ghost: true, onClick: () => chooseRatio(0) }, t('crop.reset')),
            h(Button, { ghost: true, onClick: onClose }, t('action.cancel')),
            h(
              Button,
              { primary: true, icon: 'crop', onClick: apply, disabled: busy || box.width === 0 },
              busy ? t('status.saving') : t('crop.apply'),
            ),
          ),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * Settings
     * ------------------------------------------------------------------ */

    function SettingsDialog({ settings, t, onClose, onSaved }) {
      const [baseUrl, setBaseUrl] = useState(settings.baseUrl ?? '')
      const [model, setModel] = useState(settings.model ?? '')
      const [apiKey, setApiKey] = useState('')
      const [defaultSize, setDefaultSize] = useState(settings.defaultSize ?? '')
      const [busy, setBusy] = useState(false)
      const [message, setMessage] = useState('')
      const [error, setError] = useState('')

      const put = async (body) => {
        setBusy(true)
        setError('')
        setMessage('')
        try {
          const next = await requestJson('/settings', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          })
          setApiKey('')
          setMessage(t('settings.saved'))
          onSaved(next)
        } catch (caught) {
          setError(errText(caught))
        } finally {
          setBusy(false)
        }
      }

      return h(
        Overlay,
        { label: t('settings.title'), onClose },
        h(
          'div',
          { className: 'icv-modal', style: { width: 'min(520px, 94vw)' } },
          h(
            'div',
            { className: 'icv-modal-head' },
            h(Icon, { name: 'gear' }),
            h('span', null, t('settings.title')),
            h('div', { className: 'icv-spacer' }),
            h(
              'span',
              { className: `icv-chip ${settings.hasKey ? 'icv-chip-ok' : 'icv-chip-warn'}` },
              settings.hasKey ? `${t('label.keyConfigured')} ${settings.keyMask ?? ''}` : t('label.keyMissing'),
            ),
            h(IconButton, { name: 'close', title: t('action.close'), onClick: onClose }),
          ),
          h(
            'div',
            { className: 'icv-modal-body' },
            h(
              'div',
              { className: 'icv-field' },
              h('label', { htmlFor: 'icv-base-url' }, t('label.baseUrl')),
              h('input', {
                id: 'icv-base-url',
                className: 'icv-input',
                value: baseUrl,
                spellCheck: false,
                onChange: (event) => setBaseUrl(event.target.value),
              }),
              h('span', { className: 'icv-mono' }, t('settings.baseUrlHint')),
            ),
            h(
              'div',
              { className: 'icv-field' },
              h('label', { htmlFor: 'icv-model' }, t('label.model')),
              h('input', {
                id: 'icv-model',
                className: 'icv-input',
                value: model,
                spellCheck: false,
                onChange: (event) => setModel(event.target.value),
              }),
              h('span', { className: 'icv-mono' }, t('settings.modelHint')),
            ),
            h(
              'div',
              { className: 'icv-field' },
              h('label', { htmlFor: 'icv-api-key' }, t('label.apiKey')),
              h('input', {
                id: 'icv-api-key',
                className: 'icv-input',
                type: 'password',
                value: apiKey,
                placeholder: settings.hasKey ? (settings.keyMask ?? '') : '',
                autoComplete: 'off',
                onChange: (event) => setApiKey(event.target.value),
              }),
              h('span', { className: 'icv-mono' }, t('settings.keyHint')),
            ),
            h(
              'div',
              { className: 'icv-field' },
              h('label', { htmlFor: 'icv-default-size' }, t('label.defaultSize')),
              h(
                'select',
                {
                  id: 'icv-default-size',
                  className: 'icv-input',
                  value: defaultSize,
                  onChange: (event) => setDefaultSize(event.target.value),
                },
                ...RATIOS.flatMap((ratio) =>
                  RESOLUTIONS.map((resolution) =>
                    h('option', { key: `${ratio}-${resolution}`, value: sizeFor(ratio, resolution) }, `${ratio} · ${resolution}`),
                  ),
                ),
              ),
            ),
          ),
          h(
            'div',
            { className: 'icv-modal-foot' },
            h(Button, {
              ghost: true,
              danger: true,
              onClick: () => put({ baseUrl, model, defaultSize, clearKey: true, apiKey: '' }),
              disabled: busy || !settings.hasKey,
            }, t('settings.clearKey')),
            h('div', { className: 'icv-spacer' }),
            message === '' ? null : h('span', { className: 'icv-chip icv-chip-ok' }, message),
            error === '' ? null : h('span', { className: 'icv-chip icv-chip-error' }, error),
            h(Button, { ghost: true, onClick: onClose }, t('action.cancel')),
            h(
              Button,
              {
                primary: true,
                icon: 'save',
                disabled: busy,
                onClick: () => {
                  const body = { baseUrl, model, defaultSize }
                  if (apiKey.trim() !== '') body.apiKey = apiKey.trim()
                  void put(body)
                },
              },
              busy ? t('status.saving') : t('settings.save'),
            ),
          ),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * API key strip — always visible in the toolbar for quick swaps
     * ------------------------------------------------------------------ */

    /**
     * A one-line API key field that lives in the toolbar.
     *
     * Swapping the key is the one provider change a user makes repeatedly, so it
     * does not belong behind the settings dialog: type or paste, press Save, and
     * the stored value is replaced. The field never shows the stored key — only
     * whether one exists and its mask — so the secret never crosses the wire
     * back to the page.
     */
    function ApiKeyStrip({ settings, t, onSaved, onOpenSettings }) {
      const [draft, setDraft] = useState('')
      const [busy, setBusy] = useState(false)
      const [flash, setFlash] = useState('')
      const [warning, setWarning] = useState('')
      const [error, setError] = useState('')

      useEffect(() => {
        if (flash === '') return undefined
        const timer = setTimeout(() => setFlash(''), 2200)
        return () => clearTimeout(timer)
      }, [flash])

      const submit = async () => {
        const value = draft.trim()
        if (value === '' || busy) return
        setBusy(true)
        setError('')
        try {
          const next = await requestJson('/settings', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ apiKey: value }),
          })
          setDraft('')
          // Surfacing a fallback matters: a key that silently landed somewhere
          // other than the credential store is otherwise invisible until it
          // "disappears" on the next start.
          setFlash(next.keyWarning !== undefined ? t('settings.keySavedFallback') : t('settings.keySaved'))
          setWarning(next.keyWarning ?? '')
          onSaved(next)
        } catch (caught) {
          setError(errText(caught))
        } finally {
          setBusy(false)
        }
      }

      const configured = settings !== null && settings.hasKey

      return h(
        'div',
        { className: 'icv-keystrip', title: t('settings.keyHint') },
        h(
          'span',
          { className: `icv-keystrip-badge${configured ? ' icv-keystrip-badge-ok' : ''}` },
          h(Icon, { name: 'key', size: 13 }),
          configured ? settings.keyMask : t('label.keyMissing'),
        ),
        h('input', {
          className: 'icv-input icv-keystrip-input',
          type: 'password',
          value: draft,
          placeholder: configured ? t('settings.keyPlaceholder') : t('settings.keyPlaceholderEmpty'),
          autoComplete: 'off',
          spellCheck: false,
          'aria-label': t('label.apiKey'),
          onChange: (event) => setDraft(event.target.value),
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void submit()
            }
          },
        }),
        h(
          Button,
          { icon: 'check', small: true, primary: draft.trim() !== '', disabled: busy || draft.trim() === '', onClick: submit },
          busy ? t('settings.savingKey') : t('settings.saveKey'),
        ),
        flash === ''
          ? null
          : h('span', { className: `icv-chip ${warning === '' ? 'icv-chip-ok' : 'icv-chip-warn'}`, title: warning === '' ? undefined : warning }, flash),
        error === ''
          ? null
          : h('span', { className: 'icv-chip icv-chip-error', title: error }, t('settings.keyFailed')),
        h(IconButton, { name: 'gear', title: t('action.settings'), onClick: onOpenSettings }),
      )
    }

    /* ------------------------------------------------------------------ *
     * Image context menu
     * ------------------------------------------------------------------ */

    /**
     * The right-click menu on a finished picture.
     *
     * Fetches run against the content-addressed asset URL, so a menu action
     * never depends on the node still existing when it resolves.
     */
    function ImageMenu({ x, y, node, t, onClose, onPreview, onCrop, onAsReference, onDelete, onNotice }) {
      const menuRef = useRef(null)
      const assetSrc = assetUrl(node.assetId)

      useEffect(() => {
        const onPointer = (event) => {
          if (menuRef.current !== null && !menuRef.current.contains(event.target)) onClose()
        }
        const onKey = (event) => {
          if (event.key === 'Escape') onClose()
        }
        window.addEventListener('pointerdown', onPointer, true)
        window.addEventListener('keydown', onKey)
        return () => {
          window.removeEventListener('pointerdown', onPointer, true)
          window.removeEventListener('keydown', onKey)
        }
      }, [onClose])

      const download = () => {
        const anchorEl = document.createElement('a')
        anchorEl.href = assetSrc
        anchorEl.download = node.assetId
        anchorEl.click()
        onClose()
      }

      /**
       * Copy the decoded pixels.
       *
       * Clipboard image writes need a secure context and user permission, so a
       * refusal falls back to downloading rather than silently doing nothing.
       */
      const copyImage = async () => {
        try {
          const response = await fetch(assetSrc)
          const blob = await response.blob()
          const png = blob.type === 'image/png' ? blob : await convertToPng(blob)
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
          onNotice(t('notice.copied'))
        } catch {
          onNotice(t('notice.copyFailed'))
          const anchorEl = document.createElement('a')
          anchorEl.href = assetSrc
          anchorEl.download = node.assetId
          anchorEl.click()
        }
        onClose()
      }

      const copyAddress = async () => {
        try {
          await navigator.clipboard.writeText(new URL(assetSrc, window.location.origin).toString())
          onNotice(t('notice.copied'))
        } catch {
          onNotice(t('notice.copyFailed'))
        }
        onClose()
      }

      const items = [
        { key: 'preview', label: t('action.preview'), icon: 'image', run: () => onPreview(node) },
        { key: 'download', label: t('action.download'), icon: 'save', run: download },
        { key: 'copyImage', label: t('action.copy'), icon: 'copy', run: copyImage },
        { key: 'copyLink', label: t('action.copyLink'), icon: 'link', run: copyAddress },
        { key: 'crop', label: t('action.crop'), icon: 'crop', run: () => onCrop(node) },
        { key: 'ref', label: t('action.asReference'), icon: 'spark', run: () => onAsReference(node) },
        { key: 'delete', label: t('action.delete'), icon: 'close', danger: true, hint: 'Del', run: () => onDelete(node.id) },
      ]

      return h(
        'div',
        {
          ref: menuRef,
          className: 'icv-ctxmenu',
          style: { left: `${String(x)}px`, top: `${String(y)}px` },
          role: 'menu',
          'aria-label': t('action.preview'),
          onPointerDown: (event) => event.stopPropagation(),
          onContextMenu: (event) => event.preventDefault(),
        },
        ...items.map((item, index) =>
          h(
            'div',
            { key: item.key },
            item.key === 'delete' ? h('div', { className: 'icv-ctxmenu-sep' }) : null,
            h(
              'button',
              {
                type: 'button',
                role: 'menuitem',
                className: `icv-ctxmenu-item${item.danger ? ' icv-ctxmenu-danger' : ''}`,
                autoFocus: index === 0,
                onClick: () => {
                  item.run()
                  if (item.key !== 'copyImage' && item.key !== 'copyLink' && item.key !== 'download') onClose()
                },
              },
              h(Icon, { name: item.icon, size: 14 }),
              h('span', { style: { flex: 1 } }, item.label),
              item.hint === undefined ? null : h('span', { className: 'icv-ctxmenu-hint' }, item.hint),
            ),
          ),
        ),
      )
    }

    /** Re-encode any stored picture as PNG so the clipboard accepts it. */
    async function convertToPng(blob) {
      const url = URL.createObjectURL(blob)
      try {
        const image = await new Promise((resolve, reject) => {
          const probe = new Image()
          probe.onload = () => resolve(probe)
          probe.onerror = () => reject(new Error('decode failed'))
          probe.src = url
        })
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0)
        return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    /* ------------------------------------------------------------------ *
     * Confirm
     * ------------------------------------------------------------------ */

    function ConfirmDialog({ title, body, t, onCancel, onConfirm }) {
      return h(
        Overlay,
        { label: title, onClose: onCancel },
        h(
          'div',
          { className: 'icv-modal', style: { width: 'min(400px, 92vw)' } },
          h('div', { className: 'icv-modal-head' }, h(Icon, { name: 'close' }), h('span', null, title)),
          h('div', { className: 'icv-modal-body' }, h('p', { className: 'icv-type', style: { margin: 0 } }, body)),
          h(
            'div',
            { className: 'icv-modal-foot' },
            h('div', { className: 'icv-spacer' }),
            h(Button, { ghost: true, onClick: onCancel }, t('action.cancel')),
            h(Button, { primary: true, danger: true, onClick: onConfirm }, t('action.delete')),
          ),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * Add-node menu (a double-click on empty canvas)
     * ------------------------------------------------------------------ */

    /**
     * The menu LibTV shows when the empty canvas is double-clicked.
     *
     * It exists so the board states its own vocabulary: the first node a user
     * adds is often a text note or an upload, neither of which a bare
     * "new generation card" ever offered.
     */
    function AddNodeMenu({ x, y, t, onPick, onClose }) {
      const [query, setQuery] = useState('')
      const menuRef = useRef(null)
      const inputRef = useRef(null)

      const items = useMemo(
        () => [
          { id: 'text', icon: 'text', label: t('menu.text'), group: 'node' },
          { id: 'image', icon: 'imagePlus', label: t('menu.image'), group: 'node' },
          { id: 'upload', icon: 'upload', label: t('menu.upload'), group: 'material' },
        ],
        [t],
      )
      const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (needle === '') return items
        return items.filter((item) => item.label.toLowerCase().includes(needle))
      }, [items, query])

      useEffect(() => {
        inputRef.current?.focus?.()
        const onPointer = (event) => {
          if (menuRef.current !== null && !menuRef.current.contains(event.target)) onClose()
        }
        const onKey = (event) => {
          if (event.key === 'Escape') onClose()
        }
        // Capture so the stage's own pointer-down pan does not close first.
        window.addEventListener('pointerdown', onPointer, true)
        window.addEventListener('keydown', onKey)
        return () => {
          window.removeEventListener('pointerdown', onPointer, true)
          window.removeEventListener('keydown', onKey)
        }
      }, [onClose])

      const nodes = filtered.filter((item) => item.group === 'node')
      const material = filtered.filter((item) => item.group === 'material')

      const row = (item) =>
        h(
          'button',
          {
            type: 'button',
            key: item.id,
            className: 'icv-addmenu-item',
            onClick: () => onPick(item.id),
          },
          h(Icon, { name: item.icon, size: 17 }),
          h('span', null, item.label),
        )

      return h(
        'div',
        {
          ref: menuRef,
          className: 'icv-addmenu',
          style: { left: `${String(x)}px`, top: `${String(y)}px` },
          role: 'menu',
          'aria-label': t('action.addNode'),
          onPointerDown: (event) => event.stopPropagation(),
          onDoubleClick: (event) => event.stopPropagation(),
        },
        h(
          'div',
          { className: 'icv-addmenu-head' },
          h('span', null, t('menu.title')),
          h('div', { className: 'icv-addmenu-search' }, h(Icon, { name: 'search', size: 14 })),
        ),
        h(
          'div',
          { className: 'icv-addmenu-search', style: { paddingBottom: '6px' } },
          h('input', {
            ref: inputRef,
            className: 'icv-input',
            value: query,
            placeholder: t('menu.search'),
            onChange: (event) => setQuery(event.target.value),
            onKeyDown: (event) => {
              if (event.key !== 'Enter' || filtered.length === 0) return
              event.preventDefault()
              onPick(filtered[0].id)
            },
          }),
        ),
        nodes.length > 0 ? h('div', { className: 'icv-addmenu-group' }, t('action.addNode')) : null,
        ...nodes.map(row),
        material.length > 0 ? h('div', { className: 'icv-addmenu-sep' }) : null,
        material.length > 0 ? h('div', { className: 'icv-addmenu-group' }, t('menu.resources')) : null,
        ...material.map(row),
        filtered.length === 0 ? h('div', { className: 'icv-addmenu-empty' }, t('menu.none')) : null,
      )
    }

    /* ------------------------------------------------------------------ *
     * Reference picker (@ in the prompt)
     * ------------------------------------------------------------------ */

    function ReferencePicker({ candidates, t, onPick, onClose }) {
      const ref = useRef(null)
      useEffect(() => {
        const onPointer = (event) => {
          if (ref.current !== null && !ref.current.contains(event.target)) onClose()
        }
        const onKey = (event) => {
          if (event.key === 'Escape') onClose()
        }
        window.addEventListener('pointerdown', onPointer, true)
        window.addEventListener('keydown', onKey)
        return () => {
          window.removeEventListener('pointerdown', onPointer, true)
          window.removeEventListener('keydown', onKey)
        }
      }, [onClose])
      return h(
        'div',
        {
          ref,
          className: 'icv-refpop',
          style: { left: '8px', top: 'calc(100% - 4px)' },
          role: 'listbox',
          'aria-label': t('node.references'),
          onPointerDown: (event) => event.stopPropagation(),
        },
        candidates.length === 0
          ? h('div', { className: 'icv-addmenu-empty' }, t('menu.none'))
          : candidates.map((candidate) =>
              h(
                'button',
                {
                  type: 'button',
                  key: candidate.id,
                  className: 'icv-refpop-item',
                  onClick: () => onPick(candidate),
                },
                h('img', { className: 'icv-refpop-thumb', src: assetUrl(candidate.assetId), alt: '' }),
                h(
                  'span',
                  { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                  candidate.label,
                  h('span', { className: 'icv-refpop-sub' }, ` · ${String(candidate.width ?? '')}×${String(candidate.height ?? '')}`),
                ),
              ),
            ),
      )
    }

    /* ------------------------------------------------------------------ *
     * Prompt editor — the inline textarea and its expanded modal twin
     * ------------------------------------------------------------------ */

    function PromptEditor({ node, t, expanded, candidates, onPatch, onReference, onExpand, onGenerate, onPickFragment, busy, hasImage, count, onCount }) {
      const areaRef = useRef(null)
      const [picking, setPicking] = useState(false)
      const [openGroup, setOpenGroup] = useState(null)
      const parsed = pickersFrom(node.size)

      const setPrompt = (value) => onPatch(node.id, { prompt: value })

      /** Append a snippet without losing the caret or glueing words together. */
      const appendFragment = (text) => {
        const current = node.prompt ?? ''
        const separator = current.trim() === '' || /[\s，。]$/u.test(current) ? '' : '，'
        setPrompt(`${current}${separator}${text}`)
        setOpenGroup(null)
        areaRef.current?.focus?.()
      }

      const chooseReference = (candidate) => {
        onReference(node.id, candidate)
        setPicking(false)
      }

      const onAreaChange = (event) => {
        const value = event.target.value
        setPrompt(value)
        // `@` opens the material list; it stays open until a pick or Escape.
        setPicking(/@\s*$/u.test(value))
      }

      return h(
        'div',
        { className: expanded ? 'icv-expanded-inner' : undefined },
        h(
          'div',
          { className: 'icv-prompt-wrap' },
          h('textarea', {
            ref: areaRef,
            className: 'icv-prompt',
            value: node.prompt ?? '',
            placeholder: t('prompt.placeholder'),
            spellCheck: false,
            autoFocus: expanded,
            style: expanded ? { minHeight: '200px', maxHeight: '52vh', fontSize: '14px', padding: '14px' } : undefined,
            onChange: onAreaChange,
            onPointerDown: (event) => event.stopPropagation(),
            onKeyDown: (event) => {
              if (event.key === 'Escape' && picking) {
                event.stopPropagation()
                setPicking(false)
              }
            },
          }),
          expanded
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  className: 'icv-prompt-expand',
                  title: t('action.expand'),
                  'aria-label': t('action.expand'),
                  onClick: (event) => {
                    event.stopPropagation()
                    onExpand(node.id)
                  },
                },
                h(Icon, { name: 'expand', size: 13 }),
              ),
          picking
            ? h(ReferencePicker, {
                candidates,
                t,
                onPick: chooseReference,
                onClose: () => setPicking(false),
              })
            : null,
        ),
        h(
          'div',
          { className: 'icv-fragments' },
          ...[
            ['style', t('node.style'), null, 'sparkleImage'],
            ['color', t('node.color'), 'conic-gradient(#e2725b,#e6b85c,#7fb069,#5b9bd5,#8e6bc7,#e2725b)', 'palette'],
            ['compose', t('node.compose'), null, 'layout'],
          ].map(([group, label, swatch, icon]) =>
            h(
              'div',
              { key: group, style: { position: 'relative' } },
              h(
                'button',
                {
                  type: 'button',
                  className: 'icv-frag',
                  onClick: (event) => {
                    event.stopPropagation()
                    setOpenGroup((current) => (current === group ? null : group))
                  },
                },
                h(Icon, { name: icon, size: 13 }),
                h('span', null, label),
              ),
              openGroup === group
                ? h(
                    'div',
                    { className: 'icv-frag-pop', onPointerDown: (event) => event.stopPropagation() },
                    ...FRAGMENTS[group].map((text) =>
                      h(
                        'button',
                        { type: 'button', key: text, className: 'icv-frag-item', onClick: () => appendFragment(text) },
                        text,
                      ),
                    ),
                  )
                : null,
            ),
          ),
        ),
        h(
          'div',
          { className: 'icv-controls' },
          h('span', { className: 'icv-node-dot', style: { background: 'var(--dsw-alias-label-secondary)' } }),
          h('span', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary)' } }, t('label.model')),
          h(
            'select',
            {
              className: 'icv-select',
              value: node.model ?? '',
              'aria-label': t('label.model'),
              onChange: (event) => onPatch(node.id, { model: event.target.value }),
            },
            ...[['', 'gpt-image'], ['gpt-image-2.5-flare', 'flare'], ['gpt-image-1', 'gpt-image-1'], ['seedream-4', 'seedream-4'], ['flux-kontext', 'flux-kontext']].map(
              ([value, label]) => h('option', { key: value || 'default', value }, label),
            ),
          ),
          h(
            'select',
            {
              className: 'icv-select',
              value: parsed.ratio,
              'aria-label': t('label.ratio'),
              onChange: (event) => onPatch(node.id, { size: sizeFor(event.target.value, pickersFrom(node.size).resolution) }),
            },
            ...RATIOS.map((ratio) => h('option', { key: ratio, value: ratio }, ratio)),
          ),
          h(
            'div',
            { className: 'icv-chip', style: { height: '26px', padding: '0 3px', gap: '2px' } },
            ...RESOLUTIONS.map((resolution) =>
              h(
                'button',
                {
                  type: 'button',
                  key: resolution,
                  className: `icv-btn${parsed.resolution === resolution ? ' icv-btn-primary' : ' icv-btn-ghost'}`,
                  style: { height: '20px', padding: '0 6px', fontSize: '10px', border: 0 },
                  onClick: () => onPatch(node.id, { size: sizeFor(parsed.ratio, resolution) }),
                },
                resolution,
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: 'icv-node-foot' },
          h(IconButton, { name: 'spark', title: t('action.generate'), onClick: () => onGenerate(node.id) }),
          h('div', { className: 'icv-spacer', style: { flex: 1 } }),
          busy
            ? h('span', { className: 'icv-chip icv-chip-warn' }, t('status.generating'))
            : h('span', { className: 'icv-mono' }, hasImage ? t('action.regenerate') : ''),
          h(
            'button',
            {
              type: 'button',
              className: 'icv-btn icv-btn-primary',
              disabled: busy,
              title: t('action.generate'),
              onClick: () => onGenerate(node.id),
            },
            busy ? h('span', { className: 'icv-spin' }) : h(Icon, { name: 'spark', size: 14 }),
            h('span', null, hasImage ? t('action.regenerate') : t('action.generate')),
          ),
          h(
            'select',
            {
              className: 'icv-select',
              value: String(count ?? 1),
              'aria-label': t('label.count'),
              style: { maxWidth: '54px' },
              onChange: (event) => onCount(node.id, Number(event.target.value)),
            },
            ...[1, 2, 3, 4].map((value) => h('option', { key: String(value), value: String(value) }, `×${String(value)}`)),
          ),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * Expanded prompt modal
     * ------------------------------------------------------------------ */

    function PromptModal({ node, t, candidates, onPatch, onReference, onClose, onGenerate, busy }) {
      // The inner editor swallows Escape to close its own @ picker, so the modal
      // listens in the capture phase and closes unless a picker is open.
      useEffect(() => {
        const onKey = (event) => {
          if (event.key !== 'Escape') return
          const picking = document.querySelector('.icv-refpop') !== null
          const fragmentOpen = document.querySelector('.icv-frag-pop') !== null
          if (picking || fragmentOpen) return
          event.stopPropagation()
          onClose()
        }
        window.addEventListener('keydown', onKey, true)
        return () => window.removeEventListener('keydown', onKey, true)
      }, [onClose])
      return h(
        'div',
        { className: 'icv-overlay', role: 'dialog', 'aria-modal': true, 'aria-label': t('action.expand') },
        h(
          'div',
          { className: 'icv-modal icv-expanded' },
          h(
            'div',
            { className: 'icv-modal-head' },
            h(Icon, { name: 'sparkleImage' }),
            h('span', null, `${t('node.image')} ${String((node.prompt ?? '').slice(0, 28))}`),
            h('div', { className: 'icv-spacer' }),
            h(IconButton, { name: 'close', title: t('action.close'), onClick: onClose }),
          ),
          h(
            'div',
            { className: 'icv-modal-body', style: { padding: 0, gap: 0 } },
            h(PromptEditor, {
              node,
              t,
              expanded: true,
              candidates,
              onPatch,
              onReference,
              onExpand: () => {},
              onGenerate: (id) => {
                onGenerate(id)
                onClose()
              },
              busy,
              hasImage: Boolean(node.assetId),
              count: node.count,
              onCount: (id, value) => onPatch(id, { count: value }),
            }),
          ),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * Node card
     * ------------------------------------------------------------------ */

    /**
     * One card on the board.
     *
     * Two shapes share the frame: a text note that only holds prose, and an
     * image node that holds a result plus the tools that make one. Both expose
     * a dot on the right edge so a line can carry them into another node.
     */
    function NodeCard(props) {
      const { node, t, selected, references } = props
      const cardRef = useRef(null)
      const isText = node.kind === 'text'
      const width = node.baseWidth ?? (isText ? TEXT_WIDTH : IMAGE_WIDTH)
      const busy = node.status === 'busy'
      const hasImage = typeof node.assetId === 'string' && node.assetId !== ''
      /** A pure material node: an uploaded or dropped picture with no prompt. */
      const isAsset = isText ? false : node.kind === 'asset'
      const historyList = Array.isArray(node.history) ? node.history : []
      const historyIndex = {
        total: historyList.length,
        index: hasImage ? Math.max(0, historyList.indexOf(node.assetId)) : -1,
      }
      const ratio = hasImage && node.width > 0 && node.height > 0 ? node.height / node.width : 0.68
      const imageHeight = hasImage ? clamp(width * ratio, 120, width * 1.6) : 0
      const linkable = isText ? (node.text ?? '').trim() !== '' : hasImage

      useEffect(() => {
        const element = cardRef.current
        if (element === null) return
        const report = () => props.registerSize(node.id, { width: element.offsetWidth, height: element.offsetHeight })
        report()
        const observer = new ResizeObserver(report)
        observer.observe(element)
        return () => observer.disconnect()
      }, [node.id, props.registerSize, width, busy, hasImage, isAsset])

      /** Snippets that fill the prompt with a starting instruction. */
      const tryTemplate = (kind) => {
        const current = (node.prompt ?? '').trim()
        const seed = kind === 'img2img' ? t('node.img2img') : t('node.hd')
        props.onPatch(node.id, {
          prompt: current === '' ? `${seed}：` : current,
        })
        // Put the caret in the prompt so the next keystroke edits it.
        props.onFocusPrompt?.(node.id)
      }

      const head = h(
        'div',
        { className: 'icv-node-head' },
        h(Icon, { name: isText ? 'text' : isAsset ? 'image' : 'sparkleImage', size: 13 }),
        h(
          'span',
          { className: 'icv-node-kind' },
          isText
            ? t('node.text')
            : isAsset
              ? `${t('node.asset')} ${props.ordinal}`
              : `${t('node.image')} ${props.ordinal}`,
        ),
        busy ? h('span', { className: 'icv-chip icv-chip-warn' }, t('status.generating')) : null,
        !busy && node.status === 'error' ? h('span', { className: 'icv-chip icv-chip-error' }, t('status.failed')) : null,
        historyIndex.total > 1
          ? h('span', { className: 'icv-chip' }, `${String(historyIndex.index + 1)}/${String(historyIndex.total)}`)
          : null,
        h('div', { style: { flex: 1 } }),
        h(IconButton, { name: 'close', title: t('action.delete'), onClick: () => props.onRequestDelete(node.id) }),
      )

      /* ----- text node ----- */

      if (isText) {
        return h(
          'div',
          {
            ref: cardRef,
            className: 'icv-node',
            'data-node-id': node.id,
            'data-kind': 'text',
            'data-selected': selected ? 'true' : 'false',
            tabIndex: 0,
            role: 'group',
            'aria-label': `${t('node.text')} ${(node.text ?? '').slice(0, 40)}`,
            style: { left: node.x, top: node.y, width },
            onPointerDown: (event) => {
              if (event.button !== 0) return
              props.onSelect(node.id)
              if (event.target.closest?.('button,input,textarea,select,a,textarea') !== null) return
              props.onMoveStart(event, node)
            },
            onFocus: () => props.onSelect(node.id),
            onKeyDown: (event) => props.onArrows(event, node),
          },
          head,
          h(
            'div',
            { className: 'icv-node-body' },
            h('textarea', {
              className: 'icv-text',
              value: node.text ?? '',
              placeholder: t('node.textPlaceholder'),
              spellCheck: false,
              onChange: (event) => props.onPatch(node.id, { text: event.target.value }),
              onPointerDown: (event) => {
                props.onSelect(node.id)
                event.stopPropagation()
              },
            }),
          ),
          linkable
            ? h('div', {
                className: 'icv-port icv-port-out',
                title: t('action.asReference'),
                onPointerDown: (event) => props.onLinkStart(event, node),
              })
            : null,
          h('div', { className: 'icv-port icv-port-in icv-port-hidden', title: t('label.references') }),
          h('div', { className: 'icv-resize', onPointerDown: (event) => props.onResize(event, node) }),
        )
      }

      /* ----- material node (uploaded picture, no prompt or generation tools) ----- */

      if (isAsset) {
        return h(
          'div',
          {
            ref: cardRef,
            className: 'icv-node',
            'data-node-id': node.id,
            'data-kind': 'asset',
            'data-selected': selected ? 'true' : 'false',
            tabIndex: 0,
            role: 'group',
            'aria-label': `${t('node.asset')} ${props.ordinal}`,
            style: { left: node.x, top: node.y, width },
            onPointerDown: (event) => {
              if (event.button !== 0) return
              props.onSelect(node.id)
              if (event.target.closest?.('button,input,textarea,select,a') !== null) return
              props.onMoveStart(event, node)
            },
            onFocus: () => props.onSelect(node.id),
            onKeyDown: (event) => props.onArrows(event, node),
          },
          head,
          h(
            'div',
            { className: 'icv-node-body' },
            h(
              'div',
              {
                className: 'icv-thumb-wrap',
                'data-empty': hasImage ? 'false' : 'true',
                role: 'button',
                tabIndex: 0,
                onClick: () => props.onPreview(node),
                onContextMenu: (event) => {
                  if (!hasImage) return
                  event.preventDefault()
                  event.stopPropagation()
                  props.onImageMenu(event, node)
                },
                onPointerDown: (event) => event.stopPropagation(),
                onKeyDown: (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    props.onPreview(node)
                  }
                },
                title: t('action.preview'),
              },
              hasImage
                ? h('img', {
                    className: 'icv-thumb',
                    src: assetUrl(node.assetId),
                    alt: '',
                    draggable: false,
                    style: { height: `${String(Math.round(imageHeight))}px` },
                  })
                : h('div', { className: 'icv-thumb-empty' }, h(Icon, { name: 'image', size: 34 })),
            ),
          ),
          h(
            'div',
            { className: 'icv-node-foot', style: { borderTop: '1px solid var(--dsw-alias-border-l1)' } },
            h(IconButton, { name: 'image', title: t('action.preview'), onClick: () => props.onPreview(node) }),
            h(IconButton, { name: 'crop', title: t('action.crop'), onClick: () => props.onCrop(node) }),
            h(IconButton, { name: 'spark', title: t('action.asReference'), onClick: () => props.onAsReference(node) }),
            h('div', { className: 'icv-spacer', style: { flex: 1 } }),
            h(
              'span',
              { className: 'icv-mono' },
              `${String(Math.round(node.width ?? 0))} × ${String(Math.round(node.height ?? 0))}`,
            ),
          ),
          h('div', {
            className: 'icv-port icv-port-out',
            title: t('action.asReference'),
            style: linkable ? undefined : { display: 'none' },
            onPointerDown: (event) => props.onLinkStart(event, node),
          }),
          h('div', { className: 'icv-port icv-port-in icv-port-hidden', title: t('label.references') }),
          h('div', { className: 'icv-resize', onPointerDown: (event) => props.onResize(event, node) }),
        )
      }

      /* ----- image node ----- */

      const candidates = props.candidates ?? []

      return h(
        'div',
        {
          ref: cardRef,
          className: 'icv-node',
          'data-node-id': node.id,
          'data-kind': 'image',
          'data-selected': selected ? 'true' : 'false',
          tabIndex: 0,
          role: 'group',
          'aria-label': `${t('node.image')} ${props.ordinal}`,
          style: { left: node.x, top: node.y, width },
          onPointerDown: (event) => {
            if (event.button !== 0) return
            props.onSelect(node.id)
            if (event.target.closest?.('button,input,textarea,select,a') !== null) return
            props.onMoveStart(event, node)
          },
          onFocus: () => props.onSelect(node.id),
          onKeyDown: (event) => props.onArrows(event, node),
        },
        head,
        h(
          'div',
          { className: 'icv-node-body' },
          /* The picture, or the placeholder LibTV draws before one exists. */
          h(
            'div',
            {
              className: 'icv-thumb-wrap',
              'data-empty': hasImage ? 'false' : 'true',
              role: 'button',
              tabIndex: 0,
              // Clicking the picture shows the picture. The prompt editor still
              // has its own ⤢ button, so one click never hides the result the
              // user just clicked on.
              onClick: () => (hasImage ? props.onPreview(node) : props.onExpand(node.id)),
              onContextMenu: (event) => {
                if (!hasImage) return
                event.preventDefault()
                event.stopPropagation()
                props.onImageMenu(event, node)
              },
              onPointerDown: (event) => event.stopPropagation(),
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  if (hasImage) props.onPreview(node)
                  else props.onExpand(node.id)
                }
              },
              title: hasImage ? t('action.preview') : t('prompt.placeholder'),
            },
            busy
              ? h('div', { className: 'icv-busy' }, h('span', { className: 'icv-spin' }), h('span', null, t('status.generating')))
              : hasImage
                ? h('img', {
                    className: 'icv-thumb',
                    src: assetUrl(node.assetId),
                    alt: '',
                    draggable: false,
                    style: { height: `${String(Math.round(imageHeight))}px` },
                  })
                : h(
                    'div',
                    { className: 'icv-thumb-empty' },
                    h(Icon, { name: 'image', size: 34 }),
                    hasImage ? null : h('div', null, t('prompt.placeholder')),
                  ),
            /* Before the first result the card teaches its own next steps. */
            hasImage || busy
              ? null
              : h(
                  'div',
                  { className: 'icv-template' },
                  h('div', { className: 'icv-template-label' }, t('node.try')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'icv-template-row',
                      onClick: (event) => {
                        event.stopPropagation()
                        tryTemplate('img2img')
                      },
                    },
                    h(Icon, { name: 'upload', size: 13 }),
                    h('span', null, t('node.img2img')),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'icv-template-row',
                      onClick: (event) => {
                        event.stopPropagation()
                        tryTemplate('hd')
                      },
                    },
                    h(Icon, { name: 'upscale', size: 13 }),
                    h('span', null, t('node.hd')),
                  ),
                ),
          ),
          references.length > 0
            ? h(
                'div',
                { className: 'icv-refs' },
                ...references.map((reference) =>
                  h(
                    'div',
                    { key: reference.nodeId, className: 'icv-ref', title: reference.label },
                    h('img', { src: assetUrl(reference.assetId), alt: '' }),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'icv-ref-x',
                        title: t('action.removeReference'),
                        onClick: () => props.onDetachReference(reference.nodeId, node.id),
                      },
                      '×',
                    ),
                  ),
                ),
              )
            : null,
          h(PromptEditor, {
            node,
            t,
            expanded: false,
            candidates,
            busy,
            hasImage,
            count: node.count,
            onPatch: props.onPatch,
            onReference: props.onReference,
            onExpand: props.onExpand,
            onGenerate: props.onGenerate,
            onCount: (id, value) => props.onPatch(id, { count: value }),
          }),
          node.error ? h('div', { className: 'icv-node-error' }, node.error) : null,
          hasImage
            ? h(
                'div',
                { className: 'icv-history' },
                h(
                  'div',
                  { className: 'icv-history-head' },
                  h(Icon, { name: 'history', size: 12 }),
                  h('span', null, t('history.label')),
                  h('span', { className: 'icv-history-count' }, historyIndex.total === 0 ? t('history.empty') : `${String(historyIndex.index + 1)}/${String(historyIndex.total)}`),
                ),
                historyList.length === 0
                  ? null
                  : h(
                      'div',
                      { className: 'icv-history-strip' },
                      ...historyList.map((assetId, position) =>
                        h(
                          'button',
                          {
                            type: 'button',
                            key: `${assetId}-${String(position)}`,
                            className: 'icv-history-thumb',
                            'data-active': assetId === node.assetId ? 'true' : 'false',
                            title: t('history.current'),
                            onClick: (event) => {
                              event.stopPropagation()
                              props.onPickHistory(node.id, assetId)
                            },
                          },
                          h('img', { src: assetUrl(assetId), alt: '', draggable: false }),
                          historyList.length > 1
                            ? h(
                                'span',
                                {
                                  className: 'icv-history-x',
                                  title: t('history.remove'),
                                  role: 'button',
                                  tabIndex: 0,
                                  onClick: (event) => {
                                    event.stopPropagation()
                                    props.onDropHistory(node.id, assetId)
                                  },
                                },
                                '\u00d7',
                              )
                            : null,
                        ),
                      ),
                    ),
              )
            : null,
          hasImage
            ? h(
                'div',
                { className: 'icv-node-foot', style: { borderTop: '1px solid var(--dsw-alias-border-l1)' } },
                h(IconButton, { name: 'image', title: t('action.preview'), onClick: () => props.onPreview(node) }),
                h(IconButton, { name: 'crop', title: t('action.crop'), onClick: () => props.onCrop(node) }),
                h('div', { className: 'icv-spacer', style: { flex: 1 } }),
                historyIndex.total > 1
                  ? h(
                      'div',
                      { className: 'icv-row', style: { gap: '2px' } },
                      h(IconButton, {
                        name: 'chevronLeft',
                        title: t('action.prev'),
                        disabled: historyIndex.index <= 0,
                        onClick: () => props.onHistory(node.id, -1),
                      }),
                      h(IconButton, {
                        name: 'chevronRight',
                        title: t('action.next'),
                        disabled: historyIndex.index >= historyIndex.total - 1,
                        onClick: () => props.onHistory(node.id, 1),
                      }),
                    )
                  : null,
              )
            : null,
        ),
        h('div', {
          className: 'icv-port icv-port-out',
          title: t('action.asReference'),
          style: linkable ? undefined : { display: 'none' },
          onPointerDown: (event) => props.onLinkStart(event, node),
        }),
        h('div', { className: 'icv-port icv-port-in', title: t('label.references') }),
        h('div', { className: 'icv-resize', onPointerDown: (event) => props.onResize(event, node) }),
      )
    }


    /* ------------------------------------------------------------------ *
     * The board
     * ------------------------------------------------------------------ */

    function CanvasPanel(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key
      const stageRef = useRef(null)
      const fileRef = useRef(null)
      const [doc, setDoc] = useState({ nodes: [], edges: [], view: { x: 60, y: 60, k: 1 } })
      const [settings, setSettings] = useState(null)
      const [loaded, setLoaded] = useState(false)
      const [loadError, setLoadError] = useState('')
      const [notice, setNotice] = useState('')
      const [saveState, setSaveState] = useState('idle')
      const [saveError, setSaveError] = useState('')
      const [selected, setSelected] = useState(null)
      const [preview, setPreview] = useState(null)
      const [cropTarget, setCropTarget] = useState(null)
      const [expandedNode, setExpandedNode] = useState(null)
      const [addMenu, setAddMenu] = useState(null)
      const [imageMenu, setImageMenu] = useState(null)
      const [settingsOpen, setSettingsOpen] = useState(false)
      const [pendingDelete, setPendingDelete] = useState(null)
      const [panning, setPanning] = useState(false)
      const [link, setLink] = useState(null)
      const [sizes, setSizes] = useState({})
      const [stageBox, setStageBox] = useState({ width: 0, height: 0 })
      /**
       * Result of the update check.
       *
       * DSH's own updater reads npm, so a build shipped as a GitHub Release
       * would never hear about a new version. This panel asks the Host instead
       * and shows a banner; the state is `null` until the first answer.
       */
      const [update, setUpdate] = useState(null)
      const [updateDismissed, setUpdateDismissed] = useState(false)
      const [updateBusy, setUpdateBusy] = useState(false)

      const docRef = useRef(doc)
      docRef.current = doc
      const saveTimer = useRef(null)
      const saveSeq = useRef(0)
      const savedSeq = useRef(0)
      const loadedOk = useRef(false)
      const importRef = useRef(null)
      const focusRequest = useRef(null)
      /** Where a file picked from "Upload" should land on the board. */
      const uploadOrigin = useRef(null)

      const modalOpen =
        preview !== null || cropTarget !== null || expandedNode !== null || settingsOpen || pendingDelete !== null || imageMenu !== null

      /**
       * The document as it should be stored.
       *
       * Transient card state (`busy`, an error message) belongs to this page
       * only: persisting it would restore a spinner that never resolves.
       */
      const serializable = useCallback((value) => ({
        ...value,
        nodes: value.nodes.map((node) => {
          const { status, error, ...rest } = node
          return status === 'busy' || status === 'error' ? { ...rest, status: 'ready' } : rest
        }),
      }), [])

      const nodesById = useMemo(() => {
        const map = new Map()
        for (const node of doc.nodes) map.set(node.id, node)
        return map
      }, [doc.nodes])

      const registerSize = useCallback((id, size) => {
        setSizes((current) => {
          const previous = current[id]
          if (previous !== undefined && previous.width === size.width && previous.height === size.height) return current
          return { ...current, [id]: size }
        })
      }, [])

      /* ----- persistence ----- */

      /**
       * Send the current document to the Host.
       *
       * Saves are sequenced and never overlap: a slower older PUT must not land
       * after a newer one and resurrect a deleted card.
       */
      const flush = useCallback(async () => {
        if (!loadedOk.current) return
        const seq = saveSeq.current + 1
        saveSeq.current = seq
        setSaveState('saving')
        try {
          await requestJson('/state', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(serializable(docRef.current)),
          })
          if (seq < savedSeq.current) return
          savedSeq.current = seq
          setSaveState('saved')
          setSaveError('')
        } catch (caught) {
          setSaveState('error')
          setSaveError(errText(caught))
        }
      }, [serializable])

      const scheduleSave = useCallback(() => {
        if (!loadedOk.current) return
        setSaveState('saving')
        if (saveTimer.current !== null) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
          saveTimer.current = null
          void flush()
        }, 650)
      }, [flush])

      useEffect(() => () => {
        if (saveTimer.current !== null) clearTimeout(saveTimer.current)
      }, [])

      useEffect(() => {
        let cancelled = false
        void (async () => {
          let board
          try {
            board = await requestJson('/state', { method: 'GET' })
          } catch (caught) {
            // Without the stored board the canvas must stay read-only: showing an
            // empty board and then autosaving it would overwrite the real one.
            if (!cancelled) {
              setLoadError(errText(caught))
              setLoaded(true)
            }
            return
          }
          if (cancelled) return
          setDoc({
            nodes: Array.isArray(board.nodes) ? board.nodes.map(migrateNode) : [],
            edges: Array.isArray(board.edges) ? board.edges : [],
            view: board.view ?? { x: 60, y: 60, k: 1 },
          })
          loadedOk.current = true
          setLoaded(true)
          try {
            setSettings(await requestJson('/settings', { method: 'GET' }))
          } catch {
            setSettings({ baseUrl: '', model: '', defaultSize: '', hasKey: false, keyMask: '' })
          }
        })()
        return () => {
          cancelled = true
        }
      }, [])

      useEffect(() => {
        let cancelled = false

        /**
         * Ask the Host about newer releases.
         *
         * Runs once when the panel mounts and then hourly. The Host caches the
         * answer for six hours, so this is cheap; a failure stays silent here
         * because a network hiccup is not something the user must act on.
         */
        const check = async () => {
          try {
            const answer = await requestJson('/update-check', { method: 'GET' })
            if (!cancelled && answer?.ok === true) setUpdate(answer)
          } catch {
            // A failed check is not a user-facing error; keep the last answer.
          }
        }

        void check()
        const timer = setInterval(() => void check(), 60 * 60 * 1000)
        return () => {
          cancelled = true
          clearInterval(timer)
        }
      }, [])

      const refreshUpdate = useCallback(async () => {
        setUpdateBusy(true)
        try {
          const answer = await requestJson('/update-check?force=1', { method: 'GET' })
          if (answer?.ok === true) {
            setUpdate(answer)
            setUpdateDismissed(false)
          }
        } catch {
          // Leave the previous answer in place; the banner keeps its state.
        } finally {
          setUpdateBusy(false)
        }
      }, [])

      useEffect(() => {
        const stage = stageRef.current
        if (stage === null) return
        const measure = () => {
          const width = stage.clientWidth
          const height = stage.clientHeight
          setStageBox((current) => (current.width === width && current.height === height ? current : { width, height }))
        }
        const observer = new ResizeObserver(measure)
        observer.observe(stage)
        measure()
        return () => observer.disconnect()
      }, [loaded])

      /* ----- document mutations ----- */

      const patchNode = useCallback(
        (id, patch) => {
          setDoc((current) => ({ ...current, nodes: current.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)) }))
          scheduleSave()
        },
        [scheduleSave],
      )

      const addNode = useCallback(
        (node) => {
          setDoc((current) => ({ ...current, nodes: [...current.nodes, node] }))
          scheduleSave()
          return node
        },
        [scheduleSave],
      )

      const removeNode = useCallback(
        (id) => {
          setDoc((current) => ({
            ...current,
            nodes: current.nodes.filter((node) => node.id !== id),
            edges: current.edges.filter((edge) => edge.from !== id && edge.to !== id),
          }))
          setSelected((current) => (current === id ? null : current))
          scheduleSave()
        },
        [scheduleSave],
      )

      const addEdge = useCallback(
        (from, to) => {
          if (from === to) return
          setDoc((current) => {
            if (current.edges.some((edge) => edge.from === from && edge.to === to)) return current
            return { ...current, edges: [...current.edges, { id: newId('edge'), from, to }] }
          })
          scheduleSave()
        },
        [scheduleSave],
      )

      const removeEdge = useCallback(
        (from, to) => {
          setDoc((current) => ({ ...current, edges: current.edges.filter((edge) => !(edge.from === from && edge.to === to)) }))
          scheduleSave()
        },
        [scheduleSave],
      )

      /* ----- coordinates ----- */

      const toWorld = useCallback((clientX, clientY) => {
        const stage = stageRef.current
        const view = docRef.current.view
        if (stage === null) return { x: 60, y: 60 }
        const rect = stage.getBoundingClientRect()
        return { x: (clientX - rect.left - view.x) / view.k, y: (clientY - rect.top - view.y) / view.k }
      }, [])

      const toWorldFromCentre = useCallback(() => {
        const stage = stageRef.current
        if (stage === null) return { x: 60, y: 60 }
        const rect = stage.getBoundingClientRect()
        return toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2)
      }, [toWorld])

      /* ----- zoom ----- */

      useEffect(() => {
        const stage = stageRef.current
        if (stage === null) return
        let settle = null
        const onWheel = (event) => {
          // A prompt textarea scrolls itself; zooming the board underneath it
          // would be a surprise.
          if (event.target !== stage && event.target.closest?.('[data-node-id]') !== null) return
          event.preventDefault()
          const rect = stage.getBoundingClientRect()
          const px = event.clientX - rect.left
          const py = event.clientY - rect.top
          setDoc((current) => {
            const view = current.view
            const factor = Math.exp(-event.deltaY * 0.0015)
            const k = clamp(view.k * factor, MIN_ZOOM, MAX_ZOOM)
            if (Math.abs(k - view.k) < 1e-6) return current
            const worldX = (px - view.x) / view.k
            const worldY = (py - view.y) / view.k
            return { ...current, view: { k, x: px - worldX * k, y: py - worldY * k } }
          })
          // The viewport is part of the document, so it has to be stored too.
          if (settle !== null) clearTimeout(settle)
          settle = setTimeout(() => {
            settle = null
            scheduleSave()
          }, 500)
        }
        stage.addEventListener('wheel', onWheel, { passive: false })
        return () => {
          if (settle !== null) clearTimeout(settle)
          stage.removeEventListener('wheel', onWheel)
        }
      }, [loaded, scheduleSave])

      /* ----- pan ----- */

      const beginPan = (event) => {
        if (event.button !== 0 && event.button !== 1) return
        if (event.target !== event.currentTarget) return
        const startX = event.clientX
        const startY = event.clientY
        const startView = docRef.current.view
        setPanning(true)
        setSelected(null)
        const move = (moveEvent) => {
          setDoc((current) => ({
            ...current,
            view: { x: startView.x + (moveEvent.clientX - startX), y: startView.y + (moveEvent.clientY - startY), k: startView.k },
          }))
        }
        const up = () => {
          setPanning(false)
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
          scheduleSave()
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      }

      /* ----- node gestures ----- */

      const beginMove = (event, node) => {
        event.stopPropagation()
        const startX = event.clientX
        const startY = event.clientY
        const origin = { x: node.x, y: node.y }
        const zoom = docRef.current.view.k
        const move = (moveEvent) => {
          const dx = (moveEvent.clientX - startX) / zoom
          const dy = (moveEvent.clientY - startY) / zoom
          setDoc((current) => ({
            ...current,
            nodes: current.nodes.map((entry) => (entry.id === node.id ? { ...entry, x: Math.round(origin.x + dx), y: Math.round(origin.y + dy) } : entry)),
          }))
        }
        const up = () => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
          scheduleSave()
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      }

      const beginResize = (event, node) => {
        event.stopPropagation()
        event.preventDefault()
        const startX = event.clientX
        const startWidth = node.baseWidth ?? IMAGE_WIDTH
        const zoom = docRef.current.view.k
        const move = (moveEvent) => {
          const width = clamp(startWidth + (moveEvent.clientX - startX) / zoom, NODE_MIN_WIDTH, NODE_MAX_WIDTH)
          setDoc((current) => ({
            ...current,
            nodes: current.nodes.map((entry) => (entry.id === node.id ? { ...entry, baseWidth: Math.round(width) } : entry)),
          }))
        }
        const up = () => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
          scheduleSave()
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      }

      const beginLink = (event, node) => {
        event.stopPropagation()
        event.preventDefault()
        if (node.assetId === undefined) return
        setLink({ from: node.id, x: node.x + (node.baseWidth ?? IMAGE_WIDTH), y: node.y + DOT_TOP })
        const move = (moveEvent) => {
          const point = toWorld(moveEvent.clientX, moveEvent.clientY)
          setLink((current) => (current === null ? null : { ...current, x: point.x, y: point.y }))
        }
        const up = (upEvent) => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
          setLink(null)
          const element = document.elementFromPoint(upEvent.clientX, upEvent.clientY)
          const targetId = element?.closest?.('[data-node-id]')?.getAttribute('data-node-id')
          if (typeof targetId !== 'string') return
          const target = docRef.current.nodes.find((entry) => entry.id === targetId)
          // Only image nodes consume input; a text node is a source, never a sink.
          if (target?.kind === 'image') addEdge(node.id, targetId)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      }

      /* ----- assets ----- */

      const uploadBlob = useCallback(async (blob, type) => {
        const response = await fetch(`${API}/assets`, {
          method: 'POST',
          headers: { 'content-type': type || blob.type || 'application/octet-stream' },
          body: blob,
        })
        const text = await response.text()
        let payload
        try {
          payload = JSON.parse(text)
        } catch {
          throw new Error(`HTTP ${String(response.status)}`)
        }
        if (!response.ok) throw new Error(payload.error ?? `HTTP ${String(response.status)}`)
        return payload
      }, [])

      const uploadFiles = useCallback(
        async (files, at) => {
          const images = files.filter((file) => file.type.startsWith('image/'))
          if (images.length === 0) return
          const origin = at ?? toWorldFromCentre()
          let index = 0
          for (const file of images) {
            if (file.size > UPLOAD_MAX_BYTES) {
              setNotice(`${t('error.upload')}：${file.name} ${t('error.tooLarge')}`)
              continue
            }
            try {
              const asset = await uploadBlob(file, file.type)
              // A dropped or pasted file is material, not a prompt: it gets the
              // plain picture node with no generation controls.
              addNode({
                id: newId('ast'),
                kind: 'asset',
                x: Math.round(origin.x + index * 40),
                y: Math.round(origin.y + index * 40),
                baseWidth: IMAGE_WIDTH,
                assetId: asset.id,
                width: asset.width,
                height: asset.height,
                history: [asset.id],
                status: 'ready',
              })
            } catch (caught) {
              setNotice(`${t('error.upload')}：${errText(caught)}`)
            }
            index += 1
          }
        },
        [addNode, t, toWorldFromCentre, uploadBlob],
      )

      /** Repoint a node at another stored asset and adopt its real size. */
      const applyAsset = useCallback(
        async (nodeId, assetId) => {
          const size = await measureAsset(assetId)
          const node = docRef.current.nodes.find((entry) => entry.id === nodeId)
          const history = Array.isArray(node?.history) ? [...node.history] : []
          if (!history.includes(assetId)) history.push(assetId)
          patchNode(nodeId, {
            assetId,
            width: size.width || node?.width || 0,
            height: size.height || node?.height || 0,
            history,
            status: 'ready',
            error: '',
          })
        },
        [patchNode],
      )

      /* ----- generation ----- */

      /**
       * Run one image node.
       *
       * Incoming edges supply what the request needs: image node edges become
       * reference images, text node edges become prompt context, the way a style
       * or character note visually sitting on the line into a node would read.
       */
      const generate = useCallback(
        async (nodeId) => {
          const node = docRef.current.nodes.find((entry) => entry.id === nodeId)
          if (node === undefined || node.kind === 'text') return
          const incoming = docRef.current.edges
            .filter((edge) => edge.to === nodeId)
            .map((edge) => docRef.current.nodes.find((entry) => entry.id === edge.from))
            .filter((entry) => entry !== undefined)
          const references = incoming
            .filter((entry) => entry.kind !== 'text' && typeof entry.assetId === 'string')
            .map((entry) => entry.assetId)
          const contextNotes = incoming
            .filter((entry) => entry.kind === 'text' && (entry.text ?? '').trim() !== '')
            .map((entry) => (entry.text ?? '').trim())
          const own = (node.prompt ?? '').trim()
          if (own === '' && contextNotes.length === 0) {
            patchNode(nodeId, { status: 'error', error: t('prompt.empty') })
            return
          }
          const prompt = [own, ...contextNotes].filter((part) => part !== '').join('\n\n')
          patchNode(nodeId, { status: 'busy', error: '' })
          try {
            const payload = await requestJson('/generate', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                prompt,
                model: node.model ?? '',
                size: node.size ?? '',
                n: node.count ?? 1,
                references,
              }),
            })
            const images = Array.isArray(payload.images) ? payload.images : []
            const first = images[0]
            if (first === undefined) throw new Error(t('error.generate'))
            // Append against the *current* node, not the snapshot captured when the
            // request started: a second generation must extend the history, and
            // anything added while it ran must survive.
            let merged = []
            setDoc((current) => ({
              ...current,
              nodes: current.nodes.map((entry) => {
                if (entry.id !== nodeId) return entry
                const base = Array.isArray(entry.history) ? entry.history : []
                merged = base.concat(images.map((image) => image.id)).filter((id, index, all) => all.indexOf(id) === index)
                return {
                  ...entry,
                  status: 'ready',
                  assetId: first.id,
                  width: first.width,
                  height: first.height,
                  history: merged,
                  error: '',
                }
              }),
            }))
            scheduleSave()
            // Extra results of one batch become their own cards to the right, so a
            // four-image generation is visible instead of hidden behind a history.
            images.slice(1).forEach((image, index) => {
              addNode({
                id: newId('img'),
                kind: 'image',
                x: node.x + (node.baseWidth ?? IMAGE_WIDTH) + 90,
                y: node.y + index * 260,
                baseWidth: IMAGE_WIDTH,
                prompt: node.prompt ?? '',
                size: node.size ?? '',
                count: 1,
                assetId: image.id,
                width: image.width,
                height: image.height,
                history: [image.id],
                status: 'ready',
              })
            })
          } catch (caught) {
            patchNode(nodeId, { status: 'error', error: `${t('error.generate')}：${errText(caught)}` })
          }
        },
        [addNode, patchNode, scheduleSave, t],
      )

      /* ----- node factories ----- */

      /** A blank image node at a board position. */
      const makeImageNode = useCallback(
        (point) => ({
          id: newId('img'),
          kind: 'image',
          x: Math.round(point.x),
          y: Math.round(point.y),
          baseWidth: IMAGE_WIDTH,
          prompt: '',
          model: '',
          size: sizeFor('1:1', '1K'),
          count: 1,
          status: 'ready',
          history: [],
        }),
        [],
      )

      const addImageNode = useCallback(
        (point) => {
          const node = makeImageNode(point)
          addNode(node)
          setSelected(node.id)
          return node
        },
        [addNode, makeImageNode],
      )

      const addTextNode = useCallback(
        (point) => {
          const node = {
            id: newId('txt'),
            kind: 'text',
            x: Math.round(point.x),
            y: Math.round(point.y),
            baseWidth: TEXT_WIDTH,
            text: '',
            status: 'ready',
          }
          addNode(node)
          setSelected(node.id)
          return node
        },
        [addNode],
      )

      /** Reference candidates for the @ picker: every other node holding an image or prose. */
      const candidatesOf = useCallback(
        (nodeId) =>
          docRef.current.nodes
            .filter((entry) => entry.id !== nodeId)
            .map((entry, index) => ({
              id: entry.id,
              assetId: entry.assetId,
              width: entry.width,
              height: entry.height,
              label:
                entry.kind === 'text'
                  ? `${t('node.text')}：${(entry.text ?? '').trim().slice(0, 18) || '…'}`
                  : `${t('node.image')} ${String(index + 1)}`,
              isText: entry.kind === 'text',
              text: entry.text ?? '',
            }))
            .filter((entry) => entry.isText || typeof entry.assetId === 'string'),
        [t],
      )

      /** Attach a picked candidate: an image becomes an edge, text is quoted in. */
      const attachReference = useCallback(
        (nodeId, candidate) => {
          const node = docRef.current.nodes.find((entry) => entry.id === nodeId)
          // The typed "@" was only the trigger; drop it once the pick lands.
          const current = (node?.prompt ?? '').replace(/@\s*$/u, '')
          if (candidate.isText) {
            const quote = (candidate.text ?? '').trim().slice(0, 400)
            const separator = current.trim() === '' || /[\s\n，。]$/u.test(current) ? '' : '\n'
            patchNode(nodeId, { prompt: `${current}${separator}${quote}` })
            return
          }
          if (current !== (node?.prompt ?? '')) patchNode(nodeId, { prompt: current })
          addEdge(candidate.id, nodeId)
        },
        [addEdge, patchNode],
      )

      const useAsReference = useCallback(
        (node) => {
          const created = addImageNode({ x: node.x + (node.baseWidth ?? IMAGE_WIDTH) + 120, y: node.y })
          if (node.assetId !== undefined) addEdge(node.id, created.id)
          setPreview(null)
        },
        [addEdge, addImageNode],
      )

      const historyOf = useCallback((node) => {
        const list = Array.isArray(node.history) && node.history.length > 0 ? node.history : node.assetId ? [node.assetId] : []
        const index = node.assetId === undefined ? -1 : list.indexOf(node.assetId)
        return { total: list.length, index: index < 0 ? list.length - 1 : index, list }
      }, [])

      /** Switch the card to one specific image from its history. */
      const pickHistory = useCallback(
        (nodeId, assetId) => {
          if (typeof assetId === 'string' && assetId !== '') void applyAsset(nodeId, assetId)
        },
        [applyAsset],
      )

      /**
       * Remove one entry from a card's history.
       *
       * The picture on screen cannot be removed: something has to be current, so
       * the next available entry takes over first.
       */
      const dropHistory = useCallback(
        (nodeId, assetId) => {
          const node = docRef.current.nodes.find((entry) => entry.id === nodeId)
          if (node === undefined) return
          const list = Array.isArray(node.history) ? node.history : []
          if (list.length <= 1) return
          const remaining = list.filter((id) => id !== assetId)
          if (remaining.length === 0) return
          const nextAsset = node.assetId === assetId ? remaining[remaining.length - 1] : node.assetId
          patchNode(nodeId, { history: remaining, assetId: nextAsset })
        },
        [patchNode],
      )

      const stepHistory = useCallback(
        (nodeId, delta) => {
          const node = docRef.current.nodes.find((entry) => entry.id === nodeId)
          if (node === undefined) return
          const { list, index } = historyOf(node)
          const next = list[index + delta]
          if (typeof next === 'string') void applyAsset(nodeId, next)
        },
        [applyAsset, historyOf],
      )

      /* ----- board-level actions ----- */

      const fitView = useCallback(() => {
        const stage = stageRef.current
        if (stage === null) return
        const nodes = docRef.current.nodes
        const rect = stage.getBoundingClientRect()
        if (nodes.length === 0) {
          setDoc((current) => ({ ...current, view: { x: 60, y: 60, k: 1 } }))
          return
        }
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (const node of nodes) {
          const size = sizes[node.id] ?? { width: node.baseWidth ?? IMAGE_WIDTH, height: 240 }
          minX = Math.min(minX, node.x)
          minY = Math.min(minY, node.y)
          maxX = Math.max(maxX, node.x + size.width)
          maxY = Math.max(maxY, node.y + size.height)
        }
        const padding = 56
        const width = Math.max(1, maxX - minX)
        const height = Math.max(1, maxY - minY)
        const k = clamp(Math.min((rect.width - padding * 2) / width, (rect.height - padding * 2) / height), MIN_ZOOM, 1.15)
        setDoc((current) => ({
          ...current,
          view: { k, x: (rect.width - width * k) / 2 - minX * k, y: (rect.height - height * k) / 2 - minY * k },
        }))
      }, [sizes])

      const exportBoard = useCallback(() => {
        const blob = new Blob([JSON.stringify(serializable(docRef.current), null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `image-canvas-${new Date().toISOString().slice(0, 10)}.json`
        anchor.click()
        setTimeout(() => URL.revokeObjectURL(url), 4000)
      }, [serializable])

      /** Put an exported board file back on the canvas (assets must already exist). */
      const importBoard = useCallback(
        async (file) => {
          try {
            const text = await file.text()
            const parsed = JSON.parse(text)
            if (parsed === null || typeof parsed !== 'object' || !Array.isArray(parsed.nodes)) {
              throw new Error(t('error.importShape'))
            }
            setDoc({
              nodes: parsed.nodes.map(migrateNode),
              edges: Array.isArray(parsed.edges) ? parsed.edges : [],
              view: parsed.view ?? { x: 60, y: 60, k: 1 },
            })
            setSelected(null)
            setNotice('')
            scheduleSave()
          } catch (caught) {
            setNotice(`${t('error.import')}：${errText(caught)}`)
          }
        },
        [scheduleSave, t],
      )

      const saveNow = useCallback(() => {
        if (saveTimer.current !== null) {
          clearTimeout(saveTimer.current)
          saveTimer.current = null
        }
        void flush()
      }, [flush])

      /* ----- crop ----- */

      const applyCrop = useCallback(
        async (blob, target) => {
          const asset = await uploadBlob(blob, 'image/png')
          const history = Array.isArray(target.history) ? [...target.history] : []
          if (!history.includes(asset.id)) history.push(asset.id)
          patchNode(target.id, {
            assetId: asset.id,
            width: asset.width || target.width || 0,
            height: asset.height || target.height || 0,
            status: 'ready',
            error: '',
            history,
          })
        },
        [patchNode, uploadBlob],
      )

      /* ----- keyboard ----- */

      useEffect(() => {
        const onKey = (event) => {
          const target = event.target
          const typing =
            target instanceof HTMLElement &&
            (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
          if (typing) return
          // A dialog owns the keyboard while it is open: Delete must not stack a
          // confirmation on top of it, and Escape there closes the dialog only.
          if (modalOpen) return
          if ((event.key === 'Delete' || event.key === 'Backspace') && selected !== null) {
            event.preventDefault()
            setPendingDelete(selected)
            return
          }
          if (event.key === 'Escape') {
            setSelected(null)
            return
          }
          if ((event.ctrlKey || event.metaKey) && event.key === '0') {
            event.preventDefault()
            fitView()
          }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [fitView, modalOpen, selected])

      /* ----- paste ----- */

      useEffect(() => {
        const onPaste = (event) => {
          const files = event.clipboardData?.files
          if (files === undefined || files.length === 0) return
          void uploadFiles(Array.from(files), toWorldFromCentre())
        }
        window.addEventListener('paste', onPaste)
        return () => window.removeEventListener('paste', onPaste)
      }, [toWorldFromCentre, uploadFiles])

      /* ----- geometry ----- */

      /** Reference images already lined into one image node. */
      const referencesOf = useCallback(
        (nodeId) =>
          doc.edges
            .filter((edge) => edge.to === nodeId)
            .map((edge) => {
              const node = nodesById.get(edge.from)
              if (node === undefined || node.kind === 'text' || node.assetId === undefined) return null
              const ordinal = docRef.current.nodes.findIndex((entry) => entry.id === node.id) + 1
              return { nodeId: edge.from, assetId: node.assetId, label: `${t('node.image')} ${String(ordinal)}` }
            })
            .filter((entry) => entry !== null),
        [doc.edges, nodesById, t],
      )

      const edgePath = useCallback(
        (from, to) => {
          const source = nodesById.get(from)
          const target = nodesById.get(to)
          if (source === undefined || target === undefined) return ''
          const ax = source.x + (source.baseWidth ?? IMAGE_WIDTH)
          const ay = source.y + DOT_TOP
          const bx = target.x
          const by = target.y + DOT_TOP
          const curve = Math.max(46, Math.abs(bx - ax) * 0.45)
          return `M ${ax} ${ay} C ${ax + curve} ${ay}, ${bx - curve} ${by}, ${bx} ${by}`
        },
        [nodesById],
      )

      const linkPath = useMemo(() => {
        if (link === null) return ''
        const source = nodesById.get(link.from)
        if (source === undefined) return ''
        const ax = source.x + (source.baseWidth ?? IMAGE_WIDTH)
        const ay = source.y + DOT_TOP
        const curve = Math.max(46, Math.abs(link.x - ax) * 0.45)
        return `M ${ax} ${ay} C ${ax + curve} ${ay}, ${link.x - curve} ${link.y}, ${link.x} ${link.y}`
      }, [link, nodesById])

      const minimap = useMemo(() => {
        const nodes = doc.nodes
        if (nodes.length === 0) return null
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (const node of nodes) {
          const size = sizes[node.id] ?? { width: node.baseWidth ?? IMAGE_WIDTH, height: 200 }
          minX = Math.min(minX, node.x)
          minY = Math.min(minY, node.y)
          maxX = Math.max(maxX, node.x + size.width)
          maxY = Math.max(maxY, node.y + size.height)
        }
        const width = Math.max(1, maxX - minX)
        const height = Math.max(1, maxY - minY)
        return { minX, minY, width, height, scale: Math.min(156 / width, 100 / height) }
      }, [doc.nodes, sizes])

      const view = doc.view
      const zoomLabel = `${String(Math.round(view.k * 100))}%`

      /* ----- render ----- */

      if (!loaded) {
        return h(
          'div',
          { className: 'icv-root' },
          h('style', null, CSS),
          h('div', { className: 'icv-bar' }, h('span', { className: 'icv-bar-title' }, t('panel.title'))),
          h(
            'div',
            { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } },
            h('span', { className: 'icv-spin' }),
            h('span', null, t('status.loading')),
          ),
        )
      }

      return h(
        'div',
        { className: 'icv-root' },
        h('style', null, CSS),
        h(
          'div',
          { className: 'icv-bar' },
          h('span', { className: 'icv-bar-title' }, t('panel.title')),
          h(Button, { icon: 'plus', onClick: () => setAddMenu({ x: 12, y: 12, world: toWorldFromCentre() }) }, t('action.addNode')),
          h(Button, { icon: 'upload', onClick: () => fileRef.current?.click() }, t('action.upload')),
          h(Button, { icon: 'fit', onClick: fitView }, t('action.fit')),
          h('div', { className: 'icv-spacer' }),
          saveState === 'saved' ? h('span', { className: 'icv-chip icv-chip-ok' }, t('status.saved')) : null,
          saveState === 'saving' ? h('span', { className: 'icv-chip' }, t('status.saving')) : null,
          saveState === 'error' ? h('span', { className: 'icv-chip icv-chip-error', title: saveError }, t('status.saveFailed')) : null,
          settings !== null && !settings.hasKey
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'icv-chip icv-chip-warn',
                  style: { cursor: 'pointer', height: '22px' },
                  onClick: () => setSettingsOpen(true),
                },
                t('status.noKey'),
              )
            : null,
          h('span', { className: 'icv-chip' }, zoomLabel),
          h('span', { className: 'icv-sr', role: 'status', 'aria-live': 'polite' }, saveState === 'error' ? t('status.saveFailed') : saveState === 'saving' ? t('status.saving') : t('status.saved')),
          h(Button, { icon: 'save', onClick: saveNow, disabled: !loadedOk.current }, t('action.save')),
          h(Button, { icon: 'export', onClick: exportBoard }, t('action.export')),
          h(Button, { icon: 'import', onClick: () => importRef.current?.click() }, t('action.import')),
          h('input', {
            ref: importRef,
            type: 'file',
            accept: 'application/json,.json',
            style: { display: 'none' },
            onChange: (event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file !== undefined) void importBoard(file)
            },
          }),
          h('input', {
            ref: fileRef,
            type: 'file',
            accept: 'image/png,image/jpeg,image/webp,image/gif',
            multiple: true,
            style: { display: 'none' },
            onChange: (event) => {
              const files = Array.from(event.target.files ?? [])
              event.target.value = ''
              const origin = uploadOrigin.current
              uploadOrigin.current = null
              if (files.length > 0) void uploadFiles(files, origin ?? toWorldFromCentre())
            },
          }),
        ),
        h(
          'div',
          { className: 'icv-keybar' },
          h('span', { className: 'icv-keybar-label' }, t('settings.keyStripLabel')),
          h(ApiKeyStrip, {
            settings,
            t,
            onSaved: (next) => setSettings(next),
            onOpenSettings: () => setSettingsOpen(true),
          }),
        ),
        loadError === ''
          ? null
          : h(
              'div',
              { className: 'icv-notice', role: 'alert' },
              h(Icon, { name: 'close' }),
              h('span', null, `${t('error.readOnly')} ${loadError}`),
            ),
        notice === ''
          ? null
          : h(
              'div',
              { className: 'icv-notice', role: 'alert' },
              h('span', { style: { flex: 1 } }, notice),
              h(Button, { ghost: true, onClick: () => setNotice('') }, t('action.dismiss')),
            ),
        update?.newer === true && !updateDismissed
          ? h(
              'div',
              { className: 'icv-notice icv-update', role: 'status' },
              h('span', { style: { flex: 1 } }, `${t('update.available')} ${String(update.latest ?? '')}`),
              h(
                Button,
                {
                  onClick: () => {
                    // The release page carries the download and its notes; opening
                    // it in a new tab keeps the board (and unsaved camera) intact.
                    const target = update.page
                    if (typeof target === 'string' && target !== '') {
                      window.open(target, '_blank', 'noopener,noreferrer')
                    }
                  },
                },
                t('update.open'),
              ),
              h(
                Button,
                { ghost: true, disabled: updateBusy, onClick: () => void refreshUpdate() },
                updateBusy ? t('update.checking') : t('update.recheck'),
              ),
              h(Button, { ghost: true, onClick: () => setUpdateDismissed(true) }, t('update.later')),
            )
          : null,
        h(
          'div',
          {
            className: 'icv-stage',
            ref: stageRef,
            'data-panning': panning ? 'true' : 'false',
            'data-linking': link === null ? 'false' : 'true',
            onPointerDown: beginPan,
            onDragOver: (event) => event.preventDefault(),
            onDrop: (event) => {
              event.preventDefault()
              const files = Array.from(event.dataTransfer?.files ?? [])
              if (files.length > 0) void uploadFiles(files, toWorld(event.clientX, event.clientY))
            },
            onDoubleClick: (event) => {
              if (event.target !== event.currentTarget) return
              // LibTV opens an add-node menu here rather than creating a card, so
              // the board states what it can hold before anything is added.
              const rect = event.currentTarget.getBoundingClientRect()
              setAddMenu({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                world: toWorld(event.clientX, event.clientY),
              })
            },
          },
          h(
            'div',
            {
              className: 'icv-world',
              style: { transform: `translate(${String(view.x)}px, ${String(view.y)}px) scale(${String(view.k)})` },
            },
            h(
              'svg',
              { className: 'icv-edges' },
              doc.edges.map((edge) =>
                h(
                  'g',
                  { key: edge.id },
                  h('path', { className: 'icv-edge', d: edgePath(edge.from, edge.to) }),
                  h('path', {
                    className: 'icv-edge-hit',
                    d: edgePath(edge.from, edge.to),
                    onPointerDown: (event) => {
                      event.stopPropagation()
                      removeEdge(edge.from, edge.to)
                    },
                  }),
                ),
              ),
              link === null ? null : h('path', { className: 'icv-edge icv-edge-active', d: linkPath }),
            ),
            doc.nodes.map((node, index) =>
              h(NodeCard, {
                key: node.id,
                node,
                t,
                ordinal: index + 1,
                selected: selected === node.id,
                maxReferences: 4,
                candidates: node.kind === 'image' ? candidatesOf(node.id) : [],
                references: node.kind === 'image' ? referencesOf(node.id) : [],
                registerSize,
                onSelect: setSelected,
                onMoveStart: beginMove,
                onResize: beginResize,
                onLinkStart: beginLink,
                onPatch: patchNode,
                onGenerate: generate,
                onPreview: setPreview,
                onCrop: setCropTarget,
                onAsReference: useAsReference,
                onRequestDelete: setPendingDelete,
                onDetachReference: removeEdge,
                onHistory: stepHistory,
                onPickHistory: pickHistory,
                onDropHistory: dropHistory,
                onExpand: setExpandedNode,
                onImageMenu: (event, entry) => {
                  // Keep the menu inside the viewport on a right-click near an edge.
                  const width = 210
                  const height = 260
                  setSelected(entry.id)
                  setImageMenu({
                    node: entry,
                    x: Math.min(event.clientX, window.innerWidth - width),
                    y: Math.min(event.clientY, window.innerHeight - height),
                  })
                },
                onReference: attachReference,
                onArrows: (event, entry) => {
                  const step = event.shiftKey ? 10 : 1
                  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
                  const delta = moves[event.key]
                  if (delta === undefined) return
                  event.preventDefault()
                  patchNode(entry.id, { x: entry.x + delta[0], y: entry.y + delta[1] })
                },
              }),
            ),
          ),
          addMenu === null
            ? null
            : h(AddNodeMenu, {
                x: addMenu.x,
                y: addMenu.y,
                t,
                onClose: () => setAddMenu(null),
                onPick: (kind) => {
                  const point = addMenu.world
                  setAddMenu(null)
                  if (kind === 'text') addTextNode(point)
                  else if (kind === 'image') addImageNode(point)
                  else if (kind === 'upload') {
                    uploadOrigin.current = point
                    fileRef.current?.click()
                  }
                },
              }),
          doc.nodes.length === 0
            ? h(
                'div',
                { className: 'icv-empty' },
                h('h3', null, t('empty.title')),
                h('p', null, t('empty.body')),
                h('p', null, t('empty.shortcut')),
              )
            : h('div', { className: 'icv-hint' }, t('panel.hint')),
          minimap === null
            ? null
            : h(
                'div',
                {
                  className: 'icv-minimap',
                  onPointerDown: (event) => {
                    event.stopPropagation()
                    const rect = event.currentTarget.getBoundingClientRect()
                    const worldX = minimap.minX + ((event.clientX - rect.left) / rect.width) * minimap.width
                    const worldY = minimap.minY + ((event.clientY - rect.top) / rect.height) * minimap.height
                    const stage = stageRef.current
                    if (stage === null) return
                    setDoc((current) => ({
                      ...current,
                      view: {
                        k: current.view.k,
                        x: stage.clientWidth / 2 - worldX * current.view.k,
                        y: stage.clientHeight / 2 - worldY * current.view.k,
                      },
                    }))
                  },
                },
                doc.nodes.map((node) => {
                  const size = sizes[node.id] ?? { width: node.baseWidth ?? IMAGE_WIDTH, height: 200 }
                  return h('div', {
                    key: node.id,
                    className: 'icv-minimap-node',
                    style: {
                      left: `${String((node.x - minimap.minX) * minimap.scale)}px`,
                      top: `${String((node.y - minimap.minY) * minimap.scale)}px`,
                      width: `${String(Math.max(2, size.width * minimap.scale))}px`,
                      height: `${String(Math.max(2, size.height * minimap.scale))}px`,
                    },
                  })
                }),
                h('div', {
                  className: 'icv-minimap-view',
                  style: {
                    left: `${String((-view.x / view.k - minimap.minX) * minimap.scale)}px`,
                    top: `${String((-view.y / view.k - minimap.minY) * minimap.scale)}px`,
                    width: `${String((stageBox.width / view.k) * minimap.scale)}px`,
                    height: `${String((stageBox.height / view.k) * minimap.scale)}px`,
                  },
                }),
              ),
        ),
        preview === null
          ? null
          : h(Lightbox, {
              node: preview,
              t,
              onClose: () => setPreview(null),
              onCrop: (node) => {
                setPreview(null)
                setCropTarget(node)
              },
              onUseAsReference: useAsReference,
            }),
        cropTarget === null
          ? null
          : h(Cropper, {
              node: cropTarget,
              t,
              onClose: () => setCropTarget(null),
              onApply: async (blob) => {
                await applyCrop(blob, cropTarget)
              },
            }),
        settingsOpen && settings !== null
          ? h(SettingsDialog, {
              settings,
              t,
              onClose: () => setSettingsOpen(false),
              onSaved: (next) => setSettings(next),
            })
          : null,
        expandedNode !== null && nodesById.has(expandedNode)
          ? h(PromptModal, {
              node: nodesById.get(expandedNode),
              t,
              candidates: candidatesOf(expandedNode),
              busy: nodesById.get(expandedNode)?.status === 'busy',
              onPatch: patchNode,
              onReference: attachReference,
              onGenerate: generate,
              onClose: () => setExpandedNode(null),
            })
          : null,
        imageMenu === null
          ? null
          : h(ImageMenu, {
              x: imageMenu.x,
              y: imageMenu.y,
              node: imageMenu.node,
              t,
              onClose: () => setImageMenu(null),
              onPreview: (entry) => {
                setImageMenu(null)
                setPreview(entry)
              },
              onCrop: (entry) => {
                setImageMenu(null)
                setCropTarget(entry)
              },
              onAsReference: (entry) => {
                setImageMenu(null)
                useAsReference(entry)
              },
              onDelete: (id) => {
                setImageMenu(null)
                setPendingDelete(id)
              },
              onNotice: (message) => setNotice(message),
            }),
        pendingDelete === null
          ? null
          : h(ConfirmDialog, {
              title: t('confirm.deleteTitle'),
              body: t('confirm.deleteBody'),
              t,
              onCancel: () => setPendingDelete(null),
              onConfirm: () => {
                removeNode(pendingDelete)
                setPendingDelete(null)
              },
            }),
      )
    }

    /* ------------------------------------------------------------------ *
     * Sidebar icon
     * ------------------------------------------------------------------ */

    function PanelIcon({ size, active }) {
      const edge = typeof size === 'number' ? size : 20
      return h(
        'svg',
        {
          width: edge,
          height: edge,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          style: { opacity: active ? 1 : 0.72 },
        },
        h('rect', { x: 3, y: 5, width: 7, height: 6, rx: 1.6 }),
        h('rect', { x: 14, y: 13, width: 7, height: 6, rx: 1.6 }),
        h('path', { d: 'M10 8h3.5A1.5 1.5 0 0 1 15 9.5V13' }),
      )
    }

    return {
      // `locale` must be declared here: without it the Client runtime does not
      // resolve the service for this plugin and `ctx.get('locale')` is undefined
      // at apply time, which used to leave every label untranslated.
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx.get('locale')
        if (locale !== undefined) {
          ctx.effect(() => locale.register(NS, { zh: DICT.zh, en: DICT.en }), 'image-canvas: locale')
        }

        /**
         * Resolve one label.
         *
         * The locale service is preferred, but two failure modes must not reach
         * the screen as `action.generate` or as English in a Chinese UI:
         * the service may be absent, and a namespace key may be missing from
         * the active language. Both fall back to a dictionary chosen from the
         * document language, which DSH sets from the user's own setting.
         */
        const bound = locale === undefined ? undefined : locale.bind(NS)
        const documentIsChinese = () =>
          typeof document !== 'undefined' && String(document.documentElement.lang || '').toLowerCase().startsWith('zh')
        const t = (key, params) => {
          let template = bound === undefined ? undefined : bound(key, params)
          if (template === undefined || template === key) {
            const dict = documentIsChinese() ? DICT.zh : DICT.en
            template = dict[key] ?? DICT.en[key] ?? key
          }
          if (params === undefined) return template
          return template.replace(/\{(\w+)\}/g, (match, name) =>
            name in params ? String(params[name]) : match,
          )
        }

        ctx.effect(
          () =>
            ctx.slots.inject('main', () =>
              ctx.slots.register({ name: 'main', key: 'image-canvas', locale: NS }, (slotProps) =>
                h(CanvasPanel, { ...slotProps, t }),
              ),
            ),
          'image-canvas: main panel',
        )

        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.panellist', () =>
              ctx.slots.register(
                {
                  name: 'sidebar.panellist',
                  id: 'image-canvas',
                  order: 24,
                  locale: NS,
                  label: () => t('panel.title'),
                },
                PanelIcon,
              ),
            ),
          'image-canvas: sidebar entry',
        )
      },
    }
  },
})
