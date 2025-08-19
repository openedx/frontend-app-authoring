import React from "react";
import { useTranslation } from "react-i18next";
import { useCalendarContext } from "../context/CalendarContext";

const FilterDropdown = ({ types }) => {
  const { t } = useTranslation();
  const { filterByType, filteredEvents, nextEvent, prevEvent } = useCalendarContext();

  return (
    <div className="filter-container">
      <select onChange={(e) => filterByType(e.target.value)}>
        <option value="all">{t("all")}</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {t(type) || type}
          </option>
        ))}
      </select>

      {filteredEvents.length > 1 && (
        <div className="filter-nav">
          <button onClick={prevEvent}>{t("prev")}</button>
          <button onClick={nextEvent}>{t("next")}</button>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
