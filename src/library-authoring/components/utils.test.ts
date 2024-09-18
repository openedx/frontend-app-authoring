import { getEditUrl } from './utils';

describe('component utils', () => {
  describe('getEditUrl', () => {
    it('returns the right URL for an HTML (Text) block', () => {
      const usageKey = 'lb:org:ALPHA:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
      expect(getEditUrl(usageKey)).toStrictEqual(`/library/lib:org:ALPHA/editor/html/${usageKey}`);
    });
    it('returns the right URL for editing a Problem block', () => {
      const usageKey = 'lb:org:beta:problem:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
      expect(getEditUrl(usageKey)).toStrictEqual(`/library/lib:org:beta/editor/problem/${usageKey}`);
    });
    it('doesn\'t yet allow editing a video block', () => {
      const usageKey = 'lb:org:beta:video:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
      expect(getEditUrl(usageKey)).toBeUndefined();
    });
    it('doesn\'t yet allow editing a drag-and-drop-v2 block', () => {
      const usageKey = 'lb:org:beta:drag-and-drop-v2:571fe018-f3ce-45c9-8f53-5dafcb422fdd';
      expect(getEditUrl(usageKey)).toBeUndefined();
    });
    it('returns undefined for an invalid key', () => {
      expect(getEditUrl('foobar')).toBeUndefined();
      expect(getEditUrl('')).toBeUndefined();
      expect(getEditUrl('lb:unknown:unknown:unknown')).toBeUndefined();
    });
  });
});
