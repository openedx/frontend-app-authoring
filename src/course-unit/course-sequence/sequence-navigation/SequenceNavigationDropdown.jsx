import PropTypes from 'prop-types';
import { Button, Dropdown } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Plus as PlusIcon, ContentPasteGo as ContentPasteGoIcon } from '@openedx/paragon/icons/';

import messages from '../messages';
import UnitButton from './UnitButton';

const SequenceNavigationDropdown = ({
  unitId,
  unitIds,
  handleAddNewSequenceUnit,
  handlePasteNewSequenceUnit,
  showPasteUnit,
}) => {
  const intl = useIntl();

  return (
    <Dropdown className="sequence-navigation-dropdown">
      <Dropdown.Toggle id="sequence-navigation-dropdown" variant="outline-primary" className="w-100">
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
        <Button
          as={Dropdown.Item}
          variant="outline-primary"
          iconBefore={PlusIcon}
          onClick={handleAddNewSequenceUnit}
        >
          {intl.formatMessage(messages.newUnitBtnText)}
        </Button>
        {showPasteUnit && (
          <Button
            as={Dropdown.Item}
            variant="outline-primary"
            iconBefore={ContentPasteGoIcon}
            onClick={handlePasteNewSequenceUnit}
          >
            {intl.formatMessage(messages.pasteAsNewUnitLink)}
          </Button>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

SequenceNavigationDropdown.propTypes = {
  unitId: PropTypes.string.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleAddNewSequenceUnit: PropTypes.func.isRequired,
  handlePasteNewSequenceUnit: PropTypes.func.isRequired,
  showPasteUnit: PropTypes.bool.isRequired,
};

export default SequenceNavigationDropdown;
