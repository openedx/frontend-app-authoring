import { Breadcrumb, Button, Card, Icon, Stack } from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import { useCallback, useMemo, useState } from 'react';
import { LoadingSpinner } from '../generic/Loading';
import { useContainerChildren } from '../library-authoring/data/apiHooks';
import ChildrenPreview from './ChildrenPreview';
import ContainerRow from './ContainerRow';
import { useCourseContainerChildren } from './data/apiHooks';
import { ContainerChildBase, CourseContainerChildBase, WithState } from './types';
import { diffPreviewContainerChildren } from './utils';

interface ContainerInfoProps {
  title: string;
  upstreamBlockId: string;
  downstreamBlockId: string;
}

interface Props extends ContainerInfoProps {
  parent: ContainerInfoProps[];
  onRowClick: (row: WithState<CourseContainerChildBase>) => void;
  onBackBtnClick: () => void;
}

/**
 * CompareContainersWidget component. Displays a diff of set of child containers from two different sources
 * and allows the user to select the container to view. This is a wrapper component that maintains current
 * source state. Actual implementation of the diff view is done by _CompareContainersWidget.
 */
export const CompareContainersWidget = ({ title, upstreamBlockId, downstreamBlockId }: ContainerInfoProps) => {
  const [currentContainerState, setCurrentContainerState] = useState<ContainerInfoProps & {
    parent: ContainerInfoProps[];
  }>({
    title,
    upstreamBlockId,
    downstreamBlockId,
    parent: [],
  });

  const onRowClick = (row: WithState<CourseContainerChildBase>) => {
    if (!row.upstreamLink || row.state !== "modified") {
      return;
    }

    setCurrentContainerState((prev) => ({
      title: row.name,
      upstreamBlockId: row.upstreamLink.upstreamRef,
      downstreamBlockId: row.id,
      parent: [...prev.parent, {
        title,
        upstreamBlockId,
        downstreamBlockId,
      }]
    }));
  }

  const onBackBtnClick = () => {
    setCurrentContainerState((prev) => {
      if (prev.parent.length < 1) {
        return prev;
      }
      const prevParent = prev.parent[prev.parent.length-1];
      return {
        title: prevParent!.title,
        upstreamBlockId: prevParent!.upstreamBlockId,
        downstreamBlockId: prevParent!.downstreamBlockId,
        parent: prev.parent.slice(0, -1),
      }
    });
  }

  return (
    <_CompareContainersWidget
      title={currentContainerState.title}
      upstreamBlockId={currentContainerState.upstreamBlockId}
      downstreamBlockId={currentContainerState.downstreamBlockId}
      parent={currentContainerState.parent}
      onRowClick={onRowClick}
      onBackBtnClick={onBackBtnClick}
    />
  );
};

/**
 * Actual implementation of the displaying diff between children of containers.
 */
const _CompareContainersWidget = ({
  title,
  upstreamBlockId,
  downstreamBlockId,
  parent,
  onRowClick,
  onBackBtnClick,
}: Props) => {
  const { data, isPending } = useCourseContainerChildren(downstreamBlockId);
  const {
    data: libData,
    isPending: libPending,
  } = useContainerChildren(upstreamBlockId, true);

  const result = useMemo(() => {
    if (!data || !libData) {
      return [undefined, undefined];
    }
    return diffPreviewContainerChildren(data.children, libData as ContainerChildBase[]);
  }, [data, libData]);

  const renderBeforeChildren = useCallback(() => {
    if (isPending) {
      return <div className="m-auto"><LoadingSpinner /></div>;
    }

    return result[0]?.map((child) => (
      <ContainerRow
        title={child.name}
        containerType={child.blockType}
        state={child.state}
        originalName={child.originalName}
        side="Before"
        onClick={() => onRowClick(child)}
      />
    ));
  }, [isPending, result]);

  const renderAfterChildren = useCallback(() => {
    if (libPending || isPending) {
      return <div className="m-auto"><LoadingSpinner /></div>;
    }

    return result[1]?.map((child) => (
      <ContainerRow
        title={child.displayName}
        containerType={child.containerType || child.blockType!}
        state={child.state}
        side="After"
      />
    ));
  }, [libPending, isPending, result]);

  const getTitleComponent = () => {
    if (parent.length === 0) {
      return title;
    } else {
      return (
        <Breadcrumb ariaLabel="title breadcrumb"
          links={[
            {
              label: <Stack direction="horizontal" gap={1}><Icon size='xs' src={ArrowBack} />Back</Stack>,
              onClick: onBackBtnClick,
              variant: "link",
              className: "px-0 text-gray-900",
            },
            {
              label: title,
              variant: "link",
              className: "px-0 text-gray-900",
              disabled: true,
            },
          ]}
          linkAs={Button}
        />
      );
    }
  }

  return (
    <div className="row">
      <div className="col col-6 p-1">
        <Card className="p-4">
          <ChildrenPreview title={getTitleComponent()} side="Before">
            {renderBeforeChildren()}
          </ChildrenPreview>
        </Card>
      </div>
      <div className="col col-6 p-1">
        <Card className="p-4">
          <ChildrenPreview title={getTitleComponent()} side="After">
            {renderAfterChildren()}
          </ChildrenPreview>
        </Card>
      </div>
    </div>
  );
};
