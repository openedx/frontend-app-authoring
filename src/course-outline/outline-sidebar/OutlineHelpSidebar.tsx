import { Hyperlink } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { HelpSidebar } from '@src/generic/help-sidebar';
import { useHelpUrls } from '@src/help-urls/hooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { getFormattedSidebarMessages } from './utils';

const OutlineHelpSideBar = () => {
  const intl = useIntl();
  const {
    visibility: learnMoreVisibilityUrl,
    grading: learnMoreGradingUrl,
    outline: learnMoreOutlineUrl,
  } = useHelpUrls(['visibility', 'grading', 'outline']);
  const { courseId } = useCourseAuthoringContext();

  const sidebarMessages = getFormattedSidebarMessages(
    {
      learnMoreGradingUrl,
      learnMoreOutlineUrl,
      learnMoreVisibilityUrl,
    },
    intl,
  );

  return (
    <HelpSidebar
      courseId={courseId}
      showOtherSettings={false}
      className="outline-sidebar mt-4"
      data-testid="outline-sidebar"
    >
      {sidebarMessages.map(({ title, descriptions, link }, index) => {
        const isLastSection = index === sidebarMessages.length - 1;

        return (
          <div className="outline-sidebar-section" key={title}>
            <h4 className="help-sidebar-about-title">{title}</h4>
            {descriptions.map((description) => (
              <p className="help-sidebar-about-descriptions" key={description}>{description}</p>
            ))}
            {!!link?.href && (
              <Hyperlink
                className="small"
                destination={link.href}
                target="_blank"
                showLaunchIcon={false}
              >
                {link.text}
              </Hyperlink>
            )}
            {!isLastSection && <hr className="my-3.5" />}
          </div>
        );
      })}
    </HelpSidebar>
  );
};

export default OutlineHelpSideBar;
