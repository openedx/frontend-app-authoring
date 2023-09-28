import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { getStudioHomeData } from '../data/selectors';
import messages from '../messages';
import LibrariesTab from './libraries-tab';
import ArchivedTab from './archived-tab';
import CoursesTab from './courses-tab';

const TabsSection = ({
  intl, tabsData, showNewCourseContainer, onClickNewCourse, isShowProcessing,
}) => {
  const TABS_LIST = {
    courses: 'courses',
    libraries: 'libraries',
    archived: 'archived',
  };
  const {
    libraryAuthoringMfeUrl,
    redirectToLibraryAuthoringMfe,
  } = useSelector(getStudioHomeData);
  const {
    activeTab, courses, librariesEnabled, libraries, archivedCourses,
  } = tabsData;

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
          <ArchivedTab archivedCoursesData={archivedCourses} />
        </Tab>,
      );
    }

    if (librariesEnabled) {
      tabs.push(
        <Tab
          key={TABS_LIST.libraries}
          eventKey={TABS_LIST.libraries}
          title={intl.formatMessage(messages.librariesTabTitle)}
        >
          {!redirectToLibraryAuthoringMfe && <LibrariesTab libraries={libraries} />}
        </Tab>,
      );
    }

    return tabs;
  }, [archivedCourses, librariesEnabled, showNewCourseContainer]);

  const handleSelectTab = (tab) => {
    if (tab === TABS_LIST.libraries && redirectToLibraryAuthoringMfe) {
      window.location.assign(libraryAuthoringMfeUrl);
    }
  };

  return (
    <Tabs
      className="studio-home-tabs"
      variant="tabs"
      defaultActiveKey={activeTab}
      onSelect={handleSelectTab}
    >
      {visibleTabs}
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
};

export default injectIntl(TabsSection);
