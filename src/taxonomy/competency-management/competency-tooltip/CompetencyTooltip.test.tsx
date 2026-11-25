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
        onMouseLeave={tooltip.close}
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

// jsdom treats :focus-visible as :focus, so simulate pointer-initiated focus explicitly.
const mockPointerFocus = () => {
  const originalMatches = Element.prototype.matches;
  jest.spyOn(Element.prototype, 'matches').mockImplementation(function matches(this: Element, selector: string) {
    return selector === ':focus-visible' ? false : originalMatches.call(this, selector);
  });
};

const pressEscape = () => fireEvent.keyUp(document, { key: 'Escape', keyCode: 27 });

describe('<CompetencyTooltip /> with useCompetencyTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    initializeMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const renderHost = (props: HostProps = {}) => {
    render(<Host {...props} />);
    return screen.getByTestId('trigger');
  };

  it('opens on hover only after the show delay, with the name and Competency ID', async () => {
    const trigger = renderHost();

    fireEvent.mouseEnter(trigger);
    advance(299);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    advance(1);
    const tooltip = await screen.findByRole('tooltip');
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

  it('opens immediately on keyboard focus', async () => {
    const trigger = renderHost();

    act(() => trigger.focus());

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('does not open on focus that is not focus-visible, such as a mouse click', () => {
    mockPointerFocus();
    const trigger = renderHost();

    act(() => trigger.focus());
    advance(500);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not open when the trigger is not truncated', () => {
    const trigger = renderHost({ isTruncated: false });

    act(() => trigger.focus());
    fireEvent.mouseEnter(trigger);
    advance(500);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes on mouse leave', async () => {
    const trigger = renderHost();
    fireEvent.mouseEnter(trigger);
    advance(300);
    const tooltip = await screen.findByRole('tooltip');

    fireEvent.mouseLeave(trigger);

    expect(tooltip).not.toHaveClass('show');
  });

  it('closes on blur', async () => {
    const trigger = renderHost();
    act(() => trigger.focus());
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

  it('keeps the tooltip open while the pointer moves onto it, because it renders inside the trigger', async () => {
    const trigger = renderHost();
    fireEvent.mouseEnter(trigger);
    advance(300);
    const tooltip = await screen.findByRole('tooltip');

    // React derives enter/leave from mouseout, so the portaled tooltip counts as inside the trigger.
    fireEvent.mouseOut(trigger, { relatedTarget: tooltip });
    advance(250);
    expect(tooltip).toHaveClass('show');

    fireEvent.mouseOut(tooltip, { relatedTarget: document.body });
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });
});
