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
import { getMainMenuDropdown, getOutlineLink } from './utils';

const StudioHeaderWrapperBase = ({ intl, ...props }) => {
  // loadingStatus will only ever be 'loaded' on pages
  // where we have library details, so we can use that to
  // determine if we want to render the ContentTitleBlock or not
  const { loadingStatus, library } = props;
  const { libraryId } = useParams();
  const isHiddenMainMenu = !libraryId || !library?.id;
  const outlineLink = getOutlineLink(loadingStatus, libraryId);
  const mainMenuDropdowns = getMainMenuDropdown(loadingStatus, libraryId, intl);

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
