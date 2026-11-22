# Galaxy Tab 4 compatibility investigation · 22 November 2026

## Sources and scope

The family device previously documented in the game repositories is SM-T530NU/Android5.0.2. Samsung's indexed support specification lists1280×800 physical pixels for Tab4 10.1. This does not determine CSS viewport: browser bars, density, orientation, system navigation and keyboard subtract usable area. The exact installed Chrome version on the physical tablet has not been read in this task.

Official sources:
- [Chrome: URL bar sizing](https://developer.chrome.com/blog/url-bar-resizing/): since56, mobile100vh can represent largest viewport, not currently visible area.
- [Chrome108 viewport units](https://developer.chrome.com/blog/new-in-chrome-108/): dynamic units introduced in108;95 cannot use100dvh.
- [Chromium notice: last Lollipop release is95](https://groups.google.com/a/chromium.org/g/chromium-dev/c/2MwR9KqwY9I/m/TXLmUL-CAQAJ).

## Reproduction, not just user-agent substitution

No old executable remained locally. Reused the official snapshot URL/hash documented by `home` and fetched Mac ARM917397 into `.task-tmp/tab4/` only, not global browser install:
`https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/917397/chrome-mac.zip`
SHA256 `5ec453364a3067fc859abf5fb64c79fe453536379f8f77b7b14be9962a1117e7`.
Launched actual Chromium95.0.4630.0 through Playwright. This is the old engine on desktop, not Android hardware/GPU or the actual tablet.

Before: app starts in95 without JS errors, CSS.supports100dvh=false. Home at600×375 inherited mobile two-column layout plus90px minimum cards from landscape rules: five rows could not fit; cards overlapped header and intercepted Inicio click. Modern baseline also showed header78px inside fixed64px track after school font, causing overlap even when root scroll metrics were equal. Reference screenshot tab4-before-chrome95.png.

A toolbar with viewport/visible-height mismatch is not faithfully recreated by simply using an Android UA or desktop setViewportSize. Chrome CDP viewport clip did not change innerHeight/vv in this environment. Instead a separate deterministic test injects visualViewport height704/640/350 under800px layout to test toolbar/keyboard measurements explicitly. No claim of full Android browser chrome emulation.

## Changes

- `viewport.js`: measure min(innerHeight, visualViewport.height) at1× zoom, update CSS variable on initial load, resize, orientation and pageshow; avoid treating pinch zoom as keyboard.
- Body/root/transition/dialog use measured height with100vh fallback, not dvh-only. Dialog max-height and positioning cover keyboard-reduced viewport. Modern dynamic-unit cap remains progressive enhancement.
- Header track auto-sized to actual linked-font metrics; no header/main overlap. Home short550–600px layout corrected to4columns; no clipping/hiding scroll.
- Icons in all exercise and reading headings: local SVG semantic count/compare/plus/minus/problem/shapes/book. Decorative aria-hidden, title text unchanged and still syllabified. No emoji font dependency for title icons.

## Checks and limits

`make test-tab4 CHROME95_PATH=/existing/path` reuses executable; never downloads or installs as hidden target effect. Test matrix:1280×752,1280×640,800×1180,600×900,960×540,600×375; all math topics, home and stories, header overlap/root scroll/targets, toolbar/keyboard simulation. Include modern Chromium/WebKit regressions, offline and adult gate from existing suite.

Installed PWA viewport behavior is approximated by standalone-sized viewport; actual home-screen installation, status/navigation bars and GPU on Samsung not verified. Android4.4/Chrome81 or older not claimed. Do not present this as fixing every obsolete browser. Physical tablet confirmation remains necessary.
