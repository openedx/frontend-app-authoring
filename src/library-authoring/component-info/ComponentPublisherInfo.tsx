import Loading from '@src/generic/Loading';

import { useLibraryBlockHierarchy } from '../data/apiHooks';
import { ItemHierarchyPublisher } from '../hierarchy/ItemHierarchyPublisher';

type ComponentPublisherInfoProps = {
  componentId: string;
  handleClose: () => void;
  handlePublish: () => void;
};

export const ComponentPublisherInfo = ({
  componentId,
  handleClose,
  handlePublish,
}: ComponentPublisherInfoProps) => {
  const {
    data: hierarchy,
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
    <ItemHierarchyPublisher
      itemId={componentId}
      hierarchy={hierarchy}
      handleClose={handleClose}
      handlePublish={handlePublish}
    />
  );
};
