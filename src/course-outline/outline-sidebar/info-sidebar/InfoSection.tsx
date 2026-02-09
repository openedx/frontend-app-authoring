import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { SchoolOutline, Tag } from '@openedx/paragon/icons';
import { ContentTagsDrawerSheet, ContentTagsSnippet } from '@src/content-tags-drawer';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { LibraryReferenceCard } from '@src/course-outline/outline-sidebar/LibraryReferenceCard';
import { ComponentCountSnippet, getItemIcon } from '@src/generic/block-type-utils';
import { normalizeContainerType } from '@src/generic/key-utils';
import { SidebarContent, SidebarSection } from '@src/generic/sidebar';
import { useGetBlockTypes } from '@src/search-manager';
import messages from '../messages';

interface Props {
  itemId: string;
}

export const InfoSection = ({ itemId }: Props) => {
  const intl = useIntl();
  const { data: itemData } = useCourseItemData(itemId);
  const { data: componentData } = useGetBlockTypes(
    [`breadcrumbs.usage_key = "${itemId}"`],
  );
  const category = normalizeContainerType(itemData?.category || '');

  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  return (
    <>
      <LibraryReferenceCard itemId={itemId} />
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
