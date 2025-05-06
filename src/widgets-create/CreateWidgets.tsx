import React, { useState } from 'react';
import {
  Form,
  Button,
  Col,
  Row,
  Icon,
} from '@openedx/paragon';
import { Add as AddIcon, Delete as DeleteIcon } from '@openedx/paragon/icons';

interface ChartData {
  id: string;
  label: string;
  value: number | number[];
}

interface ReferenceLabel {
  id: string;
  value: string;
}

interface WidgetFormData {
  id: string;
  type: string;
  title: string;
  content: {
    chartType: string;
    referenceLabels?: ReferenceLabel[];
    data: ChartData[];
  };
}

const DEFAULT_LABELS: ReferenceLabel[] = [
  { id: 'label-1', value: '' },
];

function getLabelValues(labels: ReferenceLabel[]) {
  return labels.map(l => l.value);
}

function getNewLabelId(labels: ReferenceLabel[]) {
  let max = 0;
  labels.forEach(l => {
    const match = l.id.match(/label-(\d+)/);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  });
  return `label-${max + 1}`;
}

function getNewSeriesId(series: ChartData[]) {
  let max = 0;
  series.forEach(s => {
    const match = s.id.match(/series-(\d+)/);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  });
  return `series-${max + 1}`;
}

const CreateWidgets = () => {
  const [formData, setFormData] = useState<WidgetFormData>({
    id: '',
    type: 'chart',
    title: '',
    content: {
      chartType: '',
      referenceLabels: [],
      data: [{ id: 'series-1', label: '', value: Array(DEFAULT_LABELS.length).fill(0) }],
    },
  });

  const isTimeSeriesChart = ['bar', 'line', 'area'].includes(formData.content.chartType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert referenceLabels and data to array of strings for output
    const output = {
      ...formData,
      content: {
        ...formData.content,
        referenceLabels: isTimeSeriesChart
          ? getLabelValues(formData.content.referenceLabels || [])
          : undefined,
        data: formData.content.data.map(({ id, ...rest }) => rest),
      },
    };
    console.log('Form Data:', output);
    // Here you would typically send this data to your backend
  };

  const handleChartTypeChange = (chartType: string) => {
    const isTimeSeries = ['bar', 'line', 'area'].includes(chartType);
    setFormData(prev => {
      const refLabels = isTimeSeries ? DEFAULT_LABELS : undefined;
      return {
        ...prev,
        content: {
          ...prev.content,
          chartType,
          referenceLabels: refLabels,
          data: prev.content.data.map(series => ({
            ...series,
            value: isTimeSeries ? Array((refLabels || []).length).fill(0) : 0,
          })),
        },
      };
    });
  };

  // Reference label array field handlers
  const handleReferenceLabelChange = (id: string, value: string) => {
    setFormData(prev => {
      const newLabels = prev.content.referenceLabels
        ? prev.content.referenceLabels.map(l => (l.id === id ? { ...l, value } : l))
        : [];
      // Update all data series to match new label count
      const newData = prev.content.data.map(series => {
        let newValue = series.value;
        if (Array.isArray(newValue)) {
          if (newLabels.length > newValue.length) {
            newValue = [...newValue, ...Array(newLabels.length - newValue.length).fill(0)];
          } else if (newLabels.length < newValue.length) {
            newValue = newValue.slice(0, newLabels.length);
          }
        }
        return { ...series, value: newValue };
      });
      return {
        ...prev,
        content: {
          ...prev.content,
          referenceLabels: newLabels,
          data: newData,
        },
      };
    });
  };

  const addReferenceLabel = () => {
    setFormData(prev => {
      const newLabels = prev.content.referenceLabels
        ? [...prev.content.referenceLabels, { id: getNewLabelId(prev.content.referenceLabels), value: '' }]
        : [{ id: 'label-1', value: '' }];
      const newData = prev.content.data.map(series => {
        let newValue = series.value;
        if (Array.isArray(newValue)) {
          newValue = [...newValue, 0];
        }
        return { ...series, value: newValue };
      });
      return {
        ...prev,
        content: {
          ...prev.content,
          referenceLabels: newLabels,
          data: newData,
        },
      };
    });
  };

  const removeReferenceLabel = (id: string) => {
    setFormData(prev => {
      const newLabels = prev.content.referenceLabels
        ? prev.content.referenceLabels.filter(l => l.id !== id)
        : [];
      const idx = prev.content.referenceLabels
        ? prev.content.referenceLabels.findIndex(l => l.id === id)
        : -1;
      const newData = prev.content.data.map(series => {
        let newValue = series.value;
        if (Array.isArray(newValue) && idx !== -1) {
          newValue = newValue.filter((_, i) => i !== idx);
        }
        return { ...series, value: newValue };
      });
      return {
        ...prev,
        content: {
          ...prev.content,
          referenceLabels: newLabels,
          data: newData,
        },
      };
    });
  };

  // Data series handlers
  const addDataSeries = () => {
    const isTimeSeries = isTimeSeriesChart;
    const refLen = isTimeSeries && formData.content.referenceLabels ? formData.content.referenceLabels.length : DEFAULT_LABELS.length;
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        data: [
          ...prev.content.data,
          {
            id: getNewSeriesId(prev.content.data),
            label: '',
            value: isTimeSeries ? Array(refLen).fill(0) : 0,
          },
        ],
      },
    }));
  };

  const removeDataSeries = (id: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        data: prev.content.data.filter(series => series.id !== id),
      },
    }));
  };

  const updateDataSeries = (id: string, field: 'label' | 'value', value: string | number | number[]) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        data: prev.content.data.map(series =>
          series.id === id ? { ...series, [field]: value } : series
        ),
      },
    }));
  };

  const referenceLabels = isTimeSeriesChart && formData.content.referenceLabels ? formData.content.referenceLabels : [];

  return (
    <div className="p-4">
      <h2 className="mb-4">Create Chart Widget</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="widgetTitle">
          <Form.Control
            type="text"
            floatingLabel="Widget Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </Form.Group>

        <Form.Group controlId="chartType">
          <Form.Control
            as="select"
            floatingLabel="Chart Type"
            value={formData.content.chartType}
            onChange={(e) => handleChartTypeChange(e.target.value)}
          >
            <option value="pie">Pie Chart</option>
            <option value="doughnut">Doughnut Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
          </Form.Control>
        </Form.Group>

        {isTimeSeriesChart && (
          <Form.Group controlId="referenceLabels">
            <div className="mb-2"><b>Reference Labels</b></div>
            <Row className="g-2 align-items-center">
              {referenceLabels.map((labelObj, idx) => (
                <Col key={labelObj.id} xs={12} md={4} lg={3} className="mb-2">
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      value={labelObj.value}
                      floatingLabel={`Label ${idx + 1}`}
                      onChange={e => handleReferenceLabelChange(labelObj.id, e.target.value)}
                    />
                    {referenceLabels.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => removeReferenceLabel(labelObj.id)}
                        aria-label="Remove label"
                      >
                        <Icon src={DeleteIcon} />
                      </Button>
                    )}
                  </div>
                </Col>
              ))}
              <Col xs={12} md={4} lg={3} className="mb-2">
                <Button variant="outline-primary" onClick={addReferenceLabel}>
                  <Icon src={AddIcon} className="me-2" /> Add Label
                </Button>
              </Col>
            </Row>
          </Form.Group>
        )}

        <div className="mb-4">
          <h4>Data Series</h4>
          {formData.content.data.map((series) => (
            <div key={series.id} className="mb-3 p-3 border rounded">
              <Row>
                <Col>
                  <div className="d-flex align-items-center">
                    <Form.Group className="flex-grow-1 mb-2">
                      <Form.Control
                        type="text"
                        floatingLabel="Series Label"
                        value={series.label}
                        onChange={(e) => updateDataSeries(series.id, 'label', e.target.value)}
                      />
                    </Form.Group>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => removeDataSeries(series.id)}
                      disabled={formData.content.data.length === 1}
                      aria-label="Remove series"
                      style={{ marginTop: '-0.5rem' }}
                    >
                      <Icon src={DeleteIcon} />
                    </Button>
                  </div>
                </Col>
              </Row>
              {isTimeSeriesChart ? (
                <Row className="mt-2">
                  {referenceLabels.map((labelObj, valueIndex) => (
                    <Col key={labelObj.id} xs={6} md={4} lg={2}>
                      <Form.Group>
                        <Form.Control
                          type="number"
                          floatingLabel={`Value ${valueIndex + 1}`}
                          value={Array.isArray(series.value) ? series.value[valueIndex] : 0}
                          onChange={(e) => {
                            const newValues = Array.isArray(series.value) ? [...series.value] : Array(referenceLabels.length).fill(0);
                            newValues[valueIndex] = Number(e.target.value);
                            updateDataSeries(series.id, 'value', newValues);
                          }}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Row className="mt-2">
                  <Col>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        floatingLabel="Value"
                        value={typeof series.value === 'number' ? series.value : 0}
                        onChange={(e) => updateDataSeries(series.id, 'value', Number(e.target.value))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </div>
          ))}
          <Button
            variant="outline-primary"
            onClick={addDataSeries}
            className="mt-2"
          >
            <Icon src={AddIcon} className="mr-2" />
            Add Data Series
          </Button>
        </div>

        <div className="d-flex justify-content-end">
          <Button variant="primary" type="submit">
            Create Widget
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateWidgets;