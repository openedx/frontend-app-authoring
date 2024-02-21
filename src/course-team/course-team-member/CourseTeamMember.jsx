import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Button,
  Icon,
  IconButtonWithTooltip,
  MailtoLink,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import messages from './messages';
import { USER_ROLES, BADGE_STATES } from '../constants';

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
  const badgeColor = isAdminRole ? BADGE_STATES.admin : BADGE_STATES.staff;

  return (
    <div className="course-team-member" data-testid="course-team-member">
      <div className="member-info">
        <Badge className={`badge-current-user bg-${badgeColor} text-light-100`}>
          {isAdminRole
            ? intl.formatMessage(messages.roleAdmin)
            : intl.formatMessage(messages.roleStaff)}
          {currentUserEmail === email && (
            <span className="badge-current-user x-small text-light-500">{intl.formatMessage(messages.roleYou)}</span>
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
            <IconButtonWithTooltip
              src={DeleteOutline}
              tooltipContent={intl.formatMessage(messages.deleteUserButton)}
              onClick={() => onDelete(email)}
              iconAs={Icon}
              alt={intl.formatMessage(messages.deleteUserButton)}
              data-testid="delete-button"
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
