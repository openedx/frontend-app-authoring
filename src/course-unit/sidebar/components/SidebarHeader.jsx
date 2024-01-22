import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Icon, Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getCourseUnitData } from '../../data/selectors';
import { getIconVariant } from '../utils';
import messages from '../messages';

const SidebarHeader = ({ title, visibilityState, isDisplayUnitLocation }) => {
  const intl = useIntl();
  const { hasChanges, published } = useSelector(getCourseUnitData);
  const { iconSrc, colorVariant } = getIconVariant(visibilityState, published, hasChanges);

  return (
    <Stack className="course-unit-sidebar-header" direction="horizontal">
      {!isDisplayUnitLocation && (
        <Icon
          className="course-unit-sidebar-header-icon"
          svgAttrs={{ color: colorVariant }}
          src={iconSrc}
        />
      )}
      <h3 className="course-unit-sidebar-header-title m-0">
        {isDisplayUnitLocation ? intl.formatMessage(messages.sidebarHeaderUnitLocationTitle) : title}
      </h3>
    </Stack>
  );
};

SidebarHeader.propTypes = {
  title: PropTypes.string.isRequired,
  visibilityState: PropTypes.string.isRequired,
  isDisplayUnitLocation: PropTypes.bool,
};

SidebarHeader.defaultProps = {
  isDisplayUnitLocation: false,
};

export default SidebarHeader;
