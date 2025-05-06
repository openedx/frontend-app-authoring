import { ModalPopup, Form } from '@openedx/paragon';
import { LinkOff } from '@openedx/paragon/icons';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CustomIcon from './CustomIcon';
import messages from './messages';
import LockedIcon from './lockedIcon';
import ManualIcon from './manualIcon';

const FilterModal = ({
  isOpen,
  onClose,
  onApply,
  positionRef,
  filterOptions,
  initialFilters,
  activeFilters,
  filterBy,
  add,
  remove,
  set,
}) => {
  const [previousFilters, setPreviousFilters] = useState(activeFilters);
  useEffect(() => {
    if (JSON.stringify(activeFilters) !== JSON.stringify(previousFilters)) {
      set(activeFilters);
      setPreviousFilters(activeFilters);
    }
  }, [activeFilters]);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    const updatedFilters = { ...initialFilters, [value]: checked };
    if (e.target.checked) {
      add(e.target.value);
    } else {
      remove(e.target.value);
    }
    onApply(updatedFilters);
  };

  return (
    <ModalPopup isOpen={isOpen} onClose={onClose} positionRef={positionRef} placement="bottom-start">
      <div className="filter-modal bg-white rounded shadow-sm w-175">
        <Form.Group>
          <Form.CheckboxSet
            name="course-optimizer-filter"
            onChange={handleCheckboxChange}
            value={filterBy}
          >
            {filterOptions.map(({ name, value }) => (
              <Form.Checkbox {...{ value, key: value }}>
                <span style={{ display: 'flex', gap: '90px' }}>
                  {name}
                  { value === 'brokenLinks' && <CustomIcon icon={LinkOff} message1={messages.brokenLabel} message2={messages.brokenInfoTooltip} placement="right-end" /> }
                  { value === 'externalForbiddenLinks' && <CustomIcon icon={ManualIcon} message1={messages.manualLabel} message2={messages.manualInfoTooltip} placement="right-end" /> }
                  { value === 'lockedLinks' && <CustomIcon icon={LockedIcon} message1={messages.lockedLabel} message2={messages.lockedInfoTooltip} placement="right-end" /> }
                </span>
              </Form.Checkbox>
            ))}
          </Form.CheckboxSet>
        </Form.Group>
      </div>
    </ModalPopup>
  );
};

FilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  positionRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
  filterOptions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  initialFilters: PropTypes.shape({
    brokenLinks: PropTypes.bool.isRequired,
    lockedLinks: PropTypes.bool.isRequired,
    externalForbiddenLinks: PropTypes.bool.isRequired,
  }).isRequired,
  activeFilters: PropTypes.arrayOf(PropTypes.string).isRequired,
  filterBy: PropTypes.arrayOf(PropTypes.string).isRequired,
  add: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  set: PropTypes.func.isRequired,
};

export default FilterModal;
