import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Icon,
  Button,
  ModalDialog,
} from '@openedx/paragon';
import {
  MenuBook, Groups, LibraryBooks, Assessment,
  DragIndicator,
  FilterList,
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
import WidgetCard from './components/WidgetCard';
import MetricCard from './components/MetricCard';

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

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`widget-selection-card ${isSelected ? 'selected' : ''}`}
        // Only allow selection on card click, not on drag handle
        onClick={onClick}
      >
        <Card.Section className="widget-selection-content" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <h4 style={{ flex: 1, margin: 0 }}>{widget.title}</h4>
            <span
              {...attributes}
              {...listeners}
              style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 8 }}
              onClick={e => e.stopPropagation()}
              role="button"
              tabIndex={0}
              aria-label="Drag to reorder"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // Let dnd-kit handle keyboard drag
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

  // dnd-kit sensors (must be before any early return)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use the https://design.titaned.com/dashboard endpoint for deployment and http://localhost:3001/dashboard for local development
        const response = await fetch('http://localhost:3001/dashboard');
        const data = await response.json();
        // Sort widgets by order before setting state
        const sortedWidgets = [...data.widgets].sort((a, b) => a.order - b.order);
        setDashboardData({ ...data, widgets: sortedWidgets });
        // Set selected widgets based on enabled property
        setSelectedWidgets(sortedWidgets.filter(widget => widget.enabled).map(widget => widget.id));
        setTempOrderedWidgets(sortedWidgets);
        setAllWidgets(sortedWidgets);
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTempOrderedWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Create a new array with updated order values
        return items.map((item, index) => {
          if (item.id === active.id) {
            // Set the dragged item's order to the new position
            return { ...item, order: newIndex };
          }

          // Adjust orders of items between old and new positions
          if (oldIndex < newIndex && index > oldIndex && index <= newIndex) {
            // Moving down: decrease order of items between old and new positions
            return { ...item, order: item.order - 1 };
          }

          if (oldIndex > newIndex && index >= newIndex && index < oldIndex) {
            // Moving up: increase order of items between new and old positions
            return { ...item, order: item.order + 1 };
          }

          return item;
        }).sort((a, b) => a.order - b.order);
      });
    }
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

      // Update the dashboard data in db.json
      const response = await fetch('http://localhost:3001/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dashboardData,
          widgets: updatedWidgets,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update dashboard data');
      }

      // Update local state with the response data
      const updatedData = await response.json();
      setDashboardData(updatedData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating dashboard data:', error);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-main-content">
        {/* Top Metric Cards */}
        <div className="metrics-container">
          <MetricCard
            icon={MenuBook}
            value={dashboardData.metrics.courses}
            label="Courses"
            type="courses"
          />
          <MetricCard
            icon={Groups}
            value={dashboardData.metrics.students}
            label="Students"
            type="students"
          />
          <MetricCard
            icon={Assessment}
            value={dashboardData.metrics.enrollments}
            label="Enrollments"
            type="enrollments"
          />
          <MetricCard
            icon={LibraryBooks}
            value={dashboardData.metrics.submissions}
            label="Submissions"
            type="submissions"
          />
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
          <div className="overview-grid">
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tempOrderedWidgets.map((widget) => widget.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tempOrderedWidgets.map((widget) => (
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
      <div className="dashboard-sidebar">
        <Card className="sidebar-card">
          <h4 className="card-header">Titan AI suggestion</h4>
          <Card.Section className="card-section">
            {dashboardData.titanAISuggestions.length > 0 ? (
              <ul className="card-list">
                {dashboardData.titanAISuggestions.map((suggestion) => (
                  <li key={`suggestion-${suggestion}`}>{suggestion}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No suggestions yet.</p>
            )}
          </Card.Section>
        </Card>

        <Card className="sidebar-card">
          <h4 className="card-header">Todo List</h4>
          <Card.Section className="card-section temp-flow">
            {dashboardData.todoList.length > 0 ? (
              <ul className="card-list">
                {dashboardData.todoList.map((todo) => (
                  <li key={`todo-${todo}`}>{todo}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No tasks added.</p>
            )}
          </Card.Section>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
