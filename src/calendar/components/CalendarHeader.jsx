import React, { useState, useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCalendarContext } from '../context/CalendarContext';
import FilterDropdown from './FilterDropdown';
import NavigationButton from './NavigationButton';
import Dropdown from './Dropdown';
import messages from '../data/messages';

const CalendarHeader = () => {
  const  intl  = useIntl();
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
  const [searchText, setSearchText] = useState('');

  const types = useMemo(() => {
    const s = new Set(events.map((e) => e.type));
    return Array.from(s).filter(Boolean);
  }, [events]);

  const onSearchKeyDown = (e) => {
    if (e.keyCode === 13) {
      searchEvents(searchText);
    }
  };

  const viewOptions = [
    { value: 'dayGridMonth', messageId: 'month' },
    { value: 'timeGridWeek', messageId: 'week' },
    { value: 'timeGridDay', messageId: 'day' },
    { value: 'listWeek', messageId: 'list' },
  ];

  return (
    <div className="calendar-header">
      <div className="top-row">
        <h2>
          {intl && intl.formatMessage
            ? intl.formatMessage(messages.calendarTitle)
            : messages.calendarTitle.defaultMessage}
        </h2>
      </div>
      <div className="controls-row">
        <div className="left-controls">
          <NavigationButton type="prev" onClick={prev} />
          <NavigationButton type="today" onClick={today} />
          <NavigationButton type="next" onClick={next} />
          <Dropdown
            className="view-select"
            options={viewOptions}
            value={currentView}
            onChange={changeView}
          />
        </div>
        <div className="center-title">{currentDateTitle}</div>
        <div className="right-controls">
          <input
            className="search-input"
            placeholder={
              intl && intl.formatMessage
                ? intl.formatMessage(messages.searchPlaceholder)
                : messages.searchPlaceholder.defaultMessage
            }
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