import { UpstreamInfo } from "../data/types";
import { ContainerState } from "./ContainerRow";

type WithState<T> = T & { state?: ContainerState, originalName?: string };
type WithIndex<T> = T & { index: number };

export type CourseContainerChildBase = {
  name: string;
  id: string;
  upstreamLink: UpstreamInfo;
  blockType: string;
}

export type ContainerChildBase = {
  displayName: string;
  id: string;
  containerType: string;
}

export function checkIsReadyToSync(link: UpstreamInfo): boolean {
  return (link.versionSynced < (link.versionAvailable || 0))
    || (link.versionSynced < (link.versionDeclined || 0))
}

/**
 * Compares two arrays of container children (`a` and `b`) to determine the differences between them.
 * It generates two lists indicating which elements have been added, modified, moved, or removed.
 */
export function diffPreviewContainerChildren<A extends CourseContainerChildBase, B extends ContainerChildBase>(
  a: A[],
  b: B[],
  idKey: string = "id"
): [WithState<A>[], WithState<B>[]] {
  const mapA = new Map<any, WithIndex<A>>();
  const mapB = new Map<any, WithIndex<B>>();
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    mapA.set(element.upstreamLink?.upstreamRef, { ...element, index });
  }
  const updatedA: WithState<A>[] = [...a];
  const addedA: Array<WithIndex<A>> = [];
  const updatedB: WithState<B>[] = [];
  for (let index = 0; index < b.length; index++) {
    const newVersion = b[index];
    const oldVersion = mapA.get(newVersion.id);
    if (!oldVersion) {
      // This is a newly added component
      addedA.push({
        id: newVersion.id,
        name: newVersion.displayName,
        blockType: newVersion.containerType,
        index,
      } as WithIndex<A>);
      updatedB.push({...newVersion, state: "added"});
    } else {
      // It was present in previous version
      let state: ContainerState | undefined;
      const displayName = oldVersion.upstreamLink.isModified ? oldVersion.name : newVersion.displayName;
      let originalName: string | undefined;
      if (index !== oldVersion.index) {
        // has moved from its position
        state = "moved";
      }
      if (displayName !== newVersion.displayName && displayName === oldVersion.name) {
        // Has been renamed
        state = "renamed";
        originalName = newVersion.displayName;
      }
      if (checkIsReadyToSync(oldVersion.upstreamLink)) {
        // has a new version ready to sync
        state = "modified";
      }
      // Insert in its original index
      updatedA.splice(oldVersion.index, 1, {...oldVersion, state, originalName});
      updatedB.push({...newVersion, displayName, state});
      // Delete it from mapA as it is processed.
      mapA.delete(newVersion.id);
    }
  }

  // If there are remaining items in mapA, it means they were deleted in newVersion;
  mapA.forEach((oldVersion) => {
    updatedA.splice(oldVersion.index, 1, { ...oldVersion, state: "removed" });
    updatedB.splice(oldVersion.index, 0, {
      id: oldVersion.id,
      displayName: oldVersion.name,
      containerType: oldVersion.blockType,
      state: "removed",
    } as WithState<B>);
  });

  // Create a map for id with index of newly updatedB array
  for (let index = 0; index < updatedB.length; index++) {
    const element = updatedB[index];
    mapB.set(element[idKey], { ...element, index });
  }

  // Use new mapB for getting new index for added elements
  addedA.forEach((addedRow) => {
    updatedA.splice(mapB.get(addedRow.id)?.index!, 0, { ...addedRow, state: "added" });
  });

  return [updatedA, updatedB];
}

