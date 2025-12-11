import { UpstreamInfo } from '@src/data/types';
import { ContainerType, normalizeContainerType } from '@src/generic/key-utils';
import {
  ContainerChild,
  ContainerChildBase,
  ContainerState,
  CourseContainerChildBase,
  WithIndex,
  WithState,
} from './types';

export function checkIsReadyToSync(link: UpstreamInfo): boolean {
  return (link.versionSynced < (link.versionAvailable || 0))
    || (link.versionSynced < (link.versionDeclined || 0))
      || ((link.readyToSyncChildren?.length || 0) > 0);
}

/**
 * Compares two arrays of container children (`a` and `b`) to determine the differences between them.
 * It generates two lists indicating which elements have been added, modified, moved, or removed.
 */
export function diffPreviewContainerChildren<A extends CourseContainerChildBase, B extends ContainerChildBase>(
  a: A[],
  b: B[],
  idKey: string = 'id',
): [WithState<ContainerChild>[], WithState<ContainerChild>[]] {
  const mapA = new Map<any, WithIndex<A>>();
  const mapB = new Map<any, WithIndex<ContainerChild>>();
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    mapA.set(element.upstreamLink?.upstreamRef, { ...element, index });
  }
  const updatedA: WithState<ContainerChild>[] = Array(a.length);
  const addedA: Array<WithIndex<ContainerChild>> = [];
  const updatedB: WithState<ContainerChild>[] = [];
  for (let index = 0; index < b.length; index++) {
    const newVersion = b[index];
    const oldVersion = mapA.get(newVersion.id);

    if (!oldVersion) {
      // This is a newly added component
      addedA.push({
        id: newVersion.id,
        name: newVersion.displayName,
        blockType: (newVersion.containerType || newVersion.blockType)!,
        index,
      });
      updatedB.push({
        name: newVersion.displayName,
        blockType: (newVersion.blockType || newVersion.containerType)!,
        id: newVersion.id,
        state: 'added',
      });
    } else {
      // It was present in previous version
      let state: ContainerState | undefined;
      const displayName = oldVersion.upstreamLink.downstreamCustomized.includes('display_name') ? oldVersion.name : newVersion.displayName;
      let originalName: string | undefined;
      // FIXME: This logic doesn't work when the content is updated locally and the upstream display name is updated.
      // `isRenamed` becomes true.
      // We probably need to differentiate between `contentModified` and `rename` in the backend or
      // send `downstream_customized` field to the frontend and use it here.
      const isRenamed = displayName !== newVersion.displayName && displayName === oldVersion.name;
      const isContentModified = oldVersion.upstreamLink.downstreamCustomized.includes('data');
      if (index !== oldVersion.index) {
        // has moved from its position
        state = 'moved';
      }
      if ((oldVersion.upstreamLink.downstreamCustomized.length || 0) > 0) {
        if (isRenamed) {
          state = 'locallyRenamed';
          originalName = newVersion.displayName;
        }
        if (isContentModified) {
          state = 'locallyContentUpdated';
        }
        if (isRenamed && isContentModified) {
          state = 'locallyRenamedAndContentUpdated';
        }
      } else if (checkIsReadyToSync(oldVersion.upstreamLink)) {
        // has a new version ready to sync
        state = 'modified';
      }
      // Insert in its original index
      updatedA.splice(oldVersion.index, 1, {
        name: oldVersion.name,
        blockType: normalizeContainerType(oldVersion.blockType),
        id: oldVersion.upstreamLink.upstreamRef,
        downstreamId: oldVersion.id,
        state,
        originalName,
      });
      updatedB.push({
        name: displayName,
        blockType: (newVersion.blockType || newVersion.containerType)!,
        id: newVersion.id,
        downstreamId: oldVersion.id,
        state,
      });
      // Delete it from mapA as it is processed.
      mapA.delete(newVersion.id);
    }
  }

  // If there are remaining items in mapA, it means they were deleted in newVersion;
  mapA.forEach((oldVersion) => {
    updatedA.splice(oldVersion.index, 1, {
      name: oldVersion.name,
      blockType: normalizeContainerType(oldVersion.blockType),
      id: oldVersion.upstreamLink.upstreamRef,
      downstreamId: oldVersion.id,
      state: 'removed',
    });
    updatedB.splice(oldVersion.index, 0, {
      id: oldVersion.upstreamLink.upstreamRef,
      name: oldVersion.name,
      blockType: normalizeContainerType(oldVersion.blockType),
      downstreamId: oldVersion.id,
      state: 'removed',
    });
  });

  // Create a map for id with index of newly updatedB array
  for (let index = 0; index < updatedB.length; index++) {
    const element = updatedB[index];
    mapB.set(element[idKey], { ...element, index });
  }

  // Use new mapB for getting new index for added elements
  addedA.forEach((addedRow) => {
    updatedA.splice(mapB.get(addedRow.id)?.index!, 0, { ...addedRow, state: 'added' });
  });

  return [updatedA, updatedB];
}

export function isRowClickable(state?: ContainerState, blockType?: ContainerType) {
  return state && blockType && ['modified', 'added', 'removed'].includes(state) && [
    ContainerType.Section,
    ContainerType.Subsection,
    ContainerType.Unit,
  ].includes(blockType);
}
