import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Col, Row, Badge } from '@edx/paragon';

import { importTaskShape } from './data';
import messages from './messages';

const CourseImportTaskListItem = ({ intl, task }) => {
  let badgeVariant = '';

  switch (task.state.toLowerCase()) {
    case 'successful':
      badgeVariant = 'success';
      break;

    case 'created':
    case 'pending':
    case 'running':
      badgeVariant = 'info';
      break;

    case 'failed':
      badgeVariant = 'danger';
      break;

    default:
      break;
  }

  return (
    <div className="library-link">
      <Row className="h-100">
        <Col xs={12} className="my-auto">
          <h3 className="library-title">Import of {task.course_id}</h3>
        </Col>
      </Row>
      <div className="library-metadata">
        <span className="library-state metadata-item">
          <span className="label">{intl.formatMessage(messages['library.library.course_import.list_item.state'])}</span>
          <span className="value">
            <Badge variant={badgeVariant}>{task.state}</Badge>
          </span>
        </span>
        <span className="library-org metadata-item">
          <span className="label">{intl.formatMessage(messages['library.course_import.list_item.organization'])}</span>
          <span className="value">{task.org}</span>
        </span>
        <span className="library-slug metadata-item">
          <span className="label">{intl.formatMessage(messages['library.course_import.list_item.created_at'])}</span>
          <span className="value">{new Date(task.created_at).toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
};

CourseImportTaskListItem.propTypes = {
  intl: intlShape.isRequired,
  task: importTaskShape.isRequired,
};

export default injectIntl(CourseImportTaskListItem);
