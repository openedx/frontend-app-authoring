import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';
import { selectors } from '../../../../../../data/redux';
import { ShowAnswerCardInternal as ShowAnswerCard, mapStateToProps, mapDispatchToProps } from './ShowAnswerCard';
import * as hooks from '../hooks';

jest.mock('../../../../../../data/redux', () => ({
  selectors: {
    app: {
      studioEndpointUrl: jest.fn(state => ({ studioEndpointUrl: state })),
      learningContextId: jest.fn(state => ({ learningContextId: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
    },
  },
  thunkActions: {
    video: jest.fn(),
  },
}));

describe('ShowAnswerCard', () => {
  const showAnswer = {
    on: 'after_attempts',
    afterAttempts: 5,
    updateSettings: jest.fn().mockName('args.updateSettings'),
  };

  const props = {
    showAnswer,
    defaultValue: 'finished',
    updateSettings: jest.fn(),
    // redux
    studioEndpointUrl: 'SoMEeNDpOinT',
    learningContextId: 'sOMEcouRseId',
    isLibrary: false,
  };

  describe('renders', () => {
    beforeEach(() => {
      initializeMocks();
    });

    test('show answer setting card', () => {
      render(<ShowAnswerCard {...props} />);
      expect(screen.getByText('Show answer')).toBeInTheDocument();
    });

    test('calls useAnswerSettings when initialized', () => {
      jest.spyOn(hooks, 'useAnswerSettings');
      render(<ShowAnswerCard {...props} />);
      expect(screen.getByText('Show answer')).toBeInTheDocument();
      expect(hooks.useAnswerSettings).toHaveBeenCalledWith(showAnswer, props.updateSettings);
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('studioEndpointUrl from app.studioEndpointUrl', () => {
      expect(
        mapStateToProps(testState).studioEndpointUrl,
        // @ts-ignore
      ).toEqual(selectors.app.studioEndpointUrl(testState));
    });
    test('learningContextId from app.learningContextId', () => {
      expect(
        mapStateToProps(testState).learningContextId,
        // @ts-ignore
      ).toEqual(selectors.app.learningContextId(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('equal an empty object', () => {
      expect(mapDispatchToProps).toEqual({});
    });
  });
});
