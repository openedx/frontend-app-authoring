import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import 'titaned-lib/dist/index.css';
// import { fetchTemplateData } from 'utils/themeService';
import './index.scss';
import {
  Analytics,
  Assignment,
  Assistant,
  Calendar,
  FolderShared,
  Home, LibraryAdd, LibraryBooks, Lightbulb, LmsBook,
} from '@openedx/paragon/icons';
// import Sidebar from 'library/Sidebar/Sidebar';
import {
  MainHeader, Sidebar, SidebarProvider,
} from 'titaned-lib';
import getUserMenuItems from 'library/utils/getUserMenuItems';
// import MainHeader from 'library/Header/MainHeader';
// import { SidebarProvider } from 'library/providers/SidebarProvider';
// import { FooterProps } './studio-home/interfaces/components';
import { getConfig } from '@edx/frontend-platform';

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

  const navigate = useNavigate();
  const location = useLocation();

  const presentPath = location.pathname;

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
    { label: 'Taxonomies', path: '/taxonomies', icon: <Assignment /> },
  ];

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
            logoUrl="/titanEd_logo.png"
            // menuAlignment={headerData.menu.align}
            // menuList={headerData.menu.menuList}
            // loginSignupButtons={headerData.menu.loginSignupButtons}
            authenticatedUser={authenticatedUser}
            userMenuItems={userMenuItems}
            onLanguageChange={handleLanguageChange}
            getBaseUrl={() => getConfig().STUDIO_BASE_URL}
          />
        </div>
        {/* Sidebar and Main Content */}
        <div className="content-wrapper">
          <div className="sidebar-container">
            <Sidebar
              buttons={sidebarItems}
              onNavigate={handleNavigate}
              presentPath={presentPath}
            />
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
