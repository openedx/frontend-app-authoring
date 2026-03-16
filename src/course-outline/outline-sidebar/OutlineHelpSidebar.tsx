import { Hyperlink } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { SchoolOutline } from '@openedx/paragon/icons';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { useHelpUrls } from '@src/help-urls/hooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { useCourseDetails } from '../data/apiHooks';
import { getFormattedSidebarMessages } from './utils';

const OutlineHelpSideBar = () => {
  const intl = useIntl();
  const {
    visibility: learnMoreVisibilityUrl,
    grading: learnMoreGradingUrl,
    outline: learnMoreOutlineUrl,
  } = useHelpUrls(['visibility', 'grading', 'outline']);
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);

  const sidebarMessages = getFormattedSidebarMessages(
    {
      learnMoreGradingUrl,
      learnMoreOutlineUrl,
      learnMoreVisibilityUrl,
    },
    intl,
  );

  return (
    <>
      <SidebarTitle
        title={courseDetails?.title || ''}
        icon={SchoolOutline}
      />
      <SidebarContent>
        {sidebarMessages.map(({ title, descriptions, link }) => (
          <SidebarSection
            key={title}
            title={title}
          >
            {descriptions.map((description) => (
              <p className="x-small" key={description}>{description}</p>
            ))}
            {!!link?.href && (
              <Hyperlink
                className="x-small"
                destination={link.href}
                target="_blank"
                showLaunchIcon={false}
              >
                {link.text}
              </Hyperlink>
            )}
          </SidebarSection>
        ))}
      </SidebarContent>
    </>
  );
};

export default OutlineHelpSideBar;
