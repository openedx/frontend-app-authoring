import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCalendarContext } from "../context/CalendarContext";
import FilterDropdown from "./FilterDropdown";

const CalendarHeader = () => {
  const { t, i18n } = useTranslation();
  const {
    events,
    prev,
    next,
    today,
    changeView,
    currentDateTitle,
    searchEvents,
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
    <div className={`calendar-header ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
      <div className="top-row">
        <h2>{t("calendarTitle")}</h2>
      </div>

      <div className="controls-row">
        <div className="left-controls">
          <button onClick={prev}>{t("prev")}</button>
          <button onClick={today}>{t("today")}</button>
          <button onClick={next}>{t("next")}</button>

          <select
            className="view-select"
            onChange={(e) => changeView(e.target.value)}
            defaultValue="dayGridMonth"
          >
            <option value="dayGridMonth">{t("month")}</option>
            <option value="timeGridWeek">{t("week")}</option>
            <option value="timeGridDay">{t("day")}</option>
            <option value="listWeek">{t("list")}</option>
          </select>
        </div>

        <div className="center-title">{currentDateTitle}</div>

        <div className="right-controls">
          <input
            className="search-input"
            placeholder={t("searchPlaceholder")}
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
