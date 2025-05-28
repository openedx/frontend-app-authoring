/* eslint-disable react/jsx-no-useless-fragment */
import React, { useState, useEffect, useRef } from 'react';
import {
  Navbar,
  Nav,
  NavDropdown,
  Button,
  SearchField,
  Icon,
  IconButton,
  IconButtonWithTooltip,
  Dropdown,
} from '@openedx/paragon';
// import useIsMobileSize from '../../../hooks/useIsMobileSize';
// import { MainHeaderProps } from '../../../interfaces/components';
import { MainHeaderProps } from 'titaned-lib';
// import useIsMobileSize from '../hooks/useIsMobileSize';
// import UserMenu from '../UserMenu/UserMenu';
// import { useSidebar } from '../../../hooks/useSidebar';
import {
  ExitToApp, HelpCenter, Notifications, Sync, MenuIcon, Search, MoreVert,
} from '@openedx/paragon/icons';
import { useSidebar } from '../hooks/useSidebar';
// import './MainHeader.scss';
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
  const { toggleSidebar, setSidebarCollapsed } = useSidebar();
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('selectedLanguage') || 'EN');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.dir = selectedLanguage === 'AR' ? 'rtl' : 'ltr';
  }, [selectedLanguage]);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (!showMoreMenu) return;

    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

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
    <Navbar expand="lg" className="navbarContainer py-1" style={{ zIndex: 100 }}>
      <div className="d-flex align-items-center">
        <div className="toggle-sidebar-icon">
          <IconButton
            src={MenuIcon}
            iconAs={Icon}
            alt="Toggle Sidebar"
            onClick={toggleSidebar}
            className="ms-2 ml-2"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
        <Navbar.Brand href="/" className="navbar-brand">
          <img
            src={logoUrl}
            alt="Logo"
          />
        </Navbar.Brand>
      </div>

      {authenticatedUser !== null && (
        <>
          {isMobile ? (
            <div className="d-flex justify-content-between align-items-center ml-auto">
              <div className="d-flex align-items-center navbar-buttons">
                <IconButton
                  src={Search}
                  iconAs={Icon}
                  alt="Search"
                  onClick={() => setShowSearchModal(true)}
                />
                <div className="ml-2 usermenu-dropdown-mobile">
                  <UserMenu
                    username={authenticatedUser?.username}
                    authenticatedUserAvatar={authenticatedUser?.avatar}
                    isMobile={isMobile}
                    isAdmin={authenticatedUser?.administrator}
                    menuItems={userMenuItems}
                  />
                </div>
                <IconButton
                  src={MoreVert}
                  iconAs={Icon}
                  alt="More"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => setShowMoreMenu(prev => !prev)}
                />
                {showMoreMenu && (
                  <div className="more-menu-dropdown" ref={moreMenuRef}>
                    <div className="more-menu-icons-row">
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
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-start flex-grow-1 ml-4">
                <div style={{ width: '30rem' }}>
                  <SearchField
                    onSubmit={handleSearch}
                    placeholder="Search"
                    size="sm"
                    className="w-100 search-field-custom"
                  />
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 ms-auto order-lg-3">
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
              </div>
            </>
          )}
        </>
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

      {/* Fixed search bar overlay */}
      {showSearchModal && (
        <div className="fixed-search-bar">
          <div className="fixed-search-bar-inner">
            <SearchField
              onSubmit={handleSearch}
              placeholder="Search"
              size="lg"
              className="w-100"
              autoFocus
            />
            <button className="close-search-bar" type="button" onClick={() => setShowSearchModal(false)} aria-label="Close Search">
              &times;
            </button>
          </div>
        </div>
      )}
    </Navbar>
  );
};

export default MainHeader;
