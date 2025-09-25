import { ContainerChildBase, CourseContainerChildBase } from './types';
import { diffPreviewContainerChildren } from './utils';

export const getMockCourseContainerData = (
  type: 'added|deleted' | 'moved|deleted' | 'all',
): [CourseContainerChildBase[], ContainerChildBase[]] => {
  switch (type) {
    case 'moved|deleted':
      return [
        [
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@1',
            name: 'Unit 1 remote edit - local edit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:unit-1-2a1741',
              versionSynced: 11,
              versionAvailable: 11,
              versionDeclined: null,
              isModified: true,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@2',
            name: 'New unit remote edit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:new-unit-remote-7eb9d1',
              versionSynced: 7,
              versionAvailable: 7,
              versionDeclined: null,
              isModified: false,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@3',
            name: 'Unit with tags',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:unit-with-tags-bec5f9',
              versionSynced: 2,
              versionAvailable: 2,
              versionDeclined: null,
              isModified: false,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@4',
            name: 'One more unit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:one-more-unit-745176',
              versionSynced: 1,
              versionAvailable: 1,
              versionDeclined: null,
              isModified: false,
            },
          },
        ],
        [
          {
            id: 'lct:UNIX:CS1:unit:unit-with-tags-bec5f9',
            displayName: 'Unit with tags',
            containerType: 'unit',
          },
          {
            id: 'lct:UNIX:CS1:unit:unit-1-2a1741',
            displayName: 'Unit 1 remote edit 2',
            containerType: 'unit',
          },
          {
            id: 'lct:UNIX:CS1:unit:one-more-unit-745176',
            displayName: 'One more unit',
            containerType: 'unit',
          },
        ],
      ] as [CourseContainerChildBase[], ContainerChildBase[]];
    case 'added|deleted':
      return [
        [
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@1',
            name: 'Unit 1 remote edit - local edit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:unit-1-2a1741',
              versionSynced: 11,
              versionAvailable: 11,
              versionDeclined: null,
              isModified: true,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@2',
            name: 'New unit remote edit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:new-unit-remote-7eb9d1',
              versionSynced: 7,
              versionAvailable: 7,
              versionDeclined: null,
              isModified: false,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@3',
            name: 'Unit with tags',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:unit-with-tags-bec5f9',
              versionSynced: 2,
              versionAvailable: 2,
              versionDeclined: null,
              isModified: false,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@4',
            name: 'One more unit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:one-more-unit-745176',
              versionSynced: 1,
              versionAvailable: 1,
              versionDeclined: null,
              isModified: false,
            },
          },
        ],
        [
          {
            id: 'lct:UNIX:CS1:unit:unit-1-2a1741',
            displayName: 'Unit 1 remote edit 2',
            containerType: 'unit',
          },
          {
            id: 'lct:UNIX:CS1:unit:unit-with-tags-bec5f9',
            displayName: 'Unit with tags',
            containerType: 'unit',
          },
          {
            id: 'lct:UNIX:CS1:unit:added-unit-1',
            displayName: 'Added unit',
            containerType: 'unit',
          },
          {
            id: 'lct:UNIX:CS1:unit:one-more-unit-745176',
            displayName: 'One more unit',
            containerType: 'unit',
          },
        ],
      ] as [CourseContainerChildBase[], ContainerChildBase[]];
    case 'all':
      return [
        [
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@1',
            name: 'Unit 1 remote edit - local edit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:unit-1-2a1741',
              versionSynced: 11,
              versionAvailable: 11,
              versionDeclined: null,
              isModified: true,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@2',
            name: 'New unit remote edit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:new-unit-remote-7eb9d1',
              versionSynced: 7,
              versionAvailable: 7,
              versionDeclined: null,
              isModified: false,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@3',
            name: 'Unit with tags',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:unit-with-tags-bec5f9',
              versionSynced: 2,
              versionAvailable: 2,
              versionDeclined: null,
              isModified: false,
            },
          },
          {
            id: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@4',
            name: 'One more unit',
            blockType: 'vertical',
            upstreamLink: {
              upstreamRef: 'lct:UNIX:CS1:unit:one-more-unit-745176',
              versionSynced: 1,
              versionAvailable: 1,
              versionDeclined: null,
              isModified: false,
            },
          },
        ],
        [
          {
            id: 'lct:UNIX:CS1:unit:unit-with-tags-bec5f9',
            displayName: 'Unit with tags',
            containerType: 'unit',
          },
          {
            id: 'lct:UNIX:CS1:unit:added-unit-1',
            displayName: 'Added unit',
            containerType: 'unit',
          },
          {
            id: 'lct:UNIX:CS1:unit:one-more-unit-745176',
            displayName: 'One more unit',
            containerType: 'unit',
          },
          {
            id: 'lct:UNIX:CS1:unit:unit-1-2a1741',
            displayName: 'Unit 1 remote edit 2',
            containerType: 'unit',
          },
        ],
      ] as [CourseContainerChildBase[], ContainerChildBase[]];
    default:
      throw new Error();
  }
};

describe('diffPreviewContainerChildren', () => {
  it('should handle moved and deleted', () => {
    const [a, b] = getMockCourseContainerData('moved|deleted');
    const result = diffPreviewContainerChildren(a as CourseContainerChildBase[], b);
    expect(result[0].length).toEqual(result[1].length);
    // renamed takes precendence over moved
    expect(result[0][0].state).toEqual('locallyRenamed');
    expect(result[1][2].state).toEqual('locallyRenamed');
    expect(result[0][1].state).toEqual('removed');
    expect(result[1][1].state).toEqual('removed');
    expect(result[1][2].name).toEqual(a[0].name);
  });

  it('should handle add and delete', () => {
    const [a, b] = getMockCourseContainerData('added|deleted');
    const result = diffPreviewContainerChildren(a as CourseContainerChildBase[], b);
    expect(result[0].length).toEqual(result[1].length);
    // No change, state=undefined
    expect(result[0][0].state).toEqual('locallyRenamed');
    expect(result[0][0].originalName).toEqual(b[0].displayName);
    expect(result[1][0].state).toEqual('locallyRenamed');

    // Deleted entry
    expect(result[0][1].state).toEqual('removed');
    expect(result[1][1].state).toEqual('removed');
    expect(result[1][0].name).toEqual(a[0].name);
    expect(result[0][3].name).toEqual(result[1][3].name);
    expect(result[0][3].state).toEqual('added');
    expect(result[1][3].state).toEqual('added');
  });

  it('should handle add, delete and moved', () => {
    const [a, b] = getMockCourseContainerData('all');
    const result = diffPreviewContainerChildren(a as CourseContainerChildBase[], b);
    expect(result[0].length).toEqual(result[1].length);
    // renamed takes precendence over moved
    expect(result[0][0].state).toEqual('locallyRenamed');
    expect(result[1][4].state).toEqual('locallyRenamed');
    expect(result[1][4].id).toEqual(result[0][0].id);

    // Deleted entry
    expect(result[0][1].state).toEqual('removed');
    expect(result[1][1].state).toEqual('removed');
    expect(result[1][1].name).toEqual(result[0][1].name);

    // added entry
    expect(result[0][2].state).toEqual('added');
    expect(result[1][2].state).toEqual('added');
    expect(result[1][2].id).toEqual(result[0][2].id);
  });
});
