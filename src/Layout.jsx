/* eslint-disable no-console */
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import { fetchTemplateData } from 'utils/themeService';
import './index.scss';
import * as ParagonIcons from '@openedx/paragon/icons';
// import {
//   Analytics,
//   Assignment,
//   Assistant,
//   Calendar,
//   FolderShared,
//   Home,
//   LibraryAdd,
//   LibraryBooks,
//   Lightbulb,
//   LmsBook,
// } from '@openedx/paragon/icons';
// import Sidebar from 'library/Sidebar/Sidebar';
import { MainHeader, Sidebar, SidebarProvider } from 'titaned-lib';
import getUserMenuItems from 'library/utils/getUserMenuItems';
// import MainHeader from 'library/Header/MainHeader';
// import { SidebarProvider } from 'library/providers/SidebarProvider';
// import { FooterProps } './studio-home/interfaces/components';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import messages from './messages';
import { useContentSearchConnection } from './search-manager/data/apiHooks';
import { SearchContextProvider } from './search-manager';
import { LoadingSpinner } from './generic/Loading';
import { setUIPreference } from './services/uiPreferenceService';
import Feedback from './feedback/feedback';


// Icon mapping for API icon names
// const iconMap = {
//   Analytics: <Analytics />,
//   Assignment: <Assignment />,
//   Assistant: <Assistant />,
//   Calendar: <Calendar />,
//   FolderShared: <FolderShared />,
//   LibraryAdd: <LibraryAdd />,
//   LibraryBooks: <LibraryBooks />,
//   Lightbulb: <Lightbulb />,
//   LmsBook: <LmsBook />,
// };

// API to fetch sidebar items
const fetchNavigationItems = async () => {
  try {
    const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);
    // const response = await getAuthenticatedHttpClient().get(
    //   'https://staging.titaned.com/titaned/api/v1/menu-config/'
    // );

    // https://staging.titaned.com
    if (response.status !== 200) {
      throw new Error('Failed to fetch Navigation Items');
    }

    return response.data;
  } catch (error) {
    console.warn('Failed to fetch navigation items, using defaults:', error);
    // Return default values when API fails
    return {
      allow_to_create_new_course: false,
      show_class_planner: false,
      show_insights_and_reports: false,
      assistant_is_enabled: false,
      resources_is_enabled: false,
      enable_search_in_header: false,
      enabled_re_sync: false,
      enable_switch_to_learner: false,
      enable_help_center: false,
      language_selector_is_enabled: false,
      notification_is_enabled: false,
      enabled_languages: [],
    };
  }
};

