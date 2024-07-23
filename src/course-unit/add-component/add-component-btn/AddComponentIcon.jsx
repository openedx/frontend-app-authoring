import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { EditNote as EditNoteIcon } from '@openedx/paragon/icons';

import { COMPONENT_TYPES, COMPONENT_TYPE_ICON_MAP } from '../../../generic/block-type-utils/constants';

const AddComponentIcon = ({ type }) => {
  const icon = COMPONENT_TYPE_ICON_MAP[type] || EditNoteIcon;

  return <Icon src={icon} screenReaderText={type} />;
};

AddComponentIcon.propTypes = {
  type: PropTypes.oneOf(Object.values(COMPONENT_TYPES)).isRequired,
};

export default AddComponentIcon;
