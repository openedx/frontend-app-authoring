import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { SchoolOutline, Tag } from '@openedx/paragon/icons';
import { ContentTagsDrawerSheet, ContentTagsSnippet } from '@src/content-tags-drawer';
import { invalidateLinksQuery } from '@src/course-libraries/data/apiHooks';
import { courseOutlineQueryKeys, useCourseItemData } from '@src/course-outline/data/apiHooks';
import { fetchCourseSectionQuery } from '@src/course-outline/data/thunk';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { ComponentCountSnippet, getItemIcon } from '@src/generic/block-type-utils';
import { normalizeContainerType } from '@src/generic/key-utils';
import { SidebarContent, SidebarSection } from '@src/generic/sidebar';
import { useGetBlockTypes } from '@src/search-manager';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { LibraryReferenceCard } from '@src/generic/library-reference-card/LibraryReferenceCard';
import messages from '../messages';

interface Props {
  itemId: string;
}

export const InfoSection = ({ itemId }: Props) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: itemData } = useCourseItemData(itemId);
  const { data: componentData } = useGetBlockTypes(
    [`breadcrumbs.usage_key = "${itemId}"`],
  );
  const category = normalizeContainerType(itemData?.category || '');
  const { selectedContainerState, openContainerInfoSidebar } = useOutlineSidebarContext();
  const { courseId } = useCourseAuthoringContext();

  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  // istanbul ignore next
  const handleOnPostChangeSync = useCallback(() => {
    if (selectedContainerState?.sectionId) {
      dispatch(fetchCourseSectionQuery([selectedContainerState.sectionId]));
    }
    if (courseId) {
      invalidateLinksQuery(queryClient, courseId);
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.course(courseId),
      });
    }
  }, [dispatch, selectedContainerState, queryClient, courseId]);

  return (
    <>
      <LibraryReferenceCard
        itemId={itemId}
        sectionId={selectedContainerState?.sectionId}
        postChange={handleOnPostChangeSync}
        goToParent={openContainerInfoSidebar}
      />
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages[`${category}ContentSummaryText`])}
          icon={getItemIcon(itemData?.category || SchoolOutline)}
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
          <ContentTagsSnippet contentId={itemId} />
        </SidebarSection>
      </SidebarContent>
      <ContentTagsDrawerSheet
        id={itemId}
        onClose={closeManageTagsDrawer}
        showSheet={isManageTagsDrawerOpen}
      />
    </>
  );
};
