import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../testUtils';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
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

jest.mock('./hooks', () => ({
  getContent: jest.fn(args => ({ getContent: args })),
  nullMethod: jest.fn().mockName('hooks.nullMethod'),
}));

jest.mock('../../sharedComponents/TinyMceWidget/hooks', () => ({
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
  __esModule: true,
  default: jest.fn(),
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
  thunkActions: {
    video: {
      importTranscript: jest.fn(),
    },
  },
}));

describe('TextEditor', () => {
  const props = {
    onClose: jest.fn().mockName('props.onClose'),
    // redux
    blockValue: { data: { data: 'eDiTablE Text' } },
    blockFailed: false,
    initializeEditor: jest.fn().mockName('args.intializeEditor'),
    isRaw: false,
    assetsFinished: true,
    assets: { sOmEaSsET: { staTICUrl: '/assets/sOmEaSsET' } },
    // inject
    intl: { formatMessage },
  };
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<TextEditor {...props} />).snapshot).toMatchSnapshot();
    });
    test('not yet loaded, Spinner appears', () => {
      expect(shallow(<TextEditor {...props} assetsFinished={false} />).snapshot).toMatchSnapshot();
    });
    test('loaded, raw editor', () => {
      expect(shallow(<TextEditor {...props} isRaw />).snapshot).toMatchSnapshot();
    });
    test('block failed to load, Toast is shown', () => {
      expect(shallow(<TextEditor {...props} blockFailed />).snapshot).toMatchSnapshot();
    });
  });

  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('blockValue from app.blockValue', () => {
      expect(
        mapStateToProps(testState).blockValue,
      ).toEqual(selectors.app.blockValue(testState));
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
