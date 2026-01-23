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
import { useOutlineSidebarContext } from './OutlineSidebarContext';
import XBlockContainerIframe from '@src/course-unit/xblock-container-iframe';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';

interface Props {
  unitId: string;
}

const UnitInfoSidebar = ({ unitId }: Props) => {
  const intl = useIntl();
  const { data: componentData } = useGetBlockTypes(
    [`breadcrumbs.usage_key = "${unitId}"`],
  );

  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  return (
    <>
      <LibraryReferenceCard itemId={unitId} />
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages.unitContentSummaryText)}
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
          <ContentTagsSnippet contentId={unitId} />
        </SidebarSection>
      </SidebarContent>
      <ContentTagsDrawerSheet
        id={unitId}
        onClose={closeManageTagsDrawer}
        showSheet={isManageTagsDrawerOpen}
      />
    </>
  );
};

export const UnitSidebar = ({ unitId }: Props) => {
  const intl = useIntl();
  const [tab, setTab] = useState<'preview'| 'info' | 'settings'>('info');
  const { data: unitData, isLoading } = useCourseItemData(unitId);
  const { selectedContainerState } = useOutlineSidebarContext();
  const { openPublishModal, courseId } = useCourseAuthoringContext();

  const handlePublish = () => {
    if (selectedContainerState?.sectionId && unitData?.hasChanges) {
      openPublishModal({
        value: unitData,
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
        title={unitData?.displayName || ''}
        icon={SchoolOutline}
      />
      {unitData?.hasChanges && <PublishButon onClick={handlePublish} />}
      <Tabs
        variant="tabs"
        className="my-2 d-flex justify-content-around"
        id="add-content-tabs"
        activeKey={tab}
        onSelect={setTab}
        mountOnEnter
      >
        <Tab.Pane
          eventKey="preview"
          title={intl.formatMessage(messages.previewTabText)}
          // To make sure that data is fresh
          unmountOnExit
        >
          <IframeProvider>
            <XBlockContainerIframe
              courseId={courseId}
              blockId={unitId}
              isUnitVerticalType={false}
              unitXBlockActions={{ handleDelete: () => {}, handleDuplicate: () => {}, handleUnlink: () => {} }}
              courseVerticalChildren={[]}
              handleConfigureSubmit={() => {}}
              readonly
            />
          </IframeProvider>
        </Tab.Pane>
        <Tab eventKey="info" title={intl.formatMessage(messages.infoTabText)}>
          <UnitInfoSidebar unitId={unitId} />
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
}
