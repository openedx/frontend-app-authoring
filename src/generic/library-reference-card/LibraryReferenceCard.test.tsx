import { getXBlockApiUrl } from '@src/course-outline/data/api';
import { render, screen, initializeMocks } from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';
import { LibraryReferenceCard } from './LibraryReferenceCard';

let axiosMock;
const upstreamData = {
  id: 'lct:UNIX:CIT1:subsection:99d7e14e2d6f4ab7989dc0d948f917df',
  name: 'upstream subsection',
};
const sectionData = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@asafd',
  displayName: 'downstream section',
  upstreamInfo: {
    upstreamRef: 'lct:UNIX:CIT1:section:d12323',
    upstreamName: 'upstream section',
    downstreamKey: 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@asafd',
    versionAvailable: 2,
    versionDeclined: null,
    readyToSync: false,
    topLevelParentKey: null,
    downstreamCustomized: [],
  },
};
const itemData = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sequential45d4d95a',
  displayName: 'downstream subsection',
  upstreamInfo: {
    upstreamRef: upstreamData.id,
    upstreamName: upstreamData.name,
    downstreamKey: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sequential45d4d95a',
    versionAvailable: 2,
    versionDeclined: null,
    readyToSync: false,
    topLevelParentKey: null,
    downstreamCustomized: [],
  },
};

const mockUseCourseAuthoringContext = jest.fn().mockReturnValue({
  openUnlinkModal: jest.fn(),
  courseId: 'course1',
});

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => mockUseCourseAuthoringContext(),
}));
const mockPostChange = jest.fn();
const mockOpenContainerInfoSidebar = jest.fn();
const mockOpenSyncModal = jest.fn();
jest.mock('@src/hooks', () => ({
  useToggleWithValue: () => [false, {}, mockOpenSyncModal, jest.fn()],
}));

describe('LibraryReferenceCard', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getXBlockApiUrl(sectionData.id))
      .reply(200, sectionData);
    axiosMock
      .onGet(getXBlockApiUrl(itemData.id))
      .reply(200, itemData);
  });

  it('renders the LibraryReferenceCard normally', async () => {
    render(
      <LibraryReferenceCard
        itemId={itemData.id}
        sectionId={sectionData.id}
        postChange={mockPostChange}
        goToParent={mockOpenContainerInfoSidebar}
      />,
    );
    expect(await screen.findByText(/Library Reference/)).toBeInTheDocument();
  });

  it('renders the LibraryReferenceCard error message', async () => {
    const user = userEvent.setup();
    const data = {
      ...itemData,
      upstreamInfo: {
        ...itemData.upstreamInfo,
        errorMessage: 'some error',
      },
    };
    axiosMock
      .onGet(getXBlockApiUrl(itemData.id))
      .reply(200, data);
    render(
      <LibraryReferenceCard
        itemId={itemData.id}
        sectionId={sectionData.id}
        postChange={mockPostChange}
        goToParent={mockOpenContainerInfoSidebar}
      />,
    );
    expect(await screen.findByText(
      `The link between ${itemData.displayName} and the library version has been broken. To edit or make changes, unlink component.`,
    )).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Unlink from library' }));
    expect(mockUseCourseAuthoringContext().openUnlinkModal).toHaveBeenCalledWith({
      value: data,
      sectionId: sectionData.id,
    });
  });

  it('renders the LibraryReferenceCard ready to sync', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getXBlockApiUrl(itemData.id))
      .reply(200, {
        ...itemData,
        upstreamInfo: {
          ...itemData.upstreamInfo,
          readyToSync: true,
        },
      });
    render(
      <LibraryReferenceCard
        itemId={itemData.id}
        sectionId={sectionData.id}
        postChange={mockPostChange}
        goToParent={mockOpenContainerInfoSidebar}
      />,
    );
    expect(await screen.findByText(
      `${itemData.displayName} has available updates`,
    )).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Review Updates' }));
    expect(mockOpenSyncModal).toHaveBeenCalled();
  });

  it('renders the LibraryReferenceCard customized text', async () => {
    axiosMock
      .onGet(getXBlockApiUrl(itemData.id))
      .reply(200, {
        ...itemData,
        upstreamInfo: {
          ...itemData.upstreamInfo,
          downstreamCustomized: ['displayName'],
        },
      });
    render(
      <LibraryReferenceCard
        itemId={itemData.id}
        sectionId={sectionData.id}
        postChange={mockPostChange}
        goToParent={mockOpenContainerInfoSidebar}
      />,
    );
    expect(await screen.findByText(
      `${itemData.displayName} has been modified in this course.`,
    )).toBeInTheDocument();
  });

  it('renders the LibraryReferenceCard with top level error message', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getXBlockApiUrl(itemData.id))
      .reply(200, {
        ...itemData,
        upstreamInfo: {
          ...itemData.upstreamInfo,
          topLevelParentKey: sectionData.upstreamInfo.downstreamKey,
          errorMessage: 'some error',
        },
      });
    render(
      <LibraryReferenceCard
        itemId={itemData.id}
        sectionId={sectionData.id}
        postChange={mockPostChange}
        goToParent={mockOpenContainerInfoSidebar}
      />,
    );
    expect(await screen.findByText(
      `${itemData.displayName} was reused as part of a section which has a broken link. To receive library updates to this component, unlink the broken link.`,
    )).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Unlink section' }));
    // should call unlink with parent section data
    expect(mockUseCourseAuthoringContext().openUnlinkModal).toHaveBeenCalledWith({
      value: sectionData,
      sectionId: sectionData.id,
    });
  });

  it('renders the LibraryReferenceCard with top level ready to sync', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getXBlockApiUrl(itemData.id))
      .reply(200, {
        ...itemData,
        upstreamInfo: {
          ...itemData.upstreamInfo,
          topLevelParentKey: sectionData.upstreamInfo.downstreamKey,
        },
      });
    const parentData = {
      ...sectionData,
      upstreamInfo: {
        ...sectionData.upstreamInfo,
        readyToSync: true,
      },
    };
    axiosMock
      .onGet(getXBlockApiUrl(sectionData.id))
      .reply(200, parentData);
    render(
      <LibraryReferenceCard
        itemId={itemData.id}
        sectionId={sectionData.id}
        postChange={mockPostChange}
        goToParent={mockOpenContainerInfoSidebar}
      />,
    );
    expect(await screen.findByText(
      `${itemData.displayName} was reused as part of a section which has updates available.`,
    )).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Review Updates' }));
    expect(mockOpenSyncModal).toHaveBeenCalledWith(parentData);
  });

  it('renders the LibraryReferenceCard with top level go to parent option', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getXBlockApiUrl(itemData.id))
      .reply(200, {
        ...itemData,
        upstreamInfo: {
          ...itemData.upstreamInfo,
          topLevelParentKey: sectionData.upstreamInfo.downstreamKey,
        },
      });
    render(
      <LibraryReferenceCard
        itemId={itemData.id}
        sectionId={sectionData.id}
        postChange={mockPostChange}
        goToParent={mockOpenContainerInfoSidebar}
      />,
    );
    expect(await screen.findByText(
      `${itemData.displayName} was reused as part of a section.`,
    )).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'View section' }));
    expect(mockOpenContainerInfoSidebar).toHaveBeenCalledWith(
      sectionData.id,
      undefined,
      sectionData.id,
    );
  });
});
