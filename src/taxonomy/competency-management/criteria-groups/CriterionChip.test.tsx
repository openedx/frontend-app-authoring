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

  describe('when unavailable', () => {
    const renderUnavailable = (onRemove?: () => void) =>
      render(
        <CriterionChip displayName="Content unavailable" unavailable courseName="Course A" onRemove={onRemove} />,
      );

    it('shows the visible label and a warning icon', () => {
      const { container } = renderUnavailable();
      expect(screen.getByText('Content unavailable')).toBeInTheDocument();
      expect(container.querySelector('.pgn__chip__icon-before')).toBeInTheDocument();
    });

    it('exposes the course name to assistive tech through sr-only text', () => {
      renderUnavailable();
      expect(screen.getByText('Content unavailable in Course A')).toHaveClass('sr-only');
      expect(screen.getByText('Content unavailable')).toHaveAttribute('aria-hidden', 'true');
    });

    it('keeps the remove button', async () => {
      const user = userEvent.setup();
      const onRemove = jest.fn();
      renderUnavailable(onRemove);

      await user.click(screen.getByRole('button', { name: 'Remove the association with Content unavailable' }));

      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  it('shows no warning icon or sr-only text for a resolved chip', () => {
    const { container } = render(<CriterionChip displayName="Subsection 1" courseName="Course A" />);
    expect(container.querySelector('.pgn__chip__icon-before')).not.toBeInTheDocument();
    expect(screen.queryByText(/Content unavailable/)).not.toBeInTheDocument();
  });
});
