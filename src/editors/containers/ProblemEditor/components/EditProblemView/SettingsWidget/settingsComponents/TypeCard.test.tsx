import React from 'react';

import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import { render, screen, initializeMocks } from '@src/testUtils';
import TypeCard from './TypeCard';

describe('TypeCard', () => {
  const props = {
    answers: [],
    blockTitle: 'BLocktiTLE',
    correctAnswerCount: 0,
    problemType: ProblemTypeKeys.TEXTINPUT,
    setBlockTitle: jest.fn().mockName('args.setBlockTitle'),
    updateField: jest.fn().mockName('args.updateField'),
    updateAnswer: jest.fn().mockName('args.updateAnswer'),
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders type setting card', () => {
    render(<TypeCard {...props} />);
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Text input')).toBeInTheDocument();
  });

  test('renders nothing if problemType is advanced', () => {
    const { container } = render(<TypeCard {...props} problemType={ProblemTypeKeys.ADVANCED} />);
    expect(screen.queryByText('Type')).not.toBeInTheDocument();
    expect(container.firstChild?.textContent).toBe('');
  });
});
