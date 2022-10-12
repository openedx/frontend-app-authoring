/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { ensureConfig } from '@edx/frontend-platform';
import { ActionRow, Dropdown, OverlayTrigger, Tooltip } from '@edx/paragon';
import {
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';

import { StudioHeader } from '@edx/frontend-component-header';
import messages from './HeaderWrapper.messages';


ensureConfig([
  'STUDIO_BASE_URL',
  'LOGOUT_URL',
  'LOGIN_URL',
], 'Header component');

function HeaderWrapper({
  courseId, courseNumber, courseOrg, courseTitle, intl,
}) {
  const { config } = useContext(AppContext);

  const mainMenu = (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="outline-primary" id="library-header-menu-dropdown">
          {intl.formatMessage(messages['header.links.content'])}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/course/${courseId}`}>{intl.formatMessage(messages['header.links.outline'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/course_info/${courseId}`}>{intl.formatMessage(messages['header.links.updates'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/tabs/${courseId}`}>{intl.formatMessage(messages['header.links.pages'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/assets/${courseId}`}>{intl.formatMessage(messages['header.links.filesAndUploads'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/textbooks/${courseId}`}>{intl.formatMessage(messages['header.links.textbooks'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/videos/${courseId}`}>{intl.formatMessage(messages['header.links.videoUploads'])}</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown>
        <Dropdown.Toggle variant="outline-primary" id="library-header-menu-dropdown">
          {intl.formatMessage(messages['header.links.settings'])}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/settings/details/${courseId}`}>{intl.formatMessage(messages['header.links.scheduleAndDetails'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/settings/grading/${courseId}`}>{intl.formatMessage(messages['header.links.grading'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/course_team/${courseId}`}>{intl.formatMessage(messages['header.links.courseTeam'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/group_configurations/${courseId}`}>{intl.formatMessage(messages['header.links.groupConfigurations'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/settings/advanced/${courseId}`}>{intl.formatMessage(messages['header.links.advancedSettings'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/certificates/${courseId}`}>{intl.formatMessage(messages['header.links.certificates'])}</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown>
        <Dropdown.Toggle variant="outline-primary" id="library-header-menu-dropdown">
          {intl.formatMessage(messages['header.links.tools'])}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/import/${courseId}`}>{intl.formatMessage(messages['header.links.import'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/export/${courseId}`}>{intl.formatMessage(messages['header.links.export'])}</Dropdown.Item>
          <Dropdown.Item href={`${config.STUDIO_BASE_URL}/checklists/${courseId}`}>{intl.formatMessage(messages['header.links.checklists'])}</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );

  const courseLockUp = (
    <OverlayTrigger
      placement="bottom"
      overlay={(
        <Tooltip>
          {courseTitle}
        </Tooltip>
      )}
    >
      <a
        className="content-title-block"
        href={`${config.STUDIO_BASE_URL}/course/${courseId}`}
        aria-label={intl.formatMessage(messages['header.label.courseOutline'])}
      >
        <span className="d-block small m-0 w-100 pr-2" data-testid="course-org-number">{courseOrg} {courseNumber}</span>
        <span className="d-block m-0 font-weight-bold w-100 pr-2" data-testid="course-title">{courseTitle}</span>
      </a>
    </OverlayTrigger>
  );

  const actionRowContent = (
    <>
      {courseLockUp}
      <ActionRow.Spacer />
      {mainMenu}
    </>
  )

  return (
    <StudioHeader actionRowContent={actionRowContent}/>
  );
}

HeaderWrapper.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

HeaderWrapper.defaultProps = {
  courseNumber: null,
  courseOrg: null,
};

export default injectIntl(HeaderWrapper);
