# Infinite canvas

An endless board for AI image work inside DeepSeek Harness. Cards hold prompts or
images, lines between them carry reference images into a generation, and the
whole board is saved on your machine so it survives a restart.

## Where to find it

After the bundle is enabled, an **Infinite canvas** icon appears in the sidebar's
panel column (below the plugins and schedules icons). Selecting it opens the
board in the main column.

## What it does

- **Add nodes.** Double-click empty canvas (or press **Add node** in the toolbar)
  to open the add menu: **Text**, **Image**, or **Upload**. The menu has a search
  box, so a long list stays navigable; Escape closes it.
- **Two kinds of picture node.** An **Image** node is made for generation: it
  carries the prompt field, the snippet buttons, the model / ratio / resolution
  pickers and **Generate**. A **Material** node is what an upload, a dropped file
  or a paste creates: it shows the picture, its pixel size, and only preview,
  crop and "use as reference" — no prompt field, because there is nothing to
  generate from a file you already have. Dragging material onto an image node
  makes it a reference there.
- **Image nodes.** Each image node shows its picture — or a placeholder before
  one exists — with a **Try:** row (`Image to image`, `Image upscale`) that seeds
  the prompt. Below that sits the prompt field, with **@** to reference material,
  three snippet buttons (`Style`, `Palette`, `Composition`), model / ratio /
  resolution pickers, and **Generate** with a 1–4 count. Clicking the picture
  opens the same editor expanded, for long prompts.
- **Text nodes.** A text node holds prose — a character sheet or a style note.
  Dragging from its dot onto an image node appends that text to the prompt, so a
  note can feed a whole branch of the board.
- **Image to image.** Every node with content has a dot on its right edge. Drag
  from a dot onto an image node and that image becomes one of its references. A
  node accepts several; each shows as a thumbnail above the prompt, and the small
  **×** removes it.
- **Upload.** Use the add menu, the toolbar **Upload**, drop image files onto the
  canvas, or paste with Ctrl+V. Files are stored by their SHA-256 content
  address, so the same picture is kept once.
- **Preview.** Double-click an image node, or press the preview button, to open it
  full size with download, crop and "use as reference" actions.
- **Crop.** The crop dialog draws a drag-and-resize rectangle over the image with
  optional ratio presets (1:1, 4:3, 16:9, 9:16 and others). Applying it replaces
  the node's image; the previous version stays in the node's history and the
  arrows step back through it.
- **Save and export.** Every change is saved about half a second after you stop
  editing. **Save** forces it immediately, **Export** downloads the board as a
  JSON document, and **Import** puts such a document back on the canvas.
- **Navigate.** Drag empty space to pan, scroll to zoom, **Fit** frames the whole
  board, and the minimap jumps to a place on the board. A focused node moves with
  the arrow keys (Shift for ten pixels at a time), and Delete asks before removing
  it.

## The provider

Generation goes through an OpenAI-compatible endpoint:
`POST /v1/images/generations` for text-to-image and `POST /v1/images/edits` when
references are attached. Open **Settings** in the board's toolbar to set the base
URL, the model and the API key. The key is stored on this machine — in the DSH
credential store when available, otherwise in a file only your user account can
read — and is never written into the board document or sent back to the browser.

To swap just the key, use the **API key field in the toolbar**: it always shows
whether a key is configured and its mask, takes a new key, and saves on Enter or
**Save** without opening the settings dialog. Only the mask is ever sent to the
page, so the stored secret never travels back.

The default base URL is `https://sub-proxy-us.65535.space` with the model
`gpt-image-2.5-flare`; point it at your own service if you use a different one.

## Limits

- A generation waits up to 300 seconds for the provider and cannot be cancelled
  once it is sent.
- One upload may be at most 24 MB and must be PNG, JPEG, WebP or GIF.
- Image references are sent as `image` (one) or `image[]` (several) form fields,
  which is the conventional shape of the OpenAI edits endpoint. A provider with a
  different contract needs its own adapter.
- The ratio/resolution pickers send only sizes this endpoint accepts; `2K` means
  the long edge at roughly 2048 px.
- A board saved by an earlier version used a separate generation node; on load
  those become image nodes with their prompt, size and history intact. A node that
  only ever held an uploaded picture becomes a material node.
- Assets no longer used by any node are deleted from disk a day after they stop
  being referenced. A board that arrives with no cards never triggers that sweep,
  so an empty or half-loaded page cannot wipe the asset store.
- Video generation is not part of this plugin.

## Data

The board document, settings and image assets live in
`$DSH_HOME/data/image-canvas/`. Turning the plugin off removes its sidebar entry
and panel but leaves that directory untouched; delete it to reclaim the space.

## Install

DeepSeek Harness has no separate "plugin store" beyond npm and Git: a plugin is
an ordinary package whose `package.json` declares `dsh.bundle.patch`.

**From this folder (a friend, or a zip you sent):**

1. In DSH open **Plugins** → **Add plugin**.
2. Choose the **local directory** option and point it at this folder
   (`dsh-image-canvas`).
3. Enable the bundle, then reopen DSH once so the new routes load.

**From a tarball (recommended when npm is unavailable):** download
`dsh-image-canvas-1.1.0.tgz` from the
[releases page](https://github.com/gaochangsheng0828/dsh-image-canvas/releases),
then install it the same way (some DSH builds accept a `.tgz` path in
**Add plugin**). Verified: installing that tarball yields a working
`dsh-image-canvas@1.1.0` with its `dsh.bundle.patch` intact.

**From npm:** once published as `dsh-image-canvas`, anyone can install it with
the plugin manager's package field.

## Updates

Whether a user receives an update depends only on *how* they installed it:

| Installed as | What they get on a new release |
|---|---|
| `link:` local directory | **Nothing.** They keep their copy until they re-pull your folder. |
| Pinned version `"1.0.0"` | Nothing until they change the version. |
| Caret range `"^1.0.0"` (npm only) | New **1.x** releases on their next plugin update; 2.x needs consent. |
| `latest` | Every release, including breaking ones. |

So for distribution, publish to npm and tell people to install with
`dsh-image-canvas@^1.1.0`. Republish with a higher `version` and they upgrade on
their next update; leaving the version unchanged publishes nothing new.

**What your current install is:** this folder is linked from the profile with
`link:E:/...`, which is why your own edits appear immediately and no one else
sees them. Publishing does not change that link — to receive npm updates
yourself, reinstall from the registry.

Every release that changes the client half needs DSH restarted before the new
code is live; the plugin manager reports `restart-required` when that is the
case.
