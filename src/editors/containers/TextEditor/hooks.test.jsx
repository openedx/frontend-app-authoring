import * as module from './hooks';

import { MockUseState } from '../../../testUtils';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createRef: jest.fn(val => ({ ref: val })),
}));

const state = new MockUseState(module);

describe('TextEditor hooks', () => {
  describe('Editor Init hooks', () => {
    describe('state hooks', () => {
      state.testGetter(state.keys.isModalOpen);
      state.testGetter(state.keys.imageSelection);
    });
    const mockOpenModal = jest.fn();
    const mockAddbutton = jest.fn(val => ({ onAction: val }));
    const mockNode = {
      src: 'sOmEuRl.cOm',
      alt: 'aLt tExt',
      width: 2022,
      height: 1619,
    };
    const editor = {
      ui: {
        registry: {
          addButton: mockAddbutton,
        },
      },
      selection: {
        getNode: () => mockNode,
      },
    };
    describe('openModalWithSelectedImage', () => {
      const mockSetImage = jest.fn();
      let output;
      beforeEach(() => {
        output = module.openModalWithSelectedImage(editor, mockSetImage, mockOpenModal);
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      test('image is set to be value stored in editor, modal is opened', () => {
        output();
        expect(mockSetImage).toHaveBeenCalledWith({
          externalUrl: mockNode.src,
          altText: mockNode.alt,
          width: mockNode.width,
          height: mockNode.height,
        });
        expect(mockOpenModal).toHaveBeenCalled();
      });
    });
    describe('addImageUploadBehavior', () => {
      const mockSetImage = jest.fn();
      let output;
      const mockHookResult = jest.fn();
      beforeEach(() => {
        output = module.addImageUploadBehavior({ openModal: mockOpenModal, setImage: mockSetImage });
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      test('It calls addButton in the editor, but openModal is not called', () => {
        jest.spyOn(module, 'openModalWithSelectedImage').mockImplementationOnce(() => mockHookResult);
        output(editor);
        expect(mockAddbutton.mock.calls).toEqual([
          ['imageuploadbutton', { icon: 'image', onAction: mockOpenModal }],
          ['editimagesettings', { icon: 'image', onAction: mockHookResult }],
        ]);
        expect(mockOpenModal).not.toHaveBeenCalled();
      });
    });
    describe('initializeEditorRef', () => {
      const mockSetRef = jest.fn(val => ({ editor: val }));
      const mockInitializeEditor = jest.fn();
      let output;
      beforeEach(() => {
        output = module.initializeEditorRef(mockSetRef, mockInitializeEditor);
      });
      test('It calls setref with editor as params', () => {
        output(editor);
        expect(mockSetRef).toHaveBeenCalledWith(editor);
        expect(mockInitializeEditor).toHaveBeenCalled();
      });
    });
    describe('editorConfig', () => {
      const blockvalue = null;
      const lmsEndpointUrl = 'sOmEuRL.cOm';
      const props = {
        setEditorRef: jest.fn(),
        blockValue: blockvalue,
        openModal: jest.fn(),
        initializeEditor: jest.fn(),
        lmsEndpointUrl,
      };
      let output;
      test('It creates an onInit which calls initializeEditor and setEditorRef', () => {
        output = module.editorConfig(props);
        output.onInit();
        expect(props.initializeEditor).toHaveBeenCalled();
        expect(props.setEditorRef).toHaveBeenCalled();
      });
      test('It sets the blockvalue to be empty string by default', () => {
        output = module.editorConfig(props);
        expect(output.initialValue).toBe('');
      });
      test('It sets the blockvalue to be the blockvalue if nonempty', () => {
        const htmltext = 'SomE hTML content';
        const newprops = {
          setEditorRef: jest.fn(),
          blockValue: {
            data: {
              data: htmltext,
            },
          },
          openModal: jest.fn(),
          initializeEditor: jest.fn(),
        };
        output = module.editorConfig(newprops);
        expect(output.initialValue).toBe(htmltext);
      });
      test('It configures plugins and toolbars correctly', () => {
        output = module.editorConfig(props);
        Object.values(module.pluginConfig.plugins).forEach(
          value => expect(output.init.plugins.includes(value)).toBe(true),
        );
        Object.values(module.pluginConfig.toolbar).forEach(
          value => expect(output.init.toolbar.includes(value)).toBe(true),
        );
        Object.values(module.pluginConfig.imageToolbar).forEach(
          value => expect(output.init.imagetools_toolbar.includes(value)).toBe(true),
        );
        expect(output.init.menubar).toBe(false);
        expect(output.init.imagetools_cors_hosts).toMatchObject([lmsEndpointUrl]);
        expect(output.init.height).toBe('100%');
        expect(output.init.min_height).toBe(500);
        expect(output.init.branding).toBe(false);
      });
    });
  });
  describe('selectedImage hooks', () => {
    const val = { a: 'VaLUe' };
    let hook;
    beforeEach(() => {
      state.mock();
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
  describe('modalToggle hook', () => {
    let hook;
    const hookKey = state.keys.isModalOpen;
    beforeEach(() => {
      state.mock();
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
  describe('nullMethod hook', () => {
    test('it outputs null', () => {
      expect(module.nullMethod()).toBe(undefined);
    });
  });
});
