import { Button } from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import { useCallback } from 'react';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';

interface HeaderActionsProps {
  containerKey: string;
  infoBtnText: string;
  addContentBtnText: string;
}

export const HeaderActions = ({
  containerKey,
  infoBtnText,
  addContentBtnText,
}: HeaderActionsProps) => {
  const { readOnly } = useLibraryContext();
  const {
    closeLibrarySidebar,
    sidebarItemInfo,
    openContainerInfoSidebar,
    openAddContentSidebar,
  } = useSidebarContext();
  const { navigateTo } = useLibraryRoutes();

  const infoSidebarIsOpen = sidebarItemInfo?.id === containerKey;

  const handleOnClickInfoSidebar = useCallback(() => {
    if (infoSidebarIsOpen) {
      closeLibrarySidebar();
    } else {
      openContainerInfoSidebar(containerKey);
    }
    navigateTo({ containerId: containerKey });
  }, [containerKey, infoSidebarIsOpen, navigateTo, openContainerInfoSidebar]);

  return (
    <div className="header-actions">
      <Button
        className="normal-border"
        iconBefore={InfoOutline}
        variant="outline-primary rounded-0"
        onClick={handleOnClickInfoSidebar}
      >
        {infoBtnText}
      </Button>
      <Button
        className="ml-2"
        iconBefore={Add}
        variant="primary rounded-0"
        disabled={readOnly}
        onClick={openAddContentSidebar}
      >
        {addContentBtnText}
      </Button>
    </div>
  );
};
