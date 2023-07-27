import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import HelpSidebar from '../../generic/help-sidebar';
import messages from './messages';

const OutlineSideBar = ({ courseId }) => {
  const intl = useIntl();

  return (
    <div className="outline-sidebar" data-testid="outline-sidebar">
      <HelpSidebar
        intl={intl}
        courseId={courseId}
        showOtherSettings={false}
      >
        <h4 className="help-sidebar-about-title">
          {intl.formatMessage(messages.section_1_title)}
        </h4>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.section_1_about_1)}
        </p>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.section_1_about_2)}
        </p>
      </HelpSidebar>
      <HelpSidebar
        intl={intl}
        courseId={courseId}
        showOtherSettings={false}
      >
        <h4 className="help-sidebar-about-title">
          {intl.formatMessage(messages.section_2_title)}
        </h4>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.section_2_about_1)}
        </p>
        <a className="help-sidebar-link" href="some_href">
          {intl.formatMessage(messages.section_2_link)}
        </a>
      </HelpSidebar>
      <HelpSidebar
        intl={intl}
        courseId={courseId}
        showOtherSettings={false}
      >
        <h4 className="help-sidebar-about-title">
          {intl.formatMessage(messages.section_3_title)}
        </h4>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.section_3_about_1)}
        </p>
        <a className="help-sidebar-link" href="some_href">
          {intl.formatMessage(messages.section_3_link)}
        </a>
      </HelpSidebar>
      <HelpSidebar
        intl={intl}
        courseId={courseId}
        showOtherSettings={false}
      >
        <h4 className="help-sidebar-about-title">
          {intl.formatMessage(messages.section_4_title)}
        </h4>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.section_4_about_1)}
        </p>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.section_4_about_2)}
        </p>
        <p className="help-sidebar-about-descriptions">
          {intl.formatMessage(messages.section_4_about_3)}
        </p>
        <a className="help-sidebar-link" href="some_href">
          {intl.formatMessage(messages.section_4_link)}
        </a>
      </HelpSidebar>
    </div>
  );
};

OutlineSideBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default OutlineSideBar;
