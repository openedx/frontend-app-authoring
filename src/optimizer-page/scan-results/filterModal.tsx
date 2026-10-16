import { ModalPopup, Form } from '@openedx/paragon';
import { LinkOff } from '@openedx/paragon/icons';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import CustomIcon from './CustomIcon';
import messages from './messages';
import LockedIcon from './lockedIcon';
import ManualIcon from './manualIcon';
import type { Filters } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  positionRef: HTMLButtonElement | null;
  filterOptions: { name: string; value: string; }[];
  initialFilters: Filters;
  activeFilters: string[];
  filterBy: string[];
  add: (value: string) => void;
  remove: (value: string) => void;
  set: (values: string[]) => void;
}

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
}: FilterModalProps) => {
  const [previousFilters, setPreviousFilters] = useState(activeFilters);
  useEffect(() => {
    if (JSON.stringify(activeFilters) !== JSON.stringify(previousFilters)) {
      set(activeFilters);
      setPreviousFilters(activeFilters);
    }
  }, [activeFilters]);

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    <ModalPopup isOpen={isOpen} onClose={onClose} positionRef={positionRef} placement="bottom-end">
      <div className="filter-modal bg-white rounded shadow-sm w-175">
        <Form.Group>
          <Form.CheckboxSet
            name="course-optimizer-filter"
            onChange={handleCheckboxChange}
            value={filterBy}
          >
            {filterOptions.map(({ name, value }) => (
              <Form.Checkbox key={value} value={value}>
                <span style={{ display: 'flex', gap: '90px' }}>
                  {name}
                  {value === 'brokenLinks' && (
                    <CustomIcon
                      icon={LinkOff}
                      message1={messages.brokenLabel}
                      message2={messages.brokenInfoTooltip}
                      placement="right-end"
                    />
                  )}
                  {value === 'externalForbiddenLinks' && (
                    <CustomIcon
                      icon={ManualIcon}
                      message1={messages.manualLabel}
                      message2={messages.manualInfoTooltip}
                      placement="right-end"
                    />
                  )}
                  {value === 'lockedLinks' && (
                    <CustomIcon
                      icon={LockedIcon}
                      message1={messages.lockedLabel}
                      message2={messages.lockedInfoTooltip}
                      placement="right-end"
                    />
                  )}
                </span>
              </Form.Checkbox>
            ))}
          </Form.CheckboxSet>
        </Form.Group>
      </div>
    </ModalPopup>
  );
};

export default FilterModal;
