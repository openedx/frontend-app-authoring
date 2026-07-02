import { QueryClient } from '@tanstack/react-query';
import { invalidateParentQueries } from './apiHooks';
import { courseOutlineQueryKeys } from './queryKeys';

describe('invalidateParentQueries', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
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
});
