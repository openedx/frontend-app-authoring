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

const ImportSidebar = ({ intl, courseId }) => {
  const { importCourse: importLearnMoreUrl } = useHelpUrls(['importCourse']);
  return (
    <HelpSidebar courseId={courseId}>
      <h4 className="help-sidebar-about-title">{intl.formatMessage(messages.title1)}</h4>
      <p className="help-sidebar-about-descriptions">
        {intl.formatMessage(messages.description1, { studioShortName: getConfig().STUDIO_SHORT_NAME })}
      </p>
      <hr />
      <h4 className="help-sidebar-about-title">{intl.formatMessage(messages.importedContent)}</h4>
      <p className="help-sidebar-about-descriptions">{intl.formatMessage(messages.importedContentHeading)}</p>
      <ul className="px-3">
        <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content1)}</li>
        <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content2)}</li>
        <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content3)}</li>
        <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content4)}</li>
        <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content5)}</li>
      </ul>
      <p className="help-sidebar-about-descriptions">{intl.formatMessage(messages.notImportedContent)}</p>
      <ul className="px-3">
        <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content6)}</li>
        <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content7)}</li>
      </ul>
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

ImportSidebar.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(ImportSidebar);
