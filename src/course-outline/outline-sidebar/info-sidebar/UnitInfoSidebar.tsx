import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Stack, Tab, Tabs,
} from '@openedx/paragon';
import {
  OpenInFull,
} from '@openedx/paragon/icons';

import { getItemIcon } from '@src/generic/block-type-utils';

import { SidebarTitle } from '@src/generic/sidebar';

import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import Loading from '@src/generic/Loading';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import XBlockContainerIframe from '@src/course-unit/xblock-container-iframe';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { Link } from 'react-router-dom';
import { useOutlineSidebarContext } from '../OutlineSidebarContext';
import { PublishButon } from './PublishButon';
import messages from '../messages';
import { InfoSection } from './InfoSection';

interface Props {
  unitId: string;
}

export const UnitSidebar = ({ unitId }: Props) => {
  const intl = useIntl();
  const [tab, setTab] = useState<'preview' | 'info' | 'settings'>('info');
  const { data: unitData, isLoading } = useCourseItemData(unitId);
  const { selectedContainerState, clearSelection } = useOutlineSidebarContext();
  const { openPublishModal, getUnitUrl, courseId } = useCourseAuthoringContext();

  const handlePublish = () => {
    if (unitData?.hasChanges) {
      openPublishModal({
        value: unitData,
        sectionId: selectedContainerState?.sectionId,
        subsectionId: selectedContainerState?.subsectionId,
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <SidebarTitle
        title={unitData?.displayName || ''}
        icon={getItemIcon(unitData?.category || '')}
        onBackBtnClick={clearSelection}
      />
      <Stack direction="horizontal" gap={1} className="mx-2">
        <Button
          variant="outline-primary"
          as={Link}
          to={getUnitUrl(unitId)}
          iconBefore={OpenInFull}
          block={!unitData?.hasChanges}
        >
          {intl.formatMessage(messages.openUnitPage)}
        </Button>
        {unitData?.hasChanges && (
          <PublishButon onClick={handlePublish} />
        )}
      </Stack>
      <Tabs
        variant="tabs"
        className="my-2 mx-n3.5"
        id="add-content-tabs"
        activeKey={tab}
        onSelect={setTab}
        mountOnEnter
      >
        <Tab
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
        </Tab>
        <Tab eventKey="info" title={intl.formatMessage(messages.infoTabText)}>
          <InfoSection itemId={unitId} />
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
};
