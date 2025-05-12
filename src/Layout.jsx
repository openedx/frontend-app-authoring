import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import 'titaned-lib/dist/index.css';
import { fetchTemplateData } from 'utils/themeService';
import './index.scss';
import {
  Analytics,
  Assistant,
  Calendar,
  FolderShared,
  Home, LibraryAdd, LibraryBooks, Lightbulb, LmsBook,
} from '@openedx/paragon/icons';
// import Sidebar from 'library/Sidebar/Sidebar';
import { Footer, Sidebar } from 'titaned-lib';
import getUserMenuItems from 'library/utils/getUserMenuItems';
import MainHeader from 'library/Header/MainHeader';
// import { FooterProps } './studio-home/interfaces/components';

const Layout = () => {
  // const [templateData, setTemplateData] = useState<TemplateData | undefined>(undefined)
  const [headerData, setHeaderData] = useState(undefined);
  const [footerData, setFooterData] = useState(undefined);

  const { authenticatedUser, config } = useContext(AppContext);
  const { STUDIO_BASE_URL, LOGOUT_URL } = config;
  const userIsAdmin = authenticatedUser.administrator;
  const userMenuItems = getUserMenuItems({
    studioBaseUrl: STUDIO_BASE_URL,
    logoutUrl: LOGOUT_URL,
    isAdmin: userIsAdmin,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const presentPath = location.pathname;

  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const getTemplateData = async () => {
      try {
        const templateData = await fetchTemplateData();
        const header = templateData?.content?.header?.mainHeader;
        const footer = templateData?.content?.footer;
        setHeaderData(header);
        setFooterData(footer);
      } catch (error) {
        throw new Error(`Error fetching template data: ${error.message}`);
      }
    };

    getTemplateData();
  }, []);

  const sidebarItems = [
    { label: 'Dashboard', path: '/home', icon: <Home /> },
    { label: 'Create New Course', path: '/new-course', icon: <LibraryAdd /> },
    { label: 'My Courses', path: '/my-courses', icon: <LmsBook /> },
    { label: 'Content Libraries', path: '/libraries', icon: <LibraryBooks /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar /> },
    { label: 'Class Planner', path: '/class-planner', icon: <Analytics /> },
    { label: 'Insights & Reports', path: '/reports', icon: <Lightbulb /> },
    { label: 'TitanAI Assistant', path: '/ai-assistant', icon: <Assistant /> },
    { label: 'Shared Resources', path: '/shared-resources', icon: <FolderShared /> },
  ];

  return (
    <div className="app-container">
      {/* <p>This is header</p> */}
      <div className="header-container">
        {headerData?.logoUrl
          && headerData.menu?.align
          && headerData.menu.menuList
          && headerData.menu.loginSignupButtons && (
          <MainHeader
            logoUrl="/titanEd_logo.png"
            menuAlignment={headerData.menu.align}
            menuList={headerData.menu.menuList}
            loginSignupButtons={headerData.menu.loginSignupButtons}
            authenticatedUser={authenticatedUser}
            userMenuItems={userMenuItems}
          />
        )}
      </div>
      {/* Sidebar and Main Content */}
      <div className="content-wrapper">
        <Sidebar
          buttons={sidebarItems}
          onNavigate={handleNavigate}
          presentPath={presentPath}
        />
        <div className="main-content">
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </div>
      <div>
        <div className="footer-container">
          {footerData?.contactInfo && footerData?.quickLinks && footerData?.exploreLinks && (
          <Footer
            contactInfo={footerData.contactInfo}
            quickLinks={footerData.quickLinks}
            exploreLinks={footerData.exploreLinks}
            logoUrl="https://titaned.com/wp-content/uploads/2023/07/TitanEdLogoHigherEdOrange.png"
            copyrights={footerData.copyrights}
          />
          )}
        </div>
      </div>
    </div>
  );
};
export default Layout;
