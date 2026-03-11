import React from 'react';
import PropTypes from 'prop-types';
import { Icon, IconButtonWithTooltip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DeleteOutline, EditOutline, Error as ErrorIcon } from '@openedx/paragon/icons';

import { isDateForUpdateValid } from './utils';
import messages from './messages';

const CourseUpdate = ({
  dateForUpdate,
  contentForUpdate,
  onEdit,
  onDelete,
  isDisabledButtons,
  canEdit,
  canDelete,
}) => {
  const intl = useIntl();

  return (
    <div className="course-update" data-testid="course-update">
      <div className="course-update-header">
        <span className="course-update-header__date small font-weight-bold">{dateForUpdate}</span>
        {!isDateForUpdateValid(dateForUpdate) && (
          <div className="course-update-header__error">
            <Icon src={ErrorIcon} alt={intl.formatMessage(messages.errorMessage)} />
            <p className="message-error small m-0">{intl.formatMessage(messages.errorMessage)}</p>
          </div>
        )}
        <div className="course-update-header__action">
          {canEdit && (
            <IconButtonWithTooltip
              aria-label={intl.formatMessage(messages.editButton)}
              tooltipContent={intl.formatMessage(messages.editButton)}
              src={EditOutline}
              iconAs={Icon}
              disabled={isDisabledButtons}
              data-testid="course-update-edit-button"
              onClick={onEdit}
            />
          )}
          {canDelete && (
            <IconButtonWithTooltip
              aria-label={intl.formatMessage(messages.deleteButton)}
              tooltipContent={intl.formatMessage(messages.deleteButton)}
              src={DeleteOutline}
              iconAs={Icon}
              disabled={isDisabledButtons}
              data-testid="course-update-delete-button"
              onClick={onDelete}
            />
          )}
        </div>
      </div>
      {Boolean(contentForUpdate) && (
        <div
          className="small text-gray-800"
          data-testid="course-update-content"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: contentForUpdate }}
        />
      )}
    </div>
  );
};

CourseUpdate.propTypes = {
  dateForUpdate: PropTypes.string.isRequired,
  contentForUpdate: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDisabledButtons: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};

CourseUpdate.defaultProps = {
  canEdit: true,
  canDelete: true,
};

export default CourseUpdate;
