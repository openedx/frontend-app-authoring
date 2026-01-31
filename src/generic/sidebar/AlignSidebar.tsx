import { ContentTagsDrawer } from "@src/content-tags-drawer";
import { SidebarTitle } from "./SidebarTitle";
import { SchoolOutline } from "@openedx/paragon/icons";

export interface AlignSidebarProps {
  contentId: string;
  title: string;
}

/**
 * Sidebar that renders Align Sidebar (manage tags sidebar)
 * for the given content.
 */
export const AlignSidebar = ({ contentId, title }) => (
  <div>
    <SidebarTitle
      title={title}
      icon={SchoolOutline}
    />
    <ContentTagsDrawer
      id={contentId}
      variant="component"
    />
  </div>
);
