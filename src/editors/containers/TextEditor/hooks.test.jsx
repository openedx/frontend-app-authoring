import { keyStore } from '../../utils';
import * as appHooks from '../../hooks';
import * as module from './hooks';
import * as tinyMceHooks from '../../sharedComponents/TinyMceWidget/hooks';

const tinyMceHookKeys = keyStore(tinyMceHooks);

describe('TextEditor hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('appHooks', () => {
    it('forwards navigateCallback from appHooks', () => {
      expect(module.navigateCallback).toEqual(appHooks.navigateCallback);
    });
    it('forwards navigateTo from appHooks', () => {
      expect(module.navigateTo).toEqual(appHooks.navigateTo);
    });
    it('forwards nullMethod from appHooks', () => {
      expect(module.nullMethod).toEqual(appHooks.nullMethod);
    });
  });

  describe('non-state hooks', () => {
    describe('getContent', () => {
      const visualContent = 'sOmEViSualContent';
      const rawContent = 'soMeRawContent';
      const editorRef = {
        current: {
          getContent: () => visualContent,
          state: {
            doc: rawContent,
          },
        },
      };
      const spies = {};
      spies.visualHtml = jest.spyOn(
        tinyMceHooks,
        tinyMceHookKeys.setAssetToStaticUrl,
      ).mockReturnValueOnce(visualContent);
      spies.rawHtml = jest.spyOn(
        tinyMceHooks,
        tinyMceHookKeys.setAssetToStaticUrl,
      ).mockReturnValueOnce(rawContent);
      const assets = [];
      test('returns correct content based on isRaw equals false', () => {
        const getContent = module.getContent({ editorRef, isRaw: false, assets })();
        expect(spies.visualHtml.mock.calls.length).toEqual(1);
        expect(spies.visualHtml).toHaveBeenCalledWith({ editorValue: visualContent, assets });
        expect(getContent).toEqual(visualContent);
      });
      test('returns correct content based on isRaw equals true', () => {
        jest.clearAllMocks();
        const getContent = module.getContent({ editorRef, isRaw: true, assets })();
        expect(spies.rawHtml.mock.calls.length).toEqual(1);
        expect(spies.rawHtml).toHaveBeenCalledWith({ editorValue: rawContent, assets });
        expect(getContent).toEqual(rawContent);
      });
    });
  });
});
