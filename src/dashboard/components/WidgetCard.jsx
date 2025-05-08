/* eslint-disable no-unneeded-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import DOMPurify from 'dompurify';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler,
} from 'chart.js';
import {
  Pie, Doughnut, Bar, Line,
} from 'react-chartjs-2';
import './WidgetCard.scss';

// Initialize Chart.js
if (typeof window !== 'undefined') {
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Filler,
  );
}

const WidgetCard = ({
  title, content, styles, type,
}) => {
  const generateColors = (count) => {
    const colors = [];
    const backgroundColors = [];

    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsla(${hue}, 70%, 50%, 1)`);
      backgroundColors.push(`hsla(${hue}, 70%, 50%, 0.2)`);
    }

    return { backgroundColor: backgroundColors, borderColor: colors };
  };

  const getChartData = () => {
    if (type === 'chart' && content && content.data) {
      const dataLength = content.data.length;
      const colors = generateColors(dataLength);

      if (content.chartType === 'bar' || content.chartType === 'line' || content.chartType === 'area') {
        return {
          labels: content.referenceLabels,
          datasets: content.data.map((item, index) => ({
            label: item.label,
            data: item.value,
            backgroundColor: content.chartType === 'area' ? colors.backgroundColor[index] : colors.backgroundColor[index],
            borderColor: colors.borderColor[index],
            borderWidth: 2,
            tension: 0.4,
            fill: content.chartType === 'area' ? true : false,
            pointRadius: (content.chartType === 'line' || content.chartType === 'area') ? 4 : 0,
            pointHoverRadius: (content.chartType === 'line' || content.chartType === 'area') ? 6 : 0,
          })),
        };
      }

      // For pie and doughnut charts
      return {
        labels: content.data.map(item => item.label),
        datasets: [{
          data: content.data.map(item => item.value),
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: 1,
          hoverOffset: 4,
        }],
      };
    }
    return null;
  };

  return (
    <Card className="overview-card">
      <h4 className="card-header">{title}</h4>
      <Card.Section className="card-section">
        {type === 'text' && (
          <>
            {styles && <style dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(styles) }} />}
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
          </>
        )}
        {type === 'chart' && content && content.data && (
          <div style={{
            width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
          >
            {content.chartType === 'pie' && (
              <Pie
                data={getChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      display: true,
                    },
                  },
                }}
              />
            )}
            {content.chartType === 'donut' && (
              <Doughnut
                data={getChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      display: true,
                    },
                  },
                }}
              />
            )}
            {content.chartType === 'bar' && (
              <Bar
                data={getChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      display: true,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            )}
            {(content.chartType === 'line' || content.chartType === 'area') && (
              <Line
                data={getChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      display: true,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false,
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderJoinStyle: 'round',
                    },
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
                }}
              />
            )}
          </div>
        )}
        {type === 'calendar' && content && (
          <div className="calendar-widget">
            <div className="calendar-title">{content.date}</div>
            <div className="calendar-events">
              {content.events && content.events.length > 0 ? (
                content.events.map(event => (
                  <div
                    key={`calendar-event-${event.title}-${event.time}`}
                    className="calendar-event"
                  >
                    {event.title}
                    <br />
                    <span className="event-time">{event.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted">No events today.</div>
              )}
            </div>
          </div>
        )}
      </Card.Section>
    </Card>
  );
};

WidgetCard.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      chartType: PropTypes.oneOf(['pie', 'donut', 'bar', 'line', 'area']),
      referenceLabels: PropTypes.arrayOf(PropTypes.string),
      data: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
      })),
    }),
  ]).isRequired,
  styles: PropTypes.string,
  type: PropTypes.string,
};

export default WidgetCard;
