import { getConfig } from '@edx/frontend-platform';

import { contentStyle } from './hooks';

// Automocking the whole module is safe here (unlike hooks.test.js, which reads
// the real getConfig().LMS_BASE_URL), and lets each case control the config.
jest.mock('@edx/frontend-platform');

const mockedGetConfig = jest.mocked(getConfig);

const CORE_URL = 'https://cdn.jsdelivr.net/npm/@openedx/paragon@23/dist/core.min.css';
const VARIANT_URL = 'https://cdn.jsdelivr.net/npm/@openedx/paragon@23/dist/light.min.css';
const BRAND_URL = 'http://localhost:18000/static/xblock-themes/my-theme.css';
const NIGHT_URL = 'https://example.invalid/indigo/night.min.css';

const themeUrls = () => ({
  core: { url: CORE_URL },
  variants: {
    light: { urls: { default: VARIANT_URL, brandOverride: BRAND_URL } },
  },
});

const setConfig = (urls: unknown) => {
  mockedGetConfig.mockReturnValue({ PARAGON_THEME_URLS: urls } as any);
};

// The base styles open with a Google Fonts @import, so assert on the theme URLs
// rather than on `@import` in general.
const imports = (css: string, url: string) => css.includes(`@import url("${url}");`);
const importOrder = (css: string) => (css.match(/@import url\("([^"]+)"\);/g) || []);

describe('contentStyle', () => {
  beforeEach(() => {
    setConfig(themeUrls());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('layers the same stylesheets the learner view applies', () => {
    const result = contentStyle({ editorType: 'text', useMfeTheming: true });

    // Order matters: each layer overrides the one before it, and this is the
    // order html_block.js attaches them in. Only the leading imports are
    // compared -- tinyMCEStyles opens with a Google Fonts import of its own.
    expect(importOrder(result).slice(0, 3)).toEqual([
      `@import url("${CORE_URL}");`,
      `@import url("${VARIANT_URL}");`,
      `@import url("${BRAND_URL}");`,
    ]);
  });

  it('keeps the brand override on top of the variant default', () => {
    const result = contentStyle({ editorType: 'text', useMfeTheming: true });

    expect(imports(result, VARIANT_URL)).toBe(true);
    expect(imports(result, BRAND_URL)).toBe(true);
    expect(result.indexOf(VARIANT_URL)).toBeLessThan(result.indexOf(BRAND_URL));
  });

  it('layers a nested core entry as default then brand override', () => {
    setConfig({
      core: { urls: { default: CORE_URL, brandOverride: 'https://example.invalid/brand-core.css' } },
      variants: { light: { url: VARIANT_URL } },
    });

    expect(importOrder(contentStyle({ editorType: 'text', useMfeTheming: true })).slice(0, 3)).toEqual([
      `@import url("${CORE_URL}");`,
      '@import url("https://example.invalid/brand-core.css");',
      `@import url("${VARIANT_URL}");`,
    ]);
  });

  it('does not repeat a URL published as both default and brand override', () => {
    // tutor-indigo points both at the same stylesheet.
    setConfig({
      core: { url: CORE_URL },
      variants: { light: { urls: { default: BRAND_URL, brandOverride: BRAND_URL } } },
    });

    const result = contentStyle({ editorType: 'text', useMfeTheming: true });
    const occurrences = importOrder(result).filter((entry) => entry === `@import url("${BRAND_URL}");`);

    expect(occurrences).toHaveLength(1);
  });

  it('falls back to the variant default when no brand override is published', () => {
    setConfig({ ...themeUrls(), variants: { light: { urls: { default: VARIANT_URL } } } });

    expect(imports(contentStyle({ editorType: 'text', useMfeTheming: true }), VARIANT_URL)).toBe(true);
  });

  it('puts every @import first, since CSS requires it to precede all rules', () => {
    const result = contentStyle({ editorType: 'text', useMfeTheming: true });

    expect(result.trimStart().startsWith(`@import url("${CORE_URL}");`)).toBe(true);
  });

  it('keeps the editor mechanics and a11y styles when themed', () => {
    const themed = contentStyle({ editorType: 'text', useMfeTheming: true });

    // Rules TinyMCE needs to function, and the focus/selection cues a11y relies on.
    expect(themed).toContain('.mce-edit-focus');
    expect(themed).toContain('outline: 3px solid #b4d7ff');
    expect(themed).toContain('mce-resizehandle');
    expect(themed).toContain('[data-mce-selected]');
    expect(themed).toContain('[data-mce-placeholder]');
  });

  it('drops the fallback content typography when themed', () => {
    const themed = contentStyle({ editorType: 'text', useMfeTheming: true });

    // These would out-specify the theme (`.mce-content-body h1` beats `h1`).
    expect(themed).not.toContain('.mce-content-body h1');
    expect(themed).not.toContain('font-family: \'Open Sans\'');
    expect(themed).not.toContain('fonts.googleapis.com');
  });

  it('keeps the fallback content typography when not themed', () => {
    const plain = contentStyle({ editorType: 'text', useMfeTheming: false });

    expect(plain).toContain('.mce-content-body h1');
    expect(plain).toContain('fonts.googleapis.com');
    expect(plain).toContain('.mce-edit-focus');
  });

  it('omits the theme when use_mfe_theming is off', () => {
    const result = contentStyle({ editorType: 'text', useMfeTheming: false });

    expect(imports(result, BRAND_URL)).toBe(false);
  });

  it('omits the theme for editors whose learner view is not themed', () => {
    expect(imports(contentStyle({ editorType: 'video', useMfeTheming: true }), BRAND_URL)).toBe(false);
  });

  // Two shapes are published in practice and html_block.js has to resolve both:
  // frontend-base's `Theme` (https://github.com/openedx/frontend-base/blob/main/types.ts)
  // carries a `defaults` map, tutor-indigo (https://github.com/overhangio/tutor-indigo)
  // ships only `variants`. Each case puts a decoy variant first, so the test
  // fails if the resolution is skipped rather than merely unused.
  it('reads the active variant from defaults.light', () => {
    setConfig({
      variants: {
        night: { urls: { brandOverride: NIGHT_URL } },
        day: { urls: { brandOverride: BRAND_URL } },
      },
      defaults: { light: 'day' },
    });

    expect(imports(contentStyle({ editorType: 'text', useMfeTheming: true }), BRAND_URL)).toBe(true);
  });

  it('falls back to the first variant present when no defaults map is published', () => {
    setConfig({ variants: { night: { urls: { brandOverride: NIGHT_URL } } } });

    expect(imports(contentStyle({ editorType: 'text', useMfeTheming: true }), NIGHT_URL)).toBe(true);
  });

  it('falls back to the base styles when no theme is published in the config', () => {
    setConfig(undefined);

    expect(imports(contentStyle({ editorType: 'text', useMfeTheming: true }), BRAND_URL)).toBe(false);
  });

  it('falls back to the base styles when the config carries no usable URLs', () => {
    // The key is present but nothing in it resolves to a stylesheet, which is a
    // different path from the key being absent entirely.
    setConfig({});

    expect(contentStyle({ editorType: 'text', useMfeTheming: true }))
      .toEqual(contentStyle({ editorType: 'text', useMfeTheming: false }));
  });

  it('does not read the config at all unless the theme would be used', () => {
    contentStyle({ editorType: 'text', useMfeTheming: false });
    contentStyle({ editorType: 'video', useMfeTheming: true });

    expect(mockedGetConfig).not.toHaveBeenCalled();
  });
});
