import type { TaxonomyData } from '@src/taxonomy/data/types';

/** A tag that has been applied to some content. */
export interface Tag {
  /** The value of the tag, also its ID. e.g. "Biology" */
  value: string;
  /** The values of the tag and its parent(s) in the hierarchy */
  lineage: string[];
  canChangeObjecttag: boolean;
  canDeleteObjecttag: boolean;
  isCopied: boolean;
}

/** A list of the tags from one taxonomy that are applied to a content object. */
export interface ContentTaxonomyTagData {
  name: string;
  taxonomyId: number;
  canTagObject: boolean;
  tags: Tag[];
  exportId: string;
}

/** A list of all the tags applied to some content object, grouped by taxonomy. */
export interface ContentTaxonomyTagsData {
  taxonomies: ContentTaxonomyTagData[];
}

export interface ContentActions {
  deleteable: boolean;
  draggable: boolean;
  childAddable: boolean;
  duplicable: boolean;
}

export interface XBlockData {
  id: string;
  displayName: string;
  category: string;
  hasChildren: boolean;
  editedOn: string;
  published: boolean;
  publishedOn: string;
  studioUrl: string;
  releasedToStudents: boolean;
  releaseDate: string | null;
  visibilityState: string;
  hasExplicitStaffLock: boolean;
  start: string;
  graded: boolean;
  dueDate: string;
  due: string;
  relativeWeeksDue: string | null;
  format: string | null;
  hasChanges: boolean;
  actions: ContentActions;
  explanatoryMessage: string;
  showCorrectness: string;
  discussionEnabled: boolean;
  ancestorHasStaffLock: boolean;
  staffOnlyMessage: boolean;
  hasPartitionGroupComponents: boolean;
}

export interface TagsInTaxonomy extends TaxonomyData {
  contentTags: Tag[];
}

export interface CourseData {
  courseDisplayNameWithDefault: string;
}

export type ContentData = XBlockData | CourseData;

export interface UpdateTagsData {
  taxonomy: number;
  tags: string[];
}

export interface StagedTagData {
  value: string;
  label: string;
}

/**
 * A tag as shown in the tags drawer. Tags fetched from the server carry more fields
 * (see `Tag`), but tags the user has staged in the drawer are only known by these.
 */
export interface DrawerTag {
  value: string;
  lineage: string[];
  canDeleteObjecttag: boolean;
  /** Only known for tags fetched from the server; not set on tags staged in the drawer. */
  canChangeObjecttag?: boolean;
  /** Only known for tags fetched from the server; not set on tags staged in the drawer. */
  isCopied?: boolean;
}

/** A taxonomy as shown in the tags drawer, along with the tags applied to the content. */
export interface DrawerTaxonomy extends Pick<TaxonomyData, 'id' | 'name' | 'canTagObject'> {
  contentTags: DrawerTag[];
}

/**
 * A taxonomy that is applied to the content but is not in the taxonomy list the user
 * can see, so it is rebuilt from the tags applied to the content.
 */
export interface OtherTaxonomy extends
  DrawerTaxonomy,
  Pick<
    TaxonomyData,
    'exportId' | 'enabled' | 'visibleToAuthors' | 'canChangeTaxonomy' | 'canDeleteTaxonomy'
  >
{}
