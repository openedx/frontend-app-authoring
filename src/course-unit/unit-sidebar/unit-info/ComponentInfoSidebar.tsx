import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate } from 'react-router-dom';
import { Tag } from '@openedx/paragon/icons';
import { useQueryClient } from '@tanstack/react-query';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { ContentTagsSnippet } from '@src/content-tags-drawer';
import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import type { XBlockData } from '@src/content-tags-drawer/data/types';
import { getItemIcon } from '@src/generic/block-type-utils';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { messageTypes } from '@src/course-unit/constants';
import { LibraryReferenceCard } from '@src/generic/library-reference-card/LibraryReferenceCard';
import { getCourseUnitData } from '@src/course-unit/data/selectors';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { courseOutlineQueryKeys } from '@src/course-outline/data/apiHooks';

import { useUnitSidebarContext } from '../UnitSidebarContext';
import messages from './messages';

/**
 * Sidebar info for components
 */
export const ComponentInfoSidebar = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { sendMessageToIframe } = useIframe();
  const unitData = useSelector(getCourseUnitData);
  const { courseId } = useCourseAuthoringContext();
  const sectionId = unitData?.ancestorInfo?.ancestors?.find(
    (ancestor) => ancestor.category === 'chapter',
  )?.id;

  const {
    selectedComponentId,
    setCurrentPageKey,
  } = useUnitSidebarContext();

  const { data: contentData } = useContentData(selectedComponentId) as { data: XBlockData | undefined };

  // istanbul ignore next
  const handleBack = () => {
    setCurrentPageKey('info', null);
  };

  const handleGoToParent = (containerId: string) => {
    navigate(`/course/${courseId}?show=${encodeURIComponent(containerId)}`);
  };

  // istanbul ignore next
  const handlePostChange = () => {
    sendMessageToIframe(messageTypes.refreshXBlock, null);
    queryClient.invalidateQueries({
      queryKey: courseOutlineQueryKeys.courseItemId(sectionId),
    });
  };

  return (
    <>
      <SidebarTitle
        title={contentData?.displayName || ''}
        icon={getItemIcon(contentData?.category || '')}
        onBackBtnClick={handleBack}
      />
      <LibraryReferenceCard
        itemId={selectedComponentId}
        sectionId={sectionId}
        goToParent={handleGoToParent}
        postChange={handlePostChange}
      />
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionTaxonomies)}
          icon={Tag}
        >
          <ContentTagsSnippet contentId={selectedComponentId || ''} />
        </SidebarSection>
      </SidebarContent>
    </>
  );
};
