import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Icon,
  Button,
  ModalDialog,
} from '@openedx/paragon';
import {
  DragIndicator,
  FilterList,
  RadioButtonUnchecked,
} from '@openedx/paragon/icons';
import './Dashboard.scss';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIntl, getLocale } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';
import customStarsIcon from '../assets/icons/custom-stars.svg';
import WidgetCard from './components/WidgetCard';
import MetricCard from './components/MetricCard';
import messages from './messages';
import { CalendarProvider, useCalendarContext } from '../calendar/context/CalendarContext';
import NavigationButton from '../calendar/components/NavigationButton';
import message from "../../src/calendar/data/messages"
// Sortable widget card for modal
const SortableWidgetCard = ({ widget, isSelected, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.7 : 1,
    background: isDragging ? '#f5f5f5' : undefined,
  };

  // Special styling for placeholder card
  if (widget.id === 'left-placeholder' || widget.id === 'right-placeholder') {
    return (
      <div ref={setNodeRef} style={{ ...style, cursor: 'default' }}>
        <Card className="widget-selection-card placeholder-card">
          <Card.Section className="widget-selection-content" style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <h4 style={{ flex: 1, margin: 0, color: '#666' }}>Placeholder</h4>
            </div>
            <div style={{ width: '100%' }}>
              <p style={{ margin: 0, color: '#666' }}>Drag widgets here</p>
            </div>
          </Card.Section>
        </Card>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`widget-selection-card ${isSelected ? 'selected' : ''}`}
        onClick={onClick}
      >
        <Card.Section className="widget-selection-content" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <h4 style={{ flex: 1, margin: 0 }}>{widget.title}</h4>
            <span
              {...attributes}
              {...listeners}
              style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 8 }}
              role="button"
              tabIndex={0}
              aria-label="Drag to reorder"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                }
              }}
            >
              <DragIndicator style={{ cursor: 'grab', color: '#888' }} />
            </span>
          </div>
          <div style={{ width: '100%' }}>
            <p style={{ margin: 0 }}>{widget.type === 'chart' ? `Chart type: ${widget.content.chartType}` : 'Text widget'}</p>
          </div>
        </Card.Section>
      </Card>
    </div>
  );
};

