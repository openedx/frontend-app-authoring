import { useCallback, useMemo, useState } from 'react';

import {
  Alert,
  Breadcrumb, Button, Card, Icon, Stack,
} from '@openedx/paragon';
import { ArrowBack, Add, Delete } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { ContainerType, getBlockType } from '@src/generic/key-utils';
import ErrorAlert from '@src/generic/alert-error';
import { LoadingSpinner } from '@src/generic/Loading';
import { useContainer, useContainerChildren } from '@src/library-authoring/data/apiHooks';
import { BoldText } from '@src/utils';

import { Container, LibraryBlockMetadata } from '@src/library-authoring/data/api';
import ChildrenPreview from './ChildrenPreview';
import ContainerRow from './ContainerRow';
import { useCourseContainerChildren } from './data/apiHooks';
import {
  ContainerChild, ContainerChildBase, ContainerState, WithState,
} from './types';
import { diffPreviewContainerChildren, isRowClickable } from './utils';
import messages from './messages';

interface ContainerInfoProps {
  upstreamBlockId: string;
  downstreamBlockId: string;
  isReadyToSyncIndividually?: boolean;
}

interface Props extends ContainerInfoProps {
  parent: ContainerInfoProps[];
  onRowClick: (row: WithState<ContainerChild>) => void;
  onBackBtnClick: () => void;
  state?: ContainerState;
  // This two props are used to show an alert for the changes to text components with local overrides.
  // They may be removed in the future.
  localUpdateAlertCount: number;
  localUpdateAlertBlockName: string;
}

/**
 * Actual implementation of the displaying diff between children of containers.
 */
