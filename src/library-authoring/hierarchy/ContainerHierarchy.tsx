import Loading from '@src/generic/Loading';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useContainerHierarchy } from '../data/apiHooks';
import { ItemHierarchy } from './ItemHierarchy';

export const ContainerHierarchy = ({
  showPublishStatus = false,
}: {
  showPublishStatus?: boolean,
}) => {
  const { sidebarItemInfo } = useSidebarContext();
  const containerId = sidebarItemInfo?.id;

  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  const {
    data,
    isLoading,
    isError,
  } = useContainerHierarchy(containerId);

  if (isLoading) {
    return <Loading />;
  }

  // istanbul ignore if: this should never happen
  if (isError) {
    return null;
  }

  return (
    <ItemHierarchy
      hierarchyData={data}
      itemId={containerId}
      showPublishStatus={showPublishStatus}
    />
  );
};
