import React from 'react';
import {
  Navbar,
  Nav,
  NavDropdown,
  Button,
} from '@openedx/paragon';
// import useIsMobileSize from '../../../hooks/useIsMobileSize';
// import { MainHeaderProps } from '../../../interfaces/components';
import { MainHeaderProps } from 'titaned-lib';
import UserMenu from '../UserMenu/UserMenu';
import './MainHeader.scss';
import useIsMobileSize from '../hooks/useIsMobileSize';

const MainHeader: React.FC<MainHeaderProps> = ({
  logoUrl,
  menuList,
  loginSignupButtons,
  authenticatedUser = null,
  // config,
  userMenuItems,
  menuAlignment,
}) => {
  const isMobile = useIsMobileSize();

  const alignmentMap: { [key: string]: string } = {
    left: 'justify-content-start',
    center: 'justify-content-center',
    right: 'justify-content-end',
  };

  const alignmentClass = menuAlignment
    ? alignmentMap[menuAlignment.toLowerCase()] || 'justify-content-start'
    : 'justify-content-start';

  return (
    <Navbar expand="lg" className="navbarContainer px-5 py-1" style={{ zIndex: 100 }}>
      <Navbar.Brand href="/">
        <img
          src={logoUrl}
          alt="Logo"
          style={{ width: '5.5rem', height: '5rem' }}
        />
      </Navbar.Brand>

      <div className="d-flex align-items-center gap-2 ms-auto order-lg-3">
        {authenticatedUser === null && loginSignupButtons && (
        <>
          <Button variant="primary">Log In</Button>
          <Button variant="outline-primary">Sign Up</Button>
        </>
        )}

        {authenticatedUser !== null && (
        <UserMenu
          username={authenticatedUser?.username}
          authenticatedUserAvatar={authenticatedUser?.avatar}
          isMobile={isMobile}
          isAdmin={authenticatedUser?.administrator}
          menuItems={userMenuItems}
        />
        )}
      </div>

      {authenticatedUser === null && (
      <Navbar.Toggle aria-controls="main-navbar-nav" />
      )}

      <Navbar.Collapse id="main-navbar-nav" className="justify-content-between">
        <Nav className={`nav-gap gap-3 flex-grow-1 ${alignmentClass}`}>

          {authenticatedUser === null
            && menuList.map((menu, index) => (menu.subMenu ? (
              <NavDropdown title={menu.label} key={index} id={`nav-dropdown-${index}`}>
                {menu.subMenu.map((sub, subIndex) => (
                  <NavDropdown.Item key={subIndex} onClick={() => console.log('Selected submenu:', sub.label)}>
                    {sub.label}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            ) : (
              <Nav.Link key={index} as="span" className="text-uppercase fw-semibold">
                {menu.label}
              </Nav.Link>
            )))}

        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MainHeader;
