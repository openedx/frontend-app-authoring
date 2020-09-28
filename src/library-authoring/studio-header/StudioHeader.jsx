import React, { useContext } from 'react';
import { Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dropdown, Icon } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { ensureConfig } from '@edx/frontend-platform/config';

import { ROUTES, libraryShape } from '../common';
import { selectLibraryDetail } from '../library-detail';
import StudioLogo from './assets/studio-logo.png';
import messages from './messages';

ensureConfig([
  'STUDIO_BASE_URL',
  'LOGOUT_URL',
], 'Library header');

const StudioHeader = ({ intl, library }) => {
  const { authenticatedUser, config } = useContext(AppContext);

  return (
    <div className="wrapper-header wrapper">
      <header className="primary" role="banner">
        <div className="wrapper-l">
          <h1 className="branding">
            <Link to="/">
              <img
                src={StudioLogo}
                alt={intl.formatMessage(messages['library.header.logo.alt'])}
              />
            </Link>
          </h1>
          <Route path="/library">
            {library
            && (
              <>
                <h2 className="info-library">
                  <Link to={library.url} className="library-link">
                    <span className="library-org">{library.org}</span>
                    <span className="library-id">{library.id}</span>
                    <span className="library-title" title={library.title}>{library.title}</span>
                  </Link>
                </h2>
                <nav className="p-4 mt-2">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-light">
                      {intl.formatMessage(messages['library.header.settings.menu'])}
                      <Icon className="fa fa-caret-down pl-3" alt="" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="p-4 mt-1 fade">
                      <Dropdown.Item className="p-0" as={Link} to={ROUTES.Detail.EDIT_SLUG(library.id)}>{intl.formatMessage(messages['library.header.settings.details'])}</Dropdown.Item>
                      <Dropdown.Item className="p-0" as={Link} to={ROUTES.Detail.ACCESS_SLUG(library.id)}>{intl.formatMessage(messages['library.header.settings.access'])}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </nav>
              </>
            )}
          </Route>
        </div>
        <div className="wrapper-r">
          {authenticatedUser !== null
          && (
          <nav className="p-4 mt-2" aria-label={intl.formatMessage(messages['library.header.account.label'])}>
            <ol>
              <li className="nav-item nav-account-help">
                <h3 className="title">
                  <a
                    href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                    title={intl.formatMessage(messages['library.header.nav.help.title'])}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {intl.formatMessage(messages['library.header.nav.help'])}
                  </a>
                </h3>
              </li>
              <li className="nav-item nav-account-user">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-light">
                    {authenticatedUser.username}
                    <Icon className="fa fa-caret-down pl-3" alt="" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-right p-4 mt-1 fade">
                    <Dropdown.Item className="p-0 mb-3" href={config.STUDIO_BASE_URL}>{intl.formatMessage(messages['library.header.account.studiohome'])}</Dropdown.Item>
                    <Dropdown.Item className="p-0 mb-3" href={`${config.STUDIO_BASE_URL}/maintenance`}>{intl.formatMessage(messages['library.header.account.maintenance'])}</Dropdown.Item>
                    <Dropdown.Item className="p-0" href={config.LOGOUT_URL}>{intl.formatMessage(messages['library.header.account.signout'])}</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ol>
          </nav>
          )}
        </div>
      </header>
    </div>
  );
};

StudioHeader.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
};

StudioHeader.defaultProps = {
  library: null,
};

export default connect(
  selectLibraryDetail,
)(injectIntl(StudioHeader));
