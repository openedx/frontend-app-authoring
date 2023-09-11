import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Avatar,
} from '@edx/paragon';
import NavDropdownMenu from './NavDropdownMenu';
import { getUserMenuItems } from './utils';

const UserMenu = ({
  username,
  studioBaseUrl,
  logoutUrl,
  authenticatedUserAvatar,
  isMobile,
  isAdmin,
  // injected
  intl,
}) => {
  const avatar = authenticatedUserAvatar ? (
    <img className="d-block w-100 h-100" src={authenticatedUserAvatar} alt={username} />
  ) : (
    <Avatar size="sm" className="mr-2" alt={username} />
  );
  const title = isMobile ? avatar : <>{avatar}{username}</>;

  return (
    <NavDropdownMenu
      buttonTitle={title}
      id="user-dropdown-menu"
      items={getUserMenuItems({
        studioBaseUrl,
        logoutUrl,
        intl,
        isAdmin,
      })}
    />
  );
};

UserMenu.propTypes = {
  username: PropTypes.string,
  studioBaseUrl: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string.isRequired,
  authenticatedUserAvatar: PropTypes.string,
  isMobile: PropTypes.bool,
  isAdmin: PropTypes.bool,
  // injected
  intl: intlShape.isRequired,
};

UserMenu.defaultProps = {
  isMobile: false,
  isAdmin: false,
  authenticatedUserAvatar: null,
  username: null,
};

export default injectIntl(UserMenu);
