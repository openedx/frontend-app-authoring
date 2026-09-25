import { fireEvent, render, screen } from '@testing-library/react';

import ExpandCollapseIconButton from './ExpandCollapseIconButton';

describe('<ExpandCollapseIconButton />', () => {
  it('renders an invisible, disabled placeholder when canExpand is false, regardless of isExpanded, and ignores clicks', () => {
    const onToggle = jest.fn();
    render(
      <ExpandCollapseIconButton
        canExpand={false}
        isExpanded
        onToggle={onToggle}
        expandLabel="Expand"
        collapseLabel="Collapse"
      />,
    );

    const button = screen.getByRole('button', { hidden: true });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveClass('invisible');

    fireEvent.click(button);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows the expand-action label and aria-expanded="false" while collapsed, and calls onToggle when clicked', () => {
    const onToggle = jest.fn();
    render(
      <ExpandCollapseIconButton
        canExpand
        isExpanded={false}
        onToggle={onToggle}
        expandLabel="Expand"
        collapseLabel="Collapse"
      />,
    );

    // The accessible name comes from `aria-label`, which this component
    // sets to `expandLabel` while collapsed and `collapseLabel` while
    // expanded.
    const button = screen.getByRole('button', { name: 'Expand' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows the collapse-action label and aria-expanded="true" while expanded', () => {
    render(
      <ExpandCollapseIconButton
        canExpand
        isExpanded
        expandLabel="Expand"
        collapseLabel="Collapse"
      />,
    );

    const button = screen.getByRole('button', { name: 'Collapse' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it(
    'stops an Enter/Space keydown from bubbling to a wrapping element, so an enclosing row\'s own key '
      + 'handler never fires for it',
    () => {
      // A caller whose own row is independently clickable/keyboard-activatable
      // (e.g. a selectable competency tree leaf row) relies on this: without
      // it, an Enter/Space press meant only to toggle this button would also
      // reach the row's own keydown handler and could be treated as a
      // selection there.
      const onToggle = jest.fn();
      const onWrapperKeyDown = jest.fn();
      render(
        <div onKeyDown={onWrapperKeyDown}>
          <ExpandCollapseIconButton
            canExpand
            isExpanded={false}
            onToggle={onToggle}
            expandLabel="Expand"
            collapseLabel="Collapse"
          />
        </div>,
      );

      const button = screen.getByRole('button', { name: 'Expand' });
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });

      expect(onWrapperKeyDown).not.toHaveBeenCalled();
    },
  );
});
