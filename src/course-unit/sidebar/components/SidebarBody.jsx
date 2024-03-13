import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Card, Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getCourseUnitData } from '../../data/selectors';
import { getPublishInfo } from '../utils';
import messages from '../messages';
import ReleaseInfoComponent from './ReleaseInfoComponent';

const SidebarBody = ({ releaseLabel, displayUnitLocation, locationId }) => {
  const intl = useIntl();
  const {
    editedOn,
    editedBy,
    hasChanges,
    publishedBy,
    publishedOn,
  } = useSelector(getCourseUnitData);

  return (
    <Card.Body className="course-unit-sidebar-date">
      <Stack>
        {displayUnitLocation ? (
          <span>
            <h5 className="course-unit-sidebar-date-stage m-0">
              {intl.formatMessage(messages.unitLocationTitle)}
            </h5>
            <p className="m-0 font-weight-bold">
              {locationId}
            </p>
          </span>
        ) : (
          <>
            <span>
              {getPublishInfo(intl, hasChanges, editedBy, editedOn, publishedBy, publishedOn)}
            </span>
            <span className="mt-3.5">
              <h5 className="course-unit-sidebar-date-stage m-0">
                {releaseLabel}
              </h5>
              <ReleaseInfoComponent />
            </span>
            <p className="mt-3.5 mb-0">
              {intl.formatMessage(messages.sidebarBodyNote)}
            </p>
          </>
        )}
      </Stack>
    </Card.Body>
  );
};

SidebarBody.propTypes = {
  releaseLabel: PropTypes.string.isRequired,
  displayUnitLocation: PropTypes.bool,
  locationId: PropTypes.string,
};

SidebarBody.defaultProps = {
  displayUnitLocation: false,
  locationId: null,
};

export default SidebarBody;
