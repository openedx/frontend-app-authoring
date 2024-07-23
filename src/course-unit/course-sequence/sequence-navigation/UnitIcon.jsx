import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { BookOpen as BookOpenIcon } from '@openedx/paragon/icons';

import { UNIT_TYPE_ICONS_MAP, UNIT_ICON_TYPES } from '../../../generic/block-type-utils/constants';

const UnitIcon = ({ type }) => {
  const icon = UNIT_TYPE_ICONS_MAP[type] || BookOpenIcon;

  return <Icon src={icon} screenReaderText={type} />;
};

UnitIcon.propTypes = {
  type: PropTypes.oneOf(UNIT_ICON_TYPES).isRequired,
};

export default UnitIcon;
