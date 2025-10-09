import { useCallback, useMemo, useState } from 'react';

import {
  Alert,
  Breadcrumb, Button, Card, Icon, Stack,
} from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { ContainerType } from '@src/generic/key-utils';
import ErrorAlert from '@src/generic/alert-error';
import { LoadingSpinner } from '@src/generic/Loading';
import { useContainer, useContainerChildren } from '@src/library-authoring/data/apiHooks';
import { BoldText } from '@src/utils';

import ChildrenPreview from './ChildrenPreview';
import ContainerRow from './ContainerRow';
import { useCourseContainerChildren } from './data/apiHooks';
import { ContainerChild, ContainerChildBase, WithState } from './types';
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
  showLocalUpdateAlert: boolean;
  localUpdateAlertBlockName: string;
}

/**
 * Actual implementation of the displaying diff between children of containers.
 */
const CompareContainersWidgetInner = ({
  upstreamBlockId,
  downstreamBlockId,
  parent,
  onRowClick,
  onBackBtnClick,
  showLocalUpdateAlert,
  localUpdateAlertBlockName,
}: Props) => {
  const intl = useIntl();
  const { data, isError, error } = useCourseContainerChildren(downstreamBlockId, parent.length === 0);
  const {
    data: libData,
    isError: isLibError,
    error: libError,
  } = useContainerChildren(upstreamBlockId, true);
  const {
    data: containerData,
    isError: isContainerTitleError,
    error: containerTitleError,
  } = useContainer(upstreamBlockId);

  const result = useMemo(() => {
    if (!data || !libData) {
      return [undefined, undefined];
    }
    return diffPreviewContainerChildren(data.children, libData as ContainerChildBase[]);
  }, [data, libData]);

  const renderBeforeChildren = useCallback(() => {
    if (!result[0]) {
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
  }, [result]);

  const renderAfterChildren = useCallback(() => {
    if (!result[1]) {
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

  const renderAlert = useCallback(() => {
    // Show this alert if the only change is a local override to a text component
    if (showLocalUpdateAlert) {
      return (
        <Alert variant="info">
          <FormattedMessage
            {...messages.localChangeInTextAlert}
            values={{
              blockName: localUpdateAlertBlockName,
              b: BoldText,
            }}
          />
        </Alert>
      );
    }

    return null;
  }, [showLocalUpdateAlert, localUpdateAlertBlockName]);

  if (isError || isLibError || isContainerTitleError) {
    return <ErrorAlert error={error || libError || containerTitleError} />;
  }

  return (
    <div className="row justify-content-center">
      {renderAlert()}
      <div className="col col-6 p-1">
        <Card className="p-4">
          <ChildrenPreview title={getTitleComponent(data?.displayName)} side="Before">
            {renderBeforeChildren()}
          </ChildrenPreview>
        </Card>
      </div>
      <div className="col col-6 p-1">
        <Card className="p-4">
          <ChildrenPreview title={getTitleComponent(containerData?.publishedDisplayName)} side="After">
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
    parent: ContainerInfoProps[];
  }>({
    upstreamBlockId,
    downstreamBlockId,
    parent: [],
  });

  const { data } = useCourseContainerChildren(downstreamBlockId, true);
  let showLocalUpdateAlert = false;
  let localUpdateAlertBlockName = '';

  // Show this alert if the only change is a local override to a text component.
  // We decided not to put this in `CompareContainersWidgetInner` because if you enter a child,
  // the alert would disappear. By keeping this call in CompareContainersWidget,
  // the alert remains in the modal regardless of whether you navigate within the children.
  if (!isReadyToSyncIndividually && data?.upstreamReadyToSyncChildrenInfo.length === 1
        && data.upstreamReadyToSyncChildrenInfo[0].isModified
        && data.upstreamReadyToSyncChildrenInfo[0].blockType === 'html') {
    showLocalUpdateAlert = true;
    localUpdateAlertBlockName = data.upstreamReadyToSyncChildrenInfo[0].name;
  }

  const onRowClick = (row: WithState<ContainerChild>) => {
    if (!isRowClickable(row.state, row.blockType as ContainerType)) {
      return;
    }

    setCurrentContainerState((prev) => ({
      upstreamBlockId: row.id!,
      downstreamBlockId: row.downstreamId!,
      parent: [...prev.parent, {
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
        upstreamBlockId: prevParent!.upstreamBlockId,
        downstreamBlockId: prevParent!.downstreamBlockId,
        parent: prev.parent.slice(0, -1),
      };
    });
  };

  return (
    <CompareContainersWidgetInner
      upstreamBlockId={currentContainerState.upstreamBlockId}
      downstreamBlockId={currentContainerState.downstreamBlockId}
      parent={currentContainerState.parent}
      onRowClick={onRowClick}
      onBackBtnClick={onBackBtnClick}
      showLocalUpdateAlert={showLocalUpdateAlert}
      localUpdateAlertBlockName={localUpdateAlertBlockName}
    />
  );
};
