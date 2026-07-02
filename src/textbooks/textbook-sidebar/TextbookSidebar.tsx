import { useIntl } from '@edx/frontend-platform/i18n';
import { HelpSidebar } from '@src/generic/help-sidebar';
import { useHelpUrls } from '@src/help-urls/hooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { Hyperlink } from '@openedx/paragon';
import messages from './messages';

const TextbookSidebar = () => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
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

export default TextbookSidebar;
