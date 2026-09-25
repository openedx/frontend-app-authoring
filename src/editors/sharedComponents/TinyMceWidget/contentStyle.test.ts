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
    const result = contentStyle({ editorType: 'text', includeTheme: true });

    // Order matters: each layer overrides the one before it, and this is the
    // order html_block.js attaches them in. Only the leading imports are
    // compared -- tinyMCEStyles opens with a Google Fonts import of its own.
    // The variant resolves to its brand override here, so it is one layer.
    expect(importOrder(result).slice(0, 2)).toEqual([
      `@import url("${CORE_URL}");`,
      `@import url("${BRAND_URL}");`,
    ]);
  });

  it('prefers the brand override over the variant default', () => {
    const result = contentStyle({ editorType: 'text', includeTheme: true });

    expect(imports(result, BRAND_URL)).toBe(true);
    expect(imports(result, VARIANT_URL)).toBe(false);
  });

  it('falls back to the variant default when no brand override is published', () => {
    setConfig({ ...themeUrls(), variants: { light: { urls: { default: VARIANT_URL } } } });

    expect(imports(contentStyle({ editorType: 'text', includeTheme: true }), VARIANT_URL)).toBe(true);
  });

  it('puts every @import first, since CSS requires it to precede all rules', () => {
    const result = contentStyle({ editorType: 'text', includeTheme: true });

    expect(result.trimStart().startsWith(`@import url("${CORE_URL}");`)).toBe(true);
  });

  it('keeps the base editor styles after the theme', () => {
    const themed = contentStyle({ editorType: 'text', includeTheme: true });
    const plain = contentStyle({ editorType: 'text', includeTheme: false });

    expect(themed.endsWith(plain)).toBe(true);
  });

  it('omits the theme when include_theme is off', () => {
    const result = contentStyle({ editorType: 'text', includeTheme: false });

    expect(imports(result, BRAND_URL)).toBe(false);
  });

  it('omits the theme for editors whose learner view is not themed', () => {
    expect(imports(contentStyle({ editorType: 'video', includeTheme: true }), BRAND_URL)).toBe(false);
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

    expect(imports(contentStyle({ editorType: 'text', includeTheme: true }), BRAND_URL)).toBe(true);
  });

  it('falls back to the first variant present when no defaults map is published', () => {
    setConfig({ variants: { night: { urls: { brandOverride: NIGHT_URL } } } });

    expect(imports(contentStyle({ editorType: 'text', includeTheme: true }), NIGHT_URL)).toBe(true);
  });

  it('falls back to the base styles when no theme is published in the config', () => {
    setConfig(undefined);

    expect(imports(contentStyle({ editorType: 'text', includeTheme: true }), BRAND_URL)).toBe(false);
  });

  it('falls back to the base styles when the config carries no usable URLs', () => {
    // The key is present but nothing in it resolves to a stylesheet, which is a
    // different path from the key being absent entirely.
    setConfig({});

    expect(contentStyle({ editorType: 'text', includeTheme: true }))
      .toEqual(contentStyle({ editorType: 'text', includeTheme: false }));
  });

  it('does not read the config at all unless the theme would be used', () => {
    contentStyle({ editorType: 'text', includeTheme: false });
    contentStyle({ editorType: 'video', includeTheme: true });

    expect(mockedGetConfig).not.toHaveBeenCalled();
  });
});
