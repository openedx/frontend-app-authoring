import type { TaxonomyData } from '../../taxonomy/data/types';

/** A tag that has been applied to some content. */
export interface Tag {
  /** The value of the tag, also its ID. e.g. "Biology" */
  value: string;
  /** The values of the tag and its parent(s) in the hierarchy */
  lineage: string[];
  canChangeObjecttag: boolean;
  canDeleteObjecttag: boolean;
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
