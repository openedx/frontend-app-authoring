import { ResizableBox } from '@src/generic/resizable/Resizable';

import { LibrarySidebar } from '.';

export const LibrarySidebarPanel = () => (
  <ResizableBox
    className="library-authoring-sidebar box-shadow-left-1 bg-white"
    data-testid="library-sidebar"
    storageKey="library-authoring-sidebar-width"
    initialWidth={530}
    minWidth={400}
  >
    <LibrarySidebar />
  </ResizableBox>
);
