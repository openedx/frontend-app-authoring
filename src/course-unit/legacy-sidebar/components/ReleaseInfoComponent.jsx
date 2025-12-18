import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getCourseUnitData } from '../../data/selectors';
import { getReleaseInfo } from '../utils';

const ReleaseInfoComponent = () => {
  const intl = useIntl();
  const {
    releaseDate,
    releaseDateFrom,
  } = useSelector(getCourseUnitData);
  const releaseInfo = getReleaseInfo(intl, releaseDate, releaseDateFrom);

  if (releaseInfo.isScheduled) {
    return (
      <span className="course-unit-sidebar-date-and-with">
        <h6 className="course-unit-sidebar-date-timestamp m-0 d-inline">
          {releaseInfo.releaseDate}&nbsp;
        </h6>
        {releaseInfo.sectionNameMessage}
      </span>
    );
  }

  return releaseInfo.message;
};

export default ReleaseInfoComponent;
