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
        expandedLabel="Expand"
        collapsedLabel="Collapse"
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
        expandedLabel="Expand"
        collapsedLabel="Collapse"
      />,
    );

    // The accessible name comes from `aria-label`, which this component sets
    // to `expandedLabel` while collapsed (see the prop's own doc comment:
    // it's the label for the "expand" action, offered while collapsed).
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
        expandedLabel="Expand"
        collapsedLabel="Collapse"
      />,
    );

    const button = screen.getByRole('button', { name: 'Collapse' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
