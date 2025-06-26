import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import GroupFeedbackCard from './index';
import * as hooks from './hooks';
import messages from './messages';

jest.mock('./hooks', () => ({
  groupFeedbackCardHooks: jest.fn(),
  groupFeedbackRowHooks: jest.fn(),
}));

describe('HintsCard', () => {
  const answers = ['A', 'B', 'C'];
  const groupFeedback1 = {
    id: 1, value: 'groupFeedback1', answers: ['A', 'C'], feedback: 'sOmE FeEDBACK',
  };
  const groupFeedback2 = {
    id: 2, value: '', answers: ['A'], feedback: 'sOmE FeEDBACK oTher FeEdback',
  };
  const groupFeedbacks0 = [];
  const groupFeedbacks1 = [groupFeedback1];
  const groupFeedbacks2 = [groupFeedback1, groupFeedback2];
  const props = {
    groupFeedbacks: groupFeedbacks0,
    updateSettings: jest.fn().mockName('args.updateSettings'),
    answers,
  };

  beforeEach(() => initializeMocks());

  describe('behavior', () => {
    it(' calls groupFeedbacksCardHooks when initialized', () => {
      const groupFeedbacksCardHooksProps = {
        summary: { message: messages.noGroupFeedbackSummary },
        handleAdd: jest.fn().mockName('groupFeedbacksCardHooks.handleAdd'),
      };

      jest.spyOn(hooks, 'groupFeedbackCardHooks').mockReturnValue(groupFeedbacksCardHooksProps);
      render(<GroupFeedbackCard {...props} />);
      expect(hooks.groupFeedbackCardHooks).toHaveBeenCalledWith(groupFeedbacks0, props.updateSettings, answers);
    });
  });

  describe('snapshot', () => {
    test('renders groupFeedbacks setting card no groupFeedbacks', () => {
      const groupFeedbacksCardHooksProps = {
        summary: { message: messages.noGroupFeedbackSummary, values: {} },
        handleAdd: jest.fn().mockName('groupFeedbacksCardHooks.handleAdd'),
      };
      jest.spyOn(hooks, 'groupFeedbackCardHooks').mockReturnValue(groupFeedbacksCardHooksProps);
      render(<GroupFeedbackCard {...props} />);
      expect(screen.getByText('Group Feedback')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    test('renders groupFeedbacks setting card one groupFeedback', () => {
      const groupFeedbacksCardHooksProps = {
        summary: {
          message: messages.groupFeedbackSummary,
          values: { groupFeedback: groupFeedback1.value, count: 1 },
        },
        handleAdd: jest.fn().mockName('groupFeedbacksCardHooks.handleAdd'),
      };
      jest.spyOn(hooks, 'groupFeedbackCardHooks').mockReturnValue(groupFeedbacksCardHooksProps);
      render(<GroupFeedbackCard {...props} groupFeedbacks={groupFeedbacks1} />);
      const feedbackOption = screen.getByText('Group Feedback');
      fireEvent.click(feedbackOption);
      const groupsRendered = screen.queryAllByRole('textbox');
      expect(groupsRendered).toHaveLength(1);
      expect(groupsRendered[0]).toHaveValue('sOmE FeEDBACK');
    });

    test('renders groupFeedbacks setting card multiple groupFeedbacks', () => {
      const groupFeedbacksCardHooksProps = {
        summary: {
          message: messages.groupFeedbackSummary,
          values: { groupFeedback: groupFeedback2.value, count: 2 },
        },
        handleAdd: jest.fn().mockName('groupFeedbacksCardHooks.handleAdd'),
      };
      jest.spyOn(hooks, 'groupFeedbackCardHooks').mockReturnValue(groupFeedbacksCardHooksProps);
      render(<GroupFeedbackCard {...props} groupFeedbacks={groupFeedbacks2} />);
      const feedbackOption = screen.getByText('Group Feedback');
      fireEvent.click(feedbackOption);
      const groupsRendered = screen.queryAllByRole('textbox');
      expect(groupsRendered).toHaveLength(groupFeedbacks2.length);
      groupFeedbacks2.forEach((group, index) => {
        expect(groupsRendered[index]).toHaveValue(group.feedback);
      });
    });
  });
});
