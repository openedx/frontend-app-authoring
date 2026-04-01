import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import OptionalExpandLink from './OptionalExpandLink';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

const createMockRow = ({ canExpand = true, isExpanded = false, toggleHandler = jest.fn() } = {}) =>
  ({
    getCanExpand: () => canExpand,
    getIsExpanded: () => isExpanded,
    getToggleExpandedHandler: () => toggleHandler,
  }) as any;

describe('OptionalExpandLink', () => {
  it('hides expand button when row cannot expand', () => {
    render(<OptionalExpandLink row={createMockRow({ canExpand: false })} />, { wrapper });
    const button = screen.getByRole('button', { hidden: true });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders show subtags control and toggles for collapsed row', () => {
    const toggleHandler = jest.fn();
    const row = createMockRow({ canExpand: true, isExpanded: false, toggleHandler });

    render(<OptionalExpandLink row={row} />, { wrapper });
    const button = screen.getByRole('button', { name: 'Show Subtags' });

    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(toggleHandler).toHaveBeenCalled();
  });

  it('renders hide subtags control for expanded row', () => {
    const row = createMockRow({ canExpand: true, isExpanded: true });

    render(<OptionalExpandLink row={row} />, { wrapper });
    const button = screen.getByRole('button', { name: 'Hide Subtags' });

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
