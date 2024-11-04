import { keyStore } from '../../utils';
import * as appHooks from '../../hooks';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
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
      test('returns correct content based on showRawEditor equals false', () => {
        const getContent = module.getContent({ editorRef, showRawEditor: false })();
        expect(spies.visualHtml.mock.calls.length).toEqual(1);
        expect(spies.visualHtml).toHaveBeenCalledWith({ editorValue: visualContent });
        expect(getContent).toEqual(visualContent);
      });
      test('returns correct content based on showRawEditor equals true', () => {
        jest.clearAllMocks();
        const getContent = module.getContent({ editorRef, showRawEditor: true })();
        expect(spies.rawHtml.mock.calls.length).toEqual(1);
        expect(spies.rawHtml).toHaveBeenCalledWith({ editorValue: rawContent });
        expect(getContent).toEqual(rawContent);
      });
    });

    describe('isDirty', () => {
      test('checks isNotDirty flag when showRawEditor is false', () => {
        const editorRef = {
          current: {
            isNotDirty: false,
          },
        };
        const isDirty = module.isDirty({ editorRef, showRawEditor: false })();
        expect(isDirty).toEqual(true);
      });
      test('checks observer.lastChange flag when showRawEditor is true', () => {
        const editorRef = {
          current: {
            observer: { lastChange: 123 },
          },
        };
        const isDirty = module.isDirty({ editorRef, showRawEditor: true })();
        expect(isDirty).toEqual(true);
      });
    });
  });
});
