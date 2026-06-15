import { renderHook, act } from '@testing-library/react';
import { useUnlinkModal } from './useUnlinkModal';

const mockUnlinkDownstreamMutateAsync = jest.fn();
let mockCloseUnlinkModal = jest.fn();
let mockCurrentUnlinkModalData: any = undefined;
let mockIsUnlinkModalOpen = false;

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    isUnlinkModalOpen: mockIsUnlinkModalOpen,
    currentUnlinkModalData: mockCurrentUnlinkModalData,
    closeUnlinkModal: mockCloseUnlinkModal,
  }),
}));

jest.mock('@src/generic/unlink-modal', () => ({
  useUnlinkDownstream: jest.fn(() => ({ mutateAsync: mockUnlinkDownstreamMutateAsync })),
}));

jest.mock('@src/generic/key-utils', () => ({
  getBlockType: jest.fn(() => 'vertical'),
}));

describe('useUnlinkModal handleUnlinkItemSubmit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCloseUnlinkModal = jest.fn();
    mockCurrentUnlinkModalData = undefined;
    mockIsUnlinkModalOpen = true;
  });

  it('calls unlinkDownstream and closes modal on success', async () => {
    mockUnlinkDownstreamMutateAsync.mockImplementation((_vars, { onSuccess }: any) => {
      onSuccess();
      return Promise.resolve();
    });
    mockCurrentUnlinkModalData = {
      value: { id: 'block-unit-1' },
      sectionId: 'block-sec-1',
      subsectionId: 'block-subsec-1',
    };

    const { result } = renderHook(() => useUnlinkModal());

    await act(async () => {
      await result.current.handleUnlinkItemSubmit();
    });

    expect(mockUnlinkDownstreamMutateAsync).toHaveBeenCalledWith(
      {
        downstreamBlockId: 'block-unit-1',
        sectionId: 'block-sec-1',
        subsectionId: 'block-subsec-1',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(mockCloseUnlinkModal).toHaveBeenCalledTimes(1);
  });

  it('throws on mutation failure and does not close modal', async () => {
    mockUnlinkDownstreamMutateAsync.mockRejectedValue(new Error('unlink failed'));
    mockCurrentUnlinkModalData = {
      value: { id: 'block-unit-1' },
      sectionId: 'block-sec-1',
      subsectionId: 'block-subsec-1',
    };

    const { result } = renderHook(() => useUnlinkModal());

    await act(async () => {
      await expect(result.current.handleUnlinkItemSubmit()).rejects.toThrow('unlink failed');
    });

    expect(mockUnlinkDownstreamMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockCloseUnlinkModal).not.toHaveBeenCalled();
  });
});
