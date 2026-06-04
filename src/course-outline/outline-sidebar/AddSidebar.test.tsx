import { buildTestOutline } from '@src/course-outline/__mocks__';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';
import mockResult from '@src/library-authoring/__mocks__/library-search.json';
import { mockContentSearchConfig } from '@src/search-manager/data/api.mock';
import {
  mockContentLibrary,
  mockGetCollectionMetadata,
  mockGetContainerMetadata,
  mockGetContentLibraryV2List,
  mockLibraryBlockMetadata,
} from '@src/library-authoring/data/api.mocks';
import {
  type OutlineFlow,
  OutlineSidebarProvider,
} from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import fetchMock from 'fetch-mock-jest';
import type { ContainerType } from '@src/generic/key-utils';
import { XBlock } from '@src/data/types';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { CourseOutlineProvider } from '@src/course-outline/CourseOutlineContext';
import { snakeCaseKeys } from '@src/editors/utils';
import { getXBlockApiUrl, getXBlockBaseApiUrl } from '@src/course-outline/data/api';
import MockAdapter from 'axios-mock-adapter/types';
import { AddSidebar } from './AddSidebar';

mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockGetCollectionMetadata.applyMock();
mockGetContentLibraryV2List.applyMock();
mockLibraryBlockMetadata.applyMock();
mockGetContainerMetadata.applyMock();

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';
jest.mock('@src/CourseAuthoringContext', () => ({
  ...jest.requireActual('@src/CourseAuthoringContext'),
  useCourseAuthoringContext: () => ({
    ...jest.requireActual('@src/CourseAuthoringContext').useCourseAuthoringContext(),
    courseId: 5,
    courseDetails: { name: 'Test course' },
  }),
}));

let currentItemData: Partial<XBlock> | null;
let lastEditableSection: any;
let lastEditableSubsection: { data?: any; sectionId?: string; } | undefined;

jest.mock('@src/course-outline/CourseOutlineContext', () => ({
  CourseOutlineProvider: ({ children }) => children,
  useCourseOutlineContext: () => ({
    courseUsageKey: 'block-v1:UNIX+UX1+2025_T3+type@course+block@course',
    sections: outlineChildren,
    setSections: jest.fn(),
    restoreSectionList: jest.fn(),
    currentItemData,
    lastEditableSection,
    lastEditableSubsection,
    currentSelection: undefined,
    selectContainer: jest.fn(),
    clearSelection: jest.fn(),
    openContainerInfo: jest.fn(),
    setActionTargetSelection: jest.fn(),
    handleAddBlock: {
      isPending: false,
      mutate: jest.fn((variables, options) => {
        const api = jest.requireActual('@src/course-outline/data/api');
        api.createCourseXblock(variables).then(
          data => options?.onSuccess?.(data),
          () => {},
        );
      }),
      mutateAsync: jest.fn(async (variables) => {
        const api = jest.requireActual('@src/course-outline/data/api');
        return api.createCourseXblock(variables);
      }),
    },
    handleAddAndOpenUnit: {
      isPending: false,
      mutate: jest.fn((variables, options) => {
        const api = jest.requireActual('@src/course-outline/data/api');
        api.createCourseXblock(variables).then(
          data => options?.onSuccess?.(data),
          () => {},
        );
      }),
      mutateAsync: jest.fn(async (variables) => {
        const api = jest.requireActual('@src/course-outline/data/api');
        return api.createCourseXblock(variables);
      }),
    },
    duplicateSection: jest.fn(),
    duplicateSubsection: jest.fn(),
    duplicateUnit: jest.fn(),
  }),
}));

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  useDuplicateItem: jest.fn().mockReturnValue({ mutate: jest.fn(), isPending: false }),
  useDeleteCourseItem: jest.fn().mockReturnValue({ mutateAsync: jest.fn() }),
}));

