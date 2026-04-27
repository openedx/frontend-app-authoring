import { renderHook } from '@testing-library/react';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useCourseUserPermissions } from './hooks';
import { COURSE_PERMISSIONS } from './constants';

jest.mock('@src/authz/data/apiHooks', () => ({
  useUserPermissions: jest.fn(),
}));

const courseId = 'course-v1:org+course+run';
const permissions = {
  canView: { action: COURSE_PERMISSIONS.VIEW_GRADING_SETTINGS, scope: courseId },
  canEdit: { action: COURSE_PERMISSIONS.EDIT_GRADING_SETTINGS, scope: courseId },
};

describe('useCourseUserPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: undefined,
    } as unknown as ReturnType<typeof useUserPermissions>);
  });

  it('defaults all permissions to true when authz is disabled', () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: false });

    const { result } = renderHook(() => useCourseUserPermissions(courseId, permissions));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthzEnabled).toBe(false);
    expect(result.current.canView).toBe(true);
    expect(result.current.canEdit).toBe(true);
  });

  it('returns actual permission values when authz is enabled and permissions are loaded', () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canView: true, canEdit: false },
    } as unknown as ReturnType<typeof useUserPermissions>);

    const { result } = renderHook(() => useCourseUserPermissions(courseId, permissions));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthzEnabled).toBe(true);
    expect(result.current.canView).toBe(true);
    expect(result.current.canEdit).toBe(false);
  });

  it('returns isLoading=true and no permission keys while authz permissions are loading', () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: true,
      data: undefined,
    } as unknown as ReturnType<typeof useUserPermissions>);

    const { result } = renderHook(() => useCourseUserPermissions(courseId, permissions));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthzEnabled).toBe(true);
    expect(result.current.canView).toBeUndefined();
    expect(result.current.canEdit).toBeUndefined();
  });

  it('falls back to false for permissions absent from server response when authz is enabled', () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: {},
    } as unknown as ReturnType<typeof useUserPermissions>);

    const { result } = renderHook(() => useCourseUserPermissions(courseId, permissions));

    expect(result.current.canView).toBe(false);
    expect(result.current.canEdit).toBe(false);
  });
});
