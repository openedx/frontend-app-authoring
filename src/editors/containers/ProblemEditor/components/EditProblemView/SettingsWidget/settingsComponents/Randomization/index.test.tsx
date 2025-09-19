import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import { RandomizationCard } from './index';
import * as hooks from './hooks';

describe('RandomizationCard', () => {
  const props = {
    randomization: 'per_student',
    defaultValue: 'always',
    updateSettings: jest.fn().mockName('args.updateSettings'),
  };

  const randomizationCardHooksProps = {
    summary: { message: { id: 'defaultMessage', defaultMessage: 'sUmmary' } },
    handleChange: jest.fn().mockName('randomizationCardHooks.handleChange'),
  };

  jest.spyOn(hooks, 'useRandomizationSettingStatus').mockReturnValue(randomizationCardHooksProps);

  beforeEach(() => {
    initializeMocks();
  });

  describe('behavior', () => {
    it('calls useRandomizationSettingStatus when initialized', () => {
      render(<RandomizationCard {...props} />);
      expect(hooks.useRandomizationSettingStatus).toHaveBeenCalledWith(
        { updateSettings: props.updateSettings, randomization: props.randomization },
      );
    });
  });

  describe('renders', () => {
    test('renders randomization setting card with randomization defined', () => {
      render(<RandomizationCard {...props} />);
      expect(screen.getByText('sUmmary')).toBeInTheDocument();
      expect(screen.getByText('Randomization')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Randomization' }));
      expect(screen.getByRole('combobox')).toHaveValue(props.randomization);
    });

    test('renders randomization setting card with default randomization', () => {
      render(<RandomizationCard {...props} randomization="" />);
      expect(screen.getByText('sUmmary')).toBeInTheDocument();
      expect(screen.getByText('Randomization')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Randomization' }));
      expect(screen.getByRole('combobox')).toHaveValue(props.defaultValue);
    });

    test('renders randomization setting card with randomization null', () => {
      render(<RandomizationCard {...props} randomization="" defaultValue="" />);
      fireEvent.click(screen.getByRole('button', { name: 'Randomization' }));
      expect(screen.getByRole('combobox')).toHaveValue('never');
    });
  });
});
