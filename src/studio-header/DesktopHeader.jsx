// This file was copied from edx/frontend-component-header-edx.
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from '@edx/frontend-platform/i18n';

// Local Components
import { Menu, MenuTrigger, MenuContent } from './Menu';
import Avatar from './Avatar';
import { LinkedLogo, Logo } from './Logo';

// Assets
import { CaretIcon } from './Icons';

class DesktopHeader extends React.Component {
  constructor(props) { // eslint-disable-line no-useless-constructor
    super(props);
  }

  renderMainMenu() {
    const { mainMenu } = this.props;

    // Nodes are accepted as a prop
    if (!Array.isArray(mainMenu)) {
      return mainMenu;
    }

    return mainMenu.map((menuItem) => {
      const {
        type,
        href,
        content,
        submenuContent,
      } = menuItem;

      if (type === 'item') {
        return (
          <a key={`${type}-${content}`} className="nav-link" href={href}>{content}</a>
        );
      }

      return (
        <Menu key={`${type}-${content}`} tag="div" className="nav-item" respondToPointerEvents>
          <MenuTrigger tag="a" className="nav-link d-inline-flex align-items-center" href={href}>
            {content} <CaretIcon role="img" aria-hidden focusable="false" />
          </MenuTrigger>
          <MenuContent className="pin-left pin-right shadow py-2">
            {submenuContent}
          </MenuContent>
        </Menu>
      );
    });
  }

  renderUserMenu() {
    const {
      userMenu,
      avatar,
      username,
    } = this.props;

    return (
      <Menu transitionClassName="menu-dropdown" transitionTimeout={250}>
        <MenuTrigger
          tag="button"
          aria-label={`Account menu for ${username}`}
          className="btn btn-light d-inline-flex align-items-center pl-2 pr-3"
        >
          <Avatar size="1.5em" src={avatar} alt="" className="mr-2" />
          {username} <CaretIcon role="img" aria-hidden focusable="false" />
        </MenuTrigger>
        <MenuContent className="mb-0 dropdown-menu show dropdown-menu-right pin-right shadow py-2">
          {userMenu.map(({ type, href, content }) => (
            <a className={`dropdown-${type}`} key={`${type}-${content}`} href={href}>{content}</a>
          ))}
        </MenuContent>
      </Menu>
    );
  }

  render() {
    const {
      logo,
      logoAltText,
      logoDestination,
      courseTitleDestination,
    } = this.props;
    const logoProps = { src: logo, alt: logoAltText, href: logoDestination };

    return (
      <header className="site-header-desktop">
        <div className="container-fluid">
          <div className="nav-container position-relative d-flex align-items-center">
            {logoDestination === null ? <Logo className="logo" src={logo} alt={logoAltText} /> : <LinkedLogo className="logo" {...logoProps} />}
            {/* This lockup HTML was copied from edx/frontend-app-learning/src/course-header/Header.jsx. */}
            <a
              className="course-title-lockup"
              style={{ lineHeight: 1 }}
              href={courseTitleDestination}
              aria-label="Back to course outline in Studio"
            >
              {this.props.courseId}
            </a>
            <nav
              aria-label="Main"
              className="nav main-nav"
            >
              {/* TODO: Create main menu items to populate main navigation. */}
              {/* {this.renderMainMenu()} */}
              <a style={{ paddingLeft: '1rem' }} href={courseTitleDestination}>Back to Studio Course Outline</a>
            </nav>
            <nav
              aria-label="Secondary"
              className="nav secondary-menu-container align-items-center ml-auto"
            >
              {this.renderUserMenu()}
            </nav>
          </div>
        </div>
      </header>
    );
  }
}

DesktopHeader.propTypes = {
  mainMenu: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.array,
  ]),
  userMenu: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['item', 'menu']),
    href: PropTypes.string,
    content: PropTypes.string,
  })),
  logo: PropTypes.string,
  logoAltText: PropTypes.string,
  logoDestination: PropTypes.string,
  courseTitleDestination: PropTypes.string,
  courseId: PropTypes.string,
  avatar: PropTypes.string,
  username: PropTypes.string,
  loggedIn: PropTypes.bool,
};

DesktopHeader.defaultProps = {
  mainMenu: [],
  userMenu: [],
  logo: null,
  logoAltText: null,
  logoDestination: null,
  courseTitleDestination: null,
  courseId: null,
  avatar: null,
  username: null,
  loggedIn: false,
};

export default injectIntl(DesktopHeader);
