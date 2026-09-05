import { Fragment } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

import { HelpSidebar } from '@src/generic/help-sidebar';
import { useHelpUrls } from '@src/help-urls/hooks';
import { getSidebarData } from './utils';
import messages from './messages';

interface GroupConfigurationSidebarProps {
  courseId: string;
  shouldShowExperimentGroups: boolean;
  shouldShowContentGroup: boolean;
  shouldShowEnrollmentTrackGroup: boolean;
  readOnly?: boolean;
}

const GroupConfigurationSidebar = ({
  courseId,
  shouldShowExperimentGroups,
  shouldShowContentGroup,
  shouldShowEnrollmentTrackGroup,
  readOnly = false,
}: GroupConfigurationSidebarProps) => {
  const intl = useIntl();
  const urls = useHelpUrls(['groupConfigurations', 'enrollmentTracks', 'contentGroups']);
  const sidebarData = getSidebarData({
    intl,
    shouldShowExperimentGroups,
    shouldShowContentGroup,
    shouldShowEnrollmentTrackGroup,
    readOnly,
  });

  return (
    <HelpSidebar
      courseId={courseId}
      showOtherSettings
      className="mt-4"
    >
      {sidebarData
        .map(({ title, paragraphs, urlKey }, idx) => (
          <Fragment key={title}>
            <h4 className="help-sidebar-about-title">
              {title}
            </h4>
            {paragraphs.map(({ id, content }) => (
              <p key={id} className="help-sidebar-about-descriptions">
                {content}
              </p>
            ))}
            <Hyperlink
              target="_blank"
              showLaunchIcon={false}
              destination={urls[urlKey]}
              className="mt-2 mb-3.5 sidebar-link"
            >
              {intl.formatMessage(messages.learnMoreBtn)}
            </Hyperlink>
            {idx !== sidebarData.length - 1 && <hr />}
          </Fragment>
        ))}
    </HelpSidebar>
  );
};

export default GroupConfigurationSidebar;
