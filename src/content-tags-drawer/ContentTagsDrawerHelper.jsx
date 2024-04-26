// @ts-check
import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { cloneDeep } from 'lodash';
import { useContentData, useContentTaxonomyTagsData, useContentTaxonomyTagsUpdater } from './data/apiHooks';
import { useTaxonomyList } from '../taxonomy/data/apiHooks';
import { extractOrgFromContentId } from './utils';
import messages from './messages';
import { ContentTagsDrawerSheetContext } from './common/context';

/** @typedef {import("./data/types.mjs").Tag} ContentTagData */
/** @typedef {import("./data/types.mjs").StagedTagData} StagedTagData */
/** @typedef {import("./data/types.mjs").TagsInTaxonomy} TagsInTaxonomy */

/**
 * Handles the context and all the underlying logic for the ContentTagsDrawer component
 * @param {string} contentId
 * @returns {{
 *     stagedContentTags: Record<number, StagedTagData[]>,
 *     addStagedContentTag: (taxonomyId: number, addedTag: StagedTagData) => void,
 *     removeStagedContentTag: (taxonomyId: number, tagValue: string) => void,
 *     removeGlobalStagedContentTag: (taxonomyId: number, tagValue: string) => void,
 *     addRemovedContentTag: (taxonomyId: number, tagValue: string) => void,
 *     deleteRemovedContentTag: (taxonomyId: number, tagValue: string) => void,
 *     setStagedTags: (taxonomyId: number, tagsList: StagedTagData[]) => void,
 *     globalStagedContentTags: Record<number, StagedTagData[]>,
 *     globalStagedRemovedContentTags: Record<number, string>,
 *     setGlobalStagedContentTags: Function,
 *     commitGlobalStagedTags: () => void,
 *     commitGlobalStagedTagsStatus: string,
 *     isContentDataLoaded: boolean,
 *     isContentTaxonomyTagsLoaded: boolean,
 *     isTaxonomyListLoaded: boolean,
 *     contentName: string,
 *     tagsByTaxonomy: TagsInTaxonomy[],
 *     isEditMode: boolean,
 *     toEditMode: () => void,
 *     toReadMode: () => void,
 *     collapsibleStates: Record<number, boolean>,
 *     openCollapsible: (taxonomyId: number) => void,
 *     closeCollapsible: (taxonomyId: number) => void,
 *     toastMessage: string | undefined,
 *     showToastAfterSave: () => void,
 *     closeToast: () => void,
 *     setCollapsibleToInitalState: () => void,
 * }}
 */
