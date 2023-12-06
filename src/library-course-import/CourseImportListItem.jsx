import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Card,
  ActionRow,
  StatefulButton,
  Icon,
} from '@edx/paragon';
import {
  Add,
  Check,
  SpinnerSimple,
  Sync,
} from '@edx/paragon/icons';

import { paginationParamsShape } from '@src/library-authoring/common';
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
      default: <Icon src={Add} />,
      pending: <Icon src={SpinnerSimple} className="icon-spin" />,
      complete: <Icon src={Check} />,
      error: <Icon src={Sync} />,
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
        size="sm"
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
