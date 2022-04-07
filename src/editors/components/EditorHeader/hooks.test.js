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

describe('EditorHeader hooks', () => {
  const editorRef = { current: {} };
  const returnTitle = 'Type Header';
  let setBlockTitle;
  let output;
  beforeEach(() => {
    setBlockTitle = jest.fn();
  });
  describe('base hooks', () => {
    describe('isEditing', () => {
      beforeEach(() => {
        output = module.hooks.isEditing();
      });
      test('returns isEditing field, defaulted to false', () => {
        expect(output.isEditing).toEqual({ state: false });
      });
      test('startEditing calls the setter function with true', () => {
        output.startEditing();
        expect(React.updateState).toHaveBeenCalledWith({ val: false, newVal: true });
      });
      test('stopEditign calls the setter function with false', () => {
        output.stopEditing();
        expect(React.updateState).toHaveBeenCalledWith({ val: false, newVal: false });
      });
    });
    describe('localTitle', () => {
      let stopEditing;
      beforeEach(() => {
        stopEditing = jest.fn();
        output = module.hooks.localTitle({
          setBlockTitle,
          stopEditing,
          returnTitle,
        });
      });
      test('returns the state value for localTitle, defaulted to returnTitle', () => {
        expect(output.localTitle).toEqual({ state: returnTitle });
      });
      describe('updateTitle hook', () => {
        it('calls setBlockTitle with localTitle, and stopEditing', () => {
          output.updateTitle();
          expect(setBlockTitle).toHaveBeenCalledWith(output.localTitle);
          expect(stopEditing).toHaveBeenCalled();
        });
      });
      describe('handleChange', () => {
        it('calls setLocalTitle with the event target value', () => {
          const value = 'SOME VALUe';
          output.handleChange({ target: { value } });
          expect(React.updateState).toHaveBeenCalledWith({
            val: returnTitle,
            newVal: value,
          });
        });
      });
    });
    describe('handleKeyDown', () => {
      let stopEditing;
      beforeEach(() => {
        stopEditing = jest.fn();
        editorRef.current.focus = jest.fn();
        output = module.hooks.handleKeyDown({ stopEditing, editorRef });
      });
      describe('Enter-key event', () => {
        it('calls stopEditing', () => {
          output({ key: 'Enter' });
          expect(stopEditing).toHaveBeenCalled();
        });
      });
      describe('tab event', () => {
        it('calls preventDefault on the event, and focuses to the editorRef', () => {
          const preventDefault = jest.fn();
          output({ key: 'Tab', preventDefault });
          expect(preventDefault).toHaveBeenCalled();
          expect(editorRef.current.focus).toHaveBeenCalled();
        });
        it('does nothing if editorRef is not instantiated', () => {
          const preventDefault = jest.fn();
          output = module.hooks.handleKeyDown({ stopEditing, editorRef: null });
          output({ key: 'Tab', preventDefault });
          expect(preventDefault).not.toHaveBeenCalled();
        });
      });
    });
  });
  describe('local title hooks', () => {
    let oldHooks;
    const values = {
      isEditing: 'ISeDITING',
      startEditing: 'STARTeDITING',
      stopEditing: 'STOPeDITING',
      handleChange: 'HANDLEcHANGE',
      localTitle: 'LOCALtITLE',
    };
    const newHooks = {
      isEditing: () => ({
        isEditing: values.isEditing,
        startEditing: values.startEditing,
        stopEditing: values.stopEditing,
      }),
      localTitle: jest.fn((args) => ({
        updateTitle: args,
        handleChange: values.handleChange,
        localTitle: values.localTitle,
      })),
      handleKeyDown: jest.fn(args => ({ handleKeyDown: args })),
    };
    beforeEach(() => {
      oldHooks = module.hooks;
      module.hooks.isEditing = newHooks.isEditing;
      module.hooks.localTitle = newHooks.localTitle;
      module.hooks.handleKeyDown = newHooks.handleKeyDown;
      output = module.localTitleHooks({ editorRef, setBlockTitle, returnTitle });
    });
    afterEach(() => {
      module.hooks = oldHooks;
    });
    it('returns isEditing, startEditing, and stopEditing, tied to the isEditing hook', () => {
      expect(output.isEditing).toEqual(values.isEditing);
      expect(output.startEditing).toEqual(values.startEditing);
      expect(output.stopEditing).toEqual(values.stopEditing);
    });
    it('returns localTitle, updateTitle, and handleChange, tied to the localTitle hook', () => {
      expect(output.updateTitle).toEqual({
        setBlockTitle,
        stopEditing: values.stopEditing,
        returnTitle,
      });
      expect(output.handleChange).toEqual(values.handleChange);
      expect(output.localTitle).toEqual(values.localTitle);
    });
    it('returns a new ref for inputRef', () => {
      expect(output.inputRef).toEqual({ ref: undefined });
    });
    it('returns handleKeyDown, tied to handleKeyDown hook', () => {
      expect(output.handleKeyDown).toEqual(newHooks.handleKeyDown({
        stopEditing: values.stopEditing,
        editorRef,
      }));
    });
  });
});
