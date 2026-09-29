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
      // A selectable row's own keydown handler must not see this keypress,
      // or it would treat the button toggle as a row selection too.
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
