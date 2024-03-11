import { useSelector } from 'react-redux';
import useCourseUnitData from './hooks';
import { getCourseUnitData } from '../data/selectors';
import { SidebarBody, SidebarFooter, SidebarHeader } from './components';

const LocationInfo = () => {
  const {
    title,
    locationId,
    releaseLabel,
    visibilityState,
    visibleToStaffOnly,
  } = useCourseUnitData(useSelector(getCourseUnitData));

  return (
    <>
      <SidebarHeader
        title={title}
        visibilityState={visibilityState}
        displayUnitLocation
      />
      <SidebarBody
        locationId={locationId}
        releaseLabel={releaseLabel}
        displayUnitLocation
      />
      <SidebarFooter
        locationId={locationId}
        visibleToStaffOnly={visibleToStaffOnly}
        displayUnitLocation
      />
    </>
  );
};

LocationInfo.propTypes = {};

export default LocationInfo;
