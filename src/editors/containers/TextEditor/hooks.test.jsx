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
    state.testGetter(state.keys.isModalOpen);
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

    describe('addImageUploadBehavior', () => {
      test('It calls addButton in the editor, but openModal is not called', () => {
        const addButton = jest.fn();
        const openModal = jest.fn();
        const setImage = jest.fn();
        const editor = {
          ui: { registry: { addButton } },
        };
        const mockOpenModalWithImage = args => ({ openModalWithSelectedImage: args });
        const expectedSettingsAction = mockOpenModalWithImage({ editor, setImage, openModal });
        jest.spyOn(module, moduleKeys.openModalWithSelectedImage)
          .mockImplementationOnce(mockOpenModalWithImage);
        output = module.addImageUploadBehavior({ openModal, setImage })(editor);
        expect(addButton.mock.calls).toEqual([
          [tinyMCE.buttons.imageUploadButton, { icon: 'image', onAction: openModal }],
          [tinyMCE.buttons.editImageSettings, { icon: 'image', onAction: expectedSettingsAction }],
        ]);
        expect(openModal).not.toHaveBeenCalled();
      });
    });

    describe('editorConfig', () => {
      const props = {
        blockValue: null,
        // lmsEndpointUrl: 'sOmEuRl.cOm',
      };
      const evt = 'fakeEvent';
      const editor = 'myEditor';
      const addImageUploadBehavior = args => ({ addImageUploadBehvaior: args });
      beforeEach(() => {
        props.setEditorRef = jest.fn();
        props.openModal = jest.fn();
        props.initializeEditor = jest.fn();
        jest.spyOn(module, moduleKeys.addImageUploadBehavior)
          .mockImplementationOnce(addImageUploadBehavior);
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
        expect(output.init.plugins).toEqual(pluginConfig.plugins);
        expect(output.init.imagetools_toolbar).toEqual(pluginConfig.imageToolbar);
        expect(output.init.toolbar).toEqual(pluginConfig.toolbar);
        Object.keys(pluginConfig.config).forEach(key => {
          expect(output.init[key]).toEqual(pluginConfig.config[key]);
        });
        // Commented out as we investigate whether this is only needed for image proxy
        // expect(output.init.imagetools_cors_hosts).toMatchObject([props.lmsEndpointUrl]);
      });
      it('calls addImageUploadBehavior on setup', () => {
        expect(output.init.setup).toEqual(
          addImageUploadBehavior({ openModal: props.openModal, setImage: props.setSelection }),
        );
      });
    });

    describe('modalToggle', () => {
      const hookKey = state.keys.isModalOpen;
      beforeEach(() => {
        hook = module.modalToggle();
      });
      test('isOpen: state value', () => {
        expect(hook.isOpen).toEqual(state.stateVals[hookKey]);
      });
      test('openModal: calls setter with true', () => {
        hook.openModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(true);
      });
      test('closeModal: calls setter with false', () => {
        hook.closeModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(false);
      });
    });

    describe('openModalWithSelectedImage', () => {
      test('image is set to be value stored in editor, modal is opened', () => {
        const setImage = jest.fn();
        const openModal = jest.fn();
        const editor = { selection: { getNode: () => mockNode } };
        module.openModalWithSelectedImage({ editor, openModal, setImage })();
        expect(setImage).toHaveBeenCalledWith({
          externalUrl: mockNode.src,
          altText: mockNode.alt,
          width: mockNode.width,
          height: mockNode.height,
        });
        expect(openModal).toHaveBeenCalled();
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
