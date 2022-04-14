import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../testUtils';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { modalToggle } from './hooks';
import { TextEditor, mapStateToProps, mapDispatchToProps } from '.';

// Per https://github.com/tinymce/tinymce-react/issues/91 React unit testing in JSDOM is not supported by tinymce.
// Consequently, mock the Editor out.
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'TiNYmCE EDitOR',
  };
});

jest.mock('../EditorContainer', () => 'EditorContainer');
jest.mock('./components/ImageUploadModal', () => 'ImageUploadModal');

jest.mock('./hooks', () => ({
  editorConfig: jest.fn(args => ({ editorConfig: args })),
  getContent: jest.fn(args => ({ getContent: args })),
  modalToggle: jest.fn(() => ({
    isOpen: true,
    openModal: jest.fn().mockName('openModal'),
    closeModal: jest.fn().mockName('closeModal'),
  })),
  selectedImage: jest.fn(() => ({
    selection: 'hooks.selectedImage.selection',
    setSelection: jest.fn().mockName('hooks.selectedImage.setSelection'),
    clearSelection: jest.fn().mockName('hooks.selectedImage.clearSelection'),
  })),
  nullMethod: jest.fn().mockName('hooks.nullMethod'),
  prepareEditorRef: jest.fn(() => ({
    editorRef: { current: { value: 'something' } },
    refReady: true,
    setEditorRef: jest.fn().mockName('hooks.prepareEditorRef.setEditorRef'),
  })),
}));

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    ...jest.requireActual('react'),
    updateState,
    useState: jest.fn(val => ([{ state: val }, jest.fn().mockName('setState')])),
  };
});

jest.mock('../../data/redux', () => ({
  actions: {
    app: {
      initializeEditor: jest.fn().mockName('actions.app.initializeEditor'),
    },
  },
  selectors: {
    app: {
      blockValue: jest.fn(state => ({ blockValue: state })),
      lmsEndpointUrl: jest.fn(state => ({ lmsEndpointUrl: state })),
    },
    requests: {
      isFailed: jest.fn((state, params) => ({ isFailed: { state, params } })),
      isFinished: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
  },
}));

describe('TextEditor', () => {
  const props = {
    onClose: jest.fn().mockName('props.onClose'),
    // redux
    blockValue: { data: { some: 'eDiTablE Text' } },
    lmsEndpointUrl: 'sOmEvaLue.cOm',
    blockFailed: false,
    blockFinished: true,
    initializeEditor: jest.fn().mockName('args.intializeEditor'),
    // inject
    intl: { formatMessage },
  };
  describe('snapshots', () => {
    modalToggle.mockReturnValue({
      isOpen: false,
      openModal: jest.fn().mockName('modal.openModal'),
      closeModal: jest.fn().mockName('modal.closeModal'),
    });
    test('renders as expected with default behavior', () => {
      expect(shallow(<TextEditor {...props} />)).toMatchSnapshot();
    });
    test('not yet loaded, Spinner appears', () => {
      expect(shallow(<TextEditor {...props} blockFinished={false} />)).toMatchSnapshot();
    });
    test('block failed to load, Toast is shown', () => {
      expect(shallow(<TextEditor {...props} blockFailed />)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('blockValue from app.blockValue', () => {
      expect(
        mapStateToProps(testState).blockValue,
      ).toEqual(selectors.app.blockValue(testState));
    });
    test('lmsEndpointUrl from app.lmsEndpointUrl', () => {
      expect(
        mapStateToProps(testState).lmsEndpointUrl,
      ).toEqual(selectors.app.lmsEndpointUrl(testState));
    });
    test('blockFailed from requests.isFailed', () => {
      expect(
        mapStateToProps(testState).blockFailed,
      ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.fetchBlock }));
    });
    test('blockFinished from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).blockFinished,
      ).toEqual(selectors.requests.isFinished(testState, { requestKey: RequestKeys.fetchBlock }));
    });
  });
  describe('mapDispatchToProps', () => {
    test('initializeEditor from actions.app.initializeEditor', () => {
      expect(mapDispatchToProps.initializeEditor).toEqual(actions.app.initializeEditor);
    });
  });
});