const CompareContainersWidgetInner = ({
  upstreamBlockId,
  downstreamBlockId,
  parent,
  state,
  onRowClick,
  onBackBtnClick,
  localUpdateAlertCount,
  localUpdateAlertBlockName,
}: Props) => {
  const intl = useIntl();
  const { data, isError, error } = useCourseContainerChildren(downstreamBlockId, parent.length === 0);
  // There is the case in which the item is removed, but it still exists
  // in the library, for that case, we avoid bringing the children.
  const {
    data: libData,
    isError: isLibError,
    error: libError,
  } = useContainerChildren<Container | LibraryBlockMetadata>(state === 'removed' ? undefined : upstreamBlockId, true);
  const {
    data: containerData,
    isError: isContainerTitleError,
    error: containerTitleError,
  } = useContainer(upstreamBlockId);

  const result = useMemo(() => {
    if ((!data || !libData) && !['added', 'removed'].includes(state || '')) {
      return [undefined, undefined];
    }

    return diffPreviewContainerChildren(data?.children || [], libData as ContainerChildBase[] || []);
  }, [data, libData]);

  const renderBeforeChildren = useCallback(() => {
    if (!result[0] && state !== 'added') {
      return <div className="m-auto"><LoadingSpinner /></div>;
    }

    if (state === 'added') {
      return (
        <Stack className="align-items-center justify-content-center bg-light-200 text-gray-800">
          <Icon src={Add} className="big-icon" />
          <FormattedMessage
            {...messages.newContainer}
            values={{
              containerType: getBlockType(upstreamBlockId),
            }}
          />
        </Stack>
      );
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
  }, [result]);

  const renderAfterChildren = useCallback(() => {
    if (!result[1] && state !== 'removed') {
      return <div className="m-auto"><LoadingSpinner /></div>;
    }

    if (state === 'removed') {
      return (
        <Stack className="align-items-center justify-content-center bg-light-200 text-gray-800">
          <Icon src={Delete} className="big-icon" />
          <FormattedMessage
            {...messages.deletedContainer}
            values={{
              containerType: getBlockType(upstreamBlockId),
            }}
          />
        </Stack>
      );
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
  }, [result]);

  const getTitleComponent = useCallback((title?: string | null) => {
    if (!title) {
      return <div className="m-auto"><LoadingSpinner /></div>;
    }

    if (parent.length === 0) {
      return title;
    }
    return (
      <Breadcrumb
        ariaLabel={intl.formatMessage(messages.breadcrumbAriaLabel)}
        links={[
          {
            // This raises failed prop-type error as label expects a string but it works without any issues
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
  }, [parent]);

  let beforeTitle: string | undefined | null = data?.displayName;
  let afterTitle = containerData?.publishedDisplayName;
  if (!data && state === 'added') {
    beforeTitle = containerData?.publishedDisplayName;
  }
  if (!containerData && state === 'removed') {
    afterTitle = data?.displayName;
  }

  if (isError || (isLibError && state !== 'removed') || (isContainerTitleError && state !== 'removed')) {
    return <ErrorAlert error={error || libError || containerTitleError} />;
  }

  return (
    <div className="compare-changes-widget row justify-content-center">
      {localUpdateAlertCount > 0 && (
        <Alert variant="info">
          <FormattedMessage
            {...messages.localChangeInTextAlert}
            values={{
              blockName: localUpdateAlertBlockName,
              count: localUpdateAlertCount,
              b: BoldText,
            }}
          />
        </Alert>
      )}
      <div className="col col-6 p-1">
        <Card className="compare-card p-4">
          <ChildrenPreview title={getTitleComponent(beforeTitle)} side="Before">
            {renderBeforeChildren()}
          </ChildrenPreview>
        </Card>
      </div>
      <div className="col col-6 p-1">
        <Card className="compare-card p-4">
          <ChildrenPreview title={getTitleComponent(afterTitle)} side="After">
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
export const CompareContainersWidget = ({
  upstreamBlockId,
  downstreamBlockId,
  isReadyToSyncIndividually = false,
}: ContainerInfoProps) => {
  const [currentContainerState, setCurrentContainerState] = useState<ContainerInfoProps & {
    state?: ContainerState;
    parent:(ContainerInfoProps & { state?: ContainerState })[];
  }>({
        upstreamBlockId,
        downstreamBlockId,
        parent: [],
        state: 'modified',
      });

  const { data } = useCourseContainerChildren(downstreamBlockId, true);
  let localUpdateAlertBlockName = '';
  let localUpdateAlertCount = 0;

  // Show this alert if the only change is text components with local overrides.
  // We decided not to put this in `CompareContainersWidgetInner` because if you enter a child,
  // the alert would disappear. By keeping this call in CompareContainersWidget,
  // the alert remains in the modal regardless of whether you navigate within the children.
  if (!isReadyToSyncIndividually && data?.upstreamReadyToSyncChildrenInfo
      && data.upstreamReadyToSyncChildrenInfo.every(value => value.downstreamCustomized.length > 0 && value.blockType === 'html')
  ) {
    localUpdateAlertCount = data.upstreamReadyToSyncChildrenInfo.length;
    if (localUpdateAlertCount === 1) {
      localUpdateAlertBlockName = data.upstreamReadyToSyncChildrenInfo[0].name;
    }
  }

  const onRowClick = (row: WithState<ContainerChild>) => {
    if (!isRowClickable(row.state, row.blockType as ContainerType)) {
      return;
    }

    setCurrentContainerState((prev) => ({
      upstreamBlockId: row.id!,
      downstreamBlockId: row.downstreamId!,
      state: row.state,
      parent: [...prev.parent, {
        upstreamBlockId: prev.upstreamBlockId,
        downstreamBlockId: prev.downstreamBlockId,
        state: prev.state,
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
        upstreamBlockId: prevParent!.upstreamBlockId,
        downstreamBlockId: prevParent!.downstreamBlockId,
        state: prevParent!.state,
        parent: prev.parent.slice(0, -1),
      };
    });
  };

  return (
    <CompareContainersWidgetInner
      upstreamBlockId={currentContainerState.upstreamBlockId}
      downstreamBlockId={currentContainerState.downstreamBlockId}
      parent={currentContainerState.parent}
      state={currentContainerState.state}
      onRowClick={onRowClick}
      onBackBtnClick={onBackBtnClick}
      localUpdateAlertCount={localUpdateAlertCount}
      localUpdateAlertBlockName={localUpdateAlertBlockName}
    />
  );
};
