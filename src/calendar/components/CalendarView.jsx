import React, { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { useCalendarContext } from "../context/CalendarContext";
import { useTranslation } from "react-i18next";

const CalendarView = () => {
  const { filteredEvents, calendarRef, setCurrentDateTitle } = useCalendarContext();
  const { i18n } = useTranslation();



  return (
    <div className="calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}                
        events={filteredEvents}
        locales={allLocales}
        locale={i18n.language}
        height="75vh"
        selectable={true}
        datesSet={(arg) => setCurrentDateTitle(arg.view.title)}
      />
    </div>
  );
};

export default CalendarView;
