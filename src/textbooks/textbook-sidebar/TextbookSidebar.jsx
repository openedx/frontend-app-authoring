import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { Hyperlink } from '@openedx/paragon';
import { HelpSidebar } from '../../generic/help-sidebar';
import messages from './messages';
import { useHelpUrls } from '../../help-urls/hooks';

const TextbookSidebar = ({ courseId }) => {
  const intl = useIntl();
  const { textbooks: textbookUrl } = useHelpUrls(['textbooks']);

  return (
    <HelpSidebar courseId={courseId} className="pt-4">
      <h4 className="help-sidebar-about-title">
        {intl.formatMessage(messages.section_1_title)}
      </h4>
      <p className="help-sidebar-about-descriptions">
        {intl.formatMessage(messages.section_1_descriptions)}
      </p>
      <hr className="my-3.5" />
      <h4 className="help-sidebar-about-title">
        {intl.formatMessage(messages.section_2_title)}
      </h4>
      <p className="help-sidebar-about-descriptions">
        {intl.formatMessage(messages.section_2_descriptions)}
      </p>
      <Hyperlink
        className="small"
        destination={textbookUrl}
        target="_blank"
        showLaunchIcon={false}
      >
        {intl.formatMessage(messages.sectionLink)}
      </Hyperlink>
    </HelpSidebar>
  );
};

TextbookSidebar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default TextbookSidebar;
