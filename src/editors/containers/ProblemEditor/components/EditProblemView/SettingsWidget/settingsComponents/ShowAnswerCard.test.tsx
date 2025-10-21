import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import { formatMessage } from '@src/editors/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import { ShowAnswerCardInternal as ShowAnswerCard } from './ShowAnswerCard';
import * as hooks from '../hooks';

describe('ShowAnswerCard', () => {
  const showAnswer = {
    on: 'after_attempts',
    afterAttempts: 5,
  };

  const props = {
    showAnswer,
    defaultValue: 'finished',
    updateSettings: jest.fn(),
    intl: { formatMessage },
  };

  const initialState = {
    app: {
      studioEndpointUrl: 'SoMEeNDpOinT',
      learningContextId: 'sOMEcouRseId',
      isLibrary: false,
    },
  };

  describe('renders', () => {
    beforeEach(() => {
      initializeMocks();
    });

    test('show answer setting card', () => {
      editorRender(<ShowAnswerCard {...props} />, { initialState });
      expect(screen.getByText('Show answer')).toBeInTheDocument();
    });

    test('calls useAnswerSettings when initialized', () => {
      jest.spyOn(hooks, 'useAnswerSettings');
      editorRender(<ShowAnswerCard {...props} />, { initialState });
      expect(hooks.useAnswerSettings).toHaveBeenCalledWith(showAnswer, props.updateSettings);
    });
  });
});
