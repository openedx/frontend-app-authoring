/*
Component for displaying and modifying a user's access level for a library.
 */
import {
  ActionRow,
  Badge,
  Button,
  Card,
  Col,
  Icon,
  IconButton,
  ModalDialog,
} from '@edx/paragon';
import { DeleteOutline } from '@edx/paragon/icons';
import React, { useContext, useState } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { LIBRARY_ACCESS, libraryShape } from '@src/library-authoring/common/data';
import {
  libraryUserShape, removeUserAccess, selectLibraryAccess, setUserAccess,
} from './data';
import messages from './messages';

export const UserAccessWidget = ({
  intl, library, user, multipleAdmins, setAccessLevel, isUser, showRemoveModal, setShowRemoveModal,
  isAdmin, adminLocked, removeAccess,
}) => (
  <Card className="mb-4 p-3">
    <Badge className={`position-absolute ml-1 mt-n4 permy ${user.access_level}`}>
      <strong>{intl.formatMessage(messages[`library.access.info.${user.access_level}`])}</strong>&nbsp;
      <span className="font-weight-normal text-light-500 small">{isUser && intl.formatMessage(messages['library.access.info.self'])}</span>
    </Badge>
    <ActionRow className="my-2">
      <Col>
        <div className="title title-2">
          <span className="font-weight-bold">{user.username}</span>
        </div>
        <div className="title small">
          <a href={`mailto:${user.email}`}>{user.email}</a>
        </div>
      </Col>
      <ActionRow.Spacer />
      {isAdmin && (
        <>
          {(user.access_level === LIBRARY_ACCESS.ADMIN) && adminLocked && (
            <small className="text-muted mr-2.5">{intl.formatMessage(messages['library.access.info.admin_unlock'])}</small>
          )}
          {user.access_level === LIBRARY_ACCESS.ADMIN && multipleAdmins && (
            <Button variant="tertiary" onClick={() => setAccessLevel(LIBRARY_ACCESS.AUTHOR)} size="sm">
              {intl.formatMessage(messages['library.access.remove_admin'])}
            </Button>
          )}
          {user.access_level === LIBRARY_ACCESS.READ && (
            <Button variant="primary" onClick={() => setAccessLevel(LIBRARY_ACCESS.AUTHOR)} size="sm">
              {intl.formatMessage(messages['library.access.add_author'])}
            </Button>
          )}
          {user.access_level === LIBRARY_ACCESS.AUTHOR && (
            <>
              <Button variant="tertiary" onClick={() => setAccessLevel(LIBRARY_ACCESS.READ)} size="sm">
                {intl.formatMessage(messages['library.access.remove_author'])}
              </Button>
              <Button variant="primary" onClick={() => setAccessLevel(LIBRARY_ACCESS.ADMIN)} size="sm">
                {intl.formatMessage(messages['library.access.add_admin'])}
              </Button>
            </>
          )}
          {(!((user.access_level === LIBRARY_ACCESS.ADMIN) && adminLocked)) && (
            <>
              <IconButton
                src={DeleteOutline}
                iconAs={Icon}
                onClick={() => setShowRemoveModal(true)}
                aria-label={
                  intl.formatMessage(messages['library.access.remove_user'])
                }
              />
              <ModalDialog
                isOpen={showRemoveModal}
                onClose={() => setShowRemoveModal(false)}
              >
                <ModalDialog.Header>
                  <ModalDialog.Title>
                    {intl.formatMessage(messages['library.access.modal.remove.title'])}
                  </ModalDialog.Title>
                </ModalDialog.Header>
                <ModalDialog.Body>
                  {intl.formatMessage(
                    messages['library.access.modal.remove.body'],
                    { library: library.title, email: user.email },
                  )}
                </ModalDialog.Body>
                <ModalDialog.Footer>
                  <ActionRow>
                    <ModalDialog.CloseButton variant="tertiary">
                      {intl.formatMessage(
                        messages['library.access.modal.remove.footer.cancel'],
                      )}
                    </ModalDialog.CloseButton>
                    <Button onClick={removeAccess}>
                      {intl.formatMessage(
                        messages['library.access.modal.remove.footer.delete'],
                      )}
                    </Button>
                  </ActionRow>
                </ModalDialog.Footer>
              </ModalDialog>
            </>
          )}
        </>
      )}
    </ActionRow>
  </Card>
);
export const UserAccessWidgetContainerBase = ({
  user, ...props
}) => {
  const { authenticatedUser } = useContext(AppContext);
  const isUser = authenticatedUser.username === user.username;
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const adminLocked = user.access_level === LIBRARY_ACCESS.ADMIN && !props.multipleAdmins;
  const libraryId = props.library.id;
  const setAccessLevel = (level) => props.setUserAccess({ libraryId, user, level });
  const removeAccess = () => props.removeUserAccess({ libraryId, user });

  const newProps = {
    ...props,
    showRemoveModal,
    setShowRemoveModal,
    isUser,
    user,
    adminLocked,
    setAccessLevel,
    removeAccess,
  };
  return <UserAccessWidget {...newProps} />;
};

UserAccessWidgetContainerBase.propTypes = {
  user: libraryUserShape.isRequired,
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  multipleAdmins: PropTypes.bool.isRequired,
  setUserAccess: PropTypes.func.isRequired,
  removeUserAccess: PropTypes.func.isRequired,
};

UserAccessWidget.propTypes = {
  ...UserAccessWidgetContainerBase.propTypes,
  isUser: PropTypes.bool.isRequired,
  showRemoveModal: PropTypes.bool.isRequired,
  setShowRemoveModal: PropTypes.func.isRequired,
};

const UserAccessWidgetContainer = connect(
  selectLibraryAccess,
  {
    setUserAccess,
    removeUserAccess,
  },
)(injectIntl(UserAccessWidgetContainerBase));

export default UserAccessWidgetContainer;
