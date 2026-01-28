import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { SchoolOutline, Tag } from '@openedx/paragon/icons';

import { ContentTagsDrawerSheet, ContentTagsSnippet } from '@src/content-tags-drawer';
import { ComponentCountSnippet } from '@src/generic/block-type-utils';
import { useGetBlockTypes } from '@src/search-manager';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { useCourseDetails } from '../data/apiHooks';

import messages from './messages';

export const CourseInfoSidebar = () => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);

  const { data: componentData } = useGetBlockTypes(
    [`context_key = "${courseId}"`],
  );

  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  return (
    <div>
      <SidebarTitle
        title={courseDetails?.title || ''}
        icon={SchoolOutline}
      />
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionSummary)}
          icon={SchoolOutline}
        >
          {componentData && <ComponentCountSnippet componentData={componentData} />}
        </SidebarSection>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionTaxonomy)}
          icon={Tag}
          actions={[
            {
              label: intl.formatMessage(messages.sidebarSectionTaxonomyManageTags),
              onClick: openManageTagsDrawer,
            },
          ]}
        >
          <ContentTagsSnippet contentId={courseId} />
        </SidebarSection>
      </SidebarContent>
      <ContentTagsDrawerSheet
        id={courseId}
        onClose={closeManageTagsDrawer}
        showSheet={isManageTagsDrawerOpen}
      />
    </div>
  );
};
