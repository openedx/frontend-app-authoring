import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const CourseHandouts = ({ contentForHandouts, onEdit, isDisabledButtons }) => {
  const intl = useIntl();

  return (
    <div className="course-handouts" data-testid="course-handouts">
      <div className="course-handouts-header">
        <h2 className="course-handouts-header__title lead">{intl.formatMessage(messages.handoutsTitle)}</h2>
        <Button
          className="course-handouts-header__btn"
          variant="outline-primary"
          size="sm"
          onClick={onEdit}
          disabled={isDisabledButtons}
        >
          {intl.formatMessage(messages.editButton)}
        </Button>
      </div>
      <div
        className="small"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: contentForHandouts || '' }}
      />
    </div>
  );
};

CourseHandouts.propTypes = {
  contentForHandouts: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  isDisabledButtons: PropTypes.bool.isRequired,
};

export default CourseHandouts;
