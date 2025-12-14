import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Badge,
  Stack,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { BaseFilterState, Filter, LibrariesList } from './libraries-tab';
import LibrariesV2List from './libraries-v2-tab/index';
import { CoursesList } from './courses-tab';
import { WelcomeLibrariesV2Alert } from './libraries-v2-tab/WelcomeLibrariesV2Alert';

interface Props {
  showNewCourseContainer: boolean;
  onClickNewCourse: () => void;
  isShowProcessing: boolean;
  librariesV1Enabled?: boolean;
  librariesV2Enabled?: boolean;
}

const TabsSection = ({
  showNewCourseContainer,
  onClickNewCourse,
  isShowProcessing,
  librariesV1Enabled,
  librariesV2Enabled,
}: Props) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [migrationFilter, setMigrationFilter] = useState<Filter[]>(BaseFilterState);
  const TABS_LIST = {
    courses: 'courses',
    libraries: 'libraries',
    legacyLibraries: 'legacyLibraries',
    archived: 'archived',
    taxonomies: 'taxonomies',
  } as const;
  type TabKeyType = keyof typeof TABS_LIST;

  const initTabKeyState = (pname: string) => {
    if (pname.includes('/libraries-v1')) {
      return TABS_LIST.legacyLibraries;
    }

    if (pname.includes('/libraries')) {
      return librariesV2Enabled
        ? TABS_LIST.libraries
        : TABS_LIST.legacyLibraries;
    }

    // Default to courses tab
    return TABS_LIST.courses;
  };

  const [tabKey, setTabKey] = useState<TabKeyType>(initTabKeyState(pathname));

  // This is needed to handle navigating using the back/forward buttons in the browser
  useEffect(() => {
    setTabKey(initTabKeyState(pathname));
  }, [pathname]);

  // Controlling the visibility of tabs when using conditional rendering is necessary for
  // the correct operation of iterating over child elements inside the Paragon Tabs component.
  const visibleTabs = useMemo(() => {
    const tabs: JSX.Element[] = [];
    tabs.push(
      <Tab
        key={TABS_LIST.courses}
        eventKey={TABS_LIST.courses}
        title={intl.formatMessage(messages.coursesTabTitle)}
      >
        <CoursesList
          showNewCourseContainer={showNewCourseContainer}
          onClickNewCourse={onClickNewCourse}
          isShowProcessing={isShowProcessing}
        />
      </Tab>,
    );

    if (librariesV2Enabled) {
      tabs.push(
        <Tab
          key={TABS_LIST.libraries}
          eventKey={TABS_LIST.libraries}
          title={(
            <Stack gap={2} direction="horizontal">
              {intl.formatMessage(messages.librariesTabTitle)}
              <Badge variant="info">{intl.formatMessage(messages.librariesV2TabBetaBadge)}</Badge>
            </Stack>
          )}
        >
          <div>
            <WelcomeLibrariesV2Alert />
            <LibrariesV2List />
          </div>
        </Tab>,
      );
    }

    if (librariesV1Enabled) {
      tabs.push(
        <Tab
          key={TABS_LIST.legacyLibraries}
          eventKey={TABS_LIST.legacyLibraries}
          title={intl.formatMessage(
            librariesV2Enabled
              ? messages.legacyLibrariesTabTitle
              : messages.librariesTabTitle,
          )}
        >
          <LibrariesList
            migrationFilter={migrationFilter}
            setMigrationFilter={setMigrationFilter}
          />
        </Tab>,
      );
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
  }, [showNewCourseContainer, migrationFilter]);

  const handleSelectTab = (tab: TabKeyType) => {
    if (tab === TABS_LIST.courses) {
      navigate('/home');
    } else if (tab === TABS_LIST.legacyLibraries) {
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

export default TabsSection;
