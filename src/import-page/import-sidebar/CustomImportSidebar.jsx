import React from 'react';
import {
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { HelpSidebar } from '../../generic/help-sidebar';
import { useHelpUrls } from '../../help-urls/hooks';
import messages from './messages';

const CustomImportSidebar = ({ intl, courseId }) => {
  const { importCourse: importLearnMoreUrl } = useHelpUrls(['importCourse']);
  return (
    <HelpSidebar courseId={courseId}>
      <h4 className="help-sidebar-about-title">{intl.formatMessage(messages.title1)}</h4>
      <p className="help-sidebar-about-descriptions">
        {intl.formatMessage(messages.description1, { studioShortName: getConfig().STUDIO_SHORT_NAME })}
      </p>
      <hr />
      <h4 className="help-sidebar-about-title">{intl.formatMessage(messages.importedContent)}</h4>
      <div className="help-sidebar-about-descriptions">
        <p>{intl.formatMessage(messages.importedContentHeading)}</p>
        <ul className="px-3">
          <li>{intl.formatMessage(messages.content1)}</li>
          <li>{intl.formatMessage(messages.content2)}</li>
          <li>{intl.formatMessage(messages.content3)}</li>
          <li>{intl.formatMessage(messages.content4)}</li>
          <li>{intl.formatMessage(messages.content5)}</li>
        </ul>
      </div>
      <div className="help-sidebar-about-descriptions">
        <p>{intl.formatMessage(messages.notImportedContent)}</p>
        <ul className="px-3">
          <li>{intl.formatMessage(messages.content6)}</li>
          <li>{intl.formatMessage(messages.content7)}</li>
        </ul>
      </div>
      <hr />
      <h4 className="help-sidebar-about-title">{intl.formatMessage(messages.warningTitle)}</h4>
      <p className="help-sidebar-about-descriptions">{intl.formatMessage(messages.warningDescription)}</p>
      <hr />
      <Hyperlink
        className="small"
        href={importLearnMoreUrl}
        target="_blank"
      >
        {intl.formatMessage(messages.learnMoreButtonTitle)}
      </Hyperlink>
    </HelpSidebar>
  );
};

CustomImportSidebar.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(CustomImportSidebar);
