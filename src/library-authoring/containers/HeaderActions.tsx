import { Button } from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';
import { useCallback } from 'react';
import { ContainerType } from '../../generic/key-utils';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryRoutes } from '../routes';

interface HeaderActionsProps {
  containerKey: string;
  containerType: ContainerType;
  infoBtnText: string;
  addContentBtnText: string;
}

export const HeaderActions = ({
  containerKey,
  containerType,
  infoBtnText,
  addContentBtnText,
}: HeaderActionsProps) => {
  const { readOnly } = useLibraryContext();
  const {
    closeLibrarySidebar,
    sidebarComponentInfo,
    openUnitInfoSidebar,
    openAddContentSidebar,
  } = useSidebarContext();
  const { navigateTo } = useLibraryRoutes();

  const infoSidebarIsOpen = sidebarComponentInfo?.id === containerKey;

  const handleOnClickInfoSidebar = useCallback(() => {
    if (infoSidebarIsOpen) {
      closeLibrarySidebar();
    } else {
      switch (containerType) {
        case ContainerType.Unit:
          openUnitInfoSidebar(containerKey);
          break;
        /* istanbul ignore next */
        default:
          break;
      }
    }
    navigateTo({ [`${containerType}Id`]: containerKey });
  }, [containerKey, infoSidebarIsOpen, navigateTo]);

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
