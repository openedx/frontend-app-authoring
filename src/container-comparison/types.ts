import { UpstreamInfo } from '@src/data/types';

export type ContainerState = 'removed' | 'added' | 'modified' | 'childrenModified' | 'locallyContentUpdated' | 'locallyRenamed' | 'locallyRenamedAndContentUpdated' | 'moved';

export type WithState<T> = T & { state?: ContainerState, originalName?: string };
export type WithIndex<T> = T & { index: number };

export type CourseContainerChildBase = {
  name: string;
  id: string;
  upstreamLink: UpstreamInfo;
  blockType: string;
};

export type ContainerChildBase = {
  displayName: string;
  id: string;
  containerType?: string;
  blockType?: string;
} & ({
  containerType: string;
} | {
  blockType: string;
});

export type ContainerChild = {
  name: string;
  id?: string;
  downstreamId?: string;
  blockType: string;
};
