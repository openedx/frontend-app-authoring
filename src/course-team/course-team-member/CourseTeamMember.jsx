import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge, Button, MailtoLink } from '@edx/paragon';
import { DeleteOutline as DeleteOutlineIcon } from '@edx/paragon/icons';

import messages from './messages';
import { USER_ROLES, BADGE_STATES } from '../../constants';

const CourseTeamMember = ({
  userName,
  role,
  email,
  onChangeRole,
  onDelete,
  currentUserEmail,
  isHideActions,
  isAllowActions,
}) => {
  const intl = useIntl();
  const isAdminRole = role === USER_ROLES.admin;

  return (
    <div className="course-team-member" data-testid="course-team-member">
      <div className="member-info">
        <Badge variant={isAdminRole ? BADGE_STATES.danger : BADGE_STATES.secondary} className="badge-current-user">
          {isAdminRole
            ? intl.formatMessage(messages.roleAdmin)
            : intl.formatMessage(messages.roleStaff)}
          {currentUserEmail === email && (
            <span className="badge-current-user">{intl.formatMessage(messages.roleYou)}</span>
          )}
        </Badge>
        <span className="member-info-name font-weight-bold">{userName}</span>
        <MailtoLink to={email}>{email}</MailtoLink>
      </div>
      {/* eslint-disable-next-line no-nested-ternary */}
      {isAllowActions && (
        !isHideActions ? (
          <div className="member-actions">
            <Button
              variant={isAdminRole ? 'tertiary' : 'primary'}
              size="sm"
              onClick={() => onChangeRole(email, isAdminRole ? USER_ROLES.staff : USER_ROLES.admin)}
            >
              {isAdminRole ? intl.formatMessage(messages.removeButton) : intl.formatMessage(messages.addButton)}
            </Button>
            <Button
              className="delete-button"
              variant="tertiary"
              size="sm"
              data-testid="delete-button"
              iconBefore={DeleteOutlineIcon}
              onClick={() => onDelete(email)}
            />
          </div>
        ) : (
          <div className="member-hint text-right">
            <span>{intl.formatMessage(messages.hint)}</span>
          </div>
        )
      )}
    </div>
  );
};

CourseTeamMember.propTypes = {
  userName: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  onChangeRole: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  currentUserEmail: PropTypes.string.isRequired,
  isHideActions: PropTypes.bool.isRequired,
  isAllowActions: PropTypes.bool.isRequired,
};

export default CourseTeamMember;