const Layout = () => {
  // const [templateData, setTemplateData] = useState<TemplateData | undefined>(undefined)
  // const [headerData, setHeaderData] = useState(undefined);
  // const [footerData, setFooterData] = useState(undefined);

  const { authenticatedUser, config } = useContext(AppContext);
  const { STUDIO_BASE_URL, LOGOUT_URL } = config;
  const userIsAdmin = authenticatedUser.administrator;
  const userMenuItems = getUserMenuItems({
    studioBaseUrl: STUDIO_BASE_URL,
    logoutUrl: LOGOUT_URL,
    isAdmin: userIsAdmin,
  });
  console.log('config', config);

  const intl = useIntl();

  const navigate = useNavigate();
  const location = useLocation();

  const presentPath = location.pathname;

  // Sidebar items state
  const [sidebarItems, setSidebarItems] = useState([
    {
      label: intl.formatMessage(messages.sidebarDashboardTitle),
      path: '/home',
      icon: <ParagonIcons.Home />,
    },
  ]);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [headerButtons, setHeaderButtons] = useState({});
  const [languageSelectorList, setLanguageSelectorList] = useState([]);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);

  // const DefaultIcon = ParagonIcons.Home;

  // useEffect(() => {
  //   let isMounted = true;
  //   fetchSidebarItems().then((apiItems) => {
  //     if (isMounted) {
  //       const formattedApiItems = apiItems.map(item => ({
  //         label: item.label,
  //         path: item.path,
  //         icon: iconMap[item.iconName] || null,
  //       }));
  //       setSidebarItems(prev => [prev[0], ...formattedApiItems]);
  //       setLoadingSidebar(false);
  //     }
  //   });
  //   return () => { isMounted = false; };
  // }, [intl]);

  useEffect(() => {
    let isMounted = true;

    const fetchMenu = async () => {
      try {
        const menuConfig = await fetchNavigationItems();

        setIsSearchEnabled(menuConfig.enable_search_in_header);

        if (isMounted && menuConfig) {
          // Define all sidebar items with their visibility conditions
          const sidebarItemsConfig = [
            {
              label: intl.formatMessage(messages.sidebarDashboardTitle),
              path: '/home',
              icon: <ParagonIcons.Home />,
              isVisible: true, // Always visible
            },
            {
              label: intl.formatMessage(messages.sidebarCreateNewCourseTitle),
              path: '/new-course',
              icon: <ParagonIcons.LibraryAdd />,
              isVisible: menuConfig.allow_to_create_new_course || false,
            },
            {
              label: intl.formatMessage(messages.sidebarMyCoursesTitle),
              path: '/my-courses',
              icon: <ParagonIcons.LmsBook />,
              isVisible: true, // Always visible
            },
            {
              label: intl.formatMessage(messages.sidebarContentLibrariesTitle),
              path: '/libraries',
              icon: <ParagonIcons.LibraryBooks />,
              isVisible: true, // Always visible
            },
            {
              label: intl.formatMessage(messages.sidebarCalendarTitle),
              path: '/calendar',
              icon: <ParagonIcons.Calendar />,
              isVisible: menuConfig.enable_calendar || false,
            },
            {
              label: intl.formatMessage(messages.sidebarClassPlannerTitle),
              path: '/class-planner',
              icon: <ParagonIcons.Analytics />,
              isVisible: menuConfig.show_class_planner || false,
            },
            {
              label: intl.formatMessage(messages.sidebarInsightsReportsTitle),
              path: '/reports',
              icon: <ParagonIcons.Lightbulb />,
              isVisible: menuConfig.show_insights_and_reports || false,
            },
            {
              label: intl.formatMessage(messages.sidebarTitanAITitle),
              path: '/ai-assistant',
              icon: <ParagonIcons.Assistant />,
              isVisible: menuConfig.assistant_is_enabled || false,
            },
            {
              label: intl.formatMessage(messages.sidebarSharedResourcesTitle),
              path: '/shared-resources',
              icon: <ParagonIcons.FolderShared />,
              isVisible: menuConfig.resources_is_enabled || false,
            },
            {
              label: intl.formatMessage(messages.sidebarTaxonomiesTitle),
              path: '/taxonomies',
              icon: <ParagonIcons.Assignment />,
              isVisible: true, // Always visible
            },
            {
              label: intl.formatMessage(messages.sidebarAssignmentsTitle),
              path: '/assignments',
              icon: <ParagonIcons.Assignment />,
              isVisible: menuConfig.enable_assignments || false,
            },
            {
              label: 'Switch to Old View',
              path: 'switch-to-old-view',
              icon: <ParagonIcons.FolderShared />,
              isVisible: true,
            },
          ];

          // Filter visible items and remove the isVisible property
          const visibleSidebarItems = sidebarItemsConfig
            .filter(item => item.isVisible)
            .map(({ isVisible, ...item }) => item);

          setSidebarItems(visibleSidebarItems);

          const headerButtonsConfig = {
            reSync: menuConfig.enabled_re_sync || false,
            contextSwitcher: menuConfig.enable_switch_to_learner || false,
            help: menuConfig.enable_help_center || false,
            translation: menuConfig.language_selector_is_enabled || false,
            notification: menuConfig.notification_is_enabled || false,
          };

          setHeaderButtons(headerButtonsConfig);

          if (menuConfig.enabled_languages) {
            setLanguageSelectorList(menuConfig.enabled_languages);
          }
        }
      } catch (error) {
        // Fallback to always-visible items when API fails
        const fallbackItems = [
          {
            label: intl.formatMessage(messages.sidebarDashboardTitle),
            path: '/home',
            icon: <ParagonIcons.Home />,
            isVisible: true,
          },
          {
            label: intl.formatMessage(messages.sidebarCreateNewCourseTitle),
            path: '/new-course',
            icon: <ParagonIcons.LibraryAdd />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(messages.sidebarMyCoursesTitle),
            path: '/my-courses',
            icon: <ParagonIcons.LmsBook />,
            isVisible: true,
          },
          {
            label: intl.formatMessage(messages.sidebarContentLibrariesTitle),
            path: '/libraries',
            icon: <ParagonIcons.LibraryBooks />,
            isVisible: true,
          },
          {
            label: intl.formatMessage(messages.sidebarCalendarTitle),
            path: '/calendar',
            icon: <ParagonIcons.Calendar />,
            isVisible: false,
          },
          {
            label: intl.formatMessage(messages.sidebarClassPlannerTitle),
            path: '/class-planner',
            icon: <ParagonIcons.Analytics />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(messages.sidebarInsightsReportsTitle),
            path: '/reports',
            icon: <ParagonIcons.Lightbulb />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(messages.sidebarTitanAITitle),
            path: '/ai-assistant',
            icon: <ParagonIcons.Assistant />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(messages.sidebarSharedResourcesTitle),
            path: '/shared-resources',
            icon: <ParagonIcons.FolderShared />,
            isVisible: false, // Hide when API fails
          },
          {
            label: intl.formatMessage(messages.sidebarTaxonomiesTitle),
            path: '/taxonomies',
            icon: <ParagonIcons.Assignment />,
            isVisible: true,
          },
          {
            label: intl.formatMessage(messages.sidebarAssignmentsTitle),
            path: '/assignments',
            icon: <ParagonIcons.Assignment />,
            isVisible: true,
          },
        ];

        // Filter visible items and remove the isVisible property
        const visibleFallbackItems = fallbackItems
          .filter(item => item.isVisible)
          .map(({ isVisible, ...item }) => item);

        setSidebarItems(visibleFallbackItems);

        const fallbackHeaderButtonsConfig = {
          reSync: true,
          contextSwitcher: true,
          help: true,
          translation: false,
          notification: false,
        };

        setHeaderButtons(fallbackHeaderButtonsConfig);

        setLanguageSelectorList([]);
      } finally {
        setLoadingSidebar(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = async (path) => {
    if (path === 'switch-to-old-view') {
      try {
        console.log('Switching to old UI...');
        const success = await setUIPreference(false);
        if (success) {
          console.log('Successfully switched to old UI, reloading page...');
          window.location.href = '/authoring/home';
        } else {
          console.error('Failed to switch to old UI');
        }
      } catch (error) {
        console.error('Error switching to old UI:', error);
      }
    } else {
      navigate(path);
    }
  };

  // useEffect(() => {
  //   const getTemplateData = async () => {
  //     try {
  //       const templateData = await fetchTemplateData();
  //       const header = templateData?.content?.header?.mainHeader;
  //       const footer = templateData?.content?.footer;
  //       setHeaderData(header);
  //       setFooterData(footer);
  //     } catch (error) {
  //       throw new Error(`Error fetching template data: ${error.message}`);
  //     }
  //   };

  //   getTemplateData();
  // }, []);

  // const sidebarItems = [
  //   { label: intl.formatMessage(messages.sidebarDashboardTitle), path: '/home', icon: <Home /> },
  //   { label: intl.formatMessage(messages.sidebarCreateNewCourseTitle), path: '/new-course', icon: <LibraryAdd /> },
  //   { label: intl.formatMessage(messages.sidebarMyCoursesTitle), path: '/my-courses', icon: <LmsBook /> },
  //   { label: intl.formatMessage(messages.sidebarContentLibrariesTitle), path: '/libraries', icon: <LibraryBooks /> },
  //   { label: intl.formatMessage(messages.sidebarCalendarTitle), path: '/calendar', icon: <Calendar /> },
  //   { label: intl.formatMessage(messages.sidebarClassPlannerTitle), path: '/class-planner', icon: <Analytics /> },
  //   { label: intl.formatMessage(messages.sidebarInsightsReportsTitle), path: '/reports', icon: <Lightbulb /> },
  //   { label: intl.formatMessage(messages.sidebarTitanAITitle), path: '/ai-assistant', icon: <Assistant /> },
  //   { label: intl.formatMessage(messages.sidebarSharedResourcesTitle),
  //     path: '/shared-resources', icon: <FolderShared /> },
  //   { label: intl.formatMessage(messages.sidebarTaxonomiesTitle), path: '/taxonomies', icon: <Assignment /> },
  // ];

  // const contactInfo = {
  //   align: 'left',
  //   content: {
  //     shortdesc: 'We are passionate education dedicated to
  // providing high-quality resources learners all backgrounds.',
  //     address1: 'Yarra Park, Melbourne, Australia',
  //     address2: '',
  //     pincode: '',
  //     location: {
  //       label: 'San fransicoq',
  //       value: 'Sanss',
  //     },
  //     phonenumber: '9515088071',
  //     facebook: '',
  //     instagram: '',
  //     twitter: '',
  //     linkedIn: '',
  //   },
  // };

  // const quickLinks = {
  //   align: 'center',
  //   content: [
  //     {
  //       label: 'Latest Courses',
  //       link: '',
  //     },
  //     {
  //       label: 'Mission & Vision',
  //       link: '',
  //     },
  //     {
  //       label: 'Join a Career',
  //       link: '',
  //     },
  //     {
  //       label: 'Zoom Meeting',
  //       link: '',
  //     },
  //     {
  //       label: 'Pricing Plan',
  //       link: '',
  //     },
  //   ],
  // };

  // const exploreLinks = {
  //   align: 'right',
  //   content: [
  //     {
  //       label: 'Course One',
  //       link: '',
  //     },
  //     {
  //       label: 'Course Two',
  //       link: '',
  //     },
  //     {
  //       label: 'Create Course',
  //       link: '',
  //     },
  //     {
  //       label: 'Lesson Details',
  //       link: '',
  //     },
  //     {
  //       label: 'Instructor',
  //       link: '',
  //     },
  //   ],
  // };

  // const headerButtons = {
  //   reSync: true,
  //   contextSwitcher: true,
  //   help: true,
  //   translation: true,
  //   notification: true,
  // };

  const handleLanguageChange = () => {
    const { pathname } = location;
    const cleanPath = pathname.replace('/authoring', '');
    window.location.href = `/authoring${cleanPath}`;
  };

  const { client, indexName } = useContentSearchConnection();

  const meiliSearchConfig = {
    host: client?.config?.host,
    apiKey: client?.config?.apiKey,
    indexName,
    client, // 🔑 This is the key addition - pass the complete client
  };
  console.log('meiliSearchConfig', meiliSearchConfig);
  console.log('client', client);

  // Don't render SearchContextProvider if MeiliSearch is not ready and search is enabled
  if (isSearchEnabled && (!client || !indexName)) {
    console.log('MeiliSearch not ready, rendering without SearchContextProvider');
    return (
      <div className="d-flex justify-content-center align-items-center flex-column vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  const renderContent = () => (
    <div className="app-container">
      {/* <p>This is header</p> */}
      <SidebarProvider>
        <div className="header-container">
          <MainHeader
            logoUrl={config.LOGO_URL}
            // menuAlignment={headerData.menu.align}
            // menuList={headerData.menu.menuList}
            // loginSignupButtons={headerData.menu.loginSignupButtons}
            authenticatedUser={authenticatedUser}
            userMenuItems={userMenuItems}
            onLanguageChange={handleLanguageChange}
            getBaseUrl={() => '/authoring'}
            headerButtons={headerButtons}
            meiliSearchConfig={isSearchEnabled ? meiliSearchConfig : null}
            languageSelectorList={languageSelectorList}
            // onSearchResults={(results) => {
            //   console.log('Search results:', results);
            // }}
          />
        </div>
        {/* Sidebar and Main Content */}
        <div className="content-wrapper">
          <div className="sidebar-container">
            {loadingSidebar ? (
              <div className="d-flex justify-content-center align-items-center p-4">
                <LoadingSpinner />
              </div>
            ) : (
              <Sidebar
                buttons={sidebarItems}
                onNavigate={handleNavigate}
                presentPath={presentPath}
              />
            )}
          </div>
          <div className="main-content">
            <div className="page-content">
              <Outlet />
            </div>
          </div>
        </div>
        {/* <div>
          <div className="footer-container">
            <Footer
              contactInfo={contactInfo}
              quickLinks={quickLinks}
              exploreLinks={exploreLinks}
              logoUrl="https://titaned.com/wp-content/uploads/2023/07/TitanEdLogoHigherEdOrange.png"
              copyrights="Copyright © 2025 All Rights Reserved by TitanEd"
            />
          </div>
        </div> */}
      </SidebarProvider>
      <Feedback />
    </div>
  );

  return isSearchEnabled ? (
    <SearchContextProvider>
      {renderContent()}
    </SearchContextProvider>
  ) : (
    renderContent()
  );
};
export default Layout;
