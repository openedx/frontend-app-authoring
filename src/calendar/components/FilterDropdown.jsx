import React from 'react';
import { useCalendarContext } from '../context/CalendarContext';
import NavigationButton from './NavigationButton';
import Dropdown from './Dropdown';
import messages from '../data/messages';

const FilterDropdown = ({ types }) => {
  const { filterByType, filteredEvents, nextEvent, prevEvent } = useCalendarContext();

  const filterOptions = [
    { value: 'all', messageId: 'all' },
    ...types.map((type) => ({ value: type, label: type })),
  ];

  return (
    <div className="filter-container">
      <Dropdown
        options={filterOptions}
        onChange={filterByType}
      />
      {filteredEvents.length > 1 && (
        <div className="filter-nav">
          <NavigationButton type="prev" onClick={prevEvent} />
          <NavigationButton type="next" onClick={nextEvent} />
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;