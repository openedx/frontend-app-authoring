import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate, useParams } from 'react-router-dom';
import { ComponentCountSnippet, getItemIcon } from '@src/generic/block-type-utils';
import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { useContext, useEffect, useMemo } from 'react';
import { Tag } from '@openedx/paragon/icons';
import { ContentTagsSnippet } from '@src/content-tags-drawer';
import configureMessages from '@src/generic/configure-modal/messages';
import {
  Button, ButtonGroup, Tab, Tabs,
} from '@openedx/paragon';
import { useToggle } from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { AccessEditComponent, DiscussionEditComponent } from '@src/generic/configure-modal/UnitTab';
import { Form, Formik } from 'formik';
import { getCourseUnitData, getCourseVerticalChildren } from '@src/course-unit/data/selectors';
import { messageTypes, PUBLISH_TYPES, UNIT_VISIBILITY_STATES } from '@src/course-unit/constants';
import { editCourseUnitVisibilityAndData, fetchCourseSectionVerticalData, fetchCourseVerticalChildrenData } from '@src/course-unit/data/thunk';
import PublishControls from './PublishControls';
import { useUnitSidebarContext } from '../UnitSidebarContext';
import messages from './messages';
import { getLibraryId } from '@src/generic/key-utils';
import { useClipboard } from '@src/generic/clipboard';
import { ToastContext } from '@src/generic/toast-context';
import { UnlinkModal } from '@src/generic/unlink-modal';
import { useUnlinkDownstream } from '@src/generic/unlink-modal/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useQueryClient } from '@tanstack/react-query';
import { courseOutlineQueryKeys, useDeleteCourseItem } from '@src/course-outline/data/apiHooks';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';

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
    groupAccess: Record<string, any> | null,
    isDiscussionEnabled: boolean,
  ) => {
    // oxlint-disable-next-line @typescript-eslint/await-thenable - this dispatch() IS returning a promise.
    await dispatch(editCourseUnitVisibilityAndData(
      id,
      PUBLISH_TYPES.republish,
      isVisible,
      groupAccess,
      isDiscussionEnabled,
      () => sendMessageToIframe(messageTypes.refreshXBlock, null),
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
    resetForm({ values: data });
  };

  /* istanbul ignore next */
  const getSelectedGroups = () => {
    if (userPartitionInfo?.selectedPartitionIndex >= 0) {
      return userPartitionInfo?.selectablePartitions[userPartitionInfo?.selectedPartitionIndex]
        ?.groups
        .filter(({ selected }) => selected)
        // eslint-disable-next-line @typescript-eslint/no-shadow
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
                  <FormattedMessage {...messages.visibilitySaveGroupsButton} />
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

/**
 * Component that renders the tabs of the info sidebar for units.
 */
export const UnitInfoSidebar = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { copyToClipboard } = useClipboard();
  const currentItemData = useSelector(getCourseUnitData);
  const {
    currentTabKey,
    setCurrentTabKey,
  } = useUnitSidebarContext();
  const { showToast } = useContext(ToastContext);
  const { courseId } = useCourseAuthoringContext();

  const [isUnlinkModalOpen, openUnlinkModal, closeUnlinkModal] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const { mutateAsync: unlinkDownstream } = useUnlinkDownstream();
  const { mutateAsync: deleteCourseItem } = useDeleteCourseItem();
  const queryClient = useQueryClient();

  const sequenceId = currentItemData?.ancestorInfo?.ancestors?.[0]?.id;
  const sectionId = currentItemData?.ancestorInfo?.ancestors?.[1]?.id;

  const handleDeleteSubmit = async () => {
    await deleteCourseItem({
      itemId: currentItemData.id,
      subsectionId: sequenceId,
      sectionId,
    }, {
      onSuccess: () => {
        closeDeleteModal();
        navigate(`/course/${courseId}`);
      },
    });
  };

  const handleUnlinkSubmit = async () => {
    await unlinkDownstream({
      downstreamBlockId: currentItemData.id,
      subsectionId: sequenceId,
      sectionId,
    }, {
      onSuccess: () => {
        closeUnlinkModal();
        queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(currentItemData.id) });
        dispatch(fetchCourseSectionVerticalData(currentItemData.id, sequenceId));
        dispatch(fetchCourseVerticalChildrenData(currentItemData.id, false));
      },
    });
  };

  useEffect(() => {
    // Set default Tab key
    setCurrentTabKey('details');
  }, []);

  const handleCopyLocation = () => {
    // Extract the location ID: the part after "block@" at the end of the usage key
    // e.g. "block-v1:org+course+run+type@vertical+block@abc123" → "abc123"
    const locationId = currentItemData.id.match(/block@(.+)$/)?.[1];
    if (!locationId) {
      return;
    }

    if (navigator.clipboard) {
      // Modern approach: requires HTTPS (secure context)
      void navigator.clipboard.writeText(locationId);
    } else {
      // Fallback for HTTP (non-secure) dev environments
      // Note: execCommand is deprecated but still widely supported as fallback
      const textarea = document.createElement('textarea');
      textarea.value = locationId;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy'); // eslint-disable-line deprecation/deprecation
      document.body.removeChild(textarea);
    }
    showToast(intl.formatMessage(messages.locationCopiedText));
  };

  return (
    <>
      <SidebarTitle
        title={currentItemData.displayName}
        icon={getItemIcon('unit')}
        menuProps={{
          itemId: currentItemData.id,
          index: -1,
          onClickUnlink: openUnlinkModal,
          onClickDelete: openDeleteModal,
          onClickViewLibrary: () => {
            const upstreamRef = currentItemData?.upstreamInfo?.upstreamRef;
            if (upstreamRef) {
              const libId = getLibraryId(upstreamRef);
              navigate(`/library/${libId}/unit/${upstreamRef}`);
            }
          },
          onClickCopy: () => copyToClipboard(currentItemData.id),
          onClickCopyLocation: handleCopyLocation,
        }}
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        onDeleteSubmit={handleDeleteSubmit}
        category="unit"
      />
      <UnlinkModal
        isOpen={isUnlinkModalOpen}
        close={closeUnlinkModal}
        onUnlinkSubmit={handleUnlinkSubmit}
        displayName={currentItemData.displayName}
        category="vertical"
      />
    </>
  );
};
