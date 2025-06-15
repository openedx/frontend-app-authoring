import { Button, useToggle } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { type ContainerType } from '../../generic/key-utils';
import { PickLibraryContentModal } from '../add-content';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';

interface FooterActionsProps {
  addContentType?: ContainerType;
  addContentBtnText: string;
  addExistingContentBtnText: string;
}

export const FooterActions = ({
  addContentType,
  addContentBtnText,
  addExistingContentBtnText,
}: FooterActionsProps) => {
  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();
  const { openAddContentSidebar } = useSidebarContext();
  const { readOnly, setCreateContainerModalType } = useLibraryContext();
  const addContent = () => {
    if (addContentType) {
      setCreateContainerModalType(addContentType);
    } else {
      openAddContentSidebar();
    }
  };
  return (
    <div className="d-flex">
      <div className="w-100 mr-2">
        <Button
          className="ml-2"
          iconBefore={Add}
          variant="outline-primary rounded-0"
          onClick={addContent}
          disabled={readOnly}
          block
        >
          {addContentBtnText}
        </Button>
      </div>
      <div className="w-100 ml-2">
        <Button
          className="ml-2"
          iconBefore={Add}
          variant="outline-primary rounded-0"
          onClick={showAddLibraryContentModal}
          disabled={readOnly}
          block
        >
          {addExistingContentBtnText}
        </Button>
        <PickLibraryContentModal
          isOpen={isAddLibraryContentModalOpen}
          onClose={closeAddLibraryContentModal}
        />
      </div>
    </div>
  );
};
