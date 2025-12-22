import { useIntl } from '@edx/frontend-platform/i18n';
import { SchoolOutline, Tag } from '@openedx/paragon/icons';

import { ContentTagsSnippet } from '@src/content-tags-drawer';
import { ComponentCountSnippet } from '@src/generic/block-type-utils';
import { useGetBlockTypes } from '@src/search-manager';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { useCourseDetails } from '../data/apiHooks';

import messages from './messages';

export const OutlineInfoSidebar = ({ courseId }: { courseId: string }) => {
  const intl = useIntl();
  const { data: courseDetails } = useCourseDetails(courseId);

  const { data: componentData } = useGetBlockTypes(
    [`context_key = "${courseId}"`],
  );

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
        >
          <ContentTagsSnippet contentId={courseId} />
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};
