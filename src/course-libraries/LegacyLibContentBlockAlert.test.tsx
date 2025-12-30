import { initializeMocks, render, screen } from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import LegacyLibContentBlockAlert from './LegacyLibContentBlockAlert';
import * as apiMocks from './data/api.mocks';

const renderComponent = (courseId: string) => {
  render(
    <LegacyLibContentBlockAlert courseId={courseId} />,
  );
};

apiMocks.mockGetReadyToUpdateReferences.applyMock();
apiMocks.mockMigrateCourseReadyToMigrateLegacyLibContentBlocks.applyMock();
apiMocks.mockGetCourseLegacyLibRefUpdateTaskStatus.applyMock();
let mockShowToast;

describe('LegacyLibContentBlockAlert', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    mockShowToast = mocks.mockShowToast;
  });

  test('alert is not rendered when data is loading', async () => {
    renderComponent(apiMocks.mockGetReadyToUpdateReferences.courseKeyLoading);
    expect(await screen.findByTestId('redux-provider')).toBeEmptyDOMElement();
  });

  test('alert is not rendered when data is empty', async () => {
    renderComponent(apiMocks.mockGetReadyToUpdateReferences.courseKeyEmpty);
    expect(await screen.findByTestId('redux-provider')).toBeEmptyDOMElement();
  });

  test('alert is rendered when 1 block is present', async () => {
    renderComponent(apiMocks.mockGetReadyToUpdateReferences.courseKeyWith1Block);
    expect(await screen.findByText('This course contains 1 legacy library reference')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Update library references' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Learn more' })).toBeInTheDocument();
  });

  test('alert is rendered when 2 blocks are present', async () => {
    renderComponent(apiMocks.mockGetReadyToUpdateReferences.courseKeyWith2Blocks);
    expect(await screen.findByText('This course contains 2 legacy library references')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Update library references' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Learn more' })).toBeInTheDocument();
  });

  test('migrates all blocks successfully', async () => {
    const user = userEvent.setup();
    renderComponent(apiMocks.mockGetReadyToUpdateReferences.courseKeyWith1Block);
    expect(await screen.findByText('This course contains 1 legacy library reference')).toBeInTheDocument();
    const actionBtn = await screen.findByRole('button', { name: 'Update library references' });
    expect(actionBtn).toBeInTheDocument();
    await user.click(actionBtn);

    // mockShowToast will have been called
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Updating library references...');
    });
    // mockShowToast will have been called
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Successfully updated all legacy library references');
    });
  });

  test('migrates all blocks: failed', async () => {
    const user = userEvent.setup();
    renderComponent(apiMocks.mockGetReadyToUpdateReferences.courseKeyWith3Blocks);
    expect(await screen.findByText('This course contains 3 legacy library references')).toBeInTheDocument();
    const actionBtn = await screen.findByRole('button', { name: 'Update library references' });
    expect(actionBtn).toBeInTheDocument();
    await user.click(actionBtn);

    // mockShowToast will have been called
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Updating library references...');
    });
    // mockShowToast will have been called
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Failed to update legacy library references');
    });
  });
});
