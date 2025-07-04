import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import { GeneralFeedbackCard } from './index';
import * as hooks from './hooks';

describe('GeneralFeedbackCard', () => {
  const props = {
    generalFeedback: 'sOmE_vAlUE',
    updateSettings: jest.fn().mockName('args.updateSettings'),
  };

  const randomizationCardHooksProps = {
    summary: { message: { defaultMessage: 'sUmmary' } },
    handleChange: jest.fn().mockName('randomizationCardHooks.handleChange'),
  };

  beforeEach(() => {
    initializeMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('behavior', () => {
    it('calls generalFeedbackHooks with props when initialized', () => {
      jest.spyOn(hooks, 'generalFeedbackHooks').mockImplementation(() => randomizationCardHooksProps);
      render(<GeneralFeedbackCard {...props} />);
      expect(hooks.generalFeedbackHooks).toHaveBeenCalledWith(props.generalFeedback, props.updateSettings);
    });
  });

  describe('render', () => {
    test('renders general feedback setting card', () => {
      render(<GeneralFeedbackCard {...props} />);
      expect(screen.getByText('General Feedback')).toBeInTheDocument();
      expect(screen.getByText('sOmE_vAlUE')).toBeInTheDocument();
      fireEvent.click(screen.getByText('General Feedback'));
      expect(screen.getByText('Enter General Feedback')).toBeInTheDocument();
    });
  });
});
