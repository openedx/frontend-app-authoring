import { ContentTagsDrawer } from '@src/content-tags-drawer';
import { SchoolOutline } from '@openedx/paragon/icons';
import { SidebarTitle } from './SidebarTitle';

export interface AlignSidebarProps {
  contentId: string;
  title: string;
  onBackBtnClick?: () => void;
  readOnly?: boolean;
}

/**
 * Sidebar that renders Align Sidebar (manage tags sidebar)
 * for the given content.
 */
export const AlignSidebar = ({
  contentId,
  title,
  onBackBtnClick,
  readOnly = false,
}: AlignSidebarProps) => (
  <div>
    <SidebarTitle
      title={title}
      icon={SchoolOutline}
      onBackBtnClick={onBackBtnClick}
    />
    <ContentTagsDrawer
      id={contentId}
      variant="component"
      readOnly={readOnly}
    />
  </div>
);
