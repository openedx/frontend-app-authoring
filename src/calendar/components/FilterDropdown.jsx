import React from "react";
import { useCalendarContext } from "../context/CalendarContext";
import { useIntl } from "@edx/frontend-platform/i18n";

const FilterDropdown = ({ types }) => {
  const intl = useIntl();
  const { filterByType, filteredEvents, nextEvent, prevEvent } = useCalendarContext();

  return (
    <div className="filter-container">
      <select onChange={(e) => filterByType(e.target.value)}>
        <option value="all">{intl.formatMessage({ id: "all", defaultMessage: "All" })}</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {intl.formatMessage({ id: type, defaultMessage: type })}
          </option>
        ))}
      </select>
      {filteredEvents.length > 1 && (
        <div className="filter-nav">
          <button onClick={prevEvent}>{intl.formatMessage({ id: "prev", defaultMessage: "Prev" })}</button>
          <button onClick={nextEvent}>{intl.formatMessage({ id: "next", defaultMessage: "Next" })}</button>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
