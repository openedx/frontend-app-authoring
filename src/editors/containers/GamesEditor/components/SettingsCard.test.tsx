import userEvent from '@testing-library/user-event';
import { initializeMocks, render, screen } from '@src/testUtils';
import SettingsCard from './SettingsCard';

describe('SettingsCard', () => {
  beforeEach(() => {
    initializeMocks();
  });

  // Collapsed by default, like ProblemEditor's settings cards: the sidebar
  // reads as a list of current values until the author opens one.
  it('shows the summary by default and the controls once opened', async () => {
    const user = userEvent.setup();
    render(
      <SettingsCard title="Shuffle" summary="On">
        <button type="button">Off</button>
      </SettingsCard>,
    );
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Off' })).not.toBeInTheDocument();

    await user.click(screen.getByText('Shuffle'));
    expect(screen.getByRole('button', { name: 'Off' })).toBeInTheDocument();
    expect(screen.queryByText('On')).not.toBeInTheDocument();
  });
});
