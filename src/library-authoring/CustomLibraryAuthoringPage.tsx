/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import { Container, Tab, Tabs } from '@openedx/paragon';
import React from 'react';
import { Helmet } from 'react-helmet';
import { LmsBook } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';
// import SubHeader from '../generic/sub-header/SubHeader';
import {
  ClearFiltersButton, FilterByBlockType, FilterByTags, SearchContextProvider, SearchKeywordsField, SearchSortWidget,
} from '../search-manager';
import messages from './messages';
import LibraryContent, { ContentType } from './LibraryContent';
import { LibrarySidebar } from './library-sidebar';

const CustomLibraryAuthoringPage = ({
  libraryData,
  extraFilter,
  subHeaderTitle,
  intl,
  //   componentPickerMode,
  headerActions,
  //   breadcumbs,
  activeKey,
  handleTabChange,
  sidebarComponentInfo,
//   libraryId,
}) => {
  const navigate = useNavigate();
  return (
    <div className="d-flex library-authoring-page-container">
      <div className="flex-grow-1 library-authoring-page-content">
        <div className="ca-breadcrumb-bg">
          <div className="ca-breadcrumb-container">
            <div className="ca-breadcrumb d-flex align-items-center">
              <span className="ca-breadcrumb-icon collection-breadcrumb-icon" onClick={() => navigate('/libraries')}>
                <LmsBook className="custom-icon" />
                Content Libraries
              </span>
              <span className="ca-breadcrumb-divider">/</span>
              <span className="ca-breadcrumb-current">{subHeaderTitle || 'Loading...'}</span>
            </div>
            <div className="ca-title library-breadcrumb-title">
              {subHeaderTitle || 'Loading...'}
            </div>
          </div>
        </div>
        <Helmet><title>{libraryData.title} | {process.env.SITE_NAME}</title></Helmet>
        <Container className="library-authoring-page">
          <SearchContextProvider
            extraFilter={extraFilter}
          >
            {/* <SubHeader
              title={subHeaderTitle}
              subtitle={!componentPickerMode ? intl.formatMessage(messages.headingSubtitle) : undefined}
              breadcrumbs={breadcumbs}
              headerActions={headerActions}
            /> */}
            <div className="sub-header-container d-flex justify-content-between align-items-center">
              <SearchKeywordsField className="w-40" />
              {headerActions}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e6e6', margin: '0 0 0 0' }} />
            <div className="d-flex mt-3 align-items-center">
              <FilterByTags />
              <FilterByBlockType />
              <ClearFiltersButton />
              <div className="flex-grow-1" />
              <SearchSortWidget />
            </div>
            <Tabs
              variant="tabs"
              activeKey={activeKey}
              onSelect={handleTabChange}
              className="my-3"
            >
              <Tab eventKey={ContentType.home} title={intl.formatMessage(messages.homeTab)} />
              <Tab eventKey={ContentType.components} title={intl.formatMessage(messages.componentsTab)} />
              <Tab eventKey={ContentType.collections} title={intl.formatMessage(messages.collectionsTab)} />
            </Tabs>
            <LibraryContent contentType={activeKey} />
          </SearchContextProvider>
        </Container>
      </div>
      {!!sidebarComponentInfo?.type && (
      <div className="library-authoring-sidebar box-shadow-left-1 bg-white" data-testid="library-sidebar">
        <LibrarySidebar />
      </div>
      )}
    </div>
  );
};

export default CustomLibraryAuthoringPage;