const BLOCK_PREFIX = 'block-v1:UNIX+UX1+2025_T3+type@';
const BLOCK_SUFFIX = '+block@';

const outlineFixture = buildTestOutline({
  sections: [
    {
      id: `${BLOCK_PREFIX}chapter${BLOCK_SUFFIX}section-1`,
      displayName: 'Section 1',
      children: [
        {
          id: `${BLOCK_PREFIX}sequential${BLOCK_SUFFIX}subsection-1a`,
          displayName: 'Subsection 1A',
          children: [
            { id: `${BLOCK_PREFIX}vertical${BLOCK_SUFFIX}unit-1a1`, displayName: 'Unit 1A1' },
          ],
        },
      ],
    },
    {
      id: `${BLOCK_PREFIX}chapter${BLOCK_SUFFIX}section-2`,
      displayName: 'Section 2',
      children: [
        { id: `${BLOCK_PREFIX}sequential${BLOCK_SUFFIX}subsection-2a`, displayName: 'Subsection 2A' },
        {
          id: `${BLOCK_PREFIX}sequential${BLOCK_SUFFIX}subsection-2b`,
          displayName: 'Subsection 2B',
          children: [
            { id: `${BLOCK_PREFIX}vertical${BLOCK_SUFFIX}unit-2b1`, displayName: 'Unit 2B1' },
            { id: `${BLOCK_PREFIX}vertical${BLOCK_SUFFIX}unit-2b2`, displayName: 'Unit 2B2' },
          ],
        },
      ],
    },
    { id: `${BLOCK_PREFIX}chapter${BLOCK_SUFFIX}section-3`, displayName: 'Section 3' },
    {
      id: `${BLOCK_PREFIX}chapter${BLOCK_SUFFIX}section-4`,
      displayName: 'Section 4',
      children: [
        { id: `${BLOCK_PREFIX}sequential${BLOCK_SUFFIX}subsection-4a`, displayName: 'Subsection 4A' },
      ],
    },
  ],
});

let outlineChildren = (outlineFixture.courseStructure as any).childInfo.children;
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: () => outlineChildren,
}));

jest.mock('@src/studio-home/hooks', () => ({
  useStudioHome: () => ({
    isLoadingPage: false,
    isFailedLoadingPage: false,
    librariesV2Enabled: true,
  }),
}));

let currentFlow: OutlineFlow | null = null;
let isCurrentFlowOn = false;
const clearSelection = jest.fn();
const stopCurrentFlow = jest.fn();
const mockOpenContainerInfoSidebar = jest.fn();
jest.mock('../outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('../outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('../outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    currentFlow,
    isCurrentFlowOn,
    clearSelection,
    stopCurrentFlow,
    openContainerInfoSidebar: mockOpenContainerInfoSidebar,
  }),
}));

const renderComponent = () =>
  render(<AddSidebar />, {
    extraWrapper: ({ children }) => (
      <CourseAuthoringProvider courseId="some-course">
        <CourseOutlineProvider>
          <OutlineSidebarProvider>
            {children}
          </OutlineSidebarProvider>
        </CourseOutlineProvider>
      </CourseAuthoringProvider>
    ),
  });
const searchResult = {
  ...mockResult,
  results: [
    {
      ...mockResult.results[0],
      hits: mockResult.results[0].hits.slice(16, 19),
    },
    {
      ...mockResult.results[1],
    },
  ],
};
let axiosMock: MockAdapter;

