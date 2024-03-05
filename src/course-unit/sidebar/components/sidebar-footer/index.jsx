import PropTypes from 'prop-types';
import { Card, Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../../messages';
import UnitVisibilityInfo from './UnitVisibilityInfo';
import ActionButtons from './ActionButtons';

const SidebarFooter = ({
  locationId,
  openVisibleModal,
  handlePublishing,
  openDiscardModal,
  visibleToStaffOnly,
  displayUnitLocation,
}) => {
  const intl = useIntl();

  return (
    <Card.Footer className="course-unit-sidebar-footer" orientation="horizontal">
      <Stack className="course-unit-sidebar-visibility">
        {displayUnitLocation ? (
          <small className="course-unit-sidebar-location-description">
            {intl.formatMessage(messages.unitLocationDescription, { id: locationId })}
          </small>
        ) : (
          <>
            <UnitVisibilityInfo
              openVisibleModal={openVisibleModal}
              visibleToStaffOnly={visibleToStaffOnly}
            />
            <ActionButtons
              openDiscardModal={openDiscardModal}
              handlePublishing={handlePublishing}
            />
          </>
        )}
      </Stack>
    </Card.Footer>
  );
};

SidebarFooter.propTypes = {
  locationId: PropTypes.string,
  displayUnitLocation: PropTypes.bool,
  openDiscardModal: PropTypes.func.isRequired,
  openVisibleModal: PropTypes.func.isRequired,
  handlePublishing: PropTypes.func.isRequired,
  visibleToStaffOnly: PropTypes.bool.isRequired,
};

SidebarFooter.defaultProps = {
  displayUnitLocation: false,
  locationId: null,
};

export default SidebarFooter;
