import { useUnitSidebarContext } from '../UnitSidebarContext';
import { ComponentInfoSidebar } from './ComponentInfoSidebar';
import { UnitInfoSidebar } from './UnitInfoSidebar';

/**
 * Main component to render the Info Sidebar in the unit page
 *
 * Depending of the selected component, this can render
 * the unit infor sidebar or the component info sidebar
 */
export const InfoSidebar = () => {
  const { selectedComponentId } = useUnitSidebarContext();

  if (selectedComponentId) {
    return <ComponentInfoSidebar />;
  }

  return <UnitInfoSidebar />;
};
