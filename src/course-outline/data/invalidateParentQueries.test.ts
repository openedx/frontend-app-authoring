import { QueryClient } from '@tanstack/react-query';
import { invalidateParentQueries, courseOutlineQueryKeys } from './apiHooks';

// --- Mocks ---
const mockHandleResponseErrors = jest.fn();
jest.mock('@src/generic/saving-error-alert', () => ({
  handleResponseErrors: (...args: any[]) => mockHandleResponseErrors(...args),
}));

describe('invalidateParentQueries', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient();
    // Spy on invalidateQueries so we can control resolve/reject.
    jest.spyOn(queryClient, 'invalidateQueries');
  });

  const sectionId = 'block-v1:org+course+2025+type@chapter+block@sec1';
  const subsectionId = 'block-v1:org+course+2025+type@sequential+block@sub1';

  it('invalidates sectionId query when sectionId is provided', async () => {
    await invalidateParentQueries(queryClient, { sectionId });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: courseOutlineQueryKeys.courseItemId(sectionId),
    });
  });

  it('invalidates subsectionId query when only subsectionId is provided', async () => {
    await invalidateParentQueries(queryClient, { subsectionId });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: courseOutlineQueryKeys.courseItemId(subsectionId),
    });
  });

  it('prefers sectionId over subsectionId when both are provided', async () => {
    await invalidateParentQueries(queryClient, { sectionId, subsectionId });

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: courseOutlineQueryKeys.courseItemId(sectionId),
    });
  });

  it('does nothing when neither sectionId nor subsectionId is provided', async () => {
    await invalidateParentQueries(queryClient, {});

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it('does not throw and calls handleResponseErrors when invalidateQueries rejects', async () => {
    const rejectError = new Error('invalidation failed');
    (queryClient.invalidateQueries as jest.Mock).mockRejectedValueOnce(rejectError);

    await expect(
      invalidateParentQueries(queryClient, { sectionId }),
    ).resolves.toBeUndefined();

    expect(mockHandleResponseErrors).toHaveBeenCalledWith(rejectError);
  });
});
