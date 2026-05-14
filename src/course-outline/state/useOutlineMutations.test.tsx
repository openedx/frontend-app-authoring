import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RequestStatus } from '@src/data/constants';
import { courseOutlineIndexQueryKey } from '../data/outlineIndexQuery';

// --- Mocks ---

const mockMutateAsync = {
  delete: jest.fn(),
};
const mockMutate = {
  duplicate: jest.fn(),
  configureSection: jest.fn(),
  configureSubsection: jest.fn(),
  configureUnit: jest.fn(),
  paste: jest.fn(),
  updateHighlights: jest.fn(),
};

// Allow tests to control isPending for duplicate.
let mockIsDuplicatePending = false;

jest.mock('../data/apiHooks', () => ({
  useDeleteCourseItem: jest.fn(() => ({ mutateAsync: mockMutateAsync.delete })),
  useDuplicateItem: jest.fn(() => ({ mutate: mockMutate.duplicate, isPending: mockIsDuplicatePending })),
  useConfigureSection: jest.fn(() => ({ mutate: mockMutate.configureSection })),
  useConfigureSubsection: jest.fn(() => ({ mutate: mockMutate.configureSubsection })),
  useConfigureUnit: jest.fn(() => ({ mutate: mockMutate.configureUnit })),
  usePasteItem: jest.fn(() => ({ mutate: mockMutate.paste })),
  useUpdateCourseSectionHighlights: jest.fn(() => ({ mutate: mockMutate.updateHighlights })),
}));

const mockApi = {
  enableCourseHighlightsEmails: jest.fn(),
  setVideoSharingOption: jest.fn(),
  dismissNotification: jest.fn(),
  restartIndexingOnCourse: jest.fn(),
};

jest.mock('../data/api', () => ({
  enableCourseHighlightsEmails: (...args: any[]) => mockApi.enableCourseHighlightsEmails(...args),
  setVideoSharingOption: (...args: any[]) => mockApi.setVideoSharingOption(...args),
  dismissNotification: (...args: any[]) => mockApi.dismissNotification(...args),
  restartIndexingOnCourse: (...args: any[]) => mockApi.restartIndexingOnCourse(...args),
}));

jest.mock('@src/generic/toast-context', () => ({
  showToastOutsideReact: jest.fn(),
  closeToastOutsideReact: jest.fn(),
}));

// Use jest.requireActual so getErrorDetails returns real error objects
jest.mock('../utils/getErrorDetails', () => ({
  getErrorDetails: jest.fn((error: any) => ({
    type: 'serverError',
    data: JSON.stringify(error?.response?.data || error.message),
    dismissible: true,
  })),
}));

import { useOutlineMutations } from './useOutlineMutations';

// --- Test setup ---

const courseId = 'course-v1:test+course+2025';

