import React, { useState, useMemo } from "react";
import { useCalendarContext } from "../context/CalendarContext";
import FilterDropdown from "./FilterDropdown";
import { useIntl } from "@edx/frontend-platform/i18n";

const CalendarHeader = () => {
  const intl = useIntl();
  const {
    events,
    prev,
    next,
    today,
    changeView,
    currentDateTitle,
    searchEvents,
    currentView,
  } = useCalendarContext();
  const [searchText, setSearchText] = useState("");

  const types = useMemo(() => {
    const s = new Set(events.map((e) => e.type));
    return Array.from(s).filter(Boolean);
  }, [events]);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchEvents(searchText);
    }
  };

  return (
    <div className="calendar-header">
      <div className="top-row">
        <h2>{intl.formatMessage({ id: "calendarTitle", defaultMessage: "Calendar" })}</h2>
      </div>
      <div className="controls-row">
        <div className="left-controls">
          <button onClick={prev}>{intl.formatMessage({ id: "prev", defaultMessage: "Prev" })}</button>
          <button onClick={today}>{intl.formatMessage({ id: "today", defaultMessage: "Today" })}</button>
          <button onClick={next}>{intl.formatMessage({ id: "next", defaultMessage: "Next" })}</button>
          <select
            className="view-select"
            onChange={(e) => changeView(e.target.value)}
            value={currentView}
          >
            <option value="dayGridMonth">{intl.formatMessage({ id: "month", defaultMessage: "Month" })}</option>
            <option value="timeGridWeek">{intl.formatMessage({ id: "week", defaultMessage: "Week" })}</option>
            <option value="timeGridDay">{intl.formatMessage({ id: "day", defaultMessage: "Day" })}</option>
            <option value="listWeek">{intl.formatMessage({ id: "list", defaultMessage: "List" })}</option>
          </select>
        </div>
        <div className="center-title">{currentDateTitle}</div>
        <div className="right-controls">
          <input
            className="search-input"
            placeholder={intl.formatMessage({ id: "searchPlaceholder", defaultMessage: "Search events..." })}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={onSearchKeyDown}
            onBlur={() => searchEvents(searchText)}
          />
          <FilterDropdown types={types} />
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
