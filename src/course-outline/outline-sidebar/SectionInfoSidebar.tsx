import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs, useToggle } from '@openedx/paragon';
import { SchoolOutline, Tag } from '@openedx/paragon/icons';

import { ContentTagsDrawerSheet, ContentTagsSnippet } from '@src/content-tags-drawer';
import { ComponentCountSnippet, getItemIcon } from '@src/generic/block-type-utils';
import { useGetBlockTypes } from '@src/search-manager';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';

import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import Loading from '@src/generic/Loading';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import messages from './messages';
import { LibraryReferenceCard } from './LibraryReferenceCard';
import { PublishButon } from './PublishButon';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';

interface Props {
  sectionId: string;
}

const SectionInfoSidebar = ({ sectionId }: Props) => {
  const intl = useIntl();
  const { data: componentData } = useGetBlockTypes(
    [`breadcrumbs.usage_key = "${sectionId}"`],
  );

  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  return (
    <>
      <LibraryReferenceCard itemId={sectionId} />
      <SidebarContent>
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
  const intl = useIntl();
  const [tab, setTab] = useState<'info' | 'settings'>('info');
  const { data: sectionData, isLoading } = useCourseItemData(sectionId);
  const { openPublishModal } = useCourseAuthoringContext();
  const { clearSelection } = useOutlineSidebarContext();

  const handlePublish = () => {
    if (sectionData?.hasChanges) {
      openPublishModal({
        value: sectionData,
        sectionId: sectionData.id,
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <SidebarTitle
        title={sectionData?.displayName || ''}
        icon={getItemIcon(sectionData?.category || '')}
        onBackBtnClick={clearSelection}
      />
      {sectionData?.hasChanges && <PublishButon onClick={handlePublish} />}
      <Tabs
        variant="tabs"
        className="my-2 d-flex justify-content-around"
        id="add-content-tabs"
        activeKey={tab}
        onSelect={setTab}
        mountOnEnter
      >
        <Tab eventKey="info" title={intl.formatMessage(messages.infoTabText)}>
          <SectionInfoSidebar sectionId={sectionId} />
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
};
