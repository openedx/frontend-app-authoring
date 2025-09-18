import { Stack } from "@openedx/paragon";
import { UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { UpstreamInfo } from "../data/types";
import { ContainerType } from "../generic/key-utils";
import { LoadingSpinner } from "../generic/Loading";
import { Container } from "../library-authoring/data/api";
import { useContainerChildren } from "../library-authoring/data/apiHooks";
import ChildrenPreview from "./ChildrenPreview";
import ContainerRow, { ContainerState } from "./ContainerRow";
import { useCourseContainerChildren } from "./data/apiHooks";

interface Props {
  title: string;
  upstreamBlockId: string;
  downstreamBlockId: string;
}

type WithState<T> = T & { state?: ContainerState };

type CourseContainerChildBase = {
  name: string;
  id: string;
  upstreamLink: UpstreamInfo;
  blockType: ContainerType;
}

type ContainerChildBase = {
  displayName: string;
  id: string;
  containerType: ContainerType;
}

function checkIsReadyToSync(link: UpstreamInfo): boolean {
  return (link.versionSynced < (link.versionAvailable || 0))
    || (link.versionSynced < (link.versionDeclined || 0))
}

/**
 * Stable-merge two lists while preserving relative order from both.
 * Returns [updatedA, updatedB] where both arrays have the same length
 * and are aligned index-by-index.
 *
 * Assumes each object has a unique identifier field `idKey`.
 */
function stableMergeWithState<A extends CourseContainerChildBase, B extends ContainerChildBase>(
  a: A[],
  b: B[],
  idKey: string = "id"
): [WithState<A>[], WithState<B>[]] {
  const mapA = new Map<any, A>();
  const mapB = new Map<any, B>();
  for (const x of a) mapA.set(x.upstreamLink?.upstreamRef, x);
  for (const x of b) mapB.set(x[idKey], x);

  // Build sequences of ids preserving order
  const idsA = a.map(x => x.upstreamLink?.upstreamRef);
  const idsB = b.map(x => x[idKey]);

  // We'll perform a stable merge of idsA and idsB producing mergedIds.
  // When an id appears in both, include it once at the point we encounter it
  // in either sequence while preserving relative order of remaining items.
  const mergedIds: string[] = [];
  const seen = new Set<string>();
  let i = 0, j = 0;
  while (i < idsA.length || j < idsB.length) {
    if (i < idsA.length && j < idsB.length) {
      const idA = idsA[i];
      const idB = idsB[j];
      if (idA === idB) {
        if (!seen.has(idA)) {
          mergedIds.push(idA);
          seen.add(idA);
        }
        i++; j++;
      } else {
        // Lookahead: prefer whichever id occurs earlier in the other list to avoid
        // reordering common elements. If idA appears later in idsB, we should take idB now,
        // and vice versa. If neither appears later, take idA to preserve A's order.
        const nextIndexOfAinB = idsB.indexOf(idA, j);
        const nextIndexOfBinA = idsA.indexOf(idB, i);

        if (nextIndexOfAinB === -1 && nextIndexOfBinA === -1) {
          // distinct remaining sequences — take from A to preserve A order
          if (!seen.has(idA)) { mergedIds.push(idA); seen.add(idA); }
          i++;
        } else if (nextIndexOfAinB === -1) {
          // idA not in remaining B, prefer idA (keeps A relative)
          if (!seen.has(idA)) { mergedIds.push(idA); seen.add(idA); }
          i++;
        } else if (nextIndexOfBinA === -1) {
          // idB not in remaining A, prefer idB
          if (!seen.has(idB)) { mergedIds.push(idB); seen.add(idB); }
          j++;
        } else {
          // both appear later in the opposite lists: take the one with smaller next index
          if (nextIndexOfAinB <= nextIndexOfBinA) {
            if (!seen.has(idA)) { mergedIds.push(idA); seen.add(idA); }
            i++;
          } else {
            if (!seen.has(idB)) { mergedIds.push(idB); seen.add(idB); }
            j++;
          }
        }
      }
    } else if (i < idsA.length) {
      const idA = idsA[i++];
      if (!seen.has(idA)) { mergedIds.push(idA); seen.add(idA); }
    } else {
      const idB = idsB[j++];
      if (!seen.has(idB)) { mergedIds.push(idB); seen.add(idB); }
    }
  }

  const updatedA: WithState<A>[] = [];
  const updatedB: WithState<B>[] = [];

  for (const id of mergedIds) {
    const itemA = mapA.get(id);
    const itemB = mapB.get(id);
    if (itemA && itemB) {
      let state: ContainerState | undefined;
      const newDisplayName = itemA?.upstreamLink?.isModified ? itemA?.name : itemB.displayName;
      if (checkIsReadyToSync(itemA.upstreamLink!)) {
        state = "modified";
      }
      updatedA.push({ ...itemA, state });
      updatedB.push({ ...itemB, displayName: newDisplayName, state });
    } else if (itemA && !itemB) {
      updatedA.push({ ...itemA, state: "removed" });
      updatedB.push({
        displayName: itemA.name,
        id: itemA.id,
        containerType: itemA.blockType,
        state: "removed",
      } as WithState<B>);
    } else if (!itemA && itemB) {
      updatedA.push({
        name: itemB.displayName,
        id: itemB.id,
        blockType: itemB.containerType,
        state: "added",
      } as WithState<A>);
      updatedB.push({ ...itemB, state: "added" });
    }
  }

  return [updatedA, updatedB];
}


export const CompareContainersWidget = ({ title, upstreamBlockId, downstreamBlockId }: Props) => {
  const { data, isLoading } = useCourseContainerChildren(downstreamBlockId);
  const { data: libData, isLoading: libLoading } = useContainerChildren(upstreamBlockId, true) as UseQueryResult<Container[], Error>;;

  const result = useCallback(
    () => stableMergeWithState(data?.children || [], libData || []),
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
