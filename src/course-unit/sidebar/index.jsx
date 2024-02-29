import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Card, useToggle } from '@openedx/paragon';
import { InfoOutline as InfoOutlineIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import ModalNotification from '../../generic/modal-notification';
import { editCourseUnitVisibilityAndData } from '../data/thunk';
import { getCourseUnitData } from '../data/selectors';
import { PUBLISH_TYPES } from '../constants';
import { SidebarBody, SidebarFooter, SidebarHeader } from './components';
import useCourseUnitData from './hooks';
import messages from './messages';

const Sidebar = ({ blockId, isDisplayUnitLocation, ...props }) => {
  const {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
  } = useCourseUnitData(useSelector(getCourseUnitData));
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isOpenDiscardModal, openDiscardModal, closeDiscardModal] = useToggle(false);
  const [isOpenVisibleModal, openVisibleModal, closeVisibleModal] = useToggle(false);

  const handleCourseUnitVisibility = () => {
    closeVisibleModal();
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, null));
  };

  const handleCourseUnitDiscardChanges = () => {
    closeDiscardModal();
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.discardChanges));
  };

  const handleCourseUnitPublish = () => {
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic));
  };

  return (
    <Card
      className={classNames('course-unit-sidebar', {
        'is-stuff-only': visibleToStaffOnly,
      })}
      {...props}
    >
      <SidebarHeader
        title={title}
        visibilityState={visibilityState}
        isDisplayUnitLocation={isDisplayUnitLocation}
      />
      <SidebarBody
        locationId={locationId}
        releaseLabel={releaseLabel}
        isDisplayUnitLocation={isDisplayUnitLocation}
      />
      <SidebarFooter
        locationId={locationId}
        openDiscardModal={openDiscardModal}
        openVisibleModal={openVisibleModal}
        isDisplayUnitLocation={isDisplayUnitLocation}
        handlePublishing={handleCourseUnitPublish}
        visibleToStaffOnly={visibleToStaffOnly}
      />
      <ModalNotification
        title={intl.formatMessage(messages.modalDiscardUnitChangesTitle)}
        isOpen={isOpenDiscardModal}
        actionButtonText={intl.formatMessage(messages.modalDiscardUnitChangesActionButtonText)}
        cancelButtonText={intl.formatMessage(messages.modalDiscardUnitChangesCancelButtonText)}
        handleAction={handleCourseUnitDiscardChanges}
        handleCancel={closeDiscardModal}
        message={intl.formatMessage(messages.modalDiscardUnitChangesDescription)}
        icon={InfoOutlineIcon}
      />
      <ModalNotification
        title={intl.formatMessage(messages.modalMakeVisibilityTitle)}
        isOpen={isOpenVisibleModal}
        actionButtonText={intl.formatMessage(messages.modalMakeVisibilityActionButtonText)}
        cancelButtonText={intl.formatMessage(messages.modalMakeVisibilityCancelButtonText)}
        handleAction={handleCourseUnitVisibility}
        handleCancel={closeVisibleModal}
        message={intl.formatMessage(messages.modalMakeVisibilityDescription)}
        icon={InfoOutlineIcon}
      />
    </Card>
  );
};

Sidebar.propTypes = {
  blockId: PropTypes.string,
  isDisplayUnitLocation: PropTypes.bool,
};

Sidebar.defaultProps = {
  blockId: null,
  isDisplayUnitLocation: false,
};

export default Sidebar;
