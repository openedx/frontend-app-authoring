import PropTypes from 'prop-types';
import { Icon } from '@edx/paragon';
import { BookOpen as BookOpenIcon } from '@edx/paragon/icons';

import { TYPE_ICONS_MAP, UNIT_ICON_TYPES } from '../../constants';

const UnitIcon = ({ type }) => {
  const icon = TYPE_ICONS_MAP[type] || BookOpenIcon;

  return <Icon src={icon} screenReaderText={type} />;
};

UnitIcon.propTypes = {
  type: PropTypes.oneOf(UNIT_ICON_TYPES).isRequired,
};

export default UnitIcon;
