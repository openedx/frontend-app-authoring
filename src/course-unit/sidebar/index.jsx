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
import { TagsSidebarBody } from '../../content-tags-drawer/tags-sidebar';
import TagsSidebarHeader from '../../content-tags-drawer/tags-sidebar/TagsSidebarHeader';
import messages from './messages';

const Sidebar = ({ variant, blockId, ...props }) => {
  const {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
  } = useCourseUnitData(useSelector(getCourseUnitData));
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isDiscardModalOpen, openDiscardModal, closeDiscardModal] = useToggle(false);
  const [isVisibleModalOpen, openVisibleModal, closeVisibleModal] = useToggle(false);

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

  let sidebarHeader;
  let sidebarBody;
  let hideFooter = false;
  let className = '';
  switch (variant) {
  case 'publish':
    sidebarHeader = (
      <SidebarHeader
        title={title}
        visibilityState={visibilityState}
      />
    );
    sidebarBody = (
      <SidebarBody
        releaseLabel={releaseLabel}
      />
    );
    break;
  case 'location':
    sidebarHeader = (
      <SidebarHeader
        title={title}
        visibilityState={visibilityState}
        displayUnitLocation
      />
    );
    sidebarBody = (
      <SidebarBody
        locationId={locationId}
        releaseLabel={releaseLabel}
        displayUnitLocation
      />
    );
    break;
  case 'tags':
    sidebarHeader = (
      <TagsSidebarHeader />
    );
    sidebarBody = (
      <TagsSidebarBody />
    );
    hideFooter = true;
    className = 'tags-sidebar';
    break;
  default:
    break;
  }

  return (
    <Card
      className={classNames('course-unit-sidebar', className, {
        'is-stuff-only': visibleToStaffOnly,
      })}
      {...props}
    >
      { sidebarHeader }
      { sidebarBody }
      { !hideFooter
        && (
          <SidebarFooter
            locationId={locationId}
            openDiscardModal={openDiscardModal}
            openVisibleModal={openVisibleModal}
            displayUnitLocation={variant === 'location'}
            handlePublishing={handleCourseUnitPublish}
            visibleToStaffOnly={visibleToStaffOnly}
          />
        )}
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
    </Card>
  );
};

Sidebar.propTypes = {
  blockId: PropTypes.string,
  variant: PropTypes.string.isRequired,
};

Sidebar.defaultProps = {
  blockId: null,
};

export default Sidebar;
