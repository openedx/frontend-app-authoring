import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';
import { ComponentCountSnippet, getItemIcon } from '@src/generic/block-type-utils';
import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { useMemo, useState } from 'react';
import { Tag } from '@openedx/paragon/icons';
import { ContentTagsSnippet } from '@src/content-tags-drawer';
import configureMessages from '@src/generic/configure-modal/messages';
import {
  Button, ButtonGroup, Tab, Tabs,
} from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { AccessEditComponent, DiscussionEditComponent } from '@src/generic/configure-modal/UnitTab';
import { Form, Formik } from 'formik';
import { editCourseUnitVisibilityAndData } from '../data/thunk';
import { messageTypes, PUBLISH_TYPES, UNIT_VISIBILITY_STATES } from '../constants';
import { getCourseUnitData, getCourseVerticalChildren } from '../data/selectors';
import PublishControls from '../legacy-sidebar/PublishControls';
import messages from './messages';

const UnitInfoDetails = () => {
  const intl = useIntl();
  const { blockId } = useParams();
  const courseVerticalChildren = useSelector(getCourseVerticalChildren);

  if (blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing blockId.');
  }

  // @ts-ignore
  const componentData: Record<string, number> = useMemo(() => courseVerticalChildren.children.reduce<Record<string, number>>(
    (acc, { blockType }) => {
      acc[blockType] = (acc[blockType] ?? 0) + 1;
      return acc;
    },
    {},
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

const UnitInfoSettings = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { sendMessageToIframe } = useIframe();
  const {
    id,
    visibilityState,
    discussionEnabled,
    userPartitionInfo,
  } = useSelector(getCourseUnitData);

  const visibleToStaffOnly = visibilityState === UNIT_VISIBILITY_STATES.staffOnly;

  const handleUpdate = async (
    isVisible: boolean,
    groupAccess: Object | null,
    isDiscussionEnabled: boolean,
  ) => {
    await dispatch(editCourseUnitVisibilityAndData(
      id,
      PUBLISH_TYPES.republish,
      isVisible,
      groupAccess,
      isDiscussionEnabled,
      () => sendMessageToIframe(messageTypes.completeManageXBlockAccess, { locator: id }),
      id,
    ));
  };

  const handleSaveGroups = async (data, { resetForm }) => {
    const groupAccess = {};
    if (data.selectedPartitionIndex >= 0) {
      const partitionId = userPartitionInfo.selectablePartitions[data.selectedPartitionIndex].id;
      groupAccess[partitionId] = data.selectedGroups.map(g => parseInt(g, 10));
    }
    await handleUpdate(visibleToStaffOnly, groupAccess, discussionEnabled);
    resetForm({ data });
  };

  const getSelectedGroups = () => {
    if (userPartitionInfo?.selectedPartitionIndex >= 0) {
      return userPartitionInfo?.selectablePartitions[userPartitionInfo?.selectedPartitionIndex]
        ?.groups
        .filter(({ selected }) => selected)
        .map(({ id }) => `${id}`)
        || [];
    }
    return [];
  };

  const initialValues = useMemo(() => (
    {
      selectedPartitionIndex: userPartitionInfo?.selectedPartitionIndex,
      selectedGroups: getSelectedGroups(),
    }
  ), [userPartitionInfo]);

  return (
    <SidebarContent>
      <SidebarSection
        title={intl.formatMessage(messages.sidebarInfoVisibilityTitle)}
      >
        <ButtonGroup toggle>
          <Button
            variant={visibleToStaffOnly ? 'outline-primary' : 'primary'}
            onClick={() => handleUpdate(false, null, discussionEnabled)}
          >
            <FormattedMessage {...messages.sidebarInfoVisibilityStudentLabel} />
          </Button>
          <Button
            variant={visibleToStaffOnly ? 'primary' : 'outline-primary'}
            onClick={() => handleUpdate(true, null, discussionEnabled)}
          >
            <FormattedMessage {...messages.sidebarInfoVisibilityStaffLabel} />
          </Button>
        </ButtonGroup>
      </SidebarSection>
      <SidebarSection
        title={intl.formatMessage(messages.sidebarInfoAccessTitle)}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={handleSaveGroups}
        >
          {({
            values, setFieldValue, dirty,
          }) => (
            <Form>
              <AccessEditComponent
                selectedPartitionIndex={values.selectedPartitionIndex}
                setFieldValue={setFieldValue}
                userPartitionInfo={userPartitionInfo}
                selectedGroups={values.selectedGroups}
              />
              {dirty && (
                <Button className="mt-3" type="submit" variant="primary">
                  Guardar cambios
                </Button>
              )}
            </Form>
          )}
        </Formik>
      </SidebarSection>
      <SidebarSection
        title={intl.formatMessage(configureMessages.discussionEnabledSectionTitle)}
      >
        <DiscussionEditComponent
          discussionEnabled={discussionEnabled}
          handleDiscussionChange={(e) => handleUpdate(visibleToStaffOnly, null, e.target.checked)}
        />
      </SidebarSection>
    </SidebarContent>
  );
};

export const UnitInfoSidebar = () => {
  const intl = useIntl();
  const { blockId } = useParams();
  const currentItemData = useSelector(getCourseUnitData);
  const [tab, setTab] = useState<'details' | 'settings'>('details');

  if (blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing blockId.');
  }

  return (
    <div>
      <SidebarTitle
        title={currentItemData.displayName}
        icon={getItemIcon('unit')}
      />
      <Tabs
        id="unit-info-sidebar-tabs"
        activeKey={tab}
        onSelect={(t) => setTab(t)}
      >
        <Tab eventKey="details" title={intl.formatMessage(messages.sidebarInfoDetailsTab)}>
          <div className="mt-4">
            <UnitInfoDetails />
          </div>
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.sidebarInfoSettingsTab)}>
          <div className="mt-4">
            <UnitInfoSettings />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};
