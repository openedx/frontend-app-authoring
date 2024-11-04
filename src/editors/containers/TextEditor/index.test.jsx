import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../testUtils';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { TextEditorInternal as TextEditor, mapStateToProps, mapDispatchToProps } from '.';

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
  isDirty: jest.fn(args => ({ isDirty: args })),
  nullMethod: jest.fn().mockName('hooks.nullMethod'),
}));

jest.mock('../../sharedComponents/TinyMceWidget/hooks', () => ({
  ...jest.requireActual('../../sharedComponents/TinyMceWidget/hooks'),
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
      showRawEditor: jest.fn(state => ({ showRawEditor: state })),
      images: jest.fn(state => ({ images: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
      blockId: jest.fn(state => ({ blockId: state })),
      learningContextId: jest.fn(state => ({ learningContextId: state })),
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
    showRawEditor: false,
    blockFinished: true,
    learningContextId: 'course+org+run',
    images: {},
    // inject
    intl: { formatMessage },
  };
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<TextEditor {...props} />).snapshot).toMatchSnapshot();
    });
    test('renders static images with relative paths', () => {
      const updatedProps = {
        ...props,
        blockValue: { data: { data: 'eDiTablE Text with <img src="/static/img.jpg" />' } },
      };
      expect(shallow(<TextEditor {...updatedProps} />).snapshot).toMatchSnapshot();
    });
    test('not yet loaded, Spinner appears', () => {
      expect(shallow(<TextEditor {...props} blockFinished={false} />).snapshot).toMatchSnapshot();
    });
    test('loaded, raw editor', () => {
      expect(shallow(<TextEditor {...props} showRawEditor />).snapshot).toMatchSnapshot();
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
    test('learningContextId from app.learningContextId', () => {
      expect(
        mapStateToProps(testState).learningContextId,
      ).toEqual(selectors.app.learningContextId(testState));
    });
    test('images from app.images', () => {
      expect(
        mapStateToProps(testState).images,
      ).toEqual(selectors.app.images(testState));
    });
  });

  describe('mapDispatchToProps', () => {
    test('initializeEditor from actions.app.initializeEditor', () => {
      expect(mapDispatchToProps.initializeEditor).toEqual(actions.app.initializeEditor);
    });
  });
});
