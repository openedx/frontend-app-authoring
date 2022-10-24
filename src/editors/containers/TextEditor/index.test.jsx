import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../testUtils';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { imgModalToggle, sourceCodeModalToggle } from './hooks';
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
jest.mock('./components/SourceCodeModal', () => 'SourceCodeModal');

jest.mock('./hooks', () => ({
  editorConfig: jest.fn(args => ({ editorConfig: args })),
  getContent: jest.fn(args => ({ getContent: args })),
  imgModalToggle: jest.fn(() => ({
    isImgOpen: true,
    openImgModal: jest.fn().mockName('openModal'),
    closeImgModal: jest.fn().mockName('closeModal'),
  })),
  sourceCodeModalToggle: jest.fn(() => ({
    isSourceCodeOpen: true,
    openSourceCodeModal: jest.fn().mockName('openModal'),
    closeSourceCodeModal: jest.fn().mockName('closeModal'),
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
  filterAssets: jest.fn(() => [{ staTICUrl: '/assets/sOmEaSsET' }]),
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
      studioEndpointUrl: jest.fn(state => ({ studioEndpointUrl: state })),
      isRaw: jest.fn(state => ({ isRaw: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
      assets: jest.fn(state => ({ assets: state })),
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
    blockValue: { data: { data: 'eDiTablE Text' } },
    lmsEndpointUrl: 'sOmEvaLue.cOm',
    studioEndpointUrl: 'sOmEoThERvaLue.cOm',
    blockFailed: false,
    initializeEditor: jest.fn().mockName('args.intializeEditor'),
    isRaw: false,
    isLibrary: false,
    assetsFinished: true,
    assets: { sOmEaSsET: { staTICUrl: '/assets/sOmEaSsET' } },
    // inject
    intl: { formatMessage },
  };
  describe('snapshots', () => {
    imgModalToggle.mockReturnValue({
      isImgOpen: false,
      openImgModal: jest.fn().mockName('modal.openModal'),
      closeImgModal: jest.fn().mockName('modal.closeModal'),
    });
    sourceCodeModalToggle.mockReturnValue({
      isSourceCodeOpen: false,
      openSourceCodeModal: jest.fn().mockName('modal.openModal'),
      closeSourceCodeModal: jest.fn().mockName('modal.closeModal'),
    });
    test('renders as expected with default behavior', () => {
      expect(shallow(<TextEditor {...props} />)).toMatchSnapshot();
    });
    test('not yet loaded, Spinner appears', () => {
      expect(shallow(<TextEditor {...props} assetsFinished={false} />)).toMatchSnapshot();
    });
    test('loaded, raw editor', () => {
      expect(shallow(<TextEditor {...props} isRaw />)).toMatchSnapshot();
    });
    test('block failed to load, Toast is shown', () => {
      expect(shallow(<TextEditor {...props} blockFailed />)).toMatchSnapshot();
    });
    test('ImageUploadModal is not rendered', () => {
      expect(shallow(<TextEditor {...props} isLibrary />)).toMatchSnapshot();
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
    test('assets from app.assets', () => {
      expect(
        mapStateToProps(testState).assets,
      ).toEqual(selectors.app.assets(testState));
    });
    test('blockFailed from requests.isFailed', () => {
      expect(
        mapStateToProps(testState).blockFailed,
      ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.fetchBlock }));
    });
    test('assetssFinished from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).assetsFinished,
      ).toEqual(selectors.requests.isFinished(testState, { requestKey: RequestKeys.fetchAssets }));
    });
  });
  describe('mapDispatchToProps', () => {
    test('initializeEditor from actions.app.initializeEditor', () => {
      expect(mapDispatchToProps.initializeEditor).toEqual(actions.app.initializeEditor);
    });
  });
});
