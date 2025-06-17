import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';
import TimerCard from './TimerCard';

describe('TimerCard', () => {
  const updateSettingsMock = jest.fn().mockName('updateSettingsMock');
  const props = {
    timeBetween: 5,
    updateSettings: updateSettingsMock,
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders component', () => {
    render(<TimerCard {...props} />);
    expect(screen.getByText('Time between attempts')).toBeInTheDocument();
    expect(screen.getByText(`${props.timeBetween} seconds`)).toBeInTheDocument();
  });
});
