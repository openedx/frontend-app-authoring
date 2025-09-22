import userEvent from "@testing-library/user-event";
import { mockGetContainerChildren, mockGetContainerMetadata } from "../library-authoring/data/api.mocks";
import { initializeMocks, render, screen } from "../testUtils";
import { CompareContainersWidget } from "./CompareContainersWidget";
import { mockGetCourseContainerChildren } from "./data/api.mock";

mockGetCourseContainerChildren.applyMock();
mockGetContainerChildren.applyMock();

describe('CompareContainersWidget', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('renders the component with a title', async () => {
    render(<CompareContainersWidget
      title="Test Title"
      upstreamBlockId={mockGetContainerMetadata.sectionId}
      downstreamBlockId={mockGetCourseContainerChildren.sectionId}
    />);
    expect((await screen.findAllByText('Test Title')).length).toEqual(2);
    expect((await screen.findAllByText('subsection block 0')).length).toEqual(2);
    expect((await screen.findAllByText('This subsection will be modified')).length).toEqual(3);
    expect((await screen.findAllByText('This subsection was modified')).length).toEqual(3);
    expect((await screen.findAllByText('subsection block 1')).length).toEqual(2);
    expect((await screen.findAllByText('subsection block 2')).length).toEqual(2);
  });

  test('renders loading spinner when data is pending', async () => {
    render(<CompareContainersWidget
      title="Test Title"
      upstreamBlockId={mockGetContainerMetadata.sectionIdLoading}
      downstreamBlockId={mockGetCourseContainerChildren.sectionIdLoading}
    />);
    expect((await screen.findAllByText('Test Title')).length).toEqual(2);
    const spinner = await screen.findAllByRole('status');
    expect(spinner.length).toEqual(2);
    expect(spinner[0].textContent).toEqual('Loading...');
    expect(spinner[1].textContent).toEqual('Loading...');
  });

  test('calls onRowClick when a row is clicked and updates diff view', async () => {
    const user = userEvent.setup();
    render(<CompareContainersWidget
      title="Test Title"
      upstreamBlockId={mockGetContainerMetadata.sectionId}
      downstreamBlockId={mockGetCourseContainerChildren.sectionId}
    />);
    expect((await screen.findAllByText('Test Title')).length).toEqual(2);
    const blocks =  await screen.findAllByText('subsection block 0');
    expect(blocks.length).toEqual(2);
    await user.click(blocks[0]);
    // Breadcrumbs
    const breadcrumbs = await screen.findAllByRole('button', {name: 'subsection block 0'});
    expect(breadcrumbs.length).toEqual(2);
    const backbtns = await screen.findAllByRole('button', {name: 'Back'});
    expect(backbtns.length).toEqual(2);
    await user.click(backbtns[0]);
    expect((await screen.findAllByText('Test Title')).length).toEqual(2);
    expect((await screen.findAllByText('subsection block 0')).length).toEqual(2);
  });
});
