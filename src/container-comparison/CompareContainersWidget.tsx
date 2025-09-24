import {
  Breadcrumb, Button, Card, Icon, Stack,
} from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import { useCallback, useMemo, useState } from 'react';
import { ContainerType } from '@src/generic/key-utils';
import { LoadingSpinner } from '@src/generic/Loading';
import { useContainerChildren } from '@src/library-authoring/data/apiHooks';
import ChildrenPreview from './ChildrenPreview';
import ContainerRow from './ContainerRow';
import { useCourseContainerChildren } from './data/apiHooks';
import { ContainerChild, ContainerChildBase, WithState } from './types';
import { diffPreviewContainerChildren, isRowClickable } from './utils';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

interface ContainerInfoProps {
  title: string;
  upstreamBlockId: string;
  downstreamBlockId: string;
}

interface Props extends ContainerInfoProps {
  parent: ContainerInfoProps[];
  onRowClick: (row: WithState<ContainerChild>) => void;
  onBackBtnClick: () => void;
}

/**
 * Actual implementation of the displaying diff between children of containers.
 */
const CompareContainersWidgetInner = ({
  title,
  upstreamBlockId,
  downstreamBlockId,
  parent,
  onRowClick,
  onBackBtnClick,
}: Props) => {
  const intl = useIntl();
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
        key={child.id}
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
        key={child.id}
        title={child.name}
        containerType={child.blockType}
        state={child.state}
        side="After"
        onClick={() => onRowClick(child)}
      />
    ));
  }, [libPending, isPending, result]);

  const getTitleComponent = () => {
    if (parent.length === 0) {
      return title;
    }
    return (
      <Breadcrumb
        ariaLabel={intl.formatMessage(messages.breadcrumbAriaLabel)}
        links={[
          {
            label: <Stack direction="horizontal" gap={1}><Icon size="xs" src={ArrowBack} />Back</Stack>,
            onClick: onBackBtnClick,
            variant: 'link',
            className: 'px-0 text-gray-900',
          },
          {
            label: title,
            variant: 'link',
            className: 'px-0 text-gray-900',
            disabled: true,
          },
        ]}
        linkAs={Button}
      />
    );
  };

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

/**
 * CompareContainersWidget component. Displays a diff of set of child containers from two different sources
 * and allows the user to select the container to view. This is a wrapper component that maintains current
 * source state. Actual implementation of the diff view is done by CompareContainersWidgetInner.
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

  const onRowClick = (row: WithState<ContainerChild>) => {
    if (!isRowClickable(row.state, row.blockType as ContainerType)) {
      return;
    }

    setCurrentContainerState((prev) => ({
      title: row.name,
      upstreamBlockId: row.id!,
      downstreamBlockId: row.downstreamId!,
      parent: [...prev.parent, {
        title: prev.title,
        upstreamBlockId: prev.upstreamBlockId,
        downstreamBlockId: prev.downstreamBlockId,
      }],
    }));
  };

  const onBackBtnClick = () => {
    setCurrentContainerState((prev) => {
      // istanbul ignore if: this should never happen
      if (prev.parent.length < 1) {
        return prev;
      }
      const prevParent = prev.parent[prev.parent.length - 1];
      return {
        title: prevParent!.title,
        upstreamBlockId: prevParent!.upstreamBlockId,
        downstreamBlockId: prevParent!.downstreamBlockId,
        parent: prev.parent.slice(0, -1),
      };
    });
  };

  return (
    <CompareContainersWidgetInner
      title={currentContainerState.title}
      upstreamBlockId={currentContainerState.upstreamBlockId}
      downstreamBlockId={currentContainerState.downstreamBlockId}
      parent={currentContainerState.parent}
      onRowClick={onRowClick}
      onBackBtnClick={onBackBtnClick}
    />
  );
};
