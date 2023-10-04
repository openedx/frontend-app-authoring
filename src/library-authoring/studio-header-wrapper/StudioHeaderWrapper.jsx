/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import PropTypes from 'prop-types';
import { StudioHeader } from '@edx/frontend-component-header';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import selectLibraryDetail from '../common/data/selectors';
import {
  fetchLibraryDetail,
} from '../author-library/data';
import messages from './messages';
import {
  ROUTES,
} from '../common';

const StudioHeaderWrapperBase = ({ intl, ...props }) => {
  // loadingStatus will only ever be 'loaded' on pages
  // where we have library details, so we can use that to
  // determine if we want to render the ContentTitleBlock or not
  const { loadingStatus, library } = props;
  const { libraryId } = useParams();
  const isHiddenMainMenu = !libraryId && loadingStatus === 'loaded';
  const outlineLink = `/library/${libraryId}`;
  const mainMenuDropdowns = [
    {
      id: `${intl.formatMessage(messages['library.header.settings.menu'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['library.header.settings.menu']),
      items: [
        {
          href: ROUTES.Detail.EDIT_SLUG(libraryId),
          title: intl.formatMessage(messages['library.header.settings.details']),
        },
        {
          href: ROUTES.Detail.ACCESS_SLUG(libraryId),
          title: intl.formatMessage(messages['library.header.settings.access']),
        },
        {
          href: ROUTES.Detail.IMPORT_SLUG(libraryId),
          title: intl.formatMessage(messages['library.header.settings.import']),
        },
      ],
    },
  ];

  return (
    <div className="site-header-desktop">
      <StudioHeader
        {...{
          org: library?.org,
          title: library?.title,
          isHiddenMainMenu,
          mainMenuDropdowns,
          outlineLink,
        }}
      />
    </div>
  );
};

StudioHeaderWrapperBase.propTypes = {
  intl: intlShape.isRequired,
  loadingStatus: PropTypes.string.isRequired,
  library: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    org: PropTypes.string.isRequired,
  }).isRequired,
};

const StudioHeaderWrapper = connect(
  selectLibraryDetail,
  {
    fetchLibraryDetail,
  },
)(injectIntl(StudioHeaderWrapperBase));

export default StudioHeaderWrapper;
