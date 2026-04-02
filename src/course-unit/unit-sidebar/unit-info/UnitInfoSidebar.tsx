import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import { ComponentCountSnippet, getItemIcon } from '@src/generic/block-type-utils';
import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { useEffect, useMemo } from 'react';
import { Tag } from '@openedx/paragon/icons';
import { ContentTagsSnippet } from '@src/content-tags-drawer';
import {
  Tab, Tabs,
} from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { getCourseUnitData, getCourseVerticalChildren } from '@src/course-unit/data/selectors';
import { messageTypes } from '@src/course-unit/constants';
import { GenericUnitInfoSettings } from '@src/course-unit/unit-sidebar/unit-info/GenericUnitInfoSettings';
import { useConfigureUnitWithPageUpdates } from '@src/course-unit/data/apiHooks';
import PublishControls from './PublishControls';
import { useUnitSidebarContext } from '../UnitSidebarContext';
import messages from './messages';

/**
 * Component to show unit details: Publish status, Component counts and Content Tags.
 *
 * It's using in the details tab of the unit info sidebar.
 */
const UnitInfoDetails = () => {
  const intl = useIntl();
  const { blockId } = useParams();
  const courseVerticalChildren = useSelector(getCourseVerticalChildren);

  if (blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing blockId.');
  }

  const componentData: Record<string, number> = useMemo(() => (
    // @ts-ignore
    courseVerticalChildren.children.reduce<Record<string, number>>(
      (acc, { blockType }) => {
        acc[blockType] = (acc[blockType] ?? 0) + 1;
        return acc;
      },
      {},
    )
  ), [courseVerticalChildren.children]);

  return (
    <SidebarContent>
      <PublishControls blockId={blockId} hideCopyButton />
      <SidebarSection
        title={intl.formatMessage(messages.sidebarSectionSummary)}
        icon={getItemIcon('unit')}
      >
        {componentData && <ComponentCountSnippet componentData={componentData} />}
      </SidebarSection>
      <SidebarSection
        title={intl.formatMessage(messages.sidebarSectionTaxonomies)}
        icon={Tag}
      >
        <ContentTagsSnippet contentId={blockId} />
      </SidebarSection>
    </SidebarContent>
  );
};

/**
 * Component with forms to edit unit settings.
 *
 * It's using in the settings tab of the unit info sidebar.
 */
export const UnitInfoSettings = () => {
  const { sendMessageToIframe } = useIframe();
  const {
    id,
    visibilityState,
    discussionEnabled,
    userPartitionInfo,
  } = useSelector(getCourseUnitData);

  const updateCallback = () => {
    sendMessageToIframe(messageTypes.refreshXBlock, null);
  };

  return (
    <GenericUnitInfoSettings
      id={id}
      visibilityState={visibilityState}
      discussionEnabled={discussionEnabled}
      userPartitionInfo={userPartitionInfo}
      updateCallback={updateCallback}
      configureHook={useConfigureUnitWithPageUpdates}
    />
  );
};

/**
 * Component that renders the tabs of the info sidebar for units.
 */
export const UnitInfoSidebar = () => {
  const intl = useIntl();
  const currentItemData = useSelector(getCourseUnitData);
  const {
    currentTabKey,
    setCurrentTabKey,
  } = useUnitSidebarContext();

  useEffect(() => {
    // Set default Tab key
    setCurrentTabKey('details');
  }, []);

  return (
    <>
      <SidebarTitle
        title={currentItemData.displayName}
        icon={getItemIcon('unit')}
      />
      <Tabs
        id="unit-info-sidebar-tabs"
        className="my-2 mx-n3.5"
        activeKey={currentTabKey}
        onSelect={setCurrentTabKey}
      >
        <Tab
          eventKey="details"
          title={intl.formatMessage(messages.sidebarInfoDetailsTab)}
        >
          <div className="mt-4">
            <UnitInfoDetails />
          </div>
        </Tab>
        <Tab
          eventKey="settings"
          title={intl.formatMessage(messages.sidebarInfoSettingsTab)}
        >
          <div className="mt-4">
            <UnitInfoSettings />
          </div>
        </Tab>
      </Tabs>
    </>
  );
};
