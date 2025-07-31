import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import editorRender from '../../../../../modifiedEditorTestRender';
import ExplanationWidget from './index';

jest.mock('../../../../../sharedComponents/TinyMceWidget/hooks', () => ({
  ...jest.requireActual('../../../../../sharedComponents/TinyMceWidget/hooks'),
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

jest.mock('../../../../../sharedComponents/TinyMceWidget', () => ({
  __esModule: true,
  default: () => <div>TinyMceWidget</div>,
}));

const initialState = {
  problem: {
    settings: { solutionExplanation: 'This is my solution' },
  },
  app: {
    learningContextId: 'course+org+run',
    images: {},
    isLibrary: false,
    blockId: 'block-v1:Org+TS100+24+type@html+block@12345',
  },
};

describe('SolutionWidget', () => {
  beforeEach(() => {
    initializeMocks({
      initialState,
    });
  });
  test('renders correct default', () => {
    editorRender(<ExplanationWidget />, { initialState });
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.getByText('Provide an explanation for the correct answer')).toBeInTheDocument();
    expect(screen.getByText('TinyMceWidget')).toBeInTheDocument();
  });
});
