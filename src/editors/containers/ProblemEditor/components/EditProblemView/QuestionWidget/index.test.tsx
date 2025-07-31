import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import editorRender from '../../../../../modifiedEditorTestRender';
import QuestionWidget from '.';

jest.mock('@src/editors/sharedComponents/TinyMceWidget/hooks', () => ({
  ...jest.requireActual('../../../../../sharedComponents/TinyMceWidget/hooks'),
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

jest.mock('@src/editors/sharedComponents/TinyMceWidget', () => ('TinyMceWidget'));

const initialState = {
  problem: {
    question: 'This is my question',
  },
  app: {
    learningContextId: 'course+org+run',
    images: {},
    isLibrary: false,
    blockId: '',
  },
};

describe('QuestionWidget', () => {
  beforeEach(() => {
    initializeMocks({ initialState });
  });
  describe('render', () => {
    beforeEach(() => {
      initializeMocks();
    });
    test('renders correct default', () => {
      editorRender(<QuestionWidget />, { initialState });
      expect(screen.getByText('Question')).toBeInTheDocument();
    });
  });
});
