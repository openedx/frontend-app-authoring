import { Stack } from "@openedx/paragon";
import { UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { LoadingSpinner } from "../generic/Loading";
import { Container } from "../library-authoring/data/api";
import { useContainerChildren } from "../library-authoring/data/apiHooks";
import ChildrenPreview from "./ChildrenPreview";
import ContainerRow  from "./ContainerRow";
import { useCourseContainerChildren } from "./data/apiHooks";
import { diffPreviewContainerChildren } from "./utils";

interface Props {
  title: string;
  upstreamBlockId: string;
  downstreamBlockId: string;
}

export const CompareContainersWidget = ({ title, upstreamBlockId, downstreamBlockId }: Props) => {
  const { data, isLoading } = useCourseContainerChildren(downstreamBlockId);
  const { data: libData, isLoading: libLoading } = useContainerChildren(upstreamBlockId, true) as UseQueryResult<Container[], Error>;;

  const result = useCallback(
    () => diffPreviewContainerChildren(data?.children || [], libData || []),
    [data, libData]
  );

  const renderBeforeChildren = useCallback(() => {
    if (isLoading) {
      return <div className="m-auto"><LoadingSpinner /></div>
    }

    return result()[0].map((child) => (
      <ContainerRow
        title={child.name}
        containerType={child.blockType}
        state={child.state}
      />
    ))
  }, [isLoading, result]);

  const renderAfterChildren = useCallback(() => {
    if (libLoading || isLoading) {
      return <div className="m-auto"><LoadingSpinner /></div>
    }

    return result()[1].map((child) => (
      <ContainerRow
        title={child.displayName}
        containerType={child.containerType}
        state={child.state}
      />
    ))
  }, [libLoading, isLoading, result]);

  return (
    <Stack direction="horizontal" gap={3}>
      <ChildrenPreview title={title} side="Before">
        {renderBeforeChildren()}
      </ChildrenPreview>
      <ChildrenPreview title={title} side="After">
        {renderAfterChildren()}
      </ChildrenPreview>
    </Stack>
  )
}
