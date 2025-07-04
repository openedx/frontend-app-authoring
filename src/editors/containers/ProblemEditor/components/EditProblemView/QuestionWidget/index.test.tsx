import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import { formatMessage } from '@src/editors/testUtils';
import { QuestionWidgetInternal as QuestionWidget } from '.';

jest.mock('@src/editors/data/redux', () => ({
  __esModule: true,
  default: jest.fn(),
  actions: {
    problem: {
      updateQuestion: jest.fn().mockName('actions.problem.updateQuestion'),
    },
  },
  selectors: {
    app: {
      learningContextId: jest.fn(state => ({ learningContextId: state })),
      images: jest.fn(state => ({ images: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
      blockId: jest.fn(state => ({ blockId: state })),
    },
    problem: {
      question: jest.fn(state => ({ question: state })),
    },
  },
  thunkActions: {
    video: {
      importTranscript: jest.fn(),
    },
  },
}));

jest.mock('@src/editors/sharedComponents/TinyMceWidget/hooks', () => ({
  ...jest.requireActual('../../../../../sharedComponents/TinyMceWidget/hooks'),
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

jest.mock('@src/editors/sharedComponents/TinyMceWidget', () => ('TinyMceWidget'));

describe('QuestionWidget', () => {
  const props = {
    question: 'This is my question',
    updateQuestion: jest.fn(),
    learningContextId: 'course+org+run',
    images: {},
    isLibrary: false,
    blockId: '',
    // injected
    intl: { formatMessage },
  };
  describe('render', () => {
    beforeEach(() => {
      initializeMocks();
    });
    test('renders correct default', () => {
      render(<QuestionWidget {...props} />);
      expect(screen.getByText('Question')).toBeInTheDocument();
    });
  });
});
