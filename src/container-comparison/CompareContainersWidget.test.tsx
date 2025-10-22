import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter/types';
import { getLibraryContainerApiUrl } from '@src/library-authoring/data/api';
import { mockGetContainerChildren, mockGetContainerMetadata } from '@src/library-authoring/data/api.mocks';
import { initializeMocks, render, screen } from '@src/testUtils';
import { CompareContainersWidget } from './CompareContainersWidget';
import { mockGetCourseContainerChildren } from './data/api.mock';

mockGetCourseContainerChildren.applyMock();
mockGetContainerChildren.applyMock();
let axiosMock: MockAdapter;

describe('CompareContainersWidget', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  test('renders the component with a title', async () => {
    const url = getLibraryContainerApiUrl(mockGetContainerMetadata.sectionId);
    axiosMock.onGet(url).reply(200, { publishedDisplayName: 'Test Title' });
    render(<CompareContainersWidget
      upstreamBlockId={mockGetContainerMetadata.sectionId}
      downstreamBlockId={mockGetCourseContainerChildren.sectionId}
    />);
    expect((await screen.findAllByText('Test Title')).length).toEqual(2);
    expect((await screen.findAllByText('subsection block 0')).length).toEqual(1);
    expect((await screen.findAllByText('subsection block 00')).length).toEqual(1);
    expect((await screen.findAllByText('This subsection will be modified')).length).toEqual(3);
    expect((await screen.findAllByText('This subsection was modified')).length).toEqual(3);
    expect((await screen.findAllByText('subsection block 1')).length).toEqual(1);
    expect((await screen.findAllByText('subsection block 2')).length).toEqual(1);
    expect((await screen.findAllByText('subsection block 11')).length).toEqual(1);
    expect((await screen.findAllByText('subsection block 22')).length).toEqual(1);
    expect(screen.queryByText(
      /the only change is to text block which has been edited in this course\. accepting will not remove local edits\./i,
    )).not.toBeInTheDocument();
  });

  test('renders loading spinner when data is pending', async () => {
    const url = getLibraryContainerApiUrl(mockGetContainerMetadata.sectionIdLoading);
    axiosMock.onGet(url).reply(() => new Promise(() => {}));
    render(<CompareContainersWidget
      upstreamBlockId={mockGetContainerMetadata.sectionIdLoading}
      downstreamBlockId={mockGetCourseContainerChildren.sectionIdLoading}
    />);
    const spinner = await screen.findAllByRole('status');
    expect(spinner.length).toEqual(4);
    expect(spinner[0].textContent).toEqual('Loading...');
    expect(spinner[1].textContent).toEqual('Loading...');
    expect(spinner[2].textContent).toEqual('Loading...');
    expect(spinner[3].textContent).toEqual('Loading...');
  });

  test('calls onRowClick when a row is clicked and updates diff view', async () => {
    // mocks title
    axiosMock.onGet(getLibraryContainerApiUrl(mockGetContainerMetadata.sectionId)).reply(200, { publishedDisplayName: 'Test Title' });
    axiosMock.onGet(
      getLibraryContainerApiUrl('lct:org1:Demo_course_generated:subsection:subsection-0'),
    ).reply(200, { publishedDisplayName: 'subsection block 0' });

    const user = userEvent.setup();
    render(<CompareContainersWidget
      upstreamBlockId={mockGetContainerMetadata.sectionId}
      downstreamBlockId={mockGetCourseContainerChildren.sectionId}
    />);
    expect((await screen.findAllByText('Test Title')).length).toEqual(2);
    // left i.e. before side block
    let block = await screen.findByText('subsection block 00');
    await user.click(block);
    // Breadcrumbs - shows old and new name
    expect(await screen.findByRole('button', { name: 'subsection block 00' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'subsection block 0' })).toBeInTheDocument();

    // Back breadcrumb
    const backbtns = await screen.findAllByRole('button', { name: 'Back' });
    expect(backbtns.length).toEqual(2);

    // Go back
    await user.click(backbtns[0]);
    expect((await screen.findAllByText('Test Title')).length).toEqual(2);
    // right i.e. after side block
    block = await screen.findByText('subsection block 0');

    // After side click also works
    await user.click(block);
    expect(await screen.findByRole('button', { name: 'subsection block 00' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'subsection block 0' })).toBeInTheDocument();
  });

  test('should show removed container diff state', async () => {
    // mocks title
    axiosMock.onGet(getLibraryContainerApiUrl(mockGetContainerMetadata.sectionId)).reply(200, { publishedDisplayName: 'Test Title' });
    axiosMock.onGet(
      getLibraryContainerApiUrl('lct:org1:Demo_course_generated:subsection:subsection-0'),
    ).reply(200, { publishedDisplayName: 'subsection block 0' });

    const user = userEvent.setup();
    render(<CompareContainersWidget
      upstreamBlockId={mockGetContainerMetadata.sectionId}
      downstreamBlockId={mockGetCourseContainerChildren.sectionId}
    />);
    expect((await screen.findAllByText('Test Title')).length).toEqual(2);
    // left i.e. before side block
    const block = await screen.findByText('subsection block 00');
    await user.click(block);

    const removedRows = await screen.findAllByText('This unit was removed');
    await user.click(removedRows[0]);

    expect(await screen.findByText('This unit has been removed')).toBeInTheDocument();
  });

  test('should show new added container diff state', async () => {
    // mocks title
    axiosMock.onGet(getLibraryContainerApiUrl(mockGetContainerMetadata.sectionId)).reply(200, { publishedDisplayName: 'Test Title' });
    axiosMock.onGet(
      getLibraryContainerApiUrl('lct:org1:Demo_course_generated:subsection:subsection-0'),
    ).reply(200, { publishedDisplayName: 'subsection block 0' });

    const user = userEvent.setup();
    render(<CompareContainersWidget
      upstreamBlockId={mockGetContainerMetadata.sectionId}
      downstreamBlockId="block-v1:UNIX+UX1+2025_T3+type@section+block@0-new"
    />);
    const blocks = await screen.findAllByText('This subsection will be added in the new version');
    await user.click(blocks[0]);

    expect(await screen.findByText(/this subsection is new/i)).toBeInTheDocument();
  });

  test('should show alert if the only change is a single text component with local overrides', async () => {
    const url = getLibraryContainerApiUrl(mockGetContainerMetadata.sectionId);
    axiosMock.onGet(url).reply(200, { publishedDisplayName: 'Test Title' });
    render(<CompareContainersWidget
      upstreamBlockId={mockGetContainerMetadata.sectionId}
      downstreamBlockId={mockGetCourseContainerChildren.sectionShowsAlertSingleText}
    />);

    expect((await screen.findAllByText('Test Title')).length).toEqual(2);

    expect(screen.getByText(
      /the only change is to text block which has been edited in this course\. accepting will not remove local edits\./i,
    )).toBeInTheDocument();
    expect(screen.getByText(/Html block 11/i)).toBeInTheDocument();
  });

  test('should show alert if the only changes is multiple text components with local overrides', async () => {
    const url = getLibraryContainerApiUrl(mockGetContainerMetadata.sectionId);
    axiosMock.onGet(url).reply(200, { publishedDisplayName: 'Test Title' });
    render(<CompareContainersWidget
      upstreamBlockId={mockGetContainerMetadata.sectionId}
      downstreamBlockId={mockGetCourseContainerChildren.sectionShowsAlertMultipleText}
    />);

    expect((await screen.findAllByText('Test Title')).length).toEqual(2);

    expect(screen.getByText(
      /the only change is to which have been edited in this course\. accepting will not remove local edits\./i,
    )).toBeInTheDocument();
    expect(screen.getByText(/2 text blocks/i)).toBeInTheDocument();
  });
});
