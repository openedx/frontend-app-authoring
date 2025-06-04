import React from 'react';
import {
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { HelpSidebar } from '../../generic/help-sidebar';
import { useHelpUrls } from '../../help-urls/hooks';
import messages from './messages';

const ExportSidebar = ({ intl, courseId }) => {
  const { exportCourse: exportLearnMoreUrl } = useHelpUrls(['exportCourse']);
  return (
    <PluginSlot
      id="export_sidebar_plugin_slot"
      // pluginProps={{ courseId }}
    >
      <HelpSidebar courseId={courseId}>
        <h4 className="help-sidebar-about-title">{intl.formatMessage(messages.title1)}</h4>
        <p className="help-sidebar-about-descriptions">{intl.formatMessage(messages.description1, { studioShortName: getConfig().STUDIO_SHORT_NAME })}</p>
        <hr />
        <h4 className="help-sidebar-about-title">{intl.formatMessage(messages.exportedContent)}</h4>
        <p className="help-sidebar-about-descriptions">{intl.formatMessage(messages.exportedContentHeading)}</p>
        <ul className="px-3">
          <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content1)}</li>
          <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content2)}</li>
          <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content3)}</li>
          <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content4)}</li>
          <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content5)}</li>
        </ul>
        <p className="help-sidebar-about-descriptions">{intl.formatMessage(messages.notExportedContent)}</p>
        <ul className="px-3">
          <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content6)}</li>
          <li className="help-sidebar-about-descriptions">{intl.formatMessage(messages.content7)}</li>
        </ul>
        <hr />
        <h4 className="help-sidebar-about-title">{intl.formatMessage(messages.openDownloadFile)}</h4>
        <p className="help-sidebar-about-descriptions">{intl.formatMessage(messages.openDownloadFileDescription)}</p>
        <hr />
        <Hyperlink className="small" href={exportLearnMoreUrl} target="_blank" variant="outline-primary">{intl.formatMessage(messages.learnMoreButtonTitle)}</Hyperlink>
      </HelpSidebar>
    </PluginSlot>
  );
};

ExportSidebar.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(ExportSidebar);
