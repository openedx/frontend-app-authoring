import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { SchoolOutline, Tag } from '@openedx/paragon/icons';

import { ContentTagsDrawerSheet, ContentTagsSnippet } from '@src/content-tags-drawer';
import { ComponentCountSnippet } from '@src/generic/block-type-utils';
import { useGetBlockTypes } from '@src/search-manager';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';

import messages from './messages';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import Loading from '@src/generic/Loading';
import { LibraryReferenceCard } from './LibraryReferenceCard';
import { PublishButon } from './PublishButon';

interface Props {
  sectionId: string;
}

export const SectionInfoSidebar = ({ sectionId }: Props) => {
  const intl = useIntl();
  const { data: componentData } = useGetBlockTypes(
    [`breadcrumbs.usage_key = "${sectionId}"`],
  );

  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  return (
    <>
      <SidebarContent>
        <LibraryReferenceCard />
        <SidebarSection
          title={intl.formatMessage(messages.sectionContentSummaryText)}
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
          <ContentTagsSnippet contentId={sectionId} />
        </SidebarSection>
      </SidebarContent>
      <ContentTagsDrawerSheet
        id={sectionId}
        onClose={closeManageTagsDrawer}
        showSheet={isManageTagsDrawerOpen}
      />
    </>
  );
};

export const SectionSidebar = ({ sectionId }: Props) => {
  const { data: sectionData, isLoading } = useCourseItemData(sectionId);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <SidebarTitle
        title={sectionData?.displayName || ''}
        icon={SchoolOutline}
      />
      <PublishButon onClick={() => {}} />
    <SectionInfoSidebar sectionId={sectionId} />
    </>
  );
}
