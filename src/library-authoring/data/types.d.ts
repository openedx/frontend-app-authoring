export type ContentLibrary = {
  id: string;
  type: string;
  org: string;
  slug: string;
  title: string;
  description: string;
  numBlocks: number;
  version: number;
  lastPublished: Date | null;
  allowLti: boolean;
  allowPublicLearning: boolean;
  allowPublicRead: boolean;
  hasUnpublishedChanges: boolean;
  hasUnpublishedDeletes: boolean;
  license: string;
};
