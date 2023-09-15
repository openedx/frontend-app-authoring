// This file was copied from edx/frontend-component-header-edx.
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useToggle, ModalPopup } from '@edx/paragon';
import HeaderBody from './HeaderBody';
import MobileMenu from './MobileMenu';

const MobileHeader = ({
  studioBaseUrl,
  courseId,
  ...props
}) => {
  const [isOpen, , close, toggle] = useToggle(false);
  const [target, setTarget] = useState(null);

  return (
    <>
      <HeaderBody
        {...props}
        isMobile
        setModalPopupTarget={setTarget}
        toggleModalPopup={toggle}
        isModalPopupOpen={isOpen}
      />
      <ModalPopup
        hasArrow
        placement="bottom"
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
        onEscapeKey={close}
        className="mobile-menu-container"
      >
        <MobileMenu {...{ studioBaseUrl, courseId }} />
      </ModalPopup>
    </>
  );
};

MobileHeader.propTypes = {
  studioBaseUrl: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string.isRequired,
  setModalPopupTarget: PropTypes.func.isRequired,
  toggleModalPopup: PropTypes.func.isRequired,
  isModalPopupOpen: PropTypes.bool.isRequired,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string,
  logo: PropTypes.string,
  logoAltText: PropTypes.string,
  courseId: PropTypes.string,
  authenticatedUserAvatar: PropTypes.string,
  username: PropTypes.string,
  isAdmin: PropTypes.bool,
};

MobileHeader.defaultProps = {
  logo: null,
  logoAltText: null,
  courseId: null,
  courseNumber: null,
  courseOrg: null,
  courseTitle: null,
  authenticatedUserAvatar: null,
  username: null,
  isAdmin: false,
};

export default MobileHeader;
