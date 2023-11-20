import { StudioFooter } from '@edx/frontend-component-footer';
import { Outlet } from 'react-router-dom';

import Header from '../header';

const TaxonomyLayout = () => (
  <div className="bg-light-400">
    <Header isHiddenMainMenu />
    <Outlet />
    <StudioFooter />
  </div>
);

export default TaxonomyLayout;
