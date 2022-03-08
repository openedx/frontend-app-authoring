import React from 'react';
import * as module from './hooks';

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    updateState,
    useState: jest.fn(val => ([{ state: val }, (newVal) => updateState({ val, newVal })])),
    createRef: jest.fn(val => ({ ref: val })),
  };
});

describe('TextEditor hooks', () => {
  describe('Editor Init hooks', () => {
    describe('addImageUploadButton', () => {
      const mockOpenModal = jest.fn();
      const mockAddbutton = jest.fn(val => ({ onAction: val }));
      const editor = {
        ui: {
          registry: {
            addButton: mockAddbutton,
          },
        },
      };
      let output;
      beforeEach(() => {
        output = module.addImageUploadButton(mockOpenModal);
      });
      test('It calls addButton in the editor, but openModal is not called', () => {
        output(editor);
        expect(mockAddbutton).toHaveBeenCalledWith('imageuploadbutton', { icon: 'image', onAction: mockOpenModal });
        expect(mockOpenModal).not.toHaveBeenCalled();
      });
    });
    describe('initializeEditorRef', () => {
      const mockSetRef = jest.fn(val => ({ editor: val }));
      const editor = {
        editme: 'MakE sOMe Text',
      };
      const evt = {
        garbage: 'fOr TInYmCE',
      };
      let output;
      beforeEach(() => {
        output = module.initializeEditorRef(mockSetRef);
      });
      test('It calls setref with editor as params', () => {
        output(evt, editor);
        expect(mockSetRef).toHaveBeenCalledWith(editor);
      });
    });
    describe('editorConfig', () => {
      const blockvalue = null;
      const props = {
        setEditorRef: jest.fn(),
        blockValue: blockvalue,
        openModal: jest.fn(),
        initializeEditor: jest.fn(),
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
    });
  });
  describe('modalToggle hook', () => {
    let output;
    beforeEach(() => {
      output = module.modalToggle();
    });
    test('returns isOpen field, defaulted to false', () => {
      expect(output.isOpen).toEqual({ state: false });
    });
    test('returns openModal field, which sets modal to true and calls updateState', () => {
      output.openModal();
      expect(React.updateState).toHaveBeenCalledWith({ val: false, newVal: true });
    });
    test('returns closeModal field, which sets modal to true and calls updateState', () => {
      output.closeModal();
      expect(React.updateState).toHaveBeenCalledWith({ val: false, newVal: false });
    });
  });
  describe('nullMethod hook', () => {
    test('it outputs null', () => {
      expect(module.nullMethod()).toBe(undefined);
    });
  });
});
