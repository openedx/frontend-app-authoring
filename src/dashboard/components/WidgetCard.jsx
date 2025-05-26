/* eslint-disable max-len */
/* eslint-disable no-unneeded-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import DOMPurify from 'dompurify';
import ReactApexChart from 'react-apexcharts';
import './WidgetCard.scss';

const WidgetCard = ({
  title, content, styles, type,
}) => {
  const generateColors = (count) => {
    const colors = [];
    const backgroundColors = []; // Still needed for some chart types if we want to keep similar look

    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsla(${hue}, 70%, 50%, 1)`);
      backgroundColors.push(`hsla(${hue}, 70%, 50%, 0.2)`); // Retaining for potential area fill
    }

    return { solidColors: colors, backgroundColors }; // ApexCharts typically uses a flat array of colors
  };

  const getChartOptionsAndSeries = () => {
    if (type === 'chart' && content && content.data) {
      const dataLength = content.data.length;
      // For bar, line, area charts, if content.data is an array of objects with {label, value}
      // where value is an array of numbers, then we have multiple series.
      // If content.data is an array of objects where value is a single number, it's for pie/donut.
      const isMultiSeries = content.data.every(item => Array.isArray(item.value));
      const { solidColors } = generateColors(isMultiSeries ? content.data.length : (content.data[0]?.value?.length || dataLength));

      const commonOptions = {
        chart: {
          type: content.chartType === 'donut' ? 'donut' : content.chartType,
          height: 300,
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false,
          },
        },
        legend: {
          position: 'top',
          show: true,
        },
        dataLabels: {
          enabled: content.chartType === 'pie' || content.chartType === 'donut',
        },
        stroke: {
          curve: 'smooth',
          width: (content.chartType === 'line' || content.chartType === 'area') ? 4 : 0,
        },
        fill: {
          type: content.chartType === 'area' ? 'solid' : 'solid',
          opacity: content.chartType === 'area' ? 0.2 : 1,
        },
        colors: solidColors,
      };

      if (content.chartType === 'bar' || content.chartType === 'line' || content.chartType === 'area') {
        const series = content.data.map(item => ({
          name: item.label,
          data: item.value,
        }));
        const options = {
          ...commonOptions,
          xaxis: {
            categories: content.referenceLabels || [],
          },
          yaxis: {
            min: 0,
          },
          tooltip: {
            shared: true,
            intersect: false,
          },
          states: {
            hover: {
              filter: { type: 'none' },
            },
            active: {
              filter: { type: 'none' },
            },
          },
        };
        if (content.chartType === 'area') {
          options.fill.gradient = {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 90, 100],
          };
        }
        if (content.chartType === 'bar') {
          options.plotOptions = {
            bar: {
              horizontal: false,
              columnWidth: '100%',
            },
          };
          options.dataLabels = {
            enabled: false,
          };
          options.fill = {
            type: 'solid',
            opacity: 0.9,
          };
          options.chart = {
            ...options.chart,
            stacked: true,
          };
          options.legend = {
            position: 'bottom',
            fontSize: '16px',
            fontWeight: 500,
            labels: { colors: ['#22223b'] },
          };
          options.grid = {
            borderColor: '#e5e7eb',
            strokeDashArray: 4,
          };
        }
        // Apply colors from JSON if provided (for all chart types)
        if (content.colors && Array.isArray(content.colors)) {
          options.colors = content.colors;
        }
        // If referenceLabels are not provided, try to infer from data if possible
        if (!options.xaxis.categories.length && series.length > 0 && series[0].data.length) {
          options.xaxis.categories = series[0].data.map((_, i) => `Point ${i + 1}`);
        }
        return { series, options };
      }

      // For pie and doughnut charts
      if (content.chartType === 'pie' || content.chartType === 'donut') {
        const series = content.data.map(item => item.value);
        const options = {
          ...commonOptions,
          labels: content.data.map(item => item.label),
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          }],
          states: {
            hover: {
              filter: { type: 'none' },
            },
            active: {
              filter: { type: 'none' },
            },
          },
        };
        // Apply colors from JSON if provided (for all chart types)
        if (content.colors && Array.isArray(content.colors)) {
          options.colors = content.colors;
        }
        return { series, options };
      }
    }
    return { series: [], options: {} };
  };

  const { series: chartSeries, options: chartOptions } = getChartOptionsAndSeries();

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
          <div className="chart-widget-container">
            {(content.chartType === 'pie' || content.chartType === 'donut' || content.chartType === 'bar' || content.chartType === 'line' || content.chartType === 'area') && (
              <ReactApexChart
                options={{
                  ...chartOptions,
                  grid: {
                    borderColor: '#e5e7eb',
                    strokeDashArray: 4,
                  },
                  legend: {
                    ...chartOptions.legend,
                    fontSize: '14px',
                    fontWeight: 500,
                    labels: { colors: ['#22223b'] },
                  },
                  plotOptions: {
                    ...chartOptions.plotOptions,
                    bar: {
                      ...((chartOptions.plotOptions && chartOptions.plotOptions.bar) || {}),
                      borderRadius: 6,
                      columnWidth: '80%',
                    },
                  },
                  chart: {
                    ...chartOptions.chart,
                    animations: {
                      enabled: true,
                      easing: 'easeinout',
                      speed: 800,
                      animateGradually: { enabled: true, delay: 150 },
                      dynamicAnimation: { enabled: true, speed: 350 },
                    },
                  },
                }}
                series={chartSeries}
                type={chartOptions.chart.type}
                height={chartOptions.chart.height || 380}
                width="100%"
              />
            )}
          </div>
        )}
        {type === 'youtube' && content && content.videoId && (
          <div className="youtube-widget-container">
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${content.videoId}${content.autoplay ? '?autoplay=1' : ''}`}
                title={content.title || 'YouTube video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '8px',
                }}
              />
            </div>
            {content.description && (
              <div className="video-description">
                <p>{content.description}</p>
              </div>
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
      referenceLabels: PropTypes.arrayOf(PropTypes.string), // For x-axis in bar/line/area
      data: PropTypes.arrayOf(PropTypes.shape({ // For pie/donut: {label: string, value: number}, For bar/line/area: {label: string (series name), value: array of numbers}
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
      })).isRequired,
    }),
    PropTypes.shape({
      videoId: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      autoplay: PropTypes.bool,
    }),
  ]).isRequired,
  styles: PropTypes.string,
  type: PropTypes.string,
};

export default WidgetCard;
