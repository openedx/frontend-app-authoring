/* istanbul ignore file */
import { CourseContainerChildrenData, type UpstreamReadyToSyncChildrenInfo } from '@src/course-unit/data/types';
import * as unitApi from '@src/course-unit/data/api';

/**
 * Mock for `getLibraryContainerChildren()`
 *
 * This mock returns a fixed response for the given container ID.
 */
export async function mockGetCourseContainerChildren(containerId: string): Promise<CourseContainerChildrenData> {
  let numChildren: number = 3;
  let blockType: string;
  let displayName: string;
  let upstreamReadyToSyncChildrenInfo: UpstreamReadyToSyncChildrenInfo[] = [];
  switch (containerId) {
    case mockGetCourseContainerChildren.unitId:
      blockType = 'text';
      displayName = 'unit block 00';
      break;
    case mockGetCourseContainerChildren.sectionId:
      blockType = 'subsection';
      displayName = 'Test Title';
      break;
    case mockGetCourseContainerChildren.subsectionId:
      blockType = 'unit';
      displayName = 'subsection block 00';
      break;
    case mockGetCourseContainerChildren.sectionShowsAlertSingleText:
      blockType = 'subsection';
      displayName = 'Test Title';
      upstreamReadyToSyncChildrenInfo = [{
        id: 'block-v1:UNIX+UX1+2025_T3+type@html+block@1',
        name: 'Html block 11',
        blockType: 'html',
        downstreamCustomized: ['display_name'],
        upstream: 'upstream-id',
      }];
      break;
    case mockGetCourseContainerChildren.sectionShowsAlertMultipleText:
      blockType = 'subsection';
      displayName = 'Test Title';
      upstreamReadyToSyncChildrenInfo = [
        {
          id: 'block-v1:UNIX+UX1+2025_T3+type@html+block@1',
          name: 'Html block 11',
          blockType: 'html',
          downstreamCustomized: ['display_name'],
          upstream: 'upstream-id',
        },
        {
          id: 'block-v1:UNIX+UX1+2025_T3+type@html+block@2',
          name: 'Html block 22',
          blockType: 'html',
          downstreamCustomized: ['display_name'],
          upstream: 'upstream-id',
        },
      ];
      break;
    case mockGetCourseContainerChildren.unitIdLoading:
    case mockGetCourseContainerChildren.sectionIdLoading:
    case mockGetCourseContainerChildren.subsectionIdLoading:
      return new Promise(() => { });
    default:
      blockType = 'section';
      displayName = 'section block 00';
      numChildren = 0;
      break;
  }
  const children = Array(numChildren).fill(mockGetCourseContainerChildren.childTemplate).map((child, idx) => (
    {
      ...child,
      // Generate a unique ID for each child block to avoid "duplicate key" errors in tests
      id: `block-v1:UNIX+UX1+2025_T3+type@${blockType}+block@${idx}`,
      name: `${blockType} block ${idx}${idx}`,
      blockType,
      upstreamLink: {
        upstreamRef: `lct:org1:Demo_course_generated:${blockType}:${blockType}-${idx}`,
        versionSynced: 1,
        versionAvailable: 2,
        versionDeclined: null,
        downstreamCustomized: [],
      },
    }
  ));
  return Promise.resolve({
    canPasteComponent: true,
    isPublished: false,
    children,
    displayName,
    upstreamReadyToSyncChildrenInfo,
  });
}
mockGetCourseContainerChildren.unitId = 'block-v1:UNIX+UX1+2025_T3+type@unit+block@0';
mockGetCourseContainerChildren.subsectionId = 'block-v1:UNIX+UX1+2025_T3+type@subsection+block@0';
mockGetCourseContainerChildren.sectionId = 'block-v1:UNIX+UX1+2025_T3+type@section+block@0';
mockGetCourseContainerChildren.sectionShowsAlertSingleText = 'block-v1:UNIX+UX1+2025_T3+type@section2+block@0';
mockGetCourseContainerChildren.sectionShowsAlertMultipleText = 'block-v1:UNIX+UX1+2025_T3+type@section3+block@0';
mockGetCourseContainerChildren.unitIdLoading = 'block-v1:UNIX+UX1+2025_T3+type@unit+block@loading';
mockGetCourseContainerChildren.subsectionIdLoading = 'block-v1:UNIX+UX1+2025_T3+type@subsection+block@loading';
mockGetCourseContainerChildren.sectionIdLoading = 'block-v1:UNIX+UX1+2025_T3+type@section+block@loading';
mockGetCourseContainerChildren.childTemplate = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@unit+block@1',
  name: 'Unit 1 remote edit - local edit',
  blockType: 'unit',
  upstreamLink: {
    upstreamRef: 'lct:UNIX:CS1:unit:unit-1-2a1741',
    versionSynced: 1,
    versionAvailable: 2,
    versionDeclined: null,
    downstreamCustomized: [],
  },
};
/** Apply this mock. Returns a spy object that can tell you if it's been called. */
mockGetCourseContainerChildren.applyMock = () => {
  jest.spyOn(unitApi, 'getCourseContainerChildren').mockImplementation(mockGetCourseContainerChildren);
};
