import { initializeMocks } from '@src/testUtils';
import { getCourseVerticalChildrenApiUrl } from '@src/course-unit/data/api';
import {
  deriveHasPartitionGroupComponents,
  getUnitHandler,
} from './api';

const unitId = 'block-v1:edX+DemoX+Demo+type@vertical+block@abc123';

// Mock container children API response in snake_case (as returned by Django)
const mockContainerChildrenResponse = {
  display_name: 'Test Unit',
  children: [
    {
      block_id: 'block-v1:edX+DemoX+Demo+type@html+block@1',
      block_type: 'html',
      name: 'Text',
      actions: {
        can_copy: true,
        can_duplicate: true,
        can_delete: true,
        can_move: false,
        can_manage_access: false,
      },
    },
    {
      block_id: 'block-v1:edX+DemoX+Demo+type@video+block@2',
      block_type: 'video',
      name: 'Video',
    },
  ],
  is_published: false,
  can_paste_component: true,
  upstream_ready_to_sync_children_info: [],
};

describe('deriveHasPartitionGroupComponents', () => {
  it('returns true when a component has selected partition groups', () => {
    const components = [{
      blockId: 'block-1',
      blockType: 'html',
      displayName: 'Text',
      userPartitionInfo: {
        selectablePartitions: [{
          id: 50,
          name: 'Enrollment Track Groups',
          scheme: 'enrollment_track',
          groups: [{
            id: 1,
            name: 'Audit',
            selected: true,
            deleted: false,
          }],
        }],
        selectedPartitionIndex: -1,
        selectedGroupsLabel: '',
      },
      actions: {
        canCopy: false, canDuplicate: false, canDelete: false, canMove: false, canManageAccess: false,
      },
    }];

    expect(deriveHasPartitionGroupComponents({ hasPartitionGroupComponents: false }, components)).toBe(true);
  });

  it('returns false when no components have partition group access', () => {
    const components = [{
      blockId: 'block-1',
      blockType: 'html',
      displayName: 'Text',
      userPartitionInfo: {
        selectablePartitions: [{
          id: 50,
          name: 'Enrollment Track Groups',
          scheme: 'enrollment_track',
          groups: [{
            id: 1,
            name: 'Audit',
            selected: false,
            deleted: false,
          }],
        }],
        selectedPartitionIndex: -1,
        selectedGroupsLabel: '',
      },
      actions: {
        canCopy: false, canDuplicate: false, canDelete: false, canMove: false, canManageAccess: false,
      },
    }];

    expect(deriveHasPartitionGroupComponents({ hasPartitionGroupComponents: true }, components)).toBe(false);
  });
});

describe('unit-card data/api', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('getCourseVerticalChildrenApiUrl', () => {
    it('builds the correct URL for the given unitId', () => {
      const url = getCourseVerticalChildrenApiUrl(unitId);
      expect(url).toContain(`/api/contentstore/v1/container/${unitId}/children`);
    });
  });

  describe('getUnitHandler', () => {
    it('fetches unit data and returns camelCase response', async () => {
      axiosMock.onGet(getCourseVerticalChildrenApiUrl(unitId)).reply(200, mockContainerChildrenResponse);

      const result = await getUnitHandler(unitId);

      expect(axiosMock.history.get).toHaveLength(1);
      expect(axiosMock.history.get[0].url).toEqual(getCourseVerticalChildrenApiUrl(unitId));

      expect(result.unitId).toBe(unitId);
      expect(result.displayName).toBe(mockContainerChildrenResponse.display_name);
      expect(result.components).toHaveLength(2);
      expect(result.components[0].blockType).toBe('html');
      expect(result.components[0].displayName).toBe('Text');
      expect(result.components[0].actions).toEqual({
        canCopy: true,
        canDuplicate: true,
        canDelete: true,
        canMove: false,
        canManageAccess: false,
      });
    });

    it('throws on network error', async () => {
      axiosMock.onGet(getCourseVerticalChildrenApiUrl(unitId)).networkError();

      await expect(getUnitHandler(unitId)).rejects.toThrow();
    });
  });
});
