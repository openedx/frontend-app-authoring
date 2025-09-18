import { UpstreamInfo } from "../data/types";
import { ContainerState } from "./ContainerRow";

type WithState<T> = T & { state?: ContainerState };

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
  const mapA = new Map<any, A & { index: number }>();
  const mapB = new Map<any, B & { index: number }>();
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    mapA.set(element.upstreamLink?.upstreamRef, { ...element, index });
  }
  for (let index = 0; index < b.length; index++) {
    const element = b[index];
    mapB.set(element[idKey], { ...element, index });
  }
  const updatedA: WithState<A>[] = [];
  const updatedB: WithState<B>[] = [];
  for (let index = 0; index < b.length; index++) {
    const newVersion = b[index];
    const oldVersion = mapA.get(newVersion.id);
    if (!oldVersion) {
      // This is a newly added component
      updatedA.splice(index, 0, {
        id: newVersion.id,
        name: newVersion.displayName,
        blockType: newVersion.containerType,
        state: "added",
      } as WithState<A>);
      updatedB.push({...newVersion, state: "added"});
    } else {
      // It was present in previous version
      let state: ContainerState | undefined;
      const displayName = oldVersion.upstreamLink.isModified ? oldVersion.name : newVersion.displayName;
      if (index !== oldVersion.index) {
        // has moved from its position
        state = "moved";
      }
      if (checkIsReadyToSync(oldVersion.upstreamLink)) {
        // has a new version ready to sync
        state = "modified";
      }
      // Insert in its original index
      updatedA.splice(oldVersion.index, 0, {...oldVersion, state});
      updatedB.push({...newVersion, displayName, state});
      // Delete it from mapA as it is processed.
      mapA.delete(newVersion.id);
    }
  }

  // If there are remaining items in mapA, it means they were deleted in newVersion;
  mapA.forEach((oldVersion) => {
    updatedA.splice(oldVersion.index, 0, { ...oldVersion, state: "removed" });
    updatedB.splice(oldVersion.index, 0, {
      id: oldVersion.id,
      displayName: oldVersion.name,
      containerType: oldVersion.blockType,
      state: "removed",
    } as WithState<B>);
  });

  return [updatedA, updatedB];
}

