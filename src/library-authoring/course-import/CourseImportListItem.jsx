import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, ActionRow, StatefulButton } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faSync, faSpinner, faCheck,
} from '@fortawesome/free-solid-svg-icons';

import { paginationParamsShape } from '../common';
import { courseShape } from './data';
import messages from './messages';

const CourseImportListItem = ({
  intl, course, libraryId, importBlocksHandler, ongoingImportState, taskPaginationParams,
}) => {
  const [importState, setImportState] = useState('default');

  useEffect(() => {
    setImportState(ongoingImportState);
  }, [ongoingImportState]);

  const handleImport = () => {
    importBlocksHandler({ params: { libraryId, courseId: course.id, taskPaginationParams } });
  };

  const importButtonProps = {
    state: ongoingImportState || 'default',
    variant: importState === 'error' ? 'danger' : 'primary',
    labels: {
      default: intl.formatMessage(messages['library.course_import.new_import.label']),
      pending: intl.formatMessage(messages['library.course_import.ongoing_import.label']),
      complete: intl.formatMessage(messages['library.course_import.import_scheduled.label']),
      error: intl.formatMessage(messages['library.course_import.import_schedule_failed.label']),
    },
    icons: {
      default: <FontAwesomeIcon icon={faPlus} className="icon-inline" />,
      pending: <FontAwesomeIcon icon={faSpinner} className="icon-inline fa-spin" />,
      complete: <FontAwesomeIcon icon={faCheck} className="icon-inline" />,
      error: <FontAwesomeIcon icon={faSync} className="icon-inline" />,
    },
    disabledStates: ['pending', 'complete'],
    onClick: handleImport,
  };

  return (
    <Card className="mt-1 mb-3">
      <Card.Header
        className="library-authoring-course-import-block-card-header"
        title={course.title}
        subtitle={`${course.org} • ${course.id}`}
        actions={(
          <ActionRow>
            <StatefulButton {...importButtonProps} />
          </ActionRow>
        )}
      />
    </Card>
  );
};

CourseImportListItem.defaultProps = {
  ongoingImportState: '',
};

CourseImportListItem.propTypes = {
  intl: intlShape.isRequired,
  course: courseShape.isRequired,
  libraryId: PropTypes.string.isRequired,
  importBlocksHandler: PropTypes.func.isRequired,
  ongoingImportState: PropTypes.string,
  taskPaginationParams: paginationParamsShape.isRequired,
};

export default injectIntl(CourseImportListItem);
