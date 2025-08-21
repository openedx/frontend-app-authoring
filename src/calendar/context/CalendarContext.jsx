import React, { createContext, useContext, useState, useEffect } from "react";
import eventsData from "../data/events.json";

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentDateTitle, setCurrentDateTitle] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Array.isArray(eventsData)) {
      setError("calendar.error.eventsLoad");
      return;
    }
    setEvents(eventsData);
    setFilteredEvents(eventsData);
    setError(null); 
  }, []);

  useEffect(() => {
    let result = [...events];
    if (filterType && filterType !== "all") {
      result = result.filter((ev) => ev.type === filterType);
    }
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ev) =>
          (ev.title && ev.title.toLowerCase().includes(q)) ||
          (ev.type && ev.type.toLowerCase().includes(q))
      );
    }
    setFilteredEvents(result);
    setCurrentEventIndex(0);
    setError(null); 
  }, [events, filterType, searchQuery]);

  useEffect(() => {
    if (filteredEvents.length > 0 && currentEventIndex < filteredEvents.length) {
      const ev = filteredEvents[currentEventIndex];
      if (ev && ev.start) {
        const eventDate = new Date(ev.start);
        if (!isNaN(eventDate.getTime())) {
          setCurrentDate(eventDate);
          setError(null); 
        } else {
          setError("calendar.error.eventNavigation");
        }
      }
    }
  }, [filteredEvents, currentEventIndex]);

  const prev = () => setCurrentDate((prevDate) => {
    const d = new Date(prevDate);
    if (isNaN(d.getTime())) {
      setError("calendar.error.navigation");
      return prevDate;
    }
    switch (currentView) {
      case "dayGridMonth":
        d.setMonth(d.getMonth() - 1);
        break;
      case "timeGridWeek":
      case "listWeek":
        d.setDate(d.getDate() - 7);
        break;
      case "timeGridDay":
        d.setDate(d.getDate() - 1);
        break;
      default:
        setError("calendar.error.navigation");
        return prevDate;
    }
    setError(null); 
    return d;
  });

  const next = () => setCurrentDate((prevDate) => {
    const d = new Date(prevDate);
    if (isNaN(d.getTime())) {
      setError("calendar.error.navigation");
      return prevDate;
    }
    switch (currentView) {
      case "dayGridMonth":
        d.setMonth(d.getMonth() + 1);
        break;
      case "timeGridWeek":
      case "listWeek":
        d.setDate(d.getDate() + 7);
        break;
      case "timeGridDay":
        d.setDate(d.getDate() + 1);
        break;
      default:
        setError("calendar.error.navigation");
        return prevDate;
    }
    setError(null);
    return d;
  });

  const today = () => {
    setCurrentDate(new Date());
    setError(null); 
  };

  const changeView = (view) => {
    if (["dayGridMonth", "timeGridWeek", "timeGridDay", "listWeek"].includes(view)) {
      setCurrentView(view);
      setCurrentDateTitle("");
      setError(null); 
    } else {
      setError("calendar.error.viewChange");
    }
  };

  const filterByType = (type) => {
    setFilterType(type);
    setError(null);
  };

  const searchEvents = (query) => {
    setSearchQuery(query);
    setError(null); 
  };

  const nextEvent = () => {
    setCurrentEventIndex((prev) =>
      filteredEvents.length ? (prev + 1) % filteredEvents.length : 0
    );
    setError(null); 
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) =>
      filteredEvents.length ? (prev - 1 + filteredEvents.length) % filteredEvents.length : 0
    );
    setError(null); 
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        filteredEvents,
        filterType,
        searchQuery,
        currentEventIndex,
        currentDateTitle,
        currentDate,
        currentView,
        error,
        setCurrentDateTitle,
        prev,
        next,
        today,
        changeView,
        filterByType,
        searchEvents,
        nextEvent,
        prevEvent,
        clearError,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => useContext(CalendarContext);