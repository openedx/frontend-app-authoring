import { useEffect } from 'react';
import { MockUseState } from '../../../testUtils';

import tinyMCE from '../../data/constants/tinyMCE';
import { keyStore } from '../../utils';
import * as appHooks from '../../hooks';
import pluginConfig from './pluginConfig';
import * as module from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createRef: jest.fn(val => ({ ref: val })),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

const state = new MockUseState(module);
const moduleKeys = keyStore(module);

const mockNode = {
  src: 'sOmEuRl.cOm',
  alt: 'aLt tExt',
  width: 2022,
  height: 1619,
};

let hook;
let output;

describe('TextEditor hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.isImageModalOpen);
    state.testGetter(state.keys.isSourceCodeModalOpen);
    state.testGetter(state.keys.imageSelection);
    state.testGetter(state.keys.refReady);
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
    beforeEach(() => { state.mock(); });
    afterEach(() => { state.restore(); });

    describe('setupCustomBehavior', () => {
      test('It calls addButton and addToggleButton in the editor, but openModal is not called', () => {
        const addButton = jest.fn();
        const addToggleButton = jest.fn();
        const openImgModal = jest.fn();
        const openSourceCodeModal = jest.fn();
        const setImage = jest.fn();
        const editor = {
          ui: { registry: { addButton, addToggleButton } },
        };
        const mockOpenModalWithImage = args => ({ openModalWithSelectedImage: args });
        const expectedSettingsAction = mockOpenModalWithImage({ editor, setImage, openImgModal });
        const toggleCodeFormatting = expect.any(Function);
        const setupCodeFormatting = expect.any(Function);
        jest.spyOn(module, moduleKeys.openModalWithSelectedImage)
          .mockImplementationOnce(mockOpenModalWithImage);
        output = module.setupCustomBehavior({ openImgModal, openSourceCodeModal, setImage })(editor);
        expect(addButton.mock.calls).toEqual([
          [tinyMCE.buttons.imageUploadButton, { icon: 'image', tooltip: 'Add Image', onAction: openImgModal }],
          [tinyMCE.buttons.editImageSettings, { icon: 'image', tooltip: 'Edit Image Settings', onAction: expectedSettingsAction }],
          [tinyMCE.buttons.code, { text: 'HTML', tooltip: 'Source code', onAction: openSourceCodeModal }],
        ]);
        expect(addToggleButton.mock.calls).toEqual([
          [tinyMCE.buttons.codeBlock, {
            icon: 'sourcecode', tooltip: 'Code Block', onAction: toggleCodeFormatting, onSetup: setupCodeFormatting,
          }],
        ]);
        expect(openImgModal).not.toHaveBeenCalled();
      });
    });

    describe('replaceStaticwithAsset', () => {
      test('it calls getContent and setContent', () => {
        const editor = { getContent: jest.fn(() => '<img src="/static/soMEImagEURl1.jpeg"/>'), setContent: jest.fn() };
        const imageUrls = [{ staticFullUrl: '/assets/soMEImagEURl1.jpeg', displayName: 'soMEImagEURl1.jpeg' }];
        module.replaceStaticwithAsset(editor, imageUrls);
        expect(editor.getContent).toHaveBeenCalled();
        expect(editor.setContent).toHaveBeenCalled();
      });
    });

    describe('checkRelativeUrl', () => {
      test('it calls editor.on', () => {
        const editor = { on: jest.fn() };
        const imageUrls = ['soMEImagEURl1'];
        module.checkRelativeUrl(imageUrls)(editor);
        expect(editor.on).toHaveBeenCalled();
      });
    });

    describe('editorConfig', () => {
      const props = {
        blockValue: null,
        lmsEndpointUrl: 'sOmEuRl.cOm',
        studioEndpointUrl: 'sOmEoThEruRl.cOm',
        images: { sOmEuiMAge: { staTICUrl: '/assets/sOmEuiMAge' } },
        isLibrary: false,
      };
      const evt = 'fakeEvent';
      const editor = 'myEditor';
      const setupCustomBehavior = args => ({ setupCustomBehavior: args });
      beforeEach(() => {
        props.setEditorRef = jest.fn();
        props.openImgModal = jest.fn();
        props.openSourceCodeModal = jest.fn();
        props.initializeEditor = jest.fn();
        jest.spyOn(module, moduleKeys.setupCustomBehavior)
          .mockImplementationOnce(setupCustomBehavior);
        output = module.editorConfig(props);
      });
      test('It creates an onInit which calls initializeEditor and setEditorRef', () => {
        output.onInit(evt, editor);
        expect(props.setEditorRef).toHaveBeenCalledWith(editor);
        expect(props.initializeEditor).toHaveBeenCalled();
      });
      test('It sets the blockvalue to be empty string by default', () => {
        expect(output.initialValue).toBe('');
      });
      test('It sets the blockvalue to be the blockvalue if nonempty', () => {
        const htmltext = 'SomE hTML content';
        const blockValue = { data: { data: htmltext } };
        output = module.editorConfig({ ...props, blockValue });
        expect(output.initialValue).toBe(htmltext);
      });
      test('It configures plugins and toolbars correctly', () => {
        expect(output.init.plugins).toEqual(pluginConfig(props.isLibrary).plugins);
        expect(output.init.imagetools_toolbar).toEqual(pluginConfig(props.isLibrary).imageToolbar);
        expect(output.init.toolbar).toEqual(pluginConfig(props.isLibrary).toolbar);
        Object.keys(pluginConfig(props.isLibrary).config).forEach(key => {
          expect(output.init[key]).toEqual(pluginConfig(props.isLibrary).config[key]);
        });
        // Commented out as we investigate whether this is only needed for image proxy
        // expect(output.init.imagetools_cors_hosts).toMatchObject([props.lmsEndpointUrl]);
      });

      it('calls setupCustomBehavior on setup', () => {
        expect(output.init.setup).toEqual(
          setupCustomBehavior({
            openImgModal: props.openImgModal,
            openSourceCodeModal: props.openSourceCodeModal,
            setImage: props.setSelection,
          }),
        );
      });
    });

    describe('imgModalToggle', () => {
      const hookKey = state.keys.isImageModalOpen;
      beforeEach(() => {
        hook = module.imgModalToggle();
      });
      test('isOpen: state value', () => {
        expect(hook.isImgOpen).toEqual(state.stateVals[hookKey]);
      });
      test('openModal: calls setter with true', () => {
        hook.openImgModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(true);
      });
      test('closeModal: calls setter with false', () => {
        hook.closeImgModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(false);
      });
    });

    describe('sourceCodeModalToggle', () => {
      const editorRef = { current: { focus: jest.fn() } };
      const hookKey = state.keys.isSourceCodeModalOpen;
      beforeEach(() => {
        hook = module.sourceCodeModalToggle(editorRef);
      });
      test('isOpen: state value', () => {
        expect(hook.isSourceCodeOpen).toEqual(state.stateVals[hookKey]);
      });
      test('openModal: calls setter with true', () => {
        hook.openSourceCodeModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(true);
      });
      test('closeModal: calls setter with false', () => {
        hook.closeSourceCodeModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(false);
      });
    });

    describe('openModalWithSelectedImage', () => {
      test('image is set to be value stored in editor, modal is opened', () => {
        const setImage = jest.fn();
        const openImgModal = jest.fn();
        const editor = { selection: { getNode: () => mockNode } };
        module.openModalWithSelectedImage({ editor, openImgModal, setImage })();
        expect(setImage).toHaveBeenCalledWith({
          externalUrl: mockNode.src,
          altText: mockNode.alt,
          width: mockNode.width,
          height: mockNode.height,
        });
        expect(openImgModal).toHaveBeenCalled();
      });
    });

    describe('prepareEditorRef', () => {
      beforeEach(() => {
        hook = module.prepareEditorRef();
      });
      const key = state.keys.refReady;
      test('sets refReady to false by default, ref is null', () => {
        expect(state.stateVals[key]).toEqual(false);
        expect(hook.editorRef.current).toBe(null);
      });
      test('when useEffect triggers, refReady is set to true', () => {
        expect(state.setState[key]).not.toHaveBeenCalled();
        const [cb, prereqs] = useEffect.mock.calls[0];
        expect(prereqs).toStrictEqual([]);
        cb();
        expect(state.setState[key]).toHaveBeenCalledWith(true);
      });
      test('calling setEditorRef sets the ref value', () => {
        const fakeEditor = { editor: 'faKe Editor' };
        expect(hook.editorRef.current).not.toBe(fakeEditor);
        hook.setEditorRef.cb(fakeEditor);
        expect(hook.editorRef.current).toBe(fakeEditor);
      });
    });

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
      test('returns correct ontent based on isRaw', () => {
        expect(module.getContent({ editorRef, isRaw: false })()).toEqual(visualContent);
        expect(module.getContent({ editorRef, isRaw: true })()).toEqual(rawContent);
      });
    });

    describe('selectedImage hooks', () => {
      const val = { a: 'VaLUe' };
      beforeEach(() => {
        hook = module.selectedImage(val);
      });
      test('selection: state value', () => {
        expect(hook.selection).toEqual(state.stateVals[state.keys.imageSelection]);
      });
      test('setSelection: setter for value', () => {
        expect(hook.setSelection).toEqual(state.setState[state.keys.imageSelection]);
      });
      test('clearSelection: calls setter with null', () => {
        expect(hook.setSelection).not.toHaveBeenCalled();
        hook.clearSelection();
        expect(hook.setSelection).toHaveBeenCalledWith(null);
      });
    });
  });
});
