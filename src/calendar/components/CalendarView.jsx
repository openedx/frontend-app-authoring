import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { useCalendarContext } from "../context/CalendarContext";
import { getLocale } from "@edx/frontend-platform/i18n";

const CalendarView = () => {
  const { filteredEvents, setCurrentDateTitle, currentDate, currentView } = useCalendarContext();

  return (
    <div className="calendar-container">
      <FullCalendar
        key={`${currentView}-${currentDate.getTime()}`}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={currentView}
        headerToolbar={false}
        events={filteredEvents}
        locales={allLocales}
        locale={getLocale()}
        height="100vh"
        selectable={true}
        datesSet={(arg) => setCurrentDateTitle(arg.view.title)}
        initialDate={currentDate}
      />
    </div>
  );
};

export default CalendarView;