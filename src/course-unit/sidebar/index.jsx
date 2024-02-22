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
import { TagsSidebarBody } from '../../content-tags-drawer/tags-sidebar';

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

  let sidebarTitle;
  let sidebarBody;
  let hideFooter = false;
  let hideIcon = false;
  let className = '';
  switch (variant) {
  case 'publish':
    sidebarTitle = title;
    sidebarBody = (
      <SidebarBody
        releaseLabel={releaseLabel}
      />
    );
    break;
  case 'location':
    sidebarTitle = intl.formatMessage(messages.sidebarHeaderUnitLocationTitle);
    sidebarBody = (
      <SidebarBody
        locationId={locationId}
        releaseLabel={releaseLabel}
        isDisplayUnitLocation
      />
    );
    break;
  case 'tags':
    sidebarTitle = intl.formatMessage(messages.tagsSidebarTitle);
    sidebarBody = (
      <TagsSidebarBody />
    );
    hideFooter = true;
    hideIcon = true;
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
      <SidebarHeader
        title={sidebarTitle}
        visibilityState={visibilityState}
        hideIcon={hideIcon}
      />
      { sidebarBody }
      { !hideFooter
        && (
          <SidebarFooter
            locationId={locationId}
            openDiscardModal={openDiscardModal}
            openVisibleModal={openVisibleModal}
            isDisplayUnitLocation={variant === 'location'}
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
