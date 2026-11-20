import { initializeMocks, render, screen, userEvent } from '@src/testUtils';
import CriterionChip from './CriterionChip';

describe('<CriterionChip />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the given display name', () => {
    render(<CriterionChip displayName="Subsection 1" />);
    expect(screen.getByText('Subsection 1')).toBeInTheDocument();
  });

  it('renders no remove button without onRemove', () => {
    render(<CriterionChip displayName="Subsection 1" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/Remove the association with/)).not.toBeInTheDocument();
    expect(document.querySelector('svg')).toBeNull();
  });

  it('calls onRemove from the remove button, which is named after the subsection', async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    render(<CriterionChip displayName="Subsection 1" onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Remove the association with Subsection 1' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
