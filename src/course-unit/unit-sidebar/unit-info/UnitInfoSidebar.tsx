import { useContext, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Tag } from '@openedx/paragon/icons';
import { ComponentCountSnippet, getItemIcon } from '@src/generic/block-type-utils';
import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { ContentTagsSnippet } from '@src/content-tags-drawer';
import {
  Tab, Tabs, useToggle,
} from '@openedx/paragon';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { getLibraryId } from '@src/generic/key-utils';
import { useClipboard } from '@src/generic/clipboard';
import { ToastContext } from '@src/generic/toast-context';
import { UnlinkModal, useUnlinkDownstream } from '@src/generic/unlink-modal';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import {
  useCourseItemData, useDeleteCourseItem,
} from '@src/course-outline/data/apiHooks';
import { useConfigureUnitWithPageUpdates } from '@src/course-unit/data/apiHooks';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { getCourseUnitData, getCourseVerticalChildren } from '@src/course-unit/data/selectors';
import { messageTypes } from '@src/course-unit/constants';
import { fetchCourseSectionVerticalData } from '@src/course-unit/data/thunk';
import { extractCourseUnitId } from '@src/course-unit/legacy-sidebar/utils';
import { GenericUnitInfoSettings } from '@src/course-unit/unit-sidebar/unit-info/GenericUnitInfoSettings';
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

  const subsectionId = currentItemData?.ancestorInfo?.ancestors?.[0]?.id;
  const sectionId = currentItemData?.ancestorInfo?.ancestors?.[1]?.id;
  const { data: subsection } = useCourseItemData(subsectionId);
  // re-create actions object for customizations
  const actions = { ...currentItemData.actions };
  actions.deletable = actions.deletable && !subsection?.upstreamInfo?.upstreamRef;
  actions.duplicable = actions.duplicable && !subsection?.upstreamInfo?.upstreamRef;

  const handleDeleteSubmit = async () => {
    await deleteCourseItem({
      itemId: currentItemData.id,
      subsectionId,
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
      subsectionId,
      sectionId,
    }, {
      onSuccess: () => {
        closeUnlinkModal();
        dispatch(fetchCourseSectionVerticalData(currentItemData.id, subsectionId));
      },
    });
  };

  useEffect(() => {
    // Set default Tab key
    setCurrentTabKey('details');
  }, []);

  const handleCopyLocation = () => {
    const locationId = extractCourseUnitId(currentItemData.id);
    if (!locationId) {
      return;
    }

    if (navigator.clipboard) {
      // Modern approach: requires HTTPS (secure context)
      void navigator.clipboard.writeText(locationId);
    } else /* istanbul ignore next */ {
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
          actions,
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
