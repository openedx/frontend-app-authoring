import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs, useToggle } from '@openedx/paragon';
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
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';

interface Props {
  subsectionId: string;
}

const SubsectionInfoSidebar = ({ subsectionId }: Props) => {
  const intl = useIntl();
  const { data: componentData } = useGetBlockTypes(
    [`breadcrumbs.usage_key = "${subsectionId}"`],
  );

  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  return (
    <>
      <LibraryReferenceCard itemId={subsectionId} />
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages.subsectionContentSummaryText)}
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
          <ContentTagsSnippet contentId={subsectionId} />
        </SidebarSection>
      </SidebarContent>
      <ContentTagsDrawerSheet
        id={subsectionId}
        onClose={closeManageTagsDrawer}
        showSheet={isManageTagsDrawerOpen}
      />
    </>
  );
};

export const SubsectionSidebar = ({ subsectionId }: Props) => {
  const intl = useIntl();
  const [tab, setTab] = useState<'info' | 'settings'>('info');
  const { data: subsectionData, isLoading } = useCourseItemData(subsectionId);
  const { selectedContainerState } = useOutlineSidebarContext();
  const { openPublishModal  } = useCourseAuthoringContext();

  const handlePublish = () => {
    if (selectedContainerState?.sectionId && subsectionData?.hasChanges) {
      openPublishModal({
        value: subsectionData,
        sectionId: selectedContainerState?.sectionId,
      })
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <SidebarTitle
        title={subsectionData?.displayName || ''}
        icon={SchoolOutline}
      />
      {subsectionData?.hasChanges && <PublishButon onClick={handlePublish} />}
      <Tabs
        variant="tabs"
        className="my-2 d-flex justify-content-around"
        id="add-content-tabs"
        activeKey={tab}
        onSelect={setTab}
        mountOnEnter
      >
        <Tab eventKey="info" title={intl.formatMessage(messages.infoTabText)}>
          <SubsectionInfoSidebar subsectionId={subsectionId} />
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
}
