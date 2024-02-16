import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import UnitButton from './UnitButton';

const SequenceNavigationDropdown = ({ unitId, unitIds }) => {
  const intl = useIntl();

  return (
    <Dropdown className="sequence-navigation-dropdown">
      <Dropdown.Toggle variant="outline-primary" className="w-100">
        {intl.formatMessage(messages.sequenceDropdownTitle, {
          current: unitIds.indexOf(unitId) + 1,
          total: unitIds.length,
        })}
      </Dropdown.Toggle>
      <Dropdown.Menu className="w-100">
        {unitIds.map(buttonUnitId => (
          <Dropdown.Item
            as={UnitButton}
            className="w-100"
            isActive={unitId === buttonUnitId}
            key={buttonUnitId}
            showTitle
            unitId={buttonUnitId}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

SequenceNavigationDropdown.propTypes = {
  unitId: PropTypes.string.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SequenceNavigationDropdown;
