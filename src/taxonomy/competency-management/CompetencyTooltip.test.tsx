import { useRef } from 'react';

import {
  act,
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import CompetencyTooltip from './CompetencyTooltip';
import { useCompetencyTooltip } from './useCompetencyTooltip';

interface HostProps {
  isTruncated?: boolean;
}

const Host = ({ isTruncated = true }: HostProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const tooltip = useCompetencyTooltip(() => isTruncated);
  return (
    <div>
      <div
        ref={anchorRef}
        tabIndex={0}
        data-testid="trigger"
        onMouseEnter={tooltip.openOnHover}
        onMouseLeave={tooltip.closeSoon}
        onFocus={tooltip.openOnFocus}
        onBlur={tooltip.close}
      >
        Row
        <CompetencyTooltip
          anchorRef={anchorRef}
          name="Full name"
          externalId="EXT-1"
          {...tooltip.tooltipProps}
        />
      </div>
    </div>
  );
};

const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

const pressEscape = () => fireEvent.keyUp(document, { key: 'Escape', keyCode: 27 });

describe('<CompetencyTooltip /> with useCompetencyTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    initializeMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderHost = (props: HostProps = {}) => {
    render(<Host {...props} />);
    return screen.getByTestId('trigger');
  };

  it('opens on hover only after the show delay, with the name and Competency ID', () => {
    const trigger = renderHost();

    fireEvent.mouseEnter(trigger);
    advance(299);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    advance(1);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Full name');
    expect(tooltip).toHaveTextContent('Competency ID: EXT-1');
  });

  it('does not open when the pointer leaves before the show delay', () => {
    const trigger = renderHost();

    fireEvent.mouseEnter(trigger);
    advance(200);
    fireEvent.mouseLeave(trigger);
    advance(500);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens immediately on keyboard focus', () => {
    const trigger = renderHost();

    fireEvent.focus(trigger);

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('does not open when the trigger is not truncated', () => {
    const trigger = renderHost({ isTruncated: false });

    fireEvent.focus(trigger);
    fireEvent.mouseEnter(trigger);
    advance(500);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes on mouse leave', async () => {
    const trigger = renderHost();
    fireEvent.mouseEnter(trigger);
    advance(300);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('closes on blur', async () => {
    const trigger = renderHost();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(trigger);

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('closes on Escape without moving focus', async () => {
    const trigger = renderHost();
    act(() => trigger.focus());
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    pressEscape();

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('closes a hover-opened tooltip on Escape', async () => {
    const trigger = renderHost();
    fireEvent.mouseEnter(trigger);
    advance(300);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    pressEscape();

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('stays open while the pointer moves from the trigger onto the tooltip, and closes on leaving it', async () => {
    const trigger = renderHost();
    fireEvent.mouseEnter(trigger);
    advance(300);
    const tooltip = screen.getByRole('tooltip');

    // React derives enter/leave from mouseout, so the portaled tooltip counts as inside the trigger.
    fireEvent.mouseOut(trigger, { relatedTarget: tooltip });
    // Longer than the hide delay, so a missed cancel would have closed it.
    advance(250);
    expect(tooltip).toHaveClass('show');

    fireEvent.mouseOut(tooltip, { relatedTarget: document.body });
    advance(150);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });
});
