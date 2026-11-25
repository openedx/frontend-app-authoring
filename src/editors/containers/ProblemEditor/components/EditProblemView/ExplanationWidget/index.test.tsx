import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import ExplanationWidget from '.';

jest.mock('@src/editors/data/redux', () => ({
  __esModule: true,
  default: jest.fn(),
  selectors: {
    problem: {
      settings: jest.fn(state => ({ question: state })),
    },
    app: {
      learningContextId: jest.fn(state => ({ learningContextId: state })),
      images: jest.fn(state => ({ images: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
      blockId: jest.fn(state => ({ blockId: state })),
    },
  },
  thunkActions: {
    video: {
      importTranscript: jest.fn(),
    },
  },
}));

jest.mock('@src/editors/sharedComponents/TinyMceWidget/hooks', () => ({
  ...jest.requireActual('@src/editors/sharedComponents/TinyMceWidget/hooks'),
  useEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('useEditorRef.setEditorRef'),
  })),
}));

jest.mock('@src/editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true,
  default: () => <div>TinyMceWidget</div>,
}));

describe('SolutionWidget', () => {
  const props = {
    settings: { solutionExplanation: 'This is my solution' },
    learningContextId: 'course+org+run',
    images: {},
    isLibrary: false,
    blockId: 'block-v1:Org+TS100+24+type@html+block@12345',
  };
  beforeEach(() => {
    initializeMocks();
  });
  test('renders correct default', () => {
    render(<ExplanationWidget {...props} />);
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.getByText('Provide an explanation for the correct answer')).toBeInTheDocument();
    expect(screen.getByText('TinyMceWidget')).toBeInTheDocument();
  });
});
