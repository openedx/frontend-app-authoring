import PropTypes from 'prop-types';
import { Icon } from '@edx/paragon';
import { EditNote as EditNoteIcon } from '@edx/paragon/icons';

import { COMPONENT_TYPE_ICON_MAP, COMPONENT_ICON_TYPES } from '../constants';

const ComponentIcon = ({ type }) => {
  const icon = COMPONENT_TYPE_ICON_MAP[type] || EditNoteIcon;

  return <Icon src={icon} screenReaderText={type} />;
};

ComponentIcon.propTypes = {
  type: PropTypes.oneOf(Object.values(COMPONENT_ICON_TYPES)).isRequired,
};

export default ComponentIcon;
