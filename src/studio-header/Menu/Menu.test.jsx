import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { Menu, MenuTrigger, MenuContent } from './Menu';

jest.mock('react-transition-group', () => ({
  // eslint-disable-next-line react/jsx-no-useless-fragment, react/prop-types
  CSSTransition: ({ children }) => <>{children}</>,
}));

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <Menu>
      <MenuTrigger>Toggle Menu</MenuTrigger>
      <MenuContent>Menu Content</MenuContent>
    </Menu>,
  </IntlProvider>
);

describe('<Menu />', () => {
  it('should render Menu component', () => {
    const { getByText } = render(<RootWrapper />);
    const menuTrigger = getByText(/Toggle Menu/i);
    const menuContent = getByText(/Menu Content/i);
    expect(menuTrigger).toBeInTheDocument();
    expect(menuContent).toBeInTheDocument();
  });
  it('should expand menu on trigger click', () => {
    const { getByText } = render(<RootWrapper />);
    const menuTrigger = getByText(/Toggle Menu/i);
    const menuContent = getByText(/Menu Content/i);
    fireEvent.click(menuTrigger);
    expect(menuContent).toHaveClass('menu-content');
    expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');
  });
  it('should close menu on document click outside the menu', () => {
    const { getByText } = render(<RootWrapper />);
    const menuTrigger = getByText(/Toggle Menu/i);
    const menuContent = getByText(/Menu Content/i);
    fireEvent.click(menuTrigger);
    fireEvent.click(document.body);
    expect(menuContent).toBeInTheDocument();
    expect(menuTrigger).toHaveAttribute('aria-expanded', 'false');
  });
  it('should not close menu on document click inside the menu', () => {
    const { getByText, getByRole } = render(
      <Menu>
        <MenuTrigger>Toggle Menu</MenuTrigger>
        <MenuContent role="menu">
          <button type="button">Menu Item 1</button>
          <button type="button">Menu Item 2</button>
        </MenuContent>
      </Menu>,
    );
    const menuTrigger = getByText(/Toggle Menu/i);
    const menuContent = getByRole('menu');
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText(/Menu Item 1/i));
    expect(menuContent).toBeVisible();
    expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');
  });
  it('should close menu after press Escape keyboard key', () => {
    render(
      <Menu tag="div" className="nav-item">
        <MenuTrigger>Toggle Menu</MenuTrigger>
        <MenuContent role="menu">
          <button type="button">Menu Item 1</button>
          <button type="button">Menu Item 2</button>
        </MenuContent>
      </Menu>,
    );
    const menuTrigger = screen.getByText(/Toggle Menu/i);
    fireEvent.click(menuTrigger);
    fireEvent.keyDown(menuTrigger, { key: 'Escape' });
    expect(menuTrigger).toHaveAttribute('aria-expanded', 'false');
  });
});
