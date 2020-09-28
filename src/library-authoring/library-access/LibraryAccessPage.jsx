/*
Library Access Page. This component handles team permissions access.
 */
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Alert, Button, Col, Row,
} from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '@edx/frontend-platform/react';
import messages from './messages';
import { LoadingPage } from '../../generic';
import { fetchLibraryDetail } from '../library-detail/data';
import LibraryAccessFormContainer from './LibraryAccessForm';
import {
  LIBRARY_ACCESS, libraryShape, LOADING_STATUS, ROUTES, truncateErrorMessage,
} from '../common/data';
import {
  addUser,
  clearAccess,
  clearAccessErrors,
  fetchUserList,
  libraryAccessInitialState,
  libraryUserShape,
  selectLibraryAccess,
} from './data';
// eslint-disable-next-line import/no-named-as-default
import UserAccessContainer from './UserAccessContainer';


/**
 * LibraryAccessPage:
 * Template component for the access management page for libraries.
 */
const LibraryAccessPage = ({
  intl, library, users, setShowAdd, errorMessage, showAdd, handleDismissAlert, multipleAdmins, isAdmin,
}) => (
  <div className="library-access-wrapper">
    <div className="wrapper-mast wrapper">
      <header className="mast has-actions has-navigation has-subtitle">
        <div className="page-header">
          <small className="subtitle">{intl.formatMessage(messages['library.access.page.parent_heading'])}</small>
          <h1 className="page-header-title">{intl.formatMessage(messages['library.access.page.heading'])}</h1>
        </div>
        <nav className="nav-actions">
          <ul>
            {isAdmin && (
              <li className="nav-item">
                <Button
                  variant="success"
                  onClick={() => setShowAdd(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="pr-3 icon-inline" />
                  {intl.formatMessage(messages['library.access.new.user'])}
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </div>
    <div className="wrapper-content wrapper">
      <section className="content">
        <article className="content-primary" role="main">
          {errorMessage
          && (
            <Alert
              variant="danger"
              onClose={() => handleDismissAlert()}
              dismissible
            >
              {truncateErrorMessage(errorMessage)}
            </Alert>
          )}
          {showAdd
          && (
            <LibraryAccessFormContainer
              setShowAdd={(value) => setShowAdd(value)}
              library={library}
            />
          )}
          <Row>
            { ((users && users.map((user) => (
              (
                <UserAccessContainer
                  intl={intl}
                  user={user}
                  key={user.username}
                  multipleAdmins={multipleAdmins}
                  library={library}
                  isAdmin={isAdmin}
                />
              ))))
              || (
                <Col cols={12} className="text-center">
                  <LoadingPage loadingMessage={intl.formatMessage(messages['library.access.loading.message'])} />
                </Col>
              )
            )}
          </Row>
          {isAdmin && (
            <div className="well mt-3">
              <Row className="h-100">
                <Col xs={12} md={8} className="my-auto">
                  <h2 className="h2 font-weight-bold">{intl.formatMessage(messages['library.access.well.title'])}</h2>
                  <p>{intl.formatMessage(messages['library.access.well.text'])}</p>
                </Col>
                <Col xs={12} md={4} lg={3} className="my-auto offset-lg-1 text-center text-md-right">
                  <Button variant="success" size="lg" onClick={() => setShowAdd(true)}>
                    <FontAwesomeIcon icon={faPlus} className="pr-1 icon-inline" />
                    <strong>{intl.formatMessage(messages['library.access.well.button'])}</strong>
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </article>
        <aside className="content-supplementary">
          <div className="bit">
            <h3 className="title title-3">{intl.formatMessage(messages['library.access.aside.title'])}</h3>
            <p>{intl.formatMessage(messages['library.access.aside.text.first'])}</p>
            <p>{intl.formatMessage(messages['library.access.aside.text.second'])}</p>
            <p>{intl.formatMessage(messages['library.access.aside.text.third'])}</p>
            <p>{intl.formatMessage(messages['library.access.aside.text.fourth'])}</p>

          </div>
        </aside>
      </section>
    </div>
  </div>
);

LibraryAccessPage.defaultProps = { ...libraryAccessInitialState };

LibraryAccessPage.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
  users: PropTypes.arrayOf(libraryUserShape),
  setShowAdd: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  showAdd: PropTypes.bool.isRequired,
  handleDismissAlert: PropTypes.func.isRequired,
  multipleAdmins: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

/**
 * LibraryAccessPageContainer:
 * Widget for editing the list of users with access to this content library.
 * This wraps LibraryAccessPage and handles API calls to fetch/write data, as well as displaying
 * a loading message during initial loading. This separation allows LibraryAccessPage to be tested
 * in unit tests without needing to mock the API.
 */
const LibraryAccessPageContainer = ({
  intl, users, errorMessage, ...props
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const multipleAdmins = !!(users && users.filter((user) => user.access_level === 'admin').length >= 2);
  const { authenticatedUser } = useContext(AppContext);
  let libraryAdmin = (users && users.filter((user) => (
    (user.username === authenticatedUser.username)
    && (user.access_level === LIBRARY_ACCESS.ADMIN)
  )));
  // This array is special somehow and despite being empty will eval as true.
  libraryAdmin = !!(libraryAdmin || []).length;
  const isAdmin = !!(authenticatedUser.administrator || libraryAdmin);

  // Explicit empty dependencies means on mount.
  useEffect(() => {
    const { libraryId } = props.match.params;
    if (props.library === null) {
      props.fetchLibraryDetail({ libraryId });
    }
    if (users === null) {
      props.fetchUserList({ libraryId });
    }
  }, []);
  // Returning a function with an empty dependencies list indicates this is to be done on unmount,
  // rather than on data change.
  useEffect(() => () => {
    props.clearAccess();
  }, []);

  useEffect(() => {
    // To be done on each data reload. If the user's list doesn't contain the user, or if the user now no longer has
    // staff privs, we need to send the user back to the libraries index.
    if (users === null) {
      // Still loading. Ignore.
      return;
    }
    const admin = users.filter((user) => user.username === authenticatedUser.username)[0];
    if ((admin === undefined) || admin.access_level === LIBRARY_ACCESS.READ) {
      props.history.replace(ROUTES.List.HOME);
    }
  });

  const handleDismissAlert = () => {
    props.clearAccessErrors();
  };

  const renderLoading = () => (
    <LoadingPage loadingMessage={intl.formatMessage(messages['library.access.loading.message'])} />
  );

  const renderContent = () => (
    <LibraryAccessPage
      setShowAdd={setShowAdd}
      errorMessage={errorMessage}
      handleDismissAlert={handleDismissAlert}
      intl={intl}
      showAdd={showAdd}
      users={users}
      multipleAdmins={multipleAdmins}
      isAdmin={isAdmin}
    />
  );

  let content;
  if (props.loadingStatus === LOADING_STATUS.LOADING) {
    content = renderLoading();
  } else {
    content = renderContent();
  }

  return (
    <div className="container-fluid">
      {content}
    </div>
  );
};


LibraryAccessPageContainer.propTypes = {
  // errorMessage: PropTypes.string,
  intl: intlShape.isRequired,
  library: libraryShape,
  errorMessage: PropTypes.string,
  fetchLibraryDetail: PropTypes.func.isRequired,
  fetchUserList: PropTypes.func.isRequired,
  clearAccess: PropTypes.func.isRequired,
  clearAccessErrors: PropTypes.func.isRequired,
  loadingStatus: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
  users: PropTypes.arrayOf(libraryUserShape),
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

LibraryAccessPageContainer.defaultProps = { ...libraryAccessInitialState };

export default connect(
  selectLibraryAccess,
  {
    addUser,
    clearAccessErrors,
    clearAccess,
    fetchLibraryDetail,
    fetchUserList,
  },
)(injectIntl(withRouter(LibraryAccessPageContainer)));
