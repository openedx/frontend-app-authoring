import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Nav,
  NavDropdown,
  Button,
  SearchField,
  Icon,
  IconButtonWithTooltip,
  Dropdown,
} from '@openedx/paragon';
// import useIsMobileSize from '../../../hooks/useIsMobileSize';
// import { MainHeaderProps } from '../../../interfaces/components';
import { MainHeaderProps } from 'titaned-lib';
import {
  ExitToApp, HelpCenter, Notifications, Sync,
} from '@openedx/paragon/icons';
import useIsMobileSize from '../hooks/useIsMobileSize';
import UserMenu from '../UserMenu/UserMenu';
import './MainHeader.scss';

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
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('selectedLanguage') || 'EN');

  useEffect(() => {
    document.body.dir = selectedLanguage === 'AR' ? 'rtl' : 'ltr';
  }, [selectedLanguage]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
  };

  const alignmentMap: { [key: string]: string } = {
    left: 'justify-content-start',
    center: 'justify-content-center',
    right: 'justify-content-end',
  };

  const alignmentClass = menuAlignment
    ? alignmentMap[menuAlignment.toLowerCase()] || 'justify-content-start'
    : 'justify-content-start';

  const handleSearch = (value: string) => {
    // Implement search functionality here
    console.log('Search query:', value);
  };

  return (
    <Navbar expand="lg" className="navbarContainer px-5 py-1" style={{ zIndex: 100 }}>
      <Navbar.Brand href="/" className="navbar-brand">
        <img
          src={logoUrl}
          alt="Logo"
          // style={{ width: '5.5rem', height: '5rem' }}
        />
      </Navbar.Brand>

      {authenticatedUser !== null && (
        <div className="d-flex align-items-center justify-content-center flex-grow-1 ml-2">
          <div style={{ width: '20rem' }}>
            <SearchField
              onSubmit={handleSearch}
              placeholder="Search"
              size="sm"
              className="w-100 search-field-custom"
            />
          </div>
        </div>
      )}

      <div className="d-flex align-items-center gap-2 ms-auto order-lg-3">
        {authenticatedUser === null && loginSignupButtons && (
        <>
          <Button variant="primary">Log In</Button>
          <Button variant="outline-primary">Sign Up</Button>
        </>
        )}

        {authenticatedUser !== null && (
          <>
            <div className="icon-curved-square">
              <IconButtonWithTooltip src={Sync} iconAs={Icon} alt="Sync" tooltipPlacement="bottom" tooltipContent="Re-Sync" />
            </div>
            <div className="icon-curved-square">
              <IconButtonWithTooltip src={ExitToApp} iconAs={Icon} alt="Sync" tooltipPlacement="bottom" tooltipContent="Switch to User Mode" />
            </div>
            <div className="icon-curved-square">
              <IconButtonWithTooltip src={HelpCenter} iconAs={Icon} alt="Help" tooltipPlacement="bottom" tooltipContent="Help" />
            </div>
            <div className="icon-curved-square">
              <IconButtonWithTooltip src={Notifications} iconAs={Icon} alt="Notifications" tooltipPlacement="bottom" tooltipContent="Notifications" />
            </div>

            <Dropdown className="language-dropdown">
              <Dropdown.Toggle variant="tertiary" id="language-dropdown">
                {selectedLanguage}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleLanguageChange('EN')}>EN</Dropdown.Item>
                <Dropdown.Item onClick={() => handleLanguageChange('AR')}>AR</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <div className="usermenu-dropdown">
              <UserMenu
                username={authenticatedUser?.username}
                authenticatedUserAvatar={authenticatedUser?.avatar}
                isMobile={isMobile}
                isAdmin={authenticatedUser?.administrator}
                menuItems={userMenuItems}
              />
            </div>
          </>
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
