import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import eventsData from "../data/events.json";

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const calendarRef = useRef(null);               
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentDateTitle, setCurrentDateTitle] = useState("");


  useEffect(() => {
    setEvents(eventsData);
    setFilteredEvents(eventsData);
  }, []);


  useEffect(() => {
    let result = [...events];

    if (filterType && filterType !== "all") {
      result = result.filter((ev) => ev.type === filterType);
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ev) => ev.title.toLowerCase().includes(q) || ev.type.toLowerCase().includes(q)
      );
    }

    setFilteredEvents(result);
    setCurrentEventIndex(0);
  }, [events, filterType, searchQuery]);


  useEffect(() => {
    if (calendarRef.current && filteredEvents.length > 0) {
      try {
        const api = calendarRef.current.getApi();
        const ev = filteredEvents[currentEventIndex];
        if (ev && ev.start) {
          api.gotoDate(ev.start);
        }
      } catch (err) {
        console.log("calendar api fail.")
      }
    }
  }, [filteredEvents, currentEventIndex]);


  const prev = () => calendarRef.current?.getApi().prev();
  const next = () => calendarRef.current?.getApi().next();
  const today = () => calendarRef.current?.getApi().today();
  const changeView = (view) => calendarRef.current?.getApi().changeView(view);

 
  const filterByType = (type) => setFilterType(type);
  const searchEvents = (query) => setSearchQuery(query);


  const nextEvent = () => {
    setCurrentEventIndex((prev) =>
      filteredEvents.length ? (prev + 1) % filteredEvents.length : 0
    );
  };
  const prevEvent = () => {
    setCurrentEventIndex((prev) =>
      filteredEvents.length ? (prev - 1 + filteredEvents.length) % filteredEvents.length : 0
    );
  };

  return (
    <CalendarContext.Provider
      value={{
        calendarRef,
        events,
        filteredEvents,
        filterType,
        searchQuery,
        currentEventIndex,
        currentDateTitle,
        setCurrentDateTitle,
        prev,
        next,
        today,
        changeView,
        filterByType,
        searchEvents,
        nextEvent,
        prevEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => useContext(CalendarContext);
