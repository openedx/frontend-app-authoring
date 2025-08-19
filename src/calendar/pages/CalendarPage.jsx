import React from "react";
import { CalendarProvider } from "../context/CalendarContext";
import CalendarHeader from "../components/CalendarHeader";
import CalendarView from "../components/CalendarView";

const CalendarPage = () => {
  return (
    <CalendarProvider>
      <div className="calendar-page">
        <CalendarHeader />
        <CalendarView />
      </div>
    </CalendarProvider>
  );
};

export default CalendarPage;
