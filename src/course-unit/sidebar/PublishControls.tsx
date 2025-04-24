import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@openedx/paragon';
import { InfoOutline as InfoOutlineIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import useCourseUnitData from './hooks';
import { useIframe } from '../../generic/hooks/context/hooks';
import { editCourseUnitVisibilityAndData } from '../data/thunk';
import { SidebarBody, SidebarFooter, SidebarHeader } from './components';
import { PUBLISH_TYPES, messageTypes } from '../constants';
import { getCourseUnitData } from '../data/selectors';
import messages from './messages';
import ModalNotification from '../../generic/modal-notification';

interface PublishControlsProps {
  blockId?: string,
}

const PublishControls = ({ blockId }: PublishControlsProps) => {
  const unitData = useSelector(getCourseUnitData);
  const {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
  } = useCourseUnitData(unitData);
  const intl = useIntl();
  const { sendMessageToIframe } = useIframe();

  const [isDiscardModalOpen, openDiscardModal, closeDiscardModal] = useToggle(false);
  const [isVisibleModalOpen, openVisibleModal, closeVisibleModal] = useToggle(false);

  const dispatch = useDispatch();

  const handleCourseUnitVisibility = () => {
    closeVisibleModal();
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, null));
  };

  const handleCourseUnitDiscardChanges = () => {
    closeDiscardModal();
    dispatch(editCourseUnitVisibilityAndData(
      blockId,
      PUBLISH_TYPES.discardChanges,
      null,
      null,
      null,
      () => sendMessageToIframe(messageTypes.refreshXBlock, null),
    ));
  };

  const handleCourseUnitPublish = () => {
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic));
  };

  return (
    <>
      <SidebarHeader
        title={title}
        visibilityState={visibilityState}
      />
      <SidebarBody
        releaseLabel={releaseLabel}
        visibleToStaffOnly={visibleToStaffOnly}
      />
      <SidebarFooter
        locationId={locationId}
        openDiscardModal={openDiscardModal}
        openVisibleModal={openVisibleModal}
        handlePublishing={handleCourseUnitPublish}
        visibleToStaffOnly={visibleToStaffOnly}
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
    </>
  );
};

export default PublishControls;
