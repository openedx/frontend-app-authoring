import { useSidebarContext } from '../common/context/SidebarContext';
import { ContainerEditableTitle } from './ContainerEditableTitle';

const ContainerInfoHeader = () => {
  const { sidebarItemInfo } = useSidebarContext();

  const containerId = sidebarItemInfo?.id;
  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  return (
    <ContainerEditableTitle
      containerId={containerId}
      textClassName="font-weight-bold m-1.5"
    />
  );
};

export default ContainerInfoHeader;
