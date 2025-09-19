import { Card } from "@openedx/paragon";
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
  const { data, isPending } = useCourseContainerChildren(downstreamBlockId);
  const { data: libData, isPending: libPending } = useContainerChildren(upstreamBlockId, true) as UseQueryResult<Container[], Error>;;

  const result = useCallback(
    () => {
      if (!data || !libData) {
        return [undefined, undefined];
      }
      return diffPreviewContainerChildren(data.children, libData)
    },
    [data, libData]
  );

  const renderBeforeChildren = useCallback(() => {
    if (isPending) {
      return <div className="m-auto"><LoadingSpinner /></div>
    }

    return result()[0]?.map((child) => (
      <ContainerRow
        title={child.name}
        containerType={child.blockType}
        state={child.state}
        originalName={child.originalName}
        side="Before"
      />
    ))
  }, [isPending, result]);

  const renderAfterChildren = useCallback(() => {
    if (libPending || isPending) {
      return <div className="m-auto"><LoadingSpinner /></div>
    }

    return result()[1]?.map((child) => (
      <ContainerRow
        title={child.displayName}
        containerType={child.containerType}
        state={child.state}
        side="After"
      />
    ))
  }, [libPending, isPending, result]);

  return (
    <div className="row">
      <div className="col col-6 p-1">
        <Card className="p-4">
          <ChildrenPreview title={title} side="Before">
            {renderBeforeChildren()}
          </ChildrenPreview>
        </Card>
      </div>
      <div className="col col-6 p-1">
        <Card className="p-4">
          <ChildrenPreview title={title} side="After">
            {renderAfterChildren()}
          </ChildrenPreview>
        </Card>
      </div>
    </div>
  )
}
