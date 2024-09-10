import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../../testUtils';
import { HintsCardInternal as HintsCard } from './HintsCard';
import { hintsCardHooks, hintsRowHooks } from '../hooks';
import messages from '../messages';

jest.mock('../hooks', () => ({
  hintsCardHooks: jest.fn(),
  hintsRowHooks: jest.fn(),
}));

describe('HintsCard', () => {
  const hint1 = { id: 1, value: 'hint1' };
  const hint2 = { id: 2, value: '' };
  const hints0 = [];
  const hints1 = [hint1];
  const hints2 = [hint1, hint2];
  const props = {
    intl: { formatMessage },
    hints: hints0,
    updateSettings: jest.fn().mockName('args.updateSettings'),
  };

  const hintsRowHooksProps = {
    handleChange: jest.fn().mockName('hintsRowHooks.handleChange'),
    handleDelete: jest.fn().mockName('hintsRowHooks.handleDelete'),
    images: {},
    isLibrary: false,
    learningContextId: 'course+org+run',
  };
  hintsRowHooks.mockReturnValue(hintsRowHooksProps);

  describe('behavior', () => {
    it(' calls hintsCardHooks when initialized', () => {
      const hintsCardHooksProps = {
        summary: { message: messages.noHintSummary, values: {} },
        handleAdd: jest.fn().mockName('hintsCardHooks.handleAdd'),
      };

      hintsCardHooks.mockReturnValue(hintsCardHooksProps);
      shallow(<HintsCard {...props} />);
      expect(hintsCardHooks).toHaveBeenCalledWith(hints0, props.updateSettings);
    });
  });

  describe('snapshot', () => {
    test('snapshot: renders hints setting card no hints', () => {
      const hintsCardHooksProps = {
        summary: { message: messages.noHintSummary, values: {} },
        handleAdd: jest.fn().mockName('hintsCardHooks.handleAdd'),
      };

      hintsCardHooks.mockReturnValue(hintsCardHooksProps);
      expect(shallow(<HintsCard {...props} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: renders hints setting card one hint', () => {
      const hintsCardHooksProps = {
        summary: {
          message: messages.hintSummary,
          values: { hint: hint1.value, count: 1 },
        },
        handleAdd: jest.fn().mockName('hintsCardHooks.handleAdd'),
      };

      hintsCardHooks.mockReturnValue(hintsCardHooksProps);
      expect(shallow(<HintsCard {...props} hints={hints1} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: renders hints setting card multiple hints', () => {
      const hintsCardHooksProps = {
        summary: {
          message: messages.hintSummary,
          values: { hint: hint2.value, count: 2 },
        },
        handleAdd: jest.fn().mockName('hintsCardHooks.handleAdd'),
      };

      hintsCardHooks.mockReturnValue(hintsCardHooksProps);
      expect(shallow(<HintsCard {...props} hints={hints2} />).snapshot).toMatchSnapshot();
    });
  });
});
