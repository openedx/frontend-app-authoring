/* eslint-disable import/prefer-default-export */
export const buildCollectionUsageKey = (libraryId: string, collectionId: string) => {
  const orgLib = libraryId.replace('lib:', '');
  return `lib-collection:${orgLib}:${collectionId}`;
};
