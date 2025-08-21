import React from "react";
import "../assets/styles/_calendar.scss";
import { CalendarProvider } from "../context/CalendarContext";
import CalendarHeader from "../components/CalendarHeader";
import CalendarView from "../components/CalendarView";
import ErrorDisplay from "../components/ErrorDisplay";

const CalendarPage = () => {
  return (
    <CalendarProvider>
      <div className="calendar-page">
        <ErrorDisplay />
        <CalendarHeader />
        <CalendarView />
      </div>
    </CalendarProvider>
  );
};

export default CalendarPage;