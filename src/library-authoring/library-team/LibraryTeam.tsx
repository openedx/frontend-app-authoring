import React, { useCallback, useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  Button,
  Container,
  Form,
  useToggle,
} from '@openedx/paragon';
import { Add as IconAdd } from '@openedx/paragon/icons';

import AlertError from '../../generic/alert-error';
import Loading from '../../generic/Loading';
import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { LibraryAccessLevel } from '../data/api';
import {
  useContentLibrary,
  useLibraryTeam,
  useAddLibraryTeamMember,
  useDeleteLibraryTeamMember,
  useUpdateLibraryTeamMember,
  useUpdateLibraryMetadata,
} from '../data/apiHooks';
import LibraryTeamMember from './LibraryTeamMember';
import AddLibraryTeamMember from './AddLibraryTeamMember';
import { LibraryRole } from './constants';
import messages from './messages';

const LibraryTeam: React.FC<Record<never, never>> = () => {
  const {
    libraryId,
  } = useLibraryContext();

  const intl = useIntl();

  const {
    data: libraryData,
    isLoading: isLibraryLoading,
  } = useContentLibrary(libraryId);

  const {
    data: libraryTeamMembers,
    isLoading: isTeamLoading,
    isError,
    error,
  } = useLibraryTeam(libraryId);

  const [
    isAddLibraryTeamMemberOpen,
    openAddLibraryTeamMember,
    closeAddLibraryTeamMember,
  ] = useToggle(false);

  const { showToast } = useContext(ToastContext);

  const addMember = useAddLibraryTeamMember(libraryId);
  const onAddMember = useCallback(
    (data: { email: string }) => {
      const { email } = data;
      addMember.mutateAsync({
        libraryId,
        email,
        // New members are created as Readers
        accessLevel: LibraryRole.Reader.toString() as LibraryAccessLevel,
      }).then(() => {
        showToast(intl.formatMessage(messages.addMemberSuccess));
      }).catch((addMemberError) => {
        const errorData = typeof addMemberError === 'object' ? addMemberError.response?.data : undefined;
        if (errorData && 'email' in errorData) {
          const errorEmail = errorData.email;
          if (typeof errorEmail === 'string') {
            showToast(intl.formatMessage(messages.addMemberSpecificError, {
              message: errorEmail,
            }));
          } else {
            showToast(intl.formatMessage(messages.addMemberSpecificError, {
              message: errorEmail[0],
            }));
          }
        } else {
          showToast(intl.formatMessage(messages.addMemberError));
        }
      });
      closeAddLibraryTeamMember();
    },
    [libraryId, libraryTeamMembers],
  );

  const updateMember = useUpdateLibraryTeamMember(libraryId);
  const onChangeRole = useCallback(
    (username: string, role: LibraryRole) => {
      updateMember.mutateAsync({
        libraryId,
        username,
        accessLevel: role.toString() as LibraryAccessLevel,
      }).then(() => {
        showToast(intl.formatMessage(messages.updateMemberSuccess));
      }).catch(() => {
        showToast(intl.formatMessage(messages.updateMemberError));
      });
    },
    [libraryId, libraryTeamMembers],
  );

  const deleteMember = useDeleteLibraryTeamMember(libraryId);
  const onDeleteRole = useCallback(
    (username: string) => {
      deleteMember.mutateAsync({
        libraryId,
        username,
      }).then(() => {
        showToast(intl.formatMessage(messages.deleteMemberSuccess));
      }).catch(() => {
        showToast(intl.formatMessage(messages.deleteMemberError));
      });
    },
    [libraryId, libraryTeamMembers],
  );

  const updateLibrary = useUpdateLibraryMetadata();
  const onChangeAllowPublicRead = useCallback(
    (event) => {
      const allowPublicRead = event.target.checked;
      if (libraryData && allowPublicRead !== libraryData.allowPublicRead) {
        updateLibrary.mutateAsync({
          id: libraryId,
          allow_public_read: allowPublicRead,
        }).then(() => {
          showToast(intl.formatMessage(messages.updateLibrarySuccess));
        }).catch(() => {
          showToast(intl.formatMessage(messages.updateLibraryError));
        });
      }
    },
    [libraryData],
  );

  if (isLibraryLoading || isTeamLoading) {
    return <Loading />;
  }

  const { email: currentUserEmail, administrator: isGlobalStaff } = getAuthenticatedUser();
  const isLibraryAdmin = libraryTeamMembers ? (
    libraryTeamMembers.filter(
      ({ email, accessLevel }) => (
        accessLevel === LibraryRole.Admin.toString() && email === currentUserEmail
      ),
    ).length === 1
  ) : false;
  const canChangeRoles = libraryData ? libraryData.canEditLibrary && (isLibraryAdmin || isGlobalStaff) : false;

  // Is there only one Admin member in the Team? We'll prevent that user from being demoted/deleted.
  const singleAdmin = libraryTeamMembers ? (
    libraryTeamMembers.filter(
      ({ accessLevel }) => accessLevel === LibraryRole.Admin.toString(),
    ).length === 1
  ) : false;

  return (
    <Container size="xl" className="library-team px-4">
      {!isAddLibraryTeamMemberOpen && (
        <div className="d-flex flex-column flex-md-row justify-content-between">
          <Form.Group
            size="sm"
            controlId="form-allow-public-read"
            className="form-field"
          >
            <Form.Switch
              id="form-allow-public-read"
              aria-describedby="form-allow-public-read-help"
              aria-label={intl.formatMessage(messages.allowPublicReadLabel)}
              checked={libraryData && libraryData.allowPublicRead}
              onChange={onChangeAllowPublicRead}
              disabled={!canChangeRoles}
            >
              <label htmlFor="form-allow-public-read">
                <FormattedMessage {...messages.allowPublicReadLabel} />
              </label>
            </Form.Switch>
            <Form.Text className="form-helper-text" id="form-allow-public-read-help">
              <span className="small">{intl.formatMessage(messages.allowPublicReadHelperText)}</span>
            </Form.Text>
          </Form.Group>
          {canChangeRoles && (
            <div className="ml-2 mb-2">
              <Button
                size="sm"
                variant="primary"
                iconBefore={IconAdd}
                onClick={openAddLibraryTeamMember}
              >
                <FormattedMessage {...messages.addTeamMemberButton} />
              </Button>
            </div>
          )}
        </div>
      )}
      {canChangeRoles && isAddLibraryTeamMemberOpen && (
        <AddLibraryTeamMember
          onSubmit={onAddMember}
          onCancel={closeAddLibraryTeamMember}
        />
      )}
      <section className="library-team-section mt-3">
        <div className="members-container">
          {libraryTeamMembers && libraryTeamMembers.length ? (
            libraryTeamMembers.map(({ username, accessLevel, email }) => (
              <LibraryTeamMember
                key={email}
                username={username}
                email={email}
                accessLevel={accessLevel}
                isCurrentUser={email === currentUserEmail}
                isSingleAdmin={singleAdmin && accessLevel === LibraryRole.Admin}
                canChangeRoles={canChangeRoles}
                onChangeRole={onChangeRole}
                onDeleteRole={onDeleteRole}
              />
            ))
          ) : <FormattedMessage {...messages.noMembersFound} />}
        </div>
      </section>
      {isError && <AlertError error={error} />}
    </Container>
  );
};

export default LibraryTeam;