describe('AddSidebar', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    // The Meilisearch client-side API uses fetch, not Axios.
    fetchMock.mockReset();
    fetchMock.post(searchEndpoint, (_url, req) => {
      const requestData = JSON.parse((req.body ?? '') as string);
      const query = requestData?.queries[0]?.q ?? '';
      // We have to replace the query (search keywords) in the mock results with the actual query,
      // because otherwise Instantsearch will update the UI and change the query,
      // leading to unexpected results in the test cases.
      const newMockResult = { ...searchResult };
      newMockResult.results[0].query = query;
      // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      newMockResult.results[0]?.hits.forEach((hit) => {
        hit._formatted = { ...hit };
      });
      return newMockResult;
    });
    outlineChildren = (outlineFixture.courseStructure as any).childInfo.children;
    currentItemData = null;
    lastEditableSection = outlineChildren[outlineChildren.length - 1] as any;
    lastEditableSubsection = lastEditableSection ?
      {
        data: lastEditableSection.childInfo.children[lastEditableSection.childInfo.children.length - 1] as any,
        sectionId: lastEditableSection.id,
      } :
      undefined;
  });

  it('renders the AddSidebar component without any errors', async () => {
    const user = userEvent.setup();
    renderComponent();
    // Check add new tab content
    expect(await screen.findByRole('button', { name: 'Section' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Subsection' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Unit' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Add New' })).toBeInTheDocument();
    const existingTab = await screen.findByRole('tab', { name: 'Add Existing' });
    expect(existingTab).toBeInTheDocument();

    // Check existing tab content
    await user.click(existingTab);
    expect(await screen.findByRole('button', { name: 'All libraries' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'See more' })).toBeInTheDocument();
    expect(await screen.findByRole('search')).toBeInTheDocument();
  });

  it('show hide extra filters', async () => {
    const user = userEvent.setup();
    renderComponent();
    const existingTab = await screen.findByRole('tab', { name: 'Add Existing' });
    expect(existingTab).toBeInTheDocument();
    await user.click(existingTab);
    const toggleBtn = await screen.findByRole('button', { name: 'See more' });
    expect(toggleBtn).toBeInTheDocument();
    // hidden by default
    expect(screen.queryByRole('button', { name: 'Type' })).not.toBeInTheDocument();
    // show when clicked
    await user.click(toggleBtn);
    expect(await screen.findByRole('button', { name: 'Type' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Tags' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Collections filter' })).toBeInTheDocument();
  });

  it('calls appropriate handlers on new button click', async () => {
    const user = userEvent.setup();
    const sectionList = (outlineFixture.courseStructure as any).childInfo.children;
    const lastSection = sectionList[3];
    const lastSubsection = lastSection.childInfo.children[0];
    axiosMock.onPost(getXBlockBaseApiUrl())
      .reply(200, { locator: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sequential45d4d95a' });
    renderComponent();

    // Validate handler for adding section, subsection and unit
    const section = await screen.findByRole('button', { name: 'Section' });
    const subsection = await screen.findByRole('button', { name: 'Subsection' });
    const unit = await screen.findByRole('button', { name: 'Unit' });
    await user.click(section);
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(snakeCaseKeys({
      type: 'chapter',
      category: 'chapter',
      parentLocator: 'block-v1:UNIX+UX1+2025_T3+type@course+block@course',
      displayName: 'Section',
    })));
    await user.click(subsection);
    expect(axiosMock.history.post[1].data).toEqual(JSON.stringify(snakeCaseKeys({
      type: 'sequential',
      category: 'sequential',
      parentLocator: lastSection.id,
      displayName: 'Subsection',
    })));
    await user.click(unit);
    expect(axiosMock.history.post[2].data).toEqual(JSON.stringify(snakeCaseKeys({
      type: 'vertical',
      category: 'vertical',
      parentLocator: lastSubsection.id,
      displayName: 'Unit',
    })));
  });

  it('creates parent section if required', async () => {
    const user = userEvent.setup();
    // the course is empty
    outlineChildren = [];
    lastEditableSection = undefined;
    lastEditableSubsection = undefined;
    const sectionId = 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@chapter123';
    axiosMock.onPost(getXBlockBaseApiUrl())
      .reply(200, { locator: sectionId });
    axiosMock.onGet(getXBlockApiUrl(sectionId))
      .reply(200, {});
    renderComponent();

    const subsection = await screen.findByRole('button', { name: 'Subsection' });
    await user.click(subsection);
    await waitFor(() => expect(axiosMock.history.post.length).toBeGreaterThan(1));
    // should add a section first
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(snakeCaseKeys({
      type: 'chapter',
      category: 'chapter',
      parentLocator: 'block-v1:UNIX+UX1+2025_T3+type@course+block@course',
      displayName: 'Section',
    })));
    // then subsection
    expect(axiosMock.history.post[1].data).toEqual(JSON.stringify(snakeCaseKeys({
      type: 'sequential',
      category: 'sequential',
      parentLocator: sectionId,
      displayName: 'Subsection',
    })));
    // Intermediate section creation should NOT have opened its sidebar.
    // Only the final subsection should trigger openContainerInfoSidebar.
    expect(mockOpenContainerInfoSidebar).toHaveBeenCalledTimes(1);
    expect(mockOpenContainerInfoSidebar).toHaveBeenCalledWith(sectionId, sectionId, sectionId);
  });

  it('creates parent section and subsection if required', async () => {
    const user = userEvent.setup();
    // the course is empty
    outlineChildren = [];
    lastEditableSection = undefined;
    lastEditableSubsection = undefined;
    const sectionId = 'block-v1:UNIX+UX1+2025_T3+type@chapter+block@chapter123';
    const subsectionId = 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sequential234';
    const unitId = 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@vertical2133';
    const sectionBody = snakeCaseKeys({
      type: 'chapter',
      category: 'chapter',
      parentLocator: 'block-v1:UNIX+UX1+2025_T3+type@course+block@course',
      displayName: 'Section',
    });
    const subsectionBody = snakeCaseKeys({
      type: 'sequential',
      category: 'sequential',
      parentLocator: sectionId,
      displayName: 'Subsection',
    });
    const unitBody = snakeCaseKeys({
      type: 'vertical',
      category: 'vertical',
      parentLocator: subsectionId,
      displayName: 'Unit',
    });
    axiosMock.onPost(getXBlockBaseApiUrl(), sectionBody)
      .reply(200, { locator: sectionId });
    axiosMock.onPost(getXBlockBaseApiUrl(), subsectionBody)
      .reply(200, { locator: subsectionId });
    axiosMock.onPost(getXBlockBaseApiUrl(), unitBody)
      .reply(200, { locator: unitId });
    axiosMock.onGet(getXBlockApiUrl(sectionId))
      .reply(200, {});
    renderComponent();

    const unit = await screen.findByRole('button', { name: 'Unit' });
    await user.click(unit);
    // should add a section first
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(sectionBody));
    // then subsection
    expect(axiosMock.history.post[1].data).toEqual(JSON.stringify(subsectionBody));
    // then unit
    expect(axiosMock.history.post[2].data).toEqual(JSON.stringify(unitBody));
    // No sidebar opens for intermediate section/subsection creations.
    // The unit page opens via handleAddAndOpenUnit's onSuccess.
    expect(mockOpenContainerInfoSidebar).not.toHaveBeenCalled();
  });

  it('calls appropriate handlers on existing button click', async () => {
    const user = userEvent.setup();
    const sectionList = (outlineFixture.courseStructure as any).childInfo.children;
    const lastSection = sectionList[3];
    const lastSubsection = lastSection.childInfo.children[0];
    axiosMock.onPost(getXBlockBaseApiUrl())
      .reply(200, { locator: 'block-v1:UNIX+UX1+2025_T3+type@sequential+block@sequential45d4d95a' });
    renderComponent();
    // Check existing tab content
    await user.click(await screen.findByRole('tab', { name: 'Add Existing' }));

    // Validate handler for adding section, subsection and unit
    const addBtns = await screen.findAllByRole('button', { name: 'Add' });
    // first one is unit as per mock
    await user.click(addBtns[0]);
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(snakeCaseKeys({
      type: 'library_v2',
      category: 'vertical',
      parentLocator: lastSubsection.id,
      libraryContentKey: searchResult.results[0].hits[0].usage_key,
    })));
    // second one is subsection as per mock
    await user.click(addBtns[1]);
    expect(axiosMock.history.post[1].data).toEqual(JSON.stringify(snakeCaseKeys({
      type: 'library_v2',
      category: 'sequential',
      parentLocator: lastSection.id,
      libraryContentKey: searchResult.results[0].hits[1].usage_key,
    })));
    // third one is section as per mock
    await user.click(addBtns[2]);
    expect(axiosMock.history.post[2].data).toEqual(JSON.stringify(snakeCaseKeys({
      type: 'library_v2',
      category: 'chapter',
      parentLocator: 'block-v1:UNIX+UX1+2025_T3+type@course+block@course',
      libraryContentKey: searchResult.results[0].hits[2].usage_key,
    })));
  });

  ['section', 'subsection', 'unit'].forEach((category) => {
    it(`shows appropriate existing and new content based on ${category} use button click`, async () => {
      const user = userEvent.setup();
      const sectionList = (outlineFixture.courseStructure as any).childInfo.children;
      const firstSection = sectionList[0];
      const firstSubsection = firstSection.childInfo.children[0];
      currentFlow = {
        flowType: category as ContainerType,
        parentLocator: category === 'subsection' ? firstSection.id : firstSubsection.id,
        grandParentLocator: category === 'unit' ? firstSection.id : undefined,
      };
      renderComponent();
      // Check existing tab content
      await user.click(await screen.findByRole('tab', { name: 'Add Existing' }));
      // Check existing tab content is rendered by default
      await waitFor(() => {
        expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post');
      });
      expect(fetchMock).toHaveLastFetched((_url, req) => {
        const requestData = JSON.parse((req.body ?? '') as string);
        const requestedFilter = requestData?.queries[0].filter;
        return requestedFilter?.[2] === `block_type IN ["${category}"]`;
      });

      await user.click(await screen.findByRole('tab', { name: 'Add New' }));
      // Only category button should be visible
      const section = screen.queryByRole('button', { name: 'Section' });
      const subsection = screen.queryByRole('button', { name: 'Subsection' });
      const unit = screen.queryByRole('button', { name: 'Unit' });
      switch (category) {
        case 'section':
          expect(section).toBeInTheDocument();
          expect(subsection).not.toBeInTheDocument();
          expect(unit).not.toBeInTheDocument();
          break;
        case 'subsection':
          expect(section).not.toBeInTheDocument();
          expect(subsection).toBeInTheDocument();
          expect(unit).not.toBeInTheDocument();
          break;
        default:
          expect(section).not.toBeInTheDocument();
          expect(subsection).not.toBeInTheDocument();
          expect(unit).toBeInTheDocument();
          break;
      }
    });
  });

  it('shows alert when container cannot be added', async () => {
    const user = userEvent.setup();
    currentItemData = {
      displayName: 'Test container',
      category: 'chapter',
      actions: {
        childAddable: false,
        deletable: true,
        draggable: true,
        duplicable: true,
      },
    };
    renderComponent();

    // render existing tab as well
    await user.click(await screen.findByRole('tab', { name: 'Add Existing' }));
    // One in new tab and one in existing tab
    expect(
      (await screen.findAllByText(
        `${currentItemData.displayName} is a library section. Content cannot be added to Library referenced sections.`,
      )).length,
    ).toEqual(2);
  });

  it('back button is rendered and works', async () => {
    const user = userEvent.setup();
    isCurrentFlowOn = true;
    renderComponent();

    const back = await screen.findByRole('button', { name: 'Back' });
    await user.click(back);
    expect(clearSelection).toHaveBeenCalled();
    expect(stopCurrentFlow).toHaveBeenCalled();
  });
});
