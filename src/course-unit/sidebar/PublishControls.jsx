import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@openedx/paragon';
import { InfoOutline as InfoOutlineIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import useCourseUnitData from './hooks';
import { useIframe } from '../context/hooks';
import { editCourseUnitVisibilityAndData } from '../data/thunk';
import { SidebarBody, SidebarFooter, SidebarHeader } from './components';
import { PUBLISH_TYPES, messageTypes } from '../constants';
import { getCourseUnitData } from '../data/selectors';
import messages from './messages';
import ModalNotification from '../../generic/modal-notification';

const PublishControls = ({ blockId }) => {
  const {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
  } = useCourseUnitData(useSelector(getCourseUnitData));
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
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.discardChanges));
    // TODO: this artificial delay is a temporary solution
    // to ensure the iframe content is properly refreshed.
    setTimeout(() => {
      sendMessageToIframe(messageTypes.refreshXBlock, null);
    }, 1000);
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

PublishControls.propTypes = {
  blockId: PropTypes.string,
};

PublishControls.defaultProps = {
  blockId: null,
};

export default PublishControls;
