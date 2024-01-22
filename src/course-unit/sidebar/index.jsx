import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { Card } from '@openedx/paragon';

import { getCourseUnitData } from '../data/selectors';
import { SidebarBody, SidebarFooter, SidebarHeader } from './components';
import useCourseUnitData from './hooks';

const Sidebar = ({ isDisplayUnitLocation }) => {
  const {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
  } = useCourseUnitData(useSelector(getCourseUnitData));

  return (
    <Card
      className={classNames('course-unit-sidebar', {
        'is-stuff-only': visibleToStaffOnly,
      })}
      data-testid="course-unit-sidebar"
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
        isDisplayUnitLocation={isDisplayUnitLocation}
      />
    </Card>
  );
};

Sidebar.propTypes = {
  isDisplayUnitLocation: PropTypes.bool,
};

Sidebar.defaultProps = {
  isDisplayUnitLocation: false,
};

export default Sidebar;
