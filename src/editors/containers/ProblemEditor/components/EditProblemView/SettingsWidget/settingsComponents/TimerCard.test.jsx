import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../../testUtils';
import { TimerCardInternal as TimerCard } from './TimerCard';
import { timerCardHooks } from '../hooks';

jest.mock('../hooks', () => ({
  timerCardHooks: jest.fn(),
}));

describe('TimerCard', () => {
  const props = {
    timeBetween: 5,
    updateSettings: jest.fn().mockName('args.updateSettings'),
    intl: { formatMessage },
  };

  const timerCardHooksProps = {
    handleChange: jest.fn().mockName('timerCardHooks.handleChange'),
  };

  timerCardHooks.mockReturnValue(timerCardHooksProps);

  describe('behavior', () => {
    it(' calls timerCardHooks when initialized', () => {
      shallow(<TimerCard {...props} />);
      expect(timerCardHooks).toHaveBeenCalledWith(props.updateSettings);
    });
  });

  describe('snapshot', () => {
    test('snapshot: renders reset true setting card', () => {
      expect(shallow(<TimerCard {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
