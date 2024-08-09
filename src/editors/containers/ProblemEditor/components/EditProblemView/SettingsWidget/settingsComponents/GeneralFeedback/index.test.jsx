import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../../../testUtils';
import { GeneralFeedbackCard } from './index';
import { generalFeedbackHooks } from './hooks';

jest.mock('./hooks', () => ({
  generalFeedbackHooks: jest.fn(),
}));

describe('RandomizationCard', () => {
  const props = {
    generalFeedback: 'sOmE_vAlUE',
    updateSettings: jest.fn().mockName('args.updateSettings'),
    intl: { formatMessage },
  };

  const randomizationCardHooksProps = {
    summary: { message: { defaultMessage: 'sUmmary' } },
    handleChange: jest.fn().mockName('randomizationCardHooks.handleChange'),
  };

  generalFeedbackHooks.mockReturnValue(randomizationCardHooksProps);

  describe('behavior', () => {
    it(' calls generalFeedbackHooks with props when initialized', () => {
      shallow(<GeneralFeedbackCard {...props} />);
      expect(generalFeedbackHooks).toHaveBeenCalledWith(props.generalFeedback, props.updateSettings);
    });
  });

  describe('snapshot', () => {
    test('snapshot: renders general feedback setting card', () => {
      expect(shallow(<GeneralFeedbackCard {...props} />).snapshot).toMatchSnapshot();
    });
  });
});
