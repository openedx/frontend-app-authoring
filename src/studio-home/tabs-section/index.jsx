import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useNavigate, useLocation } from 'react-router-dom';

import { getLoadingStatuses, getStudioHomeData } from '../data/selectors';
import messages from './messages';
import LibrariesTab from './libraries-tab';
import LibrariesV2Tab from './libraries-v2-tab/index';
import ArchivedTab from './archived-tab';
import CoursesTab from './courses-tab';
import { RequestStatus } from '../../data/constants';
import { fetchLibraryData } from '../data/thunks';
import { isMixedOrV1LibrariesMode, isMixedOrV2LibrariesMode } from './utils';

const TabsSection = ({
  intl,
  showNewCourseContainer,
  onClickNewCourse,
  isShowProcessing,
  dispatch,
  isPaginationCoursesEnabled,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const libMode = getConfig().LIBRARY_MODE;
  const TABS_LIST = {
    courses: 'courses',
    libraries: 'libraries',
    legacyLibraries: 'legacyLibraries',
    archived: 'archived',
    taxonomies: 'taxonomies',
  };

  const initTabKeyState = (pname) => {
    if (pname.includes('/libraries-v1')) {
      return TABS_LIST.legacyLibraries;
    }

    if (pname.includes('/libraries')) {
      return isMixedOrV2LibrariesMode(libMode)
        ? TABS_LIST.libraries
        : TABS_LIST.legacyLibraries;
    }

    // Default to courses tab
    return TABS_LIST.courses;
  };

  const [tabKey, setTabKey] = useState(initTabKeyState(pathname));

  // This is needed to handle navigating using the back/forward buttons in the browser
  useEffect(() => {
    // Handle special case when navigating directly to /libraries-v1
    // we need to call dispatch to fetch library data
    if (pathname.includes('/libraries-v1')) {
      dispatch(fetchLibraryData());
    }
    setTabKey(initTabKeyState(pathname));
  }, [pathname]);

  const {
    libraryAuthoringMfeUrl,
    redirectToLibraryAuthoringMfe,
    courses, librariesEnabled, libraries, archivedCourses,
    numPages, coursesCount,
  } = useSelector(getStudioHomeData);
  const {
    courseLoadingStatus,
    libraryLoadingStatus,
  } = useSelector(getLoadingStatuses);
  const isLoadingCourses = courseLoadingStatus === RequestStatus.IN_PROGRESS;
  const isFailedCoursesPage = courseLoadingStatus === RequestStatus.FAILED;
  const isLoadingLibraries = libraryLoadingStatus === RequestStatus.IN_PROGRESS;
  const isFailedLibrariesPage = libraryLoadingStatus === RequestStatus.FAILED;

  // Controlling the visibility of tabs when using conditional rendering is necessary for
  // the correct operation of iterating over child elements inside the Paragon Tabs component.
  const visibleTabs = useMemo(() => {
    const tabs = [];
    tabs.push(
      <Tab
        key={TABS_LIST.courses}
        eventKey={TABS_LIST.courses}
        title={intl.formatMessage(messages.coursesTabTitle)}
      >
        <CoursesTab
          coursesDataItems={courses}
          showNewCourseContainer={showNewCourseContainer}
          onClickNewCourse={onClickNewCourse}
          isShowProcessing={isShowProcessing}
          isLoading={isLoadingCourses}
          isFailed={isFailedCoursesPage}
          dispatch={dispatch}
          numPages={numPages}
          coursesCount={coursesCount}
          isEnabledPagination={isPaginationCoursesEnabled}
        />
      </Tab>,
    );

    if (archivedCourses?.length) {
      tabs.push(
        <Tab
          key={TABS_LIST.archived}
          eventKey={TABS_LIST.archived}
          title={intl.formatMessage(messages.archivedTabTitle)}
        >
          <ArchivedTab
            archivedCoursesData={archivedCourses}
            isLoading={isLoadingCourses}
            isFailed={isFailedCoursesPage}
          />
        </Tab>,
      );
    }

    if (librariesEnabled) {
      if (isMixedOrV2LibrariesMode(libMode)) {
        tabs.push(
          <Tab
            key={TABS_LIST.libraries}
            eventKey={TABS_LIST.libraries}
            title={intl.formatMessage(messages.librariesTabTitle)}
          >
            <LibrariesV2Tab
              libraryAuthoringMfeUrl={libraryAuthoringMfeUrl}
              redirectToLibraryAuthoringMfe={redirectToLibraryAuthoringMfe}
            />
          </Tab>,
        );
      }

      if (isMixedOrV1LibrariesMode(libMode)) {
        tabs.push(
          <Tab
            key={TABS_LIST.legacyLibraries}
            eventKey={TABS_LIST.legacyLibraries}
            title={intl.formatMessage(
              libMode === 'v1 only'
                ? messages.librariesTabTitle
                : messages.legacyLibrariesTabTitle,
            )}
          >
            <LibrariesTab
              libraries={libraries}
              isLoading={isLoadingLibraries}
              isFailed={isFailedLibrariesPage}
            />
          </Tab>,
        );
      }
    }

    if (getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true') {
      tabs.push(
        <Tab
          key={TABS_LIST.taxonomies}
          eventKey={TABS_LIST.taxonomies}
          title={intl.formatMessage(messages.taxonomiesTabTitle)}
        />,
      );
    }

    return tabs;
  }, [archivedCourses, librariesEnabled, showNewCourseContainer, isLoadingCourses, isLoadingLibraries]);

  const handleSelectTab = (tab) => {
    if (tab === TABS_LIST.courses) {
      navigate('/home');
    } else if (tab === TABS_LIST.legacyLibraries) {
      dispatch(fetchLibraryData());
      navigate('/libraries-v1');
    } else if (tab === TABS_LIST.libraries) {
      navigate('/libraries');
    } else if (tab === TABS_LIST.taxonomies) {
      navigate('/taxonomies');
    }
    setTabKey(tab);
  };

  return (
    <Tabs
      className="studio-home-tabs"
      variant="tabs"
      activeKey={tabKey}
      onSelect={handleSelectTab}
    >
      {visibleTabs}
    </Tabs>
  );
};

TabsSection.defaultProps = {
  isPaginationCoursesEnabled: false,
};

TabsSection.propTypes = {
  intl: intlShape.isRequired,
  showNewCourseContainer: PropTypes.bool.isRequired,
  onClickNewCourse: PropTypes.func.isRequired,
  isShowProcessing: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  isPaginationCoursesEnabled: PropTypes.bool,
};

export default injectIntl(TabsSection);
