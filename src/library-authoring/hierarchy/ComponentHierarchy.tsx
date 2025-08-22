import Loading from '@src/generic/Loading';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryBlockHierarchy } from '../data/apiHooks';
import { ItemHierarchy } from './ItemHierarchy';

export const ComponentHierarchy = ({
  showPublishStatus = false,
}: {
  showPublishStatus?: boolean,
}) => {
  const { sidebarItemInfo } = useSidebarContext();
  const componentId = sidebarItemInfo?.id;

  // istanbul ignore if: this should never happen
  if (!componentId) {
    throw new Error('containerId is required');
  }

  const {
    data,
    isLoading,
    isError,
  } = useLibraryBlockHierarchy(componentId);

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
      itemId={componentId}
      showPublishStatus={showPublishStatus}
    />
  );
};