SortableWidgetCard.propTypes = {
  widget: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    content: PropTypes.shape({
      chartType: PropTypes.string,
    }).isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [tempSelectedWidgets, setTempSelectedWidgets] = useState([]);
  const [tempOrderedWidgets, setTempOrderedWidgets] = useState([]);
  const [allWidgets, setAllWidgets] = useState([]);
  const [isAISuggestionsEnabled, setIsAISuggestionsEnabled] = useState(false);
  const [isTodoListEnabled, setIsTodoListEnabled] = useState(false);
  const [isCalendarWidgetEnabled, setIsCalendarWidgetEnabled] = useState(false);

  const intl = useIntl();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const isLocal = process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'production';
        console.log(isLocal, 'TEST');
        console.log(process.env.NODE_ENV, 'process.env.NODE_ENV');
        if (isLocal) {
          // Local mock API
          const response = await fetch('http://localhost:3001/dashboard');
          const data = await response.json();
          const sortedWidgets = [...data.widgets].sort((a, b) => a.order - b.order);
          setDashboardData({ ...data, widgets: sortedWidgets });
          setSelectedWidgets(sortedWidgets.filter(widget => widget.enabled).map(widget => widget.id));
          setTempOrderedWidgets(sortedWidgets);
          setAllWidgets(sortedWidgets);
        } else {
          // Real API endpoints
          const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/instructor-dashboard`;
          const client = getAuthenticatedHttpClient();
          // Fetch all in parallel, but handle errors for each
          const [metricsRes, widgetsRes, aiRes, todoRes] = await Promise.allSettled([
            client.get(`${baseUrl}/metrics`),
            client.get(`${baseUrl}/widgets`),
            client.get(`${baseUrl}/ai-suggestions`),
            client.get(`${baseUrl}/todo-list`),
          ]);

          const metrics = metricsRes.status === 'fulfilled' ? metricsRes.value.data : [];
          const widgets = widgetsRes.status === 'fulfilled' ? widgetsRes.value.data : [];
          const titanAISuggestions = aiRes.status === 'fulfilled' ? aiRes.value.data : [];
          const todoList = todoRes.status === 'fulfilled' ? todoRes.value.data : [];

          // Sort widgets by order before setting state
          const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

          setDashboardData({
            metrics, widgets: sortedWidgets, titanAISuggestions, todoList,
          });
          setSelectedWidgets(sortedWidgets.filter(widget => widget.enabled).map(widget => widget.id));
          setTempOrderedWidgets(sortedWidgets);
          setAllWidgets(sortedWidgets);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleModalOpen = () => {
    setTempSelectedWidgets(selectedWidgets);
    // Ensure tempOrderedWidgets contains all widgets from allWidgets, preserving order for existing ones
    const orderedIds = tempOrderedWidgets.map(w => w.id);
    const missingWidgets = allWidgets.filter(w => !orderedIds.includes(w.id));
    setTempOrderedWidgets([...tempOrderedWidgets, ...missingWidgets]);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTempSelectedWidgets(selectedWidgets);
  };

  const handleWidgetSelection = (widgetId) => {
    setTempSelectedWidgets(prev => {
      if (prev.includes(widgetId)) {
        return prev.filter(id => id !== widgetId);
      }
      return [...prev, widgetId];
    });
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) { return; }

    const activeWidget = tempOrderedWidgets.find(w => w.id === active.id);
    const overWidget = tempOrderedWidgets.find(w => w.id === over.id);

    if (!activeWidget || !overWidget) { return; }

    // If dragging to a different column
    if (activeWidget.position !== overWidget.position) {
      setTempOrderedWidgets(items => {
        // First, move the active widget to the new position
        let updatedItems = items.map(widget => {
          if (widget.id === active.id) {
            return { ...widget, position: overWidget.position };
          }
          return widget;
        });

        // Check if left column is empty (excluding placeholder)
        const leftColumnWidgets = updatedItems.filter(w => w.position === 'left' && w.id !== 'left-placeholder');
        // If left column is empty, ensure placeholder exists
        if (leftColumnWidgets.length === 0) {
          const placeholderExists = updatedItems.some(w => w.id === 'left-placeholder');
          if (!placeholderExists) {
            updatedItems.push({
              id: 'left-placeholder',
              title: 'Placeholder',
              type: 'text',
              content: 'Drag widgets here',
              position: 'left',
              enabled: false,
              order: updatedItems.length + 1,
            });
          }
        } else {
          // If there are widgets in left column, remove the placeholder
          updatedItems = updatedItems.filter(w => w.id !== 'left-placeholder');
        }

        // Check if right column is empty (excluding placeholder)
        const rightColumnWidgets = updatedItems.filter(w => w.position === 'right' && w.id !== 'right-placeholder');
        // If right column is empty, ensure placeholder exists
        if (rightColumnWidgets.length === 0) {
          const placeholderExists = updatedItems.some(w => w.id === 'right-placeholder');
          if (!placeholderExists) {
            updatedItems.push({
              id: 'right-placeholder',
              title: 'Placeholder',
              type: 'text',
              content: 'Drag widgets here',
              position: 'right',
              enabled: false,
              order: updatedItems.length + 1,
            });
          }
        } else {
          // If there are widgets in right column, remove the placeholder
          updatedItems = updatedItems.filter(w => w.id !== 'right-placeholder');
        }

        return updatedItems;
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) { return; }

    setTempOrderedWidgets((items) => {
      const activeWidget = items.find(w => w.id === active.id);
      const overWidget = items.find(w => w.id === over.id);

      if (!activeWidget || !overWidget) { return items; }

      // Get all widgets in the target column (excluding placeholders)
      const columnItems = items.filter(w => w.position === overWidget.position && w.id !== 'left-placeholder' && w.id !== 'right-placeholder');
      const otherItems = items.filter(w => w.position !== overWidget.position || w.id === 'left-placeholder' || w.id === 'right-placeholder');

      const oldIndex = columnItems.findIndex(item => item.id === active.id);
      const newIndex = columnItems.findIndex(item => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) { return items; }

      const reordered = [...columnItems];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      // Check if left column is empty after reordering
      const leftColumnWidgets = reordered.filter(w => w.position === 'left' && w.id !== 'left-placeholder');
      const leftPlaceholder = items.find(w => w.id === 'left-placeholder');

      // If left column is empty and we have a placeholder, ensure it's in the left column
      if (leftColumnWidgets.length === 0 && leftPlaceholder) {
        leftPlaceholder.position = 'left';
      }

      // Check if right column is empty after reordering
      const rightColumnWidgets = reordered.filter(w => w.position === 'right' && w.id !== 'right-placeholder');
      const rightPlaceholder = items.find(w => w.id === 'right-placeholder');

      // If right column is empty and we have a placeholder, ensure it's in the right column
      if (rightColumnWidgets.length === 0 && rightPlaceholder) {
        rightPlaceholder.position = 'right';
      }

      // Merge reordered column back with other items
      return overWidget.position === 'left'
        ? [...reordered, ...otherItems]
        : [...otherItems, ...reordered];
    });
  };

  const handleUpdateWidgets = async () => {
    try {
      // Update local state
      setSelectedWidgets(tempSelectedWidgets);

      // Update widgets to include enabled/disabled status while preserving all widgets
      const updatedWidgets = tempOrderedWidgets.map((widget, index) => ({
        ...widget,
        order: index + 1,
        enabled: tempSelectedWidgets.includes(widget.id),
      }));
      const isLocal = process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'production';
      console.log(isLocal, 'TEST');
      if (isLocal) {
        // Local mock API
        const response = await fetch('http://localhost:3001/dashboard', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...dashboardData,
            widgets: updatedWidgets.filter(widget => widget.id !== 'left-placeholder' && widget.id !== 'right-placeholder'),
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update dashboard data');
        }
        const updatedData = await response.json();
        setDashboardData(updatedData);
        setIsModalOpen(false);
      } else {
        // Real API endpoint
        const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/instructor-dashboard`;
        const client = getAuthenticatedHttpClient();
        const response = await client.post(`${baseUrl}/widgets/filter`, updatedWidgets.filter(widget => widget.id !== 'left-placeholder' && widget.id !== 'right-placeholder'));
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('Failed to update dashboard widgets');
        }
        // Refetch widgets after update
        const widgetsRes = await client.get(`${baseUrl}/widgets`);
        const sortedWidgets = [...widgetsRes.data].sort((a, b) => a.order - b.order);
        setDashboardData(prev => ({ ...prev, widgets: sortedWidgets }));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating dashboard data:', error);
    }
  };

  useEffect(() => {
    const fetchNavigationItems = async () => {
      try {
        const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);
        // const response = await getAuthenticatedHttpClient().get(
        //   'https://staging.titaned.com/titaned/api/v1/menu-config/'
        // );
        if (response.status !== 200) {
          throw new Error('Failed to fetch Navigation Items');
        }
        return response.data;
      } catch (error) {
        console.warn('Failed to fetch navigation items, using defaults:', error);
        // Return default values when API fails
        return {
          assistant_is_enabled: false,
          todo_list_is_enabled: false,
        };
      }
    };

    fetchNavigationItems().then((data) => {
      setIsAISuggestionsEnabled(data?.assistant_is_enabled || false);
      setIsTodoListEnabled(data?.todo_list_is_enabled || false);
      setIsCalendarWidgetEnabled(data?.enable_calendar || false);
    }).catch((error) => {
      console.error('Error in fetchNavigationItems:', error);
      // Set default values on error
      setIsAISuggestionsEnabled(false);
      setIsTodoListEnabled(false);
      setIsCalendarWidgetEnabled(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>;
  }

  // Provide default suggestions if none are present
  const aiSuggestions = dashboardData.titanAISuggestions;

  const isLeftColumnEmpty = !dashboardData.widgets.some(widget => widget.enabled && widget.position === 'left');
  const isRightColumnEmpty = !dashboardData.widgets.some(widget => widget.enabled && widget.position === 'right');

  const CalendarContent = () => {
    const intl = useIntl();

    const {
      filteredEvents, prev, next, today, currentDate,
    } = useCalendarContext();
    const responsiveView = 'listWeek';

    return (
      <>
        <h4 className="card-header">{intl && intl.formatMessage
            ? intl.formatMessage(message.calendarTitle)
            : messages.calendarTitle.defaultMessage}</h4>
        <div className="calendar-card">
          <div className="calendar-nav">
            <NavigationButton type="prev" onClick={prev} />
            <NavigationButton type="today" onClick={today} />
            <NavigationButton type="next" onClick={next} />
          </div>
          <div className="calendar-view">
            <FullCalendar
              key={`${responsiveView}-${currentDate.getTime()}`}
              plugins={[listPlugin, interactionPlugin]}
              initialView={responsiveView}
              headerToolbar={false}
              events={filteredEvents}
              locales={allLocales}
              locale={getLocale()}
              height="auto"
              selectable
              initialDate={currentDate}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-main-content">
        {/* Top Metric Cards */}
        <div className="dashboard-header">{intl.formatMessage(messages.dashboardPageTitle)}</div>
        <div className="metrics-container">
          {dashboardData.metrics && dashboardData.metrics.map((metric, index) => (
            <MetricCard
              key={metric.id}
              icon={metric.icon}
              value={metric.value}
              label={metric.label}
              index={index}
            />
          ))}
        </div>

        {/* Overview Section */}
        <div className="overview-section">
          <div className="overview-header">
            <h1>Overview</h1>
            <Icon
              src={FilterList}
              className="text-primary"
              style={{ cursor: 'pointer' }}
              onClick={handleModalOpen}
            />
          </div>
          <div className={`overview-grid ${isLeftColumnEmpty || isRightColumnEmpty ? 'single-column' : ''}`}>
            {/* <div className="overview-grid"> */}
            <div className="overview-left">
              {dashboardData.widgets
                .filter(widget => widget.enabled && widget.position === 'left')
                .map(widget => (
                  <WidgetCard
                    key={widget.id}
                    type={widget.type}
                    title={widget.title}
                    content={widget.content}
                    styles={widget.styles}
                  />
                ))}
            </div>
            <div className="overview-right">
              {dashboardData.widgets
                .filter(widget => widget.enabled && widget.position === 'right')
                .map(widget => (
                  <WidgetCard
                    key={widget.id}
                    type={widget.type}
                    title={widget.title}
                    content={widget.content}
                    styles={widget.styles}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Widget Selection Modal */}
      <ModalDialog
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size="lg"
        hasCloseButton
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            Add/Remove Widgets
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <div className="modal-widgets-grid">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
            >
              {/* LEFT COLUMN */}
              <SortableContext
                items={tempOrderedWidgets.filter(w => w.position === 'left').map(w => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="modal-widgets-left">
                  {tempOrderedWidgets
                    .filter(widget => widget.position === 'left')
                    .map(widget => (
                      <SortableWidgetCard
                        key={widget.id}
                        widget={widget}
                        isSelected={tempSelectedWidgets.includes(widget.id)}
                        onClick={() => handleWidgetSelection(widget.id)}
                      />
                    ))}
                </div>
              </SortableContext>

              {/* RIGHT COLUMN */}
              <SortableContext
                items={tempOrderedWidgets.filter(w => w.position === 'right').map(w => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="modal-widgets-right">
                  {tempOrderedWidgets
                    .filter(widget => widget.position === 'right')
                    .map(widget => (
                      <SortableWidgetCard
                        key={widget.id}
                        widget={widget}
                        isSelected={tempSelectedWidgets.includes(widget.id)}
                        onClick={() => handleWidgetSelection(widget.id)}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            style={{ marginRight: '10px' }}
            variant="outline-primary"
            onClick={handleModalClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateWidgets}
          >
            Update
          </Button>
        </ModalDialog.Footer>
      </ModalDialog>

      {/* Sidebar */}
      <div className={!isAISuggestionsEnabled && !isTodoListEnabled && !isCalendarWidgetEnabled ? 'dashboard-sidebar-no-display' : 'dashboard-sidebar'}>
        { isAISuggestionsEnabled && (
        <Card className="sidebar-card">
          <h4 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Titan AI suggestion
            <img
              src={customStarsIcon}
              alt="Custom Stars"
              style={{ width: '20px', height: '20px' }}
            />
          </h4>
          <Card.Section className="card-section temp-flow">
            {aiSuggestions.length > 0 ? (
              <div className="card-list ai-suggestion-list">
                {aiSuggestions.map((suggestion) => (
                  <div className="ai-suggestion-item" key={`suggestion-${suggestion}`} style={{ position: 'relative' }}>
                    {suggestion}
                    <img
                      src={customStarsIcon}
                      alt="Custom Stars"
                      className="ai-suggestions-icon"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No suggestions yet.</p>
            )}
          </Card.Section>
        </Card>
        )}
        { isTodoListEnabled && (
        <Card className="sidebar-card">
          <h4 className="card-header">Todo List</h4>
          <Card.Section className="card-section temp-flow">
            {dashboardData.todoList.length > 0 ? (
              <div className="card-list todo-list">
                {dashboardData.todoList.map((todo) => (
                  <div className="todo-item" key={`todo-${todo}`}>
                    <Icon
                      src={RadioButtonUnchecked}
                      style={{
                        marginRight: '0.75rem',
                        color: '#454545',
                        minWidth: 22,
                        minHeight: 22,
                      }}
                    />
                    {todo}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No tasks added.</p>
            )}
          </Card.Section>
        </Card>
        )}

        { isCalendarWidgetEnabled && (

        <Card className="sidebar-card">
          <CalendarProvider>
            <CalendarContent />
          </CalendarProvider>
        </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
