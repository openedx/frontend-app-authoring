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
  const response = await getAuthenticatedHttpClient().get(`${getConfig().LMS_BASE_URL}/titaned/api/v1/menu-config/`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch Navigation Items');
  }

  return response.data;
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
              isVisible: true, // Always visible
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
          ];

          // Filter visible items and remove the isVisible property
          const visibleSidebarItems = sidebarItemsConfig
            .filter(item => item.isVisible)
            .map(({ isVisible, ...item }) => item);

          setSidebarItems(visibleSidebarItems);

          const headerButtonsConfig = {
            reSync: true,
            contextSwitcher: true,
            help: true,
            translation: menuConfig.language_selector_is_enabled || false,
            notification: menuConfig.notification_is_enabled || false,
          };

          setHeaderButtons(headerButtonsConfig);
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
            isVisible: true,
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
      } finally {
        setLoadingSidebar(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
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
  //   { label: intl.formatMessage(messages.sidebarSharedResourcesTitle), path: '/shared-resources', icon: <FolderShared /> },
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

  return (
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
          />
        </div>
        {/* Sidebar and Main Content */}
        <div className="content-wrapper">
          <div className="sidebar-container">
            {loadingSidebar ? (
              <div>Loading menu...</div>
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
    </div>
  );
};
export default Layout;