const useContentTagsDrawerContext = (contentId) => {
  const intl = useIntl();
  const org = extractOrgFromContentId(contentId);

  const { setBlockingSheet } = React.useContext(ContentTagsDrawerSheetContext);

  // True if the drawer is on edit mode.
  const [isEditMode, setIsEditMode] = React.useState(false);
  // This stores the tags added on the add tags Select in all taxonomies.
  const [stagedContentTags, setStagedContentTags] = React.useState({});
  // When a staged tags on a taxonomy is commitet then is saved on this map.
  const [globalStagedContentTags, setGlobalStagedContentTags] = React.useState({});
  // This stores feched tags deleted by the user.
  const [globalStagedRemovedContentTags, setGlobalStagedRemovedContentTags] = React.useState({});
  // Merges feched tags, global staged tags and global removed staged tags
  const [tagsByTaxonomy, setTagsByTaxonomy] = React.useState(/** @type TagsInTaxonomy[] */ ([]));
  // This stores taxonomy collapsible states (open/close).
  const [collapsibleStates, setColapsibleStates] = React.useState({});
  // Message to show a toast in the content drawer.
  const [toastMessage, setToastMessage] = React.useState(/** @type string | undefined */ (undefined));
  // Mutation to update tags
  const updateTags = useContentTaxonomyTagsUpdater(contentId);

  // Fetch from database
  const { data: contentData, isSuccess: isContentDataLoaded } = useContentData(contentId);
  const {
    data: contentTaxonomyTagsData,
    isSuccess: isContentTaxonomyTagsLoaded,
  } = useContentTaxonomyTagsData(contentId);
  const { data: taxonomyListData, isSuccess: isTaxonomyListLoaded } = useTaxonomyList(org);

  // Tags feched from database
  const fechedTaxonomies = React.useMemo(() => {
    const sortTaxonomies = (taxonomiesList) => {
      const taxonomiesWithData = taxonomiesList.filter(
        (t) => t.contentTags.length !== 0,
      );

      // Count implicit tags per taxonomy.
      // TODO This count is also calculated individually
      // in ContentTagsCollapsible. It should only be calculated once.
      const tagsCountBytaxonomy = {};
      taxonomiesWithData.forEach((tax) => {
        tagsCountBytaxonomy[tax.id] = new Set(
          tax.contentTags.flatMap(item => item.lineage),
        ).size;
      });

      // Sort taxonomies with data by implicit count
      const sortedTaxonomiesWithData = taxonomiesWithData.sort(
        (a, b) => tagsCountBytaxonomy[b.id] - tagsCountBytaxonomy[a.id],
      );

      // Empty taxonomies sorted by name.
      // Since the query returns sorted by name,
      // it is not necessary to do another sorting here.
      const emptyTaxonomies = taxonomiesList.filter(
        (t) => t.contentTags.length === 0,
      );

      return [...sortedTaxonomiesWithData, ...emptyTaxonomies];
    };

    if (taxonomyListData && contentTaxonomyTagsData) {
      // Initialize list of content tags in taxonomies to populate
      const taxonomiesList = taxonomyListData.results.map((taxonomy) => ({
        ...taxonomy,
        contentTags: /** @type {ContentTagData[]} */([]),
      }));

      const contentTaxonomies = contentTaxonomyTagsData.taxonomies;

      // eslint-disable-next-line array-callback-return
      contentTaxonomies.map((contentTaxonomyTags) => {
        const contentTaxonomy = taxonomiesList.find((taxonomy) => taxonomy.id === contentTaxonomyTags.taxonomyId);
        if (contentTaxonomy) {
          contentTaxonomy.contentTags = contentTaxonomyTags.tags;
        }
      });

      return sortTaxonomies(taxonomiesList);
    }
    return [];
  }, [taxonomyListData, contentTaxonomyTagsData]);

  // Add a content tags to the staged tags for a taxonomy
  const addStagedContentTag = React.useCallback((taxonomyId, addedTag) => {
    setStagedContentTags(prevStagedContentTags => {
      const updatedStagedContentTags = {
        ...prevStagedContentTags,
        [taxonomyId]: [...(prevStagedContentTags[taxonomyId] ?? []), addedTag],
      };
      return updatedStagedContentTags;
    });
  }, [setStagedContentTags]);

  // Remove a content tag from the staged tags for a taxonomy
  const removeStagedContentTag = React.useCallback((taxonomyId, tagValue) => {
    setStagedContentTags(prevStagedContentTags => ({
      ...prevStagedContentTags,
      [taxonomyId]: prevStagedContentTags[taxonomyId].filter((t) => t.value !== tagValue),
    }));
  }, [setStagedContentTags]);

  // Remove a content tag from the global staged tags for a taxonomy
  const removeGlobalStagedContentTag = React.useCallback((taxonomyId, tagValue) => {
    setGlobalStagedContentTags(prevContentTags => ({
      ...prevContentTags,
      [taxonomyId]: prevContentTags[taxonomyId].filter((t) => t.value !== tagValue),
    }));
  }, [setGlobalStagedContentTags]);

  // Add a content tags to the removed tags for a taxonomy
  const addRemovedContentTag = React.useCallback((taxonomyId, addedTag) => {
    setGlobalStagedRemovedContentTags(prevContentTags => {
      const updatedStagedContentTags = {
        ...prevContentTags,
        [taxonomyId]: [...(prevContentTags[taxonomyId] ?? []), addedTag],
      };
      return updatedStagedContentTags;
    });
  }, [setGlobalStagedRemovedContentTags]);

  // Remove a content tag from the removed tags for a taxonomy
  const deleteRemovedContentTag = React.useCallback((taxonomyId, tagValue) => {
    setGlobalStagedRemovedContentTags(prevContentTags => ({
      ...prevContentTags,
      [taxonomyId]: prevContentTags[taxonomyId].filter((t) => t !== tagValue),
    }));
  }, [setGlobalStagedRemovedContentTags]);

  // Sets the staged content tags for taxonomy to the provided list of tags
  const setStagedTags = React.useCallback((taxonomyId, tagsList) => {
    setStagedContentTags(prevStagedContentTags => ({ ...prevStagedContentTags, [taxonomyId]: tagsList }));
  }, [setStagedContentTags]);

  // Open a collapsible of a taxonomy
  /* istanbul ignore next */
  const openCollapsible = React.useCallback((taxonomyId) => {
    setColapsibleStates(prevStates => ({
      ...prevStates,
      [taxonomyId]: true,
    }));
  }, [setColapsibleStates]);

  // Close a collapsible of a taxonomy
  /* istanbul ignore next */
  const closeCollapsible = React.useCallback((taxonomyId) => {
    setColapsibleStates(prevStates => ({
      ...prevStates,
      [taxonomyId]: false,
    }));
  }, [setColapsibleStates]);

  const openAllCollapsible = React.useCallback(() => {
    const updatedState = {};
    fechedTaxonomies.forEach((taxonomy) => {
      updatedState[taxonomy.id] = true;
    });
    setColapsibleStates(updatedState);
  }, [fechedTaxonomies, setColapsibleStates]);

  // Set initial state of collapsible based on content tags
  const setCollapsibleToInitalState = React.useCallback(() => {
    const updatedState = {};
    fechedTaxonomies.forEach((taxonomy) => {
      // Taxonomy with content tags must be open
      updatedState[taxonomy.id] = taxonomy.contentTags.length !== 0;
    });
    setColapsibleStates(updatedState);
  }, [fechedTaxonomies, setColapsibleStates]);

  // Changes the drawer mode to edit
  const toEditMode = React.useCallback(() => {
    setIsEditMode(true);
    openAllCollapsible();
  }, [setIsEditMode, openAllCollapsible]);

  // Changes the drawer mode to read and clears all staged tags and states.
  const toReadMode = React.useCallback(() => {
    setIsEditMode(false);
    setStagedContentTags({});
    setGlobalStagedContentTags({});
    setGlobalStagedRemovedContentTags({});
    setCollapsibleToInitalState();
  }, [
    setIsEditMode,
    setStagedContentTags,
    setGlobalStagedContentTags,
    setGlobalStagedRemovedContentTags,
    setCollapsibleToInitalState,
  ]);

  // Count added and removed tags
  const countTags = React.useCallback(() => {
    const tagsAddedList = Object.values(globalStagedContentTags);
    const tagsRemovedList = Object.values(globalStagedRemovedContentTags);

    const tagsAdded = tagsAddedList.length === 1 ? tagsAddedList[0].length : tagsAddedList.reduce(
      /* istanbul ignore next */
      (acc, curr) => acc + curr.length,
      0,
    );
    const tagsRemoved = tagsRemovedList.length === 1 ? tagsRemovedList[0].length : tagsRemovedList.reduce(
      /* istanbul ignore next */
      (acc, curr) => acc + curr.length,
      0,
    );
    return {
      tagsAdded,
      tagsRemoved,
    };
  }, [globalStagedContentTags, globalStagedRemovedContentTags]);

  // Build toast message and show toast after save drawer.
  /* istanbul ignore next */
  const showToastAfterSave = React.useCallback(() => {
    const { tagsAdded, tagsRemoved } = countTags();

    let message;
    if (tagsAdded && tagsRemoved) {
      message = `${intl.formatMessage(
        messages.tagsSaveToastTextTypeAdded,
        { tagsAdded },
      )
      } ${
        intl.formatMessage(
          messages.tagsSaveToastTextTypeRemoved,
          { tagsRemoved },
        )
      }`;
    } else if (tagsAdded) {
      message = intl.formatMessage(
        messages.tagsSaveToastTextTypeAdded,
        { tagsAdded },
      );
    } else if (tagsRemoved) {
      message = intl.formatMessage(
        messages.tagsSaveToastTextTypeRemoved,
        { tagsRemoved },
      );
    }
    setToastMessage(message);
  }, [setToastMessage, countTags]);

  // Close the toast
  const closeToast = React.useCallback(() => setToastMessage(undefined), [setToastMessage]);

  let contentName = '';
  if (isContentDataLoaded) {
    if ('displayName' in contentData) {
      contentName = contentData.displayName;
    } else {
      contentName = contentData.courseDisplayNameWithDefault;
    }
  }

  // Updates `tagsByTaxonomy` merged feched tags, global staged tags
  // and global removed staged tags.
  React.useEffect(() => {
    const mergedTags = cloneDeep(fechedTaxonomies).reduce((acc, obj) => (
      { ...acc, [obj.id]: obj }
    ), {});

    Object.keys(globalStagedContentTags).forEach((taxonomyId) => {
      if (mergedTags[taxonomyId]) {
        // TODO test this
        // Filter out applied tags that should become implicit because a child tag was committed
        const stagedLineages = globalStagedContentTags[taxonomyId].map((t) => t.lineage.slice(0, -1)).flat();
        const fechedTags = mergedTags[taxonomyId].contentTags.filter((t) => !stagedLineages.includes(t.value));

        mergedTags[taxonomyId].contentTags = [
          ...fechedTags,
          ...globalStagedContentTags[taxonomyId],
        ];
      }
    });

    Object.keys(globalStagedRemovedContentTags).forEach((taxonomyId) => {
      if (mergedTags[taxonomyId]) {
        mergedTags[taxonomyId].contentTags = mergedTags[taxonomyId].contentTags.filter(
          (t) => !globalStagedRemovedContentTags[taxonomyId].includes(t.value),
        );
      }
    });

    // It is constructed this way to maintain the order
    // of the list `fechedTaxonomies`
    const mergedTagsArray = fechedTaxonomies.map(obj => mergedTags[obj.id]);

    setTagsByTaxonomy(mergedTagsArray);

    if (setBlockingSheet) {
      const areChangesInTags = () => {
        // It is calculated in this way, because there are cases in which
        // there are keys in the map, but they contain empty lists
        // (e.g. add a tag, and remove the same tag later).

        const tagsAddedList = Object.values(globalStagedContentTags);
        const tagsRemovedList = Object.values(globalStagedRemovedContentTags);

        if (tagsAddedList.some(tags => tags.length > 0)) {
          return true;
        }
        if (tagsRemovedList.some(tags => tags.length > 0)) {
          return true;
        }
        return false;
      };

      if (areChangesInTags()) {
        setBlockingSheet(true);
      } else {
        setBlockingSheet(false);
      }
    }
  }, [
    fechedTaxonomies,
    globalStagedContentTags,
    globalStagedRemovedContentTags,
  ]);

  const commitGlobalStagedTags = React.useCallback(() => {
    const tagsData = [];
    tagsByTaxonomy.forEach((tags) => {
      tagsData.push({
        taxonomy: tags.id,
        tags: tags.contentTags.map(t => t.value),
      });
    });
    // @ts-ignore
    updateTags.mutate({ tagsData });
  }, [tagsByTaxonomy]);

  return {
    stagedContentTags,
    addStagedContentTag,
    removeStagedContentTag,
    removeGlobalStagedContentTag,
    addRemovedContentTag,
    deleteRemovedContentTag,
    setStagedTags,
    globalStagedContentTags,
    globalStagedRemovedContentTags,
    setGlobalStagedContentTags,
    commitGlobalStagedTags,
    commitGlobalStagedTagsStatus: updateTags.status,
    isContentDataLoaded,
    isContentTaxonomyTagsLoaded,
    isTaxonomyListLoaded,
    contentName,
    tagsByTaxonomy,
    isEditMode,
    toEditMode,
    toReadMode,
    collapsibleStates,
    openCollapsible,
    closeCollapsible,
    toastMessage,
    showToastAfterSave,
    closeToast,
    setCollapsibleToInitalState,
  };
};

export default useContentTagsDrawerContext;
