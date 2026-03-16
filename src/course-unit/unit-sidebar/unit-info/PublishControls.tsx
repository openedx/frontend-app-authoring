import { useSelector } from 'react-redux';
import { Icon, Stack, useToggle } from '@openedx/paragon';
import { InfoOutline as InfoOutlineIcon, Person } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ModalNotification from '@src/generic/modal-notification';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { getCourseUnitData } from '@src/course-unit/data/selectors';
import { messageTypes, PUBLISH_TYPES } from '@src/course-unit/constants';
import { SidebarFooter, SidebarHeader } from '@src/course-unit/legacy-sidebar/components';
import useCourseUnitData from '@src/course-unit/legacy-sidebar/hooks';
import ReleaseInfoComponent from '@src/course-unit/legacy-sidebar/components/ReleaseInfoComponent';
import messages from './messages';
import UnitVisibilityInfo from './UnitVisibilityInfo';
import { useConfigureUnitWithPageUpdates } from '@src/course-unit/data/apiHooks';

interface PublishControlsProps {
  blockId?: string,
  hideCopyButton?: boolean,
}

const PublishControls = ({
  blockId,
  hideCopyButton = false,
}: PublishControlsProps) => {
  const unitData = useSelector(getCourseUnitData);
  const {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
    publishCardClass,
  } = useCourseUnitData(unitData);
  const intl = useIntl();
  const { sendMessageToIframe } = useIframe();

  const [isDiscardModalOpen, openDiscardModal, closeDiscardModal] = useToggle(false);
  const [isVisibleModalOpen, openVisibleModal, closeVisibleModal] = useToggle(false);

  const {
    editedOn,
    editedBy,
    publishedBy,
    publishedOn,
  } = unitData;

  const publishMutation = useConfigureUnitWithPageUpdates();

  const handleCourseUnitVisibility = () => {
    closeVisibleModal();
    if (blockId) {
      publishMutation.mutate({
        unitId: blockId,
        type: PUBLISH_TYPES.republish,
        isVisibleToStaffOnly: false,
        groupAccess: null,
      });
    }
  };

  const handleCourseUnitDiscardChanges = () => {
    closeDiscardModal();
    if (blockId) {
      publishMutation.mutate(
        {
          unitId: blockId,
          type: PUBLISH_TYPES.discardChanges,
          isVisibleToStaffOnly: false,
          groupAccess: null,
        },
        {
          onSuccess: () => sendMessageToIframe(messageTypes.refreshXBlock, null),
        }
      );
    }
  };

  const handleCourseUnitPublish = () => {
    if (blockId) {
      publishMutation.mutate({
        unitId: blockId,
        type: PUBLISH_TYPES.makePublic,
        isVisibleToStaffOnly: false,
        groupAccess: null,
      });
    }
  };

  return (
    <div className={`course-unit-publish-controls border p-3 ${publishCardClass}`}>
      <div className="text-primary-700 mb-4">
        <SidebarHeader
          title={title}
          visibilityState={visibilityState}
        />
      </div>
      <Stack gap={4}>
        <Stack gap={2}>
          {editedOn && (
            <div>
              <span className="heading-label">
                <FormattedMessage {...messages.publishInfoDraftSaved} />
              </span>
              <Stack direction="horizontal" gap={1} className="text-primary-700">
                {editedBy && (
                  <>
                    <Icon src={Person} />
                    <span>
                      {editedBy}
                    </span>
                    <span>
                      -
                    </span>
                  </>
                )}
                <span>
                  {editedOn}
                </span>
              </Stack>
            </div>
          )}
          {publishedOn && (
            <div>
              <span className="heading-label">
                <FormattedMessage {...messages.publishLastPublished} />
              </span>
              <Stack direction="horizontal" gap={1} className="text-primary-700">
                {publishedBy && (
                  <>
                    <Icon src={Person} />
                    <span>
                      {publishedBy}
                    </span>
                    <span>
                      -
                    </span>
                  </>
                )}
                <span>
                  {publishedOn}
                </span>
              </Stack>
            </div>
          )}
        </Stack>
        <Stack>
          <span className="heading-label">
            {releaseLabel}
          </span>
          <div className="text-primary-700">
            <ReleaseInfoComponent />
          </div>
        </Stack>
        <div>
          <UnitVisibilityInfo
            openVisibleModal={openVisibleModal}
            visibleToStaffOnly={visibleToStaffOnly}
            userPartitionInfo={unitData.userPartitionInfo}
          />
        </div>
      </Stack>
      <SidebarFooter
        locationId={locationId}
        openDiscardModal={openDiscardModal}
        handlePublishing={handleCourseUnitPublish}
        hideCopyButton={hideCopyButton}
      />
      <ModalNotification
        title={intl.formatMessage(messages.modalDiscardUnitChangesTitle)}
        isOpen={isDiscardModalOpen}
        actionButtonText={intl.formatMessage(messages.modalDiscardUnitChangesActionButtonText)}
        cancelButtonText={intl.formatMessage(messages.modalDiscardUnitChangesCancelButtonText)}
        handleAction={handleCourseUnitDiscardChanges}
        handleCancel={closeDiscardModal}
        message={intl.formatMessage(messages.modalDiscardUnitChangesDescription)}
        icon={InfoOutlineIcon}
      />
      <ModalNotification
        title={intl.formatMessage(messages.modalMakeVisibilityTitle)}
        isOpen={isVisibleModalOpen}
        actionButtonText={intl.formatMessage(messages.modalMakeVisibilityActionButtonText)}
        cancelButtonText={intl.formatMessage(messages.modalMakeVisibilityCancelButtonText)}
        handleAction={handleCourseUnitVisibility}
        handleCancel={closeVisibleModal}
        message={intl.formatMessage(messages.modalMakeVisibilityDescription)}
        icon={InfoOutlineIcon}
      />
    </div>
  );
};

export default PublishControls;
