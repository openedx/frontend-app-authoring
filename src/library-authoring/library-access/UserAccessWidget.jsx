/*
Component for displaying and modifying a user's access level for a library.
 */
import {
  Badge,
  Button, Card, Col, Modal, Row,
} from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import React, { useContext, useState } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  libraryUserShape, removeUserAccess, selectLibraryAccess, setUserAccess,
} from './data';
import { LIBRARY_ACCESS, libraryShape } from '../common/data';
import commonMessages from '../common/messages';
import messages from './messages';

export const UserAccessWidget = ({
  intl, library, user, multipleAdmins, setAccessLevel, removeAccess, isUser, showRemoveModal, setShowRemoveModal,
  showDeprivModal, setShowDeprivModal, isAdmin, adminLocked,
}) => (
  <Col xs={12} className="py-3">
    <Card>
      <Card.Body>
        <Badge className={`position-absolute ml-1 permy ${user.access_level}`}>
          <strong>{intl.formatMessage(messages[`library.access.info.${user.access_level}`])}</strong>&nbsp;
          <span className="font-weight-normal">{isUser && intl.formatMessage(messages['library.access.info.self'])}</span>
        </Badge>
        <Row className="py-3">
          <Col xs={12} md={6}>
            <span className="title title-2">
              <span className="font-weight-bold">{user.username}</span>
            </span>
            <span className="title px-2">
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </span>
          </Col>
          {isAdmin && (
          <Col xs={12} md={6}>
            <Row>
              {(user.access_level === LIBRARY_ACCESS.ADMIN) && adminLocked && (
              <Col xs={12} className="text-center text-md-right">
                <small>{intl.formatMessage(messages['library.access.info.admin_unlock'])}</small>
              </Col>
              )}
              {user.access_level === LIBRARY_ACCESS.ADMIN && multipleAdmins && (
              <Col xs={10} className="text-left text-md-right">
                <Button size="lg" variant="secondary" onClick={() => setShowDeprivModal(true)}>
                  {intl.formatMessage(messages['library.access.remove_admin'])}
                </Button>
                <Modal
                  open={showDeprivModal}
                  title={intl.formatMessage(messages['library.access.modal.remove_admin.title'])}
                  onClose={() => setShowDeprivModal(false)}
                  body={(
                    <div>
                      <p>
                        {intl.formatMessage(
                          messages['library.access.modal.remove_admin.body'],
                          { library: library.title, email: user.email },
                        )}
                      </p>
                    </div>
                  )}
                  buttons={[
                    <Button
                      onClick={() => setAccessLevel(LIBRARY_ACCESS.AUTHOR).then(setShowDeprivModal(false))}
                    >
                      {intl.formatMessage(commonMessages['library.common.forms.button.yes'])}
                    </Button>,
                  ]}
                />
              </Col>
              )}
              {user.access_level === LIBRARY_ACCESS.READ && (
              <Col xs={10} className="text-left text-md-right">
                <Button size="lg" variant="primary" onClick={() => setAccessLevel(LIBRARY_ACCESS.AUTHOR)}>
                  {intl.formatMessage(messages['library.access.add_author'])}
                </Button>
              </Col>
              )}
              {user.access_level === LIBRARY_ACCESS.AUTHOR && (
                <>
                  <Col xs={5} className="text-left text-md-right pl-md-1">
                    <Button size="lg" variant="secondary" onClick={() => setAccessLevel(LIBRARY_ACCESS.READ)}>
                      {intl.formatMessage(messages['library.access.remove_author'])}
                    </Button>
                  </Col>
                  <Col xs={5} className="text-left text-md-right pl-md-1">
                    <Button size="lg" variant="primary" onClick={() => setAccessLevel(LIBRARY_ACCESS.ADMIN)}>
                      {intl.formatMessage(messages['library.access.add_admin'])}
                    </Button>
                  </Col>
                </>
              )}
              {(!((user.access_level === LIBRARY_ACCESS.ADMIN) && adminLocked)) && (
              <Col xs={2} className="text-right text-md-center">
                <Button
                  size="lg"
                  variant="danger"
                  onClick={() => setShowRemoveModal(true)}
                  aria-label={
                    intl.formatMessage(messages['library.access.remove_user'])
                  }
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
                <Modal
                  open={showRemoveModal}
                  title={intl.formatMessage(messages['library.access.modal.remove.title'])}
                  onClose={() => setShowRemoveModal(false)}
                  body={(
                    <div>
                      <p>
                        {intl.formatMessage(
                          messages['library.access.modal.remove.body'],
                          { library: library.title, email: user.email },
                        )}
                      </p>
                    </div>
                    )}
                  buttons={[
                    <Button onClick={() => removeAccess()}>
                      {intl.formatMessage(commonMessages['library.common.forms.button.yes'])}
                    </Button>,
                  ]}
                />
              </Col>
              )}
            </Row>
          </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  </Col>
);
export const UserAccessWidgetContainerBase = ({
  user, ...props
}) => {
  const { authenticatedUser } = useContext(AppContext);
  const isUser = authenticatedUser.username === user.username;
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showDeprivModal, setShowDeprivModal] = useState(false);
  const adminLocked = user.access_level === LIBRARY_ACCESS.ADMIN && !props.multipleAdmins;

  const setAccessLevel = (level) => props.setUserAccess({ libraryId: props.library.id, user, level });

  const removeAccess = () => props.removeUserAccess({ libraryId: props.library.id, user });

  const newProps = {
    ...props,
    showRemoveModal,
    setShowRemoveModal,
    showDeprivModal,
    setShowDeprivModal,
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
  showDeprivModal: PropTypes.bool.isRequired,
  setShowDeprivModal: PropTypes.func.isRequired,
};

const UserAccessWidgetContainer = connect(
  selectLibraryAccess,
  {
    setUserAccess,
    removeUserAccess,
  },
)(injectIntl(UserAccessWidgetContainerBase));

export default UserAccessWidgetContainer;
