import React from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Button,
  Icon,
  IconButtonWithTooltip,
  MailtoLink,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import messages from './messages';
import {
  LibraryRole,
  ROLE_LABEL,
  CHANGE_ROLE_LABEL,
  ROLE_BADGE_VARIANT,
  ROLE_BUTTON_VARIANT,
} from './constants';

const MemberBadge = ({
  role,
  isCurrentUser,
}: {
  role: LibraryRole,
  isCurrentUser: boolean,
}) => {
  const roleMessage = ROLE_LABEL[role] ?? ROLE_LABEL[LibraryRole.Unknown];
  const variant = ROLE_BADGE_VARIANT[role] ?? ROLE_BADGE_VARIANT[LibraryRole.Unknown];

  return (
    <Badge className="badge-current-user" variant={variant}>
      {roleMessage && <FormattedMessage {...roleMessage} />}
      {isCurrentUser && (
        <span className="badge-current-user x-small text-light-500">
          <FormattedMessage {...messages.roleYou} />
        </span>
      )}
    </Badge>
  );
};

const LibraryTeamMember = ({
  username,
  email,
  accessLevel,
  isCurrentUser,
  isSingleAdmin,
  canChangeRoles,
  onChangeRole,
  onDeleteRole,
}: {
  username: string,
  email: string,
  accessLevel: string,
  canChangeRoles: boolean,
  isCurrentUser: boolean,
  isSingleAdmin: boolean,
  onChangeRole: (username: string, role: LibraryRole) => void,
  onDeleteRole: (username: string) => void,
}) => {
  const intl = useIntl();

  const role: LibraryRole = Object.values(LibraryRole).find((value) => value === accessLevel) ?? LibraryRole.Unknown;
  const availableRoles: LibraryRole[] = Object.values(LibraryRole).filter((value) => (
    value !== accessLevel && value !== LibraryRole.Unknown
  ));

  // Don't allow the only Admin user to be demoted or deleted
  const canChangeThisMember = canChangeRoles && !isSingleAdmin;

  return (
    // Share some styles from course-team for consistency
    <div className="course-team-member d-flex flex-column flex-sm-row">
      <div className="member-info w-100">
        <MemberBadge role={role} isCurrentUser={isCurrentUser} />
        <span className="member-info-name font-weight-bold">{username}</span>
        <MailtoLink to={email}>{email}</MailtoLink>
      </div>
      {canChangeThisMember ? (
        <div className="member-actions w-100 d-flex mt-2 justify-content-between">
          {availableRoles && availableRoles.length && availableRoles.map((newRole) => (
            <Button
              size="sm"
              key={newRole}
              variant={ROLE_BUTTON_VARIANT[newRole]}
              onClick={() => onChangeRole(username, newRole)}
            >
              {intl.formatMessage(CHANGE_ROLE_LABEL[newRole])}
            </Button>
          ))}

          <IconButtonWithTooltip
            src={DeleteOutline}
            tooltipContent={intl.formatMessage(messages.deleteMember)}
            onClick={() => onDeleteRole(username)}
            iconAs={Icon}
            alt={intl.formatMessage(messages.deleteMember)}
            title={intl.formatMessage(messages.deleteMember)}
          />
        </div>
      ) : (
        // We prevent the user from removing the last remaining Admin
        // user so that someone can still administrate this Library,
        // so show a message explaining why.
        canChangeRoles && (
          <div className="member-hint text-right">
            <FormattedMessage {...messages.cannotChangeRoleSingleAdmin} />
          </div>
        )
      )}
    </div>
  );
};

export default LibraryTeamMember;
