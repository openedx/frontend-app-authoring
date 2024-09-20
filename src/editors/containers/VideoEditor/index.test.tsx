import 'CourseAuthoring/editors/setupEditorTest';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../testUtils';
import VideoEditor from '.';

jest.mock('../EditorContainer', () => 'EditorContainer');
jest.mock('./components/VideoEditorModal', () => 'VideoEditorModal');

jest.mock('./hooks', () => ({
  ErrorContext: {
    Provider: 'ErrorContext.Provider',
  },
  errorsHook: jest.fn(() => ({
    error: 'hooks.errorsHook.error',
    validateEntry: jest.fn().mockName('validateEntry'),
  })),
  fetchVideoContent: jest.fn().mockName('fetchVideoContent'),
}));

jest.mock('../../data/redux', () => ({
  selectors: {
    requests: {
      isFinished: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
    app: {
      isLibrary: jest.fn(state => ({ isLibrary: state })),
    },
  },
}));

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
  Spinner: 'Spinner',
}));

describe('VideoEditor', () => {
  const props = {
    onClose: jest.fn().mockName('props.onClose'),
    intl: { formatMessage },
    studioViewFinished: false,
    isLibrary: false,
  };
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<VideoEditor {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
