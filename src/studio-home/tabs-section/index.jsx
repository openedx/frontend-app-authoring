import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { getLoadingStatuses, getStudioHomeData } from '../data/selectors';
import messages from './messages';
import LibrariesTab from './libraries-tab';
import ArchivedTab from './archived-tab';
import CoursesTab from './courses-tab';
import { RequestStatus } from '../../data/constants';
import { fetchLibraryData } from '../data/thunks';

const TabsSection = ({
  intl, tabsData, showNewCourseContainer, onClickNewCourse, isShowProcessing, dispatch,
}) => {
  const TABS_LIST = {
    courses: 'courses',
    libraries: 'libraries',
    archived: 'archived',
  };
  const [tabKey, setTabKey] = useState(TABS_LIST.courses);
  const {
    libraryAuthoringMfeUrl,
    redirectToLibraryAuthoringMfe,
    courses, librariesEnabled, libraries, archivedCourses,
  } = useSelector(getStudioHomeData);
  const {
    courseLoadingStatus,
    libraryLoadingStatus,
  } = useSelector(getLoadingStatuses);
  const isLoadingCourses = courseLoadingStatus === RequestStatus.IN_PROGRESS;
  const isFailedCoursesPage = courseLoadingStatus === RequestStatus.FAILED;
  const isLoadingLibraries = libraryLoadingStatus === RequestStatus.IN_PROGRESS;
  const isFailedLibrariesPage = libraryLoadingStatus === RequestStatus.FAILED;
  // const {
  //   courses, librariesEnabled, libraries, archivedCourses,
  // } = tabsData;

  // Controlling the visibility of tabs when using conditional rendering is necessary for
  // the correct operation of iterating over child elements inside the Paragon Tabs component.
  // const visibleTabs = () => {
  //   console.log('calling memo');
  //   const tabs = [];
  //   tabs.push(
  //     <Tab
  //       key={TABS_LIST.courses}
  //       eventKey={TABS_LIST.courses}
  //       title={intl.formatMessage(messages.coursesTabTitle)}
  //     >
  //       <CoursesTab
  //         coursesDataItems={courses}
  //         showNewCourseContainer={showNewCourseContainer}
  //         onClickNewCourse={onClickNewCourse}
  //         isShowProcessing={isShowProcessing}
  //         isLoading={isLoadingCourses}
  //         isFailed={isFailedCoursesPage}
  //       />
  //     </Tab>,
  //   );

  //   if (archivedCourses?.length) {
  //     tabs.push(
  //       <Tab
  //         key={TABS_LIST.archived}
  //         eventKey={TABS_LIST.archived}
  //         title={intl.formatMessage(messages.archivedTabTitle)}
  //       >
  //         <ArchivedTab
  //           archivedCoursesData={archivedCourses}
  //           isLoading={isLoadingCourses}
  //           isFailed={isFailedCoursesPage}
  //         />
  //       </Tab>,
  //     );
  //   }

  //   if (librariesEnabled) {
  //     tabs.push(
  //       <Tab
  //         key={TABS_LIST.libraries}
  //         eventKey={TABS_LIST.libraries}
  //         title={intl.formatMessage(messages.librariesTabTitle)}
  //       >
  //         {!redirectToLibraryAuthoringMfe && (
  //           <LibrariesTab
  //             libraries={libraries}
  //             isLoading={isLoadingLibraries}
  //             isFailed={isFailedLibrariesPage}
  //           />
  //         )}
  //       </Tab>,
  //     );
  //   }

  //   return tabs;
  // }
  // , [archivedCourses, librariesEnabled, showNewCourseContainer, isLoadingCourses, isLoadingLibraries]);

  // const fetchLibraries = useCallback(() => {
  //   console.log(tabKey)
  //   dispatch(fetchLibraryData());
  // }, [tabKey])

  const handleSelectTab = (tab) => {
    if (tab === TABS_LIST.libraries && redirectToLibraryAuthoringMfe) {
      window.location.assign(libraryAuthoringMfeUrl);
    } else if (tab === TABS_LIST.libraries && !redirectToLibraryAuthoringMfe) {
      dispatch(fetchLibraryData());    }
    setTabKey(tab);
  };
  console.log('calling tabs');
  return (
    <Tabs
      className="studio-home-tabs"
      variant="tabs"
      activeKey={tabKey}
      onSelect={handleSelectTab}
    >
      {/* {visibleTabs} */}
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
        />
      </Tab>
      {/* {archivedCourses?.length && (
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
        </Tab>
      )} */}
      {librariesEnabled && (
        <Tab
          key={TABS_LIST.libraries}
          eventKey={TABS_LIST.libraries}
          title={intl.formatMessage(messages.librariesTabTitle)}
        >
          {!redirectToLibraryAuthoringMfe && (
            <LibrariesTab
              libraries={libraries}
              isLoading={isLoadingLibraries}
              isFailed={isFailedLibrariesPage}
            />
          )}
        </Tab>
      )}
    </Tabs>
  );
};

const courseDataStructure = {
  courseKey: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  lmsLink: PropTypes.string.isRequired,
  number: PropTypes.string.isRequired,
  org: PropTypes.string.isRequired,
  rerunLink: PropTypes.string.isRequired,
  run: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

TabsSection.propTypes = {
  intl: intlShape.isRequired,
  tabsData: PropTypes.shape({
    activeTab: PropTypes.string.isRequired,
    archivedCourses: PropTypes.arrayOf(
      PropTypes.shape(courseDataStructure),
    ).isRequired,
    courses: PropTypes.arrayOf(
      PropTypes.shape(courseDataStructure),
    ).isRequired,
    libraries: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        libraryKey: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        org: PropTypes.string.isRequired,
        number: PropTypes.string.isRequired,
      }),
    ).isRequired,
    librariesEnabled: PropTypes.bool.isRequired,
  }).isRequired,
  showNewCourseContainer: PropTypes.bool.isRequired,
  onClickNewCourse: PropTypes.func.isRequired,
  isShowProcessing: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default injectIntl(TabsSection);