const buildSectionTree = () => ({
  courseStructure: {
    id: courseId,
    childInfo: {
      children: [
        {
          id: 'block-v1:org+type@chapter+block@section1',
          displayName: 'Section 1',
          category: 'chapter',
          childInfo: {
            children: [
              {
                id: 'block-v1:org+type@sequential+block@subsection1',
                displayName: 'Subsection 1',
                category: 'sequential',
                childInfo: {
                  children: [
                    {
                      id: 'block-v1:org+type@vertical+block@unit1',
                      displayName: 'Unit 1',
                      category: 'vertical',
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  },
});

let queryClient: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

function defaultInput() {
  return {
    courseId,
    effectiveOutlineIndexData: { reindexLink: '/reindex/link' },
    queryClient,
    setLocalStatusBarOverride: jest.fn(),
    setReindexLoadingStatus: jest.fn(),
    setLocalReindexError: jest.fn(),
    setSavingStatusState: jest.fn(),
  };
}

function renderMutationsHook(input?: Partial<ReturnType<typeof defaultInput>>) {
  const merged = { ...defaultInput(), ...input };
  return renderHook(() => useOutlineMutations(merged as any), { wrapper });
}

describe('useOutlineMutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient();
    mockIsDuplicatePending = false;
  });

  describe('deleteCurrentSelection', () => {
    const sectionTree = buildSectionTree();

    it('deletes a chapter (section) and updates cache', async () => {
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), sectionTree);
      mockMutateAsync.delete.mockResolvedValueOnce(undefined);

      const { result } = renderMutationsHook();

      await act(async () => {
        await result.current.deleteCurrentSelection({
          currentId: 'block-v1:org+type@chapter+block@section1',
        });
      });

      expect(mockMutateAsync.delete).toHaveBeenCalledWith(
        { itemId: 'block-v1:org+type@chapter+block@section1' },
      );

      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      expect(cached?.courseStructure?.childInfo?.children).toHaveLength(0);
    });

    it('deletes a sequential (subsection) and updates cache', async () => {
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), sectionTree);
      mockMutateAsync.delete.mockResolvedValueOnce(undefined);

      const { result } = renderMutationsHook();

      await act(async () => {
        await result.current.deleteCurrentSelection({
          currentId: 'block-v1:org+type@sequential+block@subsection1',
          sectionId: 'block-v1:org+type@chapter+block@section1',
        });
      });

      expect(mockMutateAsync.delete).toHaveBeenCalledWith(
        { itemId: 'block-v1:org+type@sequential+block@subsection1', sectionId: 'block-v1:org+type@chapter+block@section1' },
      );

      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const section = cached?.courseStructure?.childInfo?.children[0];
      expect(section?.childInfo?.children).toHaveLength(0);
    });

    it('deletes a vertical (unit) and updates cache', async () => {
      queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), sectionTree);
      mockMutateAsync.delete.mockResolvedValueOnce(undefined);

      const { result } = renderMutationsHook();

      await act(async () => {
        await result.current.deleteCurrentSelection({
          currentId: 'block-v1:org+type@vertical+block@unit1',
          sectionId: 'block-v1:org+type@chapter+block@section1',
          subsectionId: 'block-v1:org+type@sequential+block@subsection1',
        });
      });

      expect(mockMutateAsync.delete).toHaveBeenCalledWith(
        {
          itemId: 'block-v1:org+type@vertical+block@unit1',
          subsectionId: 'block-v1:org+type@sequential+block@subsection1',
          sectionId: 'block-v1:org+type@chapter+block@section1',
        },
      );

      const cached: any = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId));
      const subsection = cached?.courseStructure?.childInfo?.children[0]?.childInfo?.children[0];
      expect(subsection?.childInfo?.children).toHaveLength(0);
    });

    it('falls back to invalidating when delete no outline index cached', async () => {
      // Do NOT seed the outline index cache — simulate cache miss.
      mockMutateAsync.delete.mockResolvedValueOnce(undefined);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderMutationsHook();

      await act(async () => {
        await result.current.deleteCurrentSelection({
          currentId: 'block-v1:org+type@chapter+block@section1',
        });
      });

      // Mutation still ran.
      expect(mockMutateAsync.delete).toHaveBeenCalledWith(
        { itemId: 'block-v1:org+type@chapter+block@section1' },
      );

      // Fallback invalidation fired because the optimistic update could not apply.
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: courseOutlineIndexQueryKey(courseId),
      });

      invalidateSpy.mockRestore();
    });
  });

  describe('duplicateCurrentSelection', () => {
    it('does not fire duplicate when mutation already pending', async () => {
      mockIsDuplicatePending = true;

      const { result } = renderMutationsHook();

      result.current.duplicateCurrentSelection({
        currentId: 'block-v1:org+type@chapter+block@sectionA',
      });

      // mutate should not be called — early exit due to isPending.
      expect(mockMutate.duplicate).not.toHaveBeenCalled();
    });

    it('fires duplicate when not pending', async () => {
      mockIsDuplicatePending = false;

      const { result } = renderMutationsHook();

      result.current.duplicateCurrentSelection({
        currentId: 'block-v1:org+type@chapter+block@sectionA',
      });

      expect(mockMutate.duplicate).toHaveBeenCalledTimes(1);
    });
  });

  describe('reindexCourse', () => {
    it('sets IN_PROGRESS then SUCCESSFUL and clears error on success', async () => {
      mockApi.restartIndexingOnCourse.mockResolvedValueOnce(undefined);
      const setReindexLoadingStatus = jest.fn();
      const setLocalReindexError = jest.fn();

      const { result } = renderMutationsHook({ setReindexLoadingStatus, setLocalReindexError });

      await act(async () => {
        await result.current.reindexCourse();
      });

      expect(mockApi.restartIndexingOnCourse).toHaveBeenCalledWith('/reindex/link');
      expect(setLocalReindexError).toHaveBeenCalledWith(null);
      expect(setReindexLoadingStatus).toHaveBeenCalledWith(RequestStatus.IN_PROGRESS);
      expect(setReindexLoadingStatus).toHaveBeenCalledWith(RequestStatus.SUCCESSFUL);
    });

    it('sets IN_PROGRESS then FAILED and records error on failure', async () => {
      const testError = new Error('reindex failed');
      mockApi.restartIndexingOnCourse.mockRejectedValueOnce(testError);
      const setReindexLoadingStatus = jest.fn();
      const setLocalReindexError = jest.fn();

      const { result } = renderMutationsHook({ setReindexLoadingStatus, setLocalReindexError });

      await act(async () => {
        await result.current.reindexCourse();
      });

      expect(setLocalReindexError).toHaveBeenCalledWith(null);
      expect(setReindexLoadingStatus).toHaveBeenCalledWith(RequestStatus.IN_PROGRESS);
      expect(setReindexLoadingStatus).toHaveBeenCalledWith(RequestStatus.FAILED);
      // getErrorDetails mock returns an object with type
      expect(setLocalReindexError).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'serverError' }),
      );
    });
  });

  describe('changeVideoSharingOption', () => {
    it('sets PENDING then SUCCESSFUL and updates status bar override on success', async () => {
      mockApi.setVideoSharingOption.mockResolvedValueOnce(undefined);
      const setSavingStatusState = jest.fn();
      const setLocalStatusBarOverride = jest.fn();

      const { result } = renderMutationsHook({ setSavingStatusState, setLocalStatusBarOverride });

      await act(async () => {
        await result.current.changeVideoSharingOption('per_course');
      });

      expect(mockApi.setVideoSharingOption).toHaveBeenCalledWith(courseId, 'per_course');
      expect(setSavingStatusState).toHaveBeenCalledWith(RequestStatus.PENDING);
      expect(setSavingStatusState).toHaveBeenCalledWith(RequestStatus.SUCCESSFUL);
      expect(setLocalStatusBarOverride).toHaveBeenCalledWith({ videoSharingOptions: 'per_course' });
    });

    it('sets PENDING then FAILED on failure', async () => {
      mockApi.setVideoSharingOption.mockRejectedValueOnce(new Error('fail'));
      const setSavingStatusState = jest.fn();
      const setLocalStatusBarOverride = jest.fn();

      const { result } = renderMutationsHook({ setSavingStatusState, setLocalStatusBarOverride });

      await act(async () => {
        await result.current.changeVideoSharingOption('per_course');
      });

      expect(setSavingStatusState).toHaveBeenCalledWith(RequestStatus.PENDING);
      expect(setSavingStatusState).toHaveBeenCalledWith(RequestStatus.FAILED);
    });
  });
});
