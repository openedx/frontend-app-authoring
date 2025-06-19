import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import HintsCard from './HintsCard';

jest.mock('./HintRow', () => 'HintRow');

describe('HintsCard', () => {
  const hint1 = { id: '1', value: 'hint-1' };
  const hint2 = { id: '2', value: 'hint-2' };
  const hints0 = [];
  const hints1 = [hint1];
  const hints2 = [hint1, hint2];

  const props = {
    hints: hints0,
    updateSettings: jest.fn().mockName('args.updateSettings'),
    problemType: 'multiplechoiceresponse',
    images: {},
    isLibrary: false,
    learningContextId: 'ID+',
  };

  beforeEach(() => {
    initializeMocks();
  });

  describe('HintsCard', () => {
    test('renders component', () => {
      render(<HintsCard {...props} />);
      expect(screen.getByText('Hints')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add hint' })).toBeInTheDocument();
    });

    test('does not render component when problemType is advanced', () => {
      render(<HintsCard {...props} problemType="advanced" />);
      expect(screen.queryByText('Hints')).not.toBeInTheDocument();
      expect(screen.queryByText('button')).not.toBeInTheDocument();
    });

    test('renders hints setting card one hint', () => {
      render(<HintsCard {...props} hints={hints1} />);
      expect(document.querySelector('hintrow[value="hint-1"]')).toBeInTheDocument();
    });

    test('snapshot: renders hints setting card multiple hints', () => {
      render(<HintsCard {...props} hints={hints2} />);
      expect(document.querySelector('hintrow[value="hint-1"]')).toBeInTheDocument();
      expect(document.querySelector('hintrow[value="hint-2"]')).toBeInTheDocument();
    });
  });
});
