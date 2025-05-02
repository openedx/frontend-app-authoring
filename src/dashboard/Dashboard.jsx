import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Icon,
  Button,
  Dropdown,
  ModalDialog,
} from '@openedx/paragon';
import {
  MenuBook, Groups, LibraryBooks, Assessment,
} from '@openedx/paragon/icons';
import './Dashboard.scss';
import WidgetCard from './components/WidgetCard';

const MetricCard = ({ icon, value, label }) => (
  <Card className="metric-card">
    <div className="metric-card-content">
      <Icon
        src={icon}
        className="text-primary"
        style={{ height: '50px', width: '50px' }}
      />
      <div className="metric-text">
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  </Card>
);

MetricCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  const [tempSelectedWidgets, setTempSelectedWidgets] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/db.json');
        const data = await response.json();
        setDashboardData(data.dashboard);
        setSelectedWidgets(data.dashboard.widgets.map(widget => widget.id));
        setAvailableWidgets(data.dashboard.widgets);
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

  const handleUpdateWidgets = () => {
    setSelectedWidgets(tempSelectedWidgets);
    const updatedWidgets = availableWidgets.filter(widget => tempSelectedWidgets.includes(widget.id));
    setDashboardData(prev => ({
      ...prev,
      widgets: updatedWidgets,
    }));
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="main-content">
        {/* Top Metric Cards */}
        <div className="metrics-container">
          <MetricCard icon={MenuBook} value={dashboardData.metrics.courses} label="Courses" />
          <MetricCard icon={Groups} value={dashboardData.metrics.students} label="Students" />
          <MetricCard icon={LibraryBooks} value={dashboardData.metrics.enrollments} label="Enrollments" />
          <MetricCard icon={Assessment} value={dashboardData.metrics.submissions} label="Submissions" />
        </div>

        {/* Overview Cards */}
        <div className="overview-section">
          <div className="overview-header">
            <h1>Overview</h1>
            <Dropdown>
              <Dropdown.Toggle variant="primary">
                Customize
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Edit mode</Dropdown.Item>
                <Dropdown.Item onClick={handleModalOpen}>Add widget</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="overview-grid">
            {/* <div>
              <Card className="overview-card">
                <h4 className="card-header">Quick Actions</h4>
                <Card.Section className="card-section">
                  <ul className="card-list">
                    {dashboardData.quickActions.map((action) => (
                      <li key={`quick-action-${action}`}>{action}</li>
                    ))}
                  </ul>
                </Card.Section>
              </Card>

              <Card className="overview-card">
                <h4 className="card-header">Recent course</h4>
                <Card.Section className="card-section">
                  <ul className="card-list">
                    {dashboardData.recentCourses.map((course) => (
                      <li key={`recent-course-${course}`}>{course}</li>
                    ))}
                  </ul>
                </Card.Section>
              </Card>

              <Card className="overview-card">
                <h4 className="card-header">Notifications</h4>
                <Card.Section className="card-section">
                  {dashboardData.notifications.length > 0 ? (
                    <ul className="card-list">
                      {dashboardData.notifications.map((notification) => (
                        <li key={`notification-${notification}`}>
                          {notification}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No notifications yet.</p>
                  )}
                </Card.Section>
              </Card>

              <Card className="overview-card">
                <h4 className="card-header">Upcoming Events</h4>
                <Card.Section className="card-section">
                  {dashboardData.upcomingEvents.length > 0 ? (
                    <ul className="card-list">
                      {dashboardData.upcomingEvents.map((event) => (
                        <li key={`upcoming-event-${event}`}>{event}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No upcoming events.</p>
                  )}
                </Card.Section>
              </Card>

              <Card className="calendar-card">
                <h4 className="card-header">
                  Calendar - {dashboardData.calendar.date}
                </h4>
                <Card.Section className="card-section">
                  <div className="calendar-events">
                    {dashboardData.calendar.events.map((event) => (
                      <div
                        key={`calendar-event-${event.title}`}
                        className="calendar-event"
                      >
                        {event.title}
                        <br />
                        <span className="event-time">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </Card.Section>
              </Card>
            </div> */}
            {dashboardData.widgets.map((widget) => (
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
          <div className="widget-selection-grid">
            {availableWidgets.map((widget) => (
              <Card
                key={widget.id}
                className={`widget-selection-card ${tempSelectedWidgets.includes(widget.id) ? 'selected' : ''}`}
                onClick={() => handleWidgetSelection(widget.id)}
              >
                <Card.Section className="widget-selection-content">
                  <h4>{widget.title}</h4>
                  <p>{widget.type === 'chart' ? `Chart type: ${widget.content.chartType}` : 'Text widget'}</p>
                </Card.Section>
              </Card>
            ))}
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
      <div className="sidebar">
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
          <Card.Section className="card-section">
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
