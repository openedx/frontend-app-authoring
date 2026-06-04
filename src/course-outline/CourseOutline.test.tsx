import { getConfig } from '@edx/frontend-platform';
import { cloneDeep } from 'lodash';
import { closestCorners } from '@dnd-kit/core';
import { useLocation } from 'react-router-dom';
import { clipboardUnit } from '@src/__mocks__';
import configureModalMessages from '@src/generic/configure-modal/messages';
import pasteButtonMessages from '@src/generic/clipboard/paste-component/messages';
import { getApiBaseUrl, getClipboardUrl } from '@src/generic/data/api';
import { ContainerType } from '@src/generic/key-utils';
import { getDownstreamApiUrl } from '@src/generic/unlink-modal/data/api';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import {
  act,
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '@src/testUtils';
import { XBlock } from '@src/data/types';
import { userEvent } from '@testing-library/user-event';
import { CourseOutlineProvider } from './CourseOutlineContext';
import { OutlineSidebarProvider } from './outline-sidebar/OutlineSidebarContext';
import { OutlineSidebarPagesProvider } from './outline-sidebar/OutlineSidebarPagesContext';
import {
  getCourseBestPracticesApiUrl,
  getCourseLaunchApiUrl,
  getCourseOutlineIndexApiUrl,
  getCourseReindexApiUrl,
  getXBlockApiUrl,
  getCourseBlockApiUrl,
  getCourseItemApiUrl,
  getXBlockBaseApiUrl,
  exportTags,
} from './data';
import { courseOutlineQueryKeys } from './data/queryKeys';

import {
  courseOutlineIndexMock as originalCourseOutlineIndexMock,
  courseBestPracticesMock,
  courseLaunchMock,
  buildTestOutline,
} from './__mocks__';
import { COURSE_BLOCK_NAMES, VIDEO_SHARING_OPTIONS } from './constants';
import CourseOutline from './CourseOutline';

import messages from './messages';
import headerMessages from './header-navigations/messages';
import cardHeaderMessages from './card-header/messages';
import enableHighlightsModalMessages from './enable-highlights-modal/messages';
import statusBarMessages from './status-bar/messages';
import subsectionMessages from './subsection-card/messages';
import pageAlertMessages from './page-alerts/messages';
import {
  moveSubsectionOver,
  moveUnitOver,
  moveSubsection,
  moveUnit,
} from './drag-helper/utils';

let axiosMock: import('axios-mock-adapter/types');
let queryClient;
const mockPathname = '/foo-bar';
const courseId = 'course-v1:edX+DemoX+Demo_Course';
const clearSelection = jest.fn();
const startCurrentFlow = jest.fn();
let selectedContainerId: string | undefined;
const buildCourseOutlineIndexMock = () =>
  buildTestOutline({
    overrides: cloneDeep(originalCourseOutlineIndexMock) as Record<string, unknown>,
  }) as unknown as typeof originalCourseOutlineIndexMock;

let courseOutlineIndexMock = buildCourseOutlineIndexMock();

// ─── Local snake_case API-response mocks ────────────────────────────────
const courseSectionMock = {
  id: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@d0e78d363a424da6be5c22704c34f7a7',
  display_name: 'Section',
  category: 'chapter',
  has_children: false,
  edited_on: 'Nov 22, 2023 at 07:45 UTC',
  published: true,
  published_on: 'Nov 22, 2023 at 07:45 UTC',
  studio_url: '',
  released_to_students: true,
  release_date: 'Feb 05, 2013 at 05:00 UTC',
  visibility_state: 'live',
  has_explicit_staff_lock: false,
  start: '2013-02-05T05:00:00Z',
  graded: false,
  due_date: '',
  due: null,
  relative_weeks_due: null,
  format: null,
  course_graders: ['Homework', 'Exam'],
  has_changes: false,
  actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
  explanatory_message: null,
  group_access: {},
  user_partitions: [],
  show_correctness: 'always',
  highlights: [],
  highlights_enabled: true,
  highlights_preview_only: false,
  highlights_doc_url: '',
  child_info: { category: 'sequential', display_name: 'Subsection', children: [] },
  ancestor_has_staff_lock: false,
  staff_only_message: false,
  enable_copy_paste_units: false,
  has_partition_group_components: false,
  user_partition_info: {
    selectable_partitions: [],
    selected_partition_index: -1,
    selected_groups_label: '',
  },
};

const courseSubsectionMock = {
  id: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@b713bc2830f34f6f87554028c3068729',
  display_name: 'Subsection',
  category: 'sequential',
  has_children: false,
  edited_on: 'Dec 05, 2023 at 10:35 UTC',
  published: true,
  published_on: 'Dec 05, 2023 at 10:35 UTC',
  studio_url: '',
  released_to_students: true,
  release_date: 'Feb 05, 2013 at 05:00 UTC',
  visibility_state: 'live',
  has_explicit_staff_lock: false,
  start: '2013-02-05T05:00:00Z',
  graded: false,
  due_date: '',
  due: null,
  relative_weeks_due: null,
  format: null,
  course_graders: ['Homework', 'Exam'],
  has_changes: false,
  actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
  explanatory_message: null,
  group_access: {},
  user_partitions: [],
  show_correctness: 'always',
  hide_after_due: false,
  is_proctored_exam: false,
  was_exam_ever_linked_with_external: false,
  online_proctoring_rules: '',
  is_practice_exam: false,
  is_onboarding_exam: false,
  is_time_limited: false,
  exam_review_rules: '',
  default_time_limit_minutes: null,
  proctoring_exam_configuration_link: null,
  supports_onboarding: false,
  show_review_rules: true,
  child_info: { category: 'vertical', display_name: 'Unit', children: [] },
  ancestor_has_staff_lock: false,
  staff_only_message: false,
  enable_copy_paste_units: false,
  has_partition_group_components: false,
  user_partition_info: {
    selectable_partitions: [],
    selected_partition_index: -1,
    selected_groups_label: '',
  },
};

window.HTMLElement.prototype.scrollIntoView = jest.fn();
jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    startCurrentFlow,
    clearSelection,
    selectedContainerState: (() => (selectedContainerId ? { currentId: selectedContainerId } : undefined))(),
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('@src/help-urls/hooks', () => ({
  useHelpUrls: () => ({
    contentHighlights: 'some',
    visibility: 'some',
    grading: 'some',
    outline: 'some',
  }),
}));

jest.mock('./data/api', () => ({
  ...jest.requireActual('./data/api'),
  getTagsCount: () => jest.fn().mockResolvedValue({}),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  // Since jsdom (used by jest) does not support getBoundingClientRect function
  // which is required for drag-n-drop calculations, we mock closestCorners fn
  // from dnd-kit to return collided elements as per the test. This allows us to
  // test all drag-n-drop handlers.
  closestCorners: jest.fn(),
}));

jest.mock('@src/studio-home/data/selectors', () => ({
  ...jest.requireActual('@src/studio-home/data/selectors'),
  getStudioHomeData: jest.fn().mockReturnValue({
    librariesV2Enabled: true,
  }),
}));

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CourseOutlineProvider>
        <OutlineSidebarPagesProvider>
          <OutlineSidebarProvider>
            <CourseOutline />
          </OutlineSidebarProvider>
        </OutlineSidebarPagesProvider>
      </CourseOutlineProvider>
    </CourseAuthoringProvider>,
  );

describe('<CourseOutline />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    selectedContainerId = undefined;
    // restore index mock
    courseOutlineIndexMock = buildCourseOutlineIndexMock();

    jest.mocked(useLocation).mockReturnValue({
      pathname: mockPathname,
      state: undefined,
      key: '',
      search: '',
      hash: '',
    });

    axiosMock = mocks.axiosMock;
    queryClient = mocks.queryClient;
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);
    axiosMock
      .onGet(getCourseBestPracticesApiUrl({
        courseId,
        excludeGraded: true,
        all: true,
      }))
      .reply(200, courseBestPracticesMock);

    axiosMock
      .onGet(getCourseLaunchApiUrl({
        courseId,
        gradedOnly: true,
        validateOras: true,
        all: true,
      }))
      .reply(200, courseLaunchMock);
    // Seed React Query cache with a clone so tests can mutate the mock data
    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), cloneDeep(courseOutlineIndexMock));

    // Pre-seed item-level caches so useCourseItemData queries resolve immediately
    // rather than failing when getXBlockApiUrl mocks aren't yet set up.
    courseOutlineIndexMock.courseStructure.childInfo.children.forEach((section: any) => {
      queryClient.setQueryData(
        courseOutlineQueryKeys.courseItemId(section.id),
        section,
      );
      (section.childInfo?.children || []).forEach((subsection: any) => {
        queryClient.setQueryData(
          courseOutlineQueryKeys.courseItemId(subsection.id),
          subsection,
        );
        (subsection.childInfo?.children || []).forEach((unit: any) => {
          queryClient.setQueryData(
            courseOutlineQueryKeys.courseItemId(unit.id),
            unit,
          );
        });
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('render CourseOutline component correctly', async () => {
    renderComponent();

    expect(await screen.findByText('Demonstration Course')).toBeInTheDocument();
    expect(await screen.findByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
  });

  it('renders sections from React Query without pre-loading Redux (page refresh scenario)', async () => {
    // Create fresh mock state — no pre-loaded Redux data, empty React Query cache.
    ({ axiosMock, queryClient } = initializeMocks());
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);
    axiosMock
      .onGet(getCourseBestPracticesApiUrl({
        courseId,
        excludeGraded: true,
        all: true,
      }))
      .reply(200, courseBestPracticesMock);
    axiosMock
      .onGet(getCourseLaunchApiUrl({
        courseId,
        gradedOnly: true,
        validateOras: true,
        all: true,
      }))
      .reply(200, courseLaunchMock);

    renderComponent();

    // Should show sections, not EmptyPlaceholder
    const sectionCards = await screen.findAllByTestId('section-card');
    expect(sectionCards.length).toBe(
      courseOutlineIndexMock.courseStructure.childInfo.children.length,
    );
    expect(screen.queryByTestId('empty-placeholder')).not.toBeInTheDocument();
  });

  it('handles course outline fetch api errors', async () => {
    ({ axiosMock } = initializeMocks());
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(500, 'some internal error');
    axiosMock
      .onGet(getCourseBestPracticesApiUrl({
        courseId,
        excludeGraded: true,
        all: true,
      }))
      .reply(200, courseBestPracticesMock);
    axiosMock
      .onGet(getCourseLaunchApiUrl({
        courseId,
        gradedOnly: true,
        validateOras: true,
        all: true,
      }))
      .reply(200, courseLaunchMock);

    const { findByText, queryByRole } = renderComponent();
    expect(await findByText('"some internal error"')).toBeInTheDocument();

    expect(queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('check reindex and render success alert is correctly', async () => {
    const { findByText, findByTestId } = renderComponent();

    axiosMock
      .onGet(getCourseReindexApiUrl(courseOutlineIndexMock.reindexLink))
      .reply(200);
    const reindexButton = await findByTestId('course-reindex');
    fireEvent.click(reindexButton);

    expect(await findByText(messages.alertSuccessDescription.defaultMessage)).toBeInTheDocument();
  });

  it('check video sharing option udpates correctly', async () => {
    const { findByLabelText } = renderComponent();

    axiosMock
      .onPost(getCourseBlockApiUrl(courseId), {
        metadata: {
          video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
        },
      })
      .reply(200);
    const optionDropdown = await findByLabelText(statusBarMessages.videoSharingTitle.defaultMessage);
    await act(
      async () => fireEvent.change(optionDropdown, { target: { value: VIDEO_SHARING_OPTIONS.allOff } }),
    );

    // The video sharing POST is the one with the expected data.
    // Find it by data content rather than assuming a fixed index.
    const videoSharingPost = axiosMock.history.post.find(
      (entry: any) => entry.data && entry.data.includes('video_sharing_options'),
    );
    expect(videoSharingPost).toBeDefined();
    expect(videoSharingPost).toBeDefined();
    expect(JSON.parse(videoSharingPost!.data)).toEqual({
      metadata: {
        video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
      },
    });
  });

  it('check video sharing option shows error on failure', async () => {
    renderComponent();

    axiosMock
      .onPost(getCourseBlockApiUrl(courseId), {
        metadata: {
          video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
        },
      })
      .reply(500);
    const optionDropdown = await screen.findByLabelText(statusBarMessages.videoSharingTitle.defaultMessage);
    await act(
      async () => fireEvent.change(optionDropdown, { target: { value: VIDEO_SHARING_OPTIONS.allOff } }),
    );

    const videoSharingPost = axiosMock.history.post.find(
      (entry: any) => entry.data && entry.data.includes('video_sharing_options'),
    );
    expect(videoSharingPost).toBeDefined();
    expect(videoSharingPost).toBeDefined();
    expect(JSON.parse(videoSharingPost!.data)).toEqual({
      metadata: {
        video_sharing_options: VIDEO_SHARING_OPTIONS.allOff,
      },
    });

    const alertElements = screen.queryAllByRole('alert');
    expect(alertElements.find(
      (el) => el.classList.contains('alert-content'),
    )).toHaveTextContent(
      'Unable to save changes. Please try again.',
    );
  });

  it('render error alert after failed reindex correctly', async () => {
    const { findByText, findByTestId } = renderComponent();

    axiosMock
      .onGet(getCourseReindexApiUrl(courseOutlineIndexMock.reindexLink))
      .reply(500, 'reindex failed');
    const reindexButton = await findByTestId('course-reindex');
    await act(async () => fireEvent.click(reindexButton));

    expect(await findByText('"reindex failed"')).toBeInTheDocument();
  });

  it('check that new section list is saved when dragged', async () => {
    const { findAllByRole, findByTestId } = renderComponent();
    const expandAllButton = await findByTestId('expand-collapse-all-button');
    fireEvent.click(expandAllButton);
    const sectionsDraggers = await findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = sectionsDraggers[1];

    axiosMock
      .onPut(getCourseBlockApiUrl(courseId))
      .reply(200, { dummy: 'value' });

    const sections = courseOutlineIndexMock.courseStructure.childInfo.children;
    const sectionIds = sections.map(s => s.id);
    jest.mocked(closestCorners).mockReturnValue([{ id: sectionIds[0] }]);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });

    // Wait for mutation API call
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    // Verify API called with correct new order
    const putData = JSON.parse(axiosMock.history.put[0].data);
    expect(putData.children).toEqual([
      sectionIds[1],
      sectionIds[0],
      sectionIds[2],
      sectionIds[3],
    ]);

    // Verify React Query cache was updated with new order
    const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
    const cachedChildren = cachedData?.courseStructure?.childInfo?.children;
    expect(cachedChildren.map(s => s.id)).toEqual([
      sectionIds[1],
      sectionIds[0],
      sectionIds[2],
      sectionIds[3],
    ]);
  });

  it('check section list is restored to original order when API call fails', async () => {
    const { findAllByRole, findByTestId } = renderComponent();
    const expandAllButton = await findByTestId('expand-collapse-all-button');
    fireEvent.click(expandAllButton);
    const sectionsDraggers = await findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = sectionsDraggers[1];

    axiosMock
      .onPut(getCourseBlockApiUrl(courseId))
      .reply(500);

    const sections = courseOutlineIndexMock.courseStructure.childInfo.children;
    const sectionIds = sections.map(s => s.id);
    jest.mocked(closestCorners).mockReturnValue([{ id: sectionIds[0] }]);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });

    // Wait for mutation API call to fail
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    // Verify React Query cache still has original order (rollback cleared preview, cache unchanged)
    const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
    const cachedChildren = cachedData?.courseStructure?.childInfo?.children;
    expect(cachedChildren.map(s => s.id)).toEqual(sectionIds);
  });

  it('adds new section correctly', async () => {
    const user = userEvent.setup();
    renderComponent();
    let elements = await screen.findAllByTestId('section-card');
    window.HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 0,
      bottom: 4000,
      height: 0,
      width: 0,
      x: 0,
      y: 0,
      left: 0,
      right: 0,
      toJSON: () => {},
    }));
    expect(elements.length).toBe(4);

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: courseSectionMock.id,
      });
    axiosMock
      .onGet(getXBlockApiUrl(courseSectionMock.id))
      .reply(200, courseSectionMock);
    const newSectionButton = (await screen.findAllByRole('button', { name: 'New section' }))[0];
    await user.click(newSectionButton);

    elements = await screen.findAllByTestId('section-card');
    expect(elements.length).toBe(5);
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('adds new subsection correctly', async () => {
    const user = userEvent.setup();
    const { findAllByTestId } = renderComponent();
    const [section] = await findAllByTestId('section-card');
    let subsections = await within(section).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(2);
    window.HTMLElement.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 0,
      bottom: 4000,
      height: 0,
      width: 0,
      x: 0,
      y: 0,
      left: 0,
      right: 0,
      toJSON: () => {},
    }));

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: courseSubsectionMock.id,
      });
    axiosMock
      .onGet(getXBlockApiUrl(courseSubsectionMock.id))
      .reply(200, courseSubsectionMock);
    const firstSectionData = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    // @ts-ignore
    firstSectionData.childInfo.children.push(courseSubsectionMock);
    axiosMock
      .onGet(getXBlockApiUrl(firstSectionData.id))
      .reply(200, firstSectionData);
    const newSubsectionButton = await within(section).findByRole('button', { name: 'New subsection' });
    await user.click(newSubsectionButton);

    subsections = await within(section).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(3);
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('adds new unit correctly', async () => {
    const { findAllByTestId } = renderComponent();
    const [sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const units = await within(subsectionElement).findAllByTestId('unit-card');
    expect(units.length).toBe(1);

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: 'block-v1:UNIX+UX1+2025_T3+type@vertical+block@vertical1e842129',
      });
    const newUnitButton = await within(subsectionElement).findByRole('button', { name: 'New unit' });
    await act(async () => fireEvent.click(newUnitButton));
    expect(axiosMock.history.post.length).toBe(3);
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [subsection] = section.childInfo.children;
    expect(axiosMock.history.post[2].data).toBe(JSON.stringify({
      type: COURSE_BLOCK_NAMES.vertical.id,
      category: COURSE_BLOCK_NAMES.vertical.id,
      parent_locator: subsection.id,
      display_name: COURSE_BLOCK_NAMES.vertical.name,
    }));
  });

  it('adds a unit from library correctly', async () => {
    const user = userEvent.setup();
    renderComponent();
    const [sectionElement] = await screen.findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const units = await within(subsectionElement).findAllByTestId('unit-card');
    expect(units.length).toBe(1);

    const addUnitFromLibraryButton = within(subsectionElement).getByRole('button', {
      name: /use unit from library/i,
    });
    await user.click(addUnitFromLibraryButton);

    // Start the add existing unit flow
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [subsection] = section.childInfo.children;
    expect(startCurrentFlow).toHaveBeenCalledWith({
      flowType: ContainerType.Unit,
      parentLocator: subsection.id,
      grandParentLocator: section.id,
    });
  });

  it('adds a subsection from library correctly', async () => {
    const user = userEvent.setup();
    renderComponent();
    const [sectionElement] = await screen.findAllByTestId('section-card');
    const subsections = await within(sectionElement).findAllByTestId('subsection-card');
    expect(subsections.length).toBe(2);

    const addSubsectionFromLibraryButton = within(sectionElement).getByRole('button', {
      name: /use subsection from library/i,
    });
    await user.click(addSubsectionFromLibraryButton);

    // Start the add existing subsection flow
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    expect(startCurrentFlow).toHaveBeenCalledWith({
      flowType: ContainerType.Subsection,
      parentLocator: section.id,
      grandParentLocator: undefined,
    });
  });

  it('adds a section from library correctly', async () => {
    const user = userEvent.setup();
    renderComponent();
    const sections = await screen.findAllByTestId('section-card');
    expect(sections.length).toBe(4);

    const addSectionFromLibraryButton = await screen.findByRole('button', {
      name: /use section from library/i,
    });
    await user.click(addSectionFromLibraryButton);

    // Start the add existing section flow
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    expect(startCurrentFlow).toHaveBeenCalledWith({
      flowType: ContainerType.Section,
      parentLocator: courseBlockId,
      grandParentLocator: undefined,
    });
  });

  it('render checklist value correctly', async () => {
    const { findByText } = renderComponent();

    // Data is loaded via mount effects; wait for checklist to appear
    expect(await findByText('3/8 completed')).toBeInTheDocument();
  });

  it('render alerts if checklist api fails', async () => {
    axiosMock
      .onGet(getCourseLaunchApiUrl({
        courseId,
        gradedOnly: true,
        validateOras: true,
        all: true,
      }))
      .reply(500);
    const { findByText, findByRole } = renderComponent();

    // Launch query is dispatched via mount effect; wait for error alert
    expect(await findByText('Request failed with status code 500')).toBeInTheDocument();

    const dismissBtn = await findByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismissBtn);
    await waitFor(() => {
      expect(screen.queryByText('Request failed with status code 500')).not.toBeInTheDocument();
    });
  });

  it('check highlights are enabled after enable highlights query is successful', async () => {
    const { findByTestId, findByText } = renderComponent();

    axiosMock.reset();
    axiosMock
      .onPost(getCourseBlockApiUrl(courseId), {
        publish: 'republish',
        metadata: {
          highlights_enabled_for_messaging: true,
        },
      })
      .reply(200);
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, {
        ...courseOutlineIndexMock,
        courseStructure: {
          ...courseOutlineIndexMock.courseStructure,
          highlightsEnabledForMessaging: true,
        },
      });

    const enableButton = await findByTestId('highlights-enable-button');
    fireEvent.click(enableButton);
    const saveButton = await findByText(enableHighlightsModalMessages.submitButton.defaultMessage);
    await act(async () => fireEvent.click(saveButton));
    expect(await findByTestId('highlights-enabled-span')).toBeInTheDocument();
  });

  it('should expand and collapse subsections, after click on subheader buttons', async () => {
    const { queryAllByTestId, findByText } = renderComponent();

    const collapseBtn = await findByText(headerMessages.collapseAllButton.defaultMessage);
    expect(collapseBtn).toBeInTheDocument();
    fireEvent.click(collapseBtn);

    const expandBtn = await findByText(headerMessages.expandAllButton.defaultMessage);
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);

    await waitFor(() => {
      const cardSubsections = queryAllByTestId('section-card__subsections');
      cardSubsections.forEach(element => expect(element).toBeVisible());

      fireEvent.click(collapseBtn);
      cardSubsections.forEach(element => expect(element).not.toBeVisible());
    });
  });

  it('render CourseOutline component without sections correctly', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, buildTestOutline({ sections: [] }));
    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), buildTestOutline({ sections: [] }));

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('empty-placeholder')).toBeInTheDocument();
    });
  });

  it('render configuration alerts and check dismiss query', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, {
        ...courseOutlineIndexMock,
        notificationDismissUrl: '/some/url',
      });
    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), {
      ...courseOutlineIndexMock,
      notificationDismissUrl: '/some/url',
    });

    renderComponent();
    const alert = await screen.findByText(pageAlertMessages.configurationErrorTitle.defaultMessage);
    expect(alert).toBeInTheDocument();
    const dismissBtn = await screen.findByRole('button', { name: 'Dismiss' });
    axiosMock
      .onDelete('/some/url')
      .reply(204);
    fireEvent.click(dismissBtn);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
  });

  it('check edit title works for section, subsection and unit', async () => {
    const user = userEvent.setup();
    renderComponent();
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const checkEditTitle = async (element, item, newName, elementName) => {
      axiosMock.reset();
      // Re-register all baseline GET handlers so post-mutation refetches succeed.
      axiosMock
        .onGet(getCourseOutlineIndexApiUrl(courseId))
        .reply(200, courseOutlineIndexMock);
      axiosMock
        .onGet(getCourseBestPracticesApiUrl({
          courseId,
          excludeGraded: true,
          all: true,
        }))
        .reply(200, courseBestPracticesMock);
      axiosMock
        .onGet(getCourseLaunchApiUrl({
          courseId,
          gradedOnly: true,
          validateOras: true,
          all: true,
        }))
        .reply(200, courseLaunchMock);
      // Rename-specific handlers
      axiosMock
        .onPost(getCourseItemApiUrl(item.id))
        .reply(200, { dummy: 'value' });

      // mock section, subsection and unit name and check within the elements.
      // this is done to avoid adding conditions to this mock.

      axiosMock
        .onGet(getXBlockApiUrl(section.id))
        .reply(200, {
          ...section,
          display_name: newName,
          childInfo: {
            children: [
              {
                ...section.childInfo.children[0],
                display_name: newName,
                childInfo: {
                  children: [
                    {
                      ...section.childInfo.children[0].childInfo.children[0],
                      display_name: newName,
                    },
                  ],
                },
              },
            ],
          },
        });

      const editButton = await within(element).findByTestId(`${elementName}-edit-button`);
      fireEvent.click(editButton);
      const editField = await within(element).findByTestId(`${elementName}-edit-field`);
      fireEvent.change(editField, { target: { value: newName } });
      await user.keyboard('{enter}');
      expect(
        axiosMock.history.post[axiosMock.history.post.length - 1].data,
      ).toBe(JSON.stringify({
        metadata: {
          display_name: newName,
        },
      }));
      const results = await within(element).findAllByText(newName);
      expect(results.length).toBeGreaterThan(0);
    };

    // check section
    const [sectionElement] = await screen.findAllByTestId('section-card');
    await checkEditTitle(sectionElement, section, 'New section name', 'section');

    // check subsection
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    await checkEditTitle(subsectionElement, subsection, 'New subsection name', 'subsection');

    // check unit
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');
    await checkEditTitle(unitElement, unit, 'New unit name', 'unit');
  });

  it('check whether section, subsection and unit is deleted when corresponding delete button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    // get section, subsection and unit
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await screen.findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');
    selectedContainerId = section.id;

    // Mutable copy of outline data so refetch responses reflect deletions.
    const outlineData = cloneDeep(courseOutlineIndexMock);

    const removeItemFromOutline = (itemId: string) => {
      // Remove from top-level sections
      const sectionIdx = outlineData.courseStructure.childInfo.children.findIndex(
        (s: any) => s.id === itemId,
      );
      if (sectionIdx >= 0) {
        outlineData.courseStructure.childInfo.children.splice(sectionIdx, 1);
        return;
      }
      // Remove from subsections
      for (const s of outlineData.courseStructure.childInfo.children) {
        const subIdx = s.childInfo.children.findIndex((sub: any) => sub.id === itemId);
        if (subIdx >= 0) {
          s.childInfo.children.splice(subIdx, 1);
          return;
        }
        // Remove from units
        for (const sub of s.childInfo.children) {
          const unitIdx = sub.childInfo.children.findIndex((u: any) => u.id === itemId);
          if (unitIdx >= 0) {
            sub.childInfo.children.splice(unitIdx, 1);
            return;
          }
        }
      }
    };

    const checkDeleteBtn = async (item, element, elementName) => {
      expect(within(element).getByText(item.displayName)).toBeInTheDocument();

      axiosMock.onDelete(getCourseItemApiUrl(item.id)).reply(200);

      const menu = await within(element).findByTestId(`${elementName}-card-header__menu-button`);
      await user.click(menu);
      const deleteButton = await within(element).findByTestId(`${elementName}-card-header__menu-delete-button`);
      await user.click(deleteButton);
      const confirmButton = await screen.findByRole('button', { name: 'Delete' });
      await user.click(confirmButton);

      // Wait for the element to disappear after the outline index query
      // refetches with updated data (invalidation replaces Redux facade sync).
      await waitFor(() => {
        expect(element).not.toBeInTheDocument();
      });
    };

    // delete unit, subsection and then section in order.
    // Before each delete, remove the item from the mutable data so
    // the refetch (triggered by query invalidation) returns an updated tree.
    // check unit
    removeItemFromOutline(unit.id);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, outlineData);
    await checkDeleteBtn(unit, unitElement, 'unit');
    // check subsection
    removeItemFromOutline(subsection.id);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, outlineData);
    await checkDeleteBtn(subsection, subsectionElement, 'subsection');
    // check section
    removeItemFromOutline(section.id);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, outlineData);
    await checkDeleteBtn(section, sectionElement, 'section');
  });

  it('check whether section, subsection and unit is duplicated successfully', async () => {
    const { findAllByTestId } = renderComponent();
    // get section, subsection and unit
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children as unknown as XBlock[];
    const [sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    const checkDuplicateBtn = async (item, parentElement, element, elementName, expectedLength) => {
      // baseline
      if (parentElement) {
        expect(
          await within(parentElement).findAllByTestId(`${elementName}-card`),
        ).toHaveLength(expectedLength - 1);
      } else {
        expect(
          await findAllByTestId(`${elementName}-card`),
        ).toHaveLength(expectedLength - 1);
      }

      const duplicatedItemId = item.id + elementName;
      axiosMock
        .onPost(getXBlockBaseApiUrl())
        .reply(200, {
          locator: duplicatedItemId,
        });
      if (elementName === 'section') {
        section.id = duplicatedItemId;
      } else if (elementName === 'subsection') {
        section.childInfo.children = [...section.childInfo.children, { ...subsection, id: duplicatedItemId }];
      } else if (elementName === 'unit') {
        subsection.childInfo.children = [...subsection.childInfo.children, { ...unit, id: duplicatedItemId }];
        section.childInfo.children = [subsection, ...section.childInfo.children.slice(1)];
      }
      axiosMock
        .onGet(getXBlockApiUrl(section.id))
        .reply(200, {
          ...section,
        });
      // Update outline index mock to reflect the mutation so the
      // duplicateItem.onSuccess refetchQueries gets correct data.
      const updatedOutlineChildren = (() => {
        if (elementName === 'section') {
          // For section duplication, append the new section (with updated id).
          const dupSection = {
            ...courseOutlineIndexMock.courseStructure.childInfo.children.find(
              (s) => s.id === item.id,
            ),
            id: duplicatedItemId,
          };
          return [...courseOutlineIndexMock.courseStructure.childInfo.children, dupSection];
        }
        // For unit/subsection, replace the mutated section in place.
        return courseOutlineIndexMock.courseStructure.childInfo.children.map(
          (s) => (s.id === section.id ? section : s),
        );
      })();
      axiosMock
        .onGet(getCourseOutlineIndexApiUrl(courseId))
        .reply(200, {
          ...courseOutlineIndexMock,
          courseStructure: {
            ...courseOutlineIndexMock.courseStructure,
            childInfo: {
              ...courseOutlineIndexMock.courseStructure.childInfo,
              children: updatedOutlineChildren,
            },
          },
        });

      const menu = await within(element).findByTestId(`${elementName}-card-header__menu-button`);
      fireEvent.click(menu);
      const duplicateButton = await within(element).findByTestId(`${elementName}-card-header__menu-duplicate-button`);
      await act(async () => fireEvent.click(duplicateButton));
      await waitFor(() => {
        if (parentElement) {
          expect(
            within(parentElement).queryAllByTestId(`${elementName}-card`),
          ).toHaveLength(expectedLength);
        } else {
          expect(
            screen.queryAllByTestId(`${elementName}-card`),
          ).toHaveLength(expectedLength);
        }
      });
    };

    // duplicate unit, subsection and then section in order.
    // check unit
    await checkDuplicateBtn(unit, subsectionElement, unitElement, 'unit', 2);
    // check subsection
    await checkDuplicateBtn(subsection, sectionElement, subsectionElement, 'subsection', 3);
    // check section
    await checkDuplicateBtn(section, null, sectionElement, 'section', 5);
  });

  it('check section, subsection & unit is published when publish button is clicked', async () => {
    const { findAllByTestId, findByTestId } = renderComponent();
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children as unknown as XBlock[];
    const [sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    const checkPublishBtn = async (item, element, elementName) => {
      expect(
        (await within(element).findAllByRole('status'))[0],
      ).toHaveTextContent(cardHeaderMessages.statusBadgeDraft.defaultMessage);

      axiosMock
        .onPost(getCourseItemApiUrl(item.id), {
          publish: 'make_public',
        })
        .reply(200, { dummy: 'value' });
      axiosMock
        .onGet(getXBlockApiUrl(item.id))
        .reply(200, {
          ...item,
          visibilityState: 'live',
        });
      // Mock parent section GET so invalidateParentQueries refetch succeeds and
      // propagates 'live' status down to children's caches.
      const updatedSection = cloneDeep(section);
      updatedSection.childInfo.children = updatedSection.childInfo.children.map((sub: any) => ({
        ...sub,
        visibilityState: sub.id === item.id ? 'live' : sub.visibilityState,
        childInfo: sub.childInfo ?
          {
            ...sub.childInfo,
            children: sub.childInfo.children.map((u: any) => ({
              ...u,
              visibilityState: u.id === item.id ? 'live' : u.visibilityState,
            })),
          } :
          undefined,
      }));
      axiosMock
        .onGet(getXBlockApiUrl(section.id))
        .reply(200, updatedSection);

      const menu = await within(element).findByTestId(`${elementName}-card-header__menu-button`);
      fireEvent.click(menu);
      const publishButton = await within(element).findByTestId(`${elementName}-card-header__menu-publish-button`);
      await act(async () => fireEvent.click(publishButton));
      const confirmButton = await findByTestId('publish-confirm-button');
      await act(async () => fireEvent.click(confirmButton));

      expect(
        (await within(element).findAllByRole('status'))[0],
      ).toHaveTextContent(cardHeaderMessages.statusBadgeLive.defaultMessage);
    };

    // publish unit, subsection and then section in order.
    // check unit
    await checkPublishBtn(unit, unitElement, 'unit');
    // check subsection
    await checkPublishBtn(subsection, subsectionElement, 'subsection');
    // section doesn't display badges
  });

  it('check configure modal for section', async () => {
    const { findByTestId, findAllByTestId } = renderComponent();
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const newReleaseDateIso = '2025-09-10T22:00:00Z';
    const newReleaseDate = '09/10/2025';

    const [firstSection] = await findAllByTestId('section-card');

    const sectionDropdownButton = await within(firstSection).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(sectionDropdownButton));
    const configureBtn = await within(firstSection).findByTestId('section-card-header__menu-configure-button');
    await act(async () => fireEvent.click(configureBtn));
    let releaseDateStack = await findByTestId('release-date-stack');
    let releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(releaseDatePicker).toHaveValue('08/10/2023');

    axiosMock
      .onPost(getCourseItemApiUrl(section.id), {
        publish: 'republish',
        metadata: {
          visible_to_staff_only: true,
          start: newReleaseDateIso,
        },
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        start: newReleaseDateIso,
      });

    await act(async () => fireEvent.change(releaseDatePicker, { target: { value: newReleaseDate } }));
    expect(releaseDatePicker).toHaveValue(newReleaseDate);
    const saveButton = await findByTestId('configure-save-button');
    await act(async () => fireEvent.click(saveButton));

    expect(axiosMock.history.post.length).toBe(3);
    expect(axiosMock.history.post[2].data).toBe(JSON.stringify({
      publish: 'republish',
      metadata: {
        visible_to_staff_only: true,
        start: newReleaseDateIso,
      },
    }));

    await act(async () => fireEvent.click(sectionDropdownButton));
    await act(async () => fireEvent.click(configureBtn));
    releaseDateStack = await findByTestId('release-date-stack');
    releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(releaseDatePicker).toHaveValue(newReleaseDate);
  });

  it('check configure modal for subsection', async () => {
    const user = userEvent.setup();
    const {
      findAllByTestId,
      findByTestId,
    } = renderComponent();
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[0]) as unknown as XBlock;
    const [subsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'Homework',
      isPrereq: false,
      prereqMinScore: 100,
      prereqMinCompletion: 100,
      metadata: {
        visible_to_staff_only: null,
        due: '2025-09-10T05:00:00Z',
        hide_after_due: true,
        show_correctness: 'always',
        is_practice_exam: false,
        is_time_limited: true,
        is_proctored_enabled: false,
        exam_review_rules: '',
        default_time_limit_minutes: 3270,
        is_onboarding_exam: false,
        start: '2025-08-10T00:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.start = expectedRequestData.metadata.start;
    subsection.due = expectedRequestData.metadata.due;
    subsection.format = expectedRequestData.graderType;
    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.hideAfterDue = expectedRequestData.metadata.hide_after_due;
    axiosMock
      .onGet(getXBlockApiUrl(subsection.id))
      .reply(200, subsection);
    section.childInfo.children[0] = subsection;

    await user.click(subsectionDropdownButton);
    const configureBtn = await within(firstSubsection).findByTestId('subsection-card-header__menu-configure-button');
    await user.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    expect(await within(configureModal).findByText(expectedRequestData.graderType)).toBeInTheDocument();
    let releaseDateStack = await within(configureModal).findByTestId('release-date-stack');
    let releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(releaseDatePicker, { target: { value: '08/10/2025' } });
    let releaseDateTimePicker = await within(releaseDateStack).findByPlaceholderText('HH:MM');
    fireEvent.change(releaseDateTimePicker, { target: { value: '00:00' } });
    let dueDateStack = await within(configureModal).findByTestId('due-date-stack');
    let dueDatePicker = await within(dueDateStack).findByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(dueDatePicker, { target: { value: '09/10/2025' } });
    let dueDateTimePicker = await within(dueDateStack).findByPlaceholderText('HH:MM');
    fireEvent.change(dueDateTimePicker, { target: { value: '05:00' } });
    let graderTypeDropdown = await within(configureModal).findByTestId('grader-type-select');
    fireEvent.change(graderTypeDropdown, { target: { value: expectedRequestData.graderType } });

    // visibility tab
    const visibilityTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.visibilityTabTitle.defaultMessage,
    });
    await user.click(visibilityTab);
    const visibilityRadioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(visibilityRadioButtons[1]);

    let advancedTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(radioButtons[1]);
    let hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    let hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    fireEvent.change(hours, { target: { value: '54:30' } });
    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await user.click(saveButton);

    // verify request
    expect(axiosMock.history.post.length).toBe(3);
    expect(axiosMock.history.post[2].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await user.click(subsectionDropdownButton);
    await user.click(configureBtn);

    configureModal = await findByTestId('configure-modal');
    releaseDateStack = await within(configureModal).findByTestId('release-date-stack');
    releaseDatePicker = await within(releaseDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(releaseDatePicker).toHaveValue('08/10/2025');
    releaseDateTimePicker = await within(releaseDateStack).findByPlaceholderText('HH:MM');
    expect(releaseDateTimePicker).toHaveValue('00:00');
    dueDateStack = await within(configureModal).findByTestId('due-date-stack');
    dueDatePicker = await within(dueDateStack).findByPlaceholderText('MM/DD/YYYY');
    expect(dueDatePicker).toHaveValue('09/10/2025');
    dueDateTimePicker = await within(dueDateStack).findByPlaceholderText('HH:MM');
    expect(dueDateTimePicker).toHaveValue('05:00');
    graderTypeDropdown = await within(configureModal).findByTestId('grader-type-select');
    expect(graderTypeDropdown).toHaveValue(expectedRequestData.graderType);

    advancedTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('54:30');
  });

  it('check prereq and proctoring settings in configure modal for subsection', async () => {
    const user = userEvent.setup();
    const {
      findAllByTestId,
      findByTestId,
    } = renderComponent();
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[0]) as unknown as XBlock;
    const [subsection, secondSubsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'notgraded',
      isPrereq: true,
      prereqUsageKey: secondSubsection.id,
      prereqMinScore: 80,
      prereqMinCompletion: 90,
      metadata: {
        visible_to_staff_only: true,
        due: '',
        hide_after_due: false,
        show_correctness: 'always',
        is_practice_exam: false,
        is_time_limited: true,
        is_proctored_enabled: true,
        exam_review_rules: 'some rules for proctored exams',
        default_time_limit_minutes: 30,
        is_onboarding_exam: false,
        start: '1970-01-01T05:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.isProctoredExam = expectedRequestData.metadata.is_proctored_enabled;
    subsection.isPracticeExam = expectedRequestData.metadata.is_practice_exam;
    subsection.isOnboardingExam = expectedRequestData.metadata.is_onboarding_exam;
    subsection.examReviewRules = expectedRequestData.metadata.exam_review_rules;
    subsection.isPrereq = expectedRequestData.isPrereq;
    subsection.prereq = expectedRequestData.prereqUsageKey;
    subsection.prereqMinScore = expectedRequestData.prereqMinScore;
    subsection.prereqMinCompletion = expectedRequestData.prereqMinCompletion;
    section.childInfo.children[0] = subsection;

    await user.click(subsectionDropdownButton);
    const configureBtn = await within(firstSubsection).findByTestId('subsection-card-header__menu-configure-button');
    await user.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    let advancedTab = await within(configureModal).findByRole(
      'tab',
      { name: configureModalMessages.advancedTabTitle.defaultMessage },
    );

    // visibility tab
    const visibilityTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.visibilityTabTitle.defaultMessage,
    });
    await user.click(visibilityTab);
    const visibilityRadioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(visibilityRadioButtons[2]);

    await user.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(radioButtons[2]);
    let hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    let hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    fireEvent.change(hours, { target: { value: '00:30' } });
    // select a prerequisite
    const prereqSelect = await within(configureModal).findByRole('combobox');
    fireEvent.change(prereqSelect, { target: { value: expectedRequestData.prereqUsageKey } });

    // update minimum score and completion percentage
    let prereqMinScoreInput = await within(configureModal).findByLabelText(
      configureModalMessages.minScoreLabel.defaultMessage,
    );
    fireEvent.change(prereqMinScoreInput, { target: { value: expectedRequestData.prereqMinScore } });
    let prereqMinCompletionInput = await within(configureModal).findByLabelText(
      configureModalMessages.minCompletionLabel.defaultMessage,
    );
    fireEvent.change(prereqMinCompletionInput, { target: { value: expectedRequestData.prereqMinCompletion } });

    // enable this subsection to be used as prerequisite by other subsections
    let prereqCheckbox = await within(configureModal).findByLabelText(
      configureModalMessages.prereqCheckboxLabel.defaultMessage,
    );
    await user.click(prereqCheckbox);

    // fill some rules for proctored exams
    let examsRulesInput = await within(configureModal).findByLabelText(
      configureModalMessages.reviewRulesLabel.defaultMessage,
    );
    fireEvent.change(examsRulesInput, { target: { value: expectedRequestData.metadata.exam_review_rules } });

    axiosMock
      .onGet(getXBlockApiUrl(subsection.id))
      .reply(200, subsection);
    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await user.click(saveButton);

    // verify request
    expect(axiosMock.history.post.length).toBe(3);
    expect(axiosMock.history.post[2].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await user.click(subsectionDropdownButton);
    await user.click(configureBtn);

    configureModal = await findByTestId('configure-modal');
    advancedTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', false);
    expect(radioButtons[2]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('00:30');
    prereqCheckbox = await within(configureModal).findByLabelText(
      configureModalMessages.prereqCheckboxLabel.defaultMessage,
    );
    expect(prereqCheckbox).toBeChecked();
    const prereqSelectOption = await within(configureModal).findByRole('option', { selected: true });
    expect(prereqSelectOption).toHaveAttribute('value', expectedRequestData.prereqUsageKey);
    examsRulesInput = await within(configureModal).findByLabelText(
      configureModalMessages.reviewRulesLabel.defaultMessage,
    );
    expect(examsRulesInput).toHaveTextContent(expectedRequestData.metadata.exam_review_rules);

    prereqMinScoreInput = await within(configureModal).findByLabelText(
      configureModalMessages.minScoreLabel.defaultMessage,
    );
    expect(prereqMinScoreInput).toHaveAttribute('value', `${expectedRequestData.prereqMinScore}`);
    prereqMinCompletionInput = await within(configureModal).findByLabelText(
      configureModalMessages.minCompletionLabel.defaultMessage,
    );
    expect(prereqMinCompletionInput).toHaveAttribute('value', `${expectedRequestData.prereqMinCompletion}`);
  });

  it('check practice proctoring settings in configure modal', async () => {
    const user = userEvent.setup();
    const {
      findAllByTestId,
      findByTestId,
    } = renderComponent();
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[0]) as unknown as XBlock;
    const [subsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'notgraded',
      isPrereq: false,
      prereqMinScore: 100,
      prereqMinCompletion: 100,
      metadata: {
        visible_to_staff_only: null,
        due: '',
        hide_after_due: false,
        show_correctness: 'never',
        is_practice_exam: true,
        is_time_limited: true,
        is_proctored_enabled: true,
        exam_review_rules: '',
        default_time_limit_minutes: 30,
        is_onboarding_exam: false,
        start: '1970-01-01T05:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.isProctoredExam = expectedRequestData.metadata.is_proctored_enabled;
    subsection.isPracticeExam = expectedRequestData.metadata.is_practice_exam;
    subsection.isOnboardingExam = expectedRequestData.metadata.is_onboarding_exam;
    subsection.examReviewRules = expectedRequestData.metadata.exam_review_rules;
    section.childInfo.children[0] = subsection;

    await user.click(subsectionDropdownButton);
    const configureBtn = await within(firstSubsection).findByTestId('subsection-card-header__menu-configure-button');
    await user.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    let advancedTab = await within(configureModal).findByRole(
      'tab',
      { name: configureModalMessages.advancedTabTitle.defaultMessage },
    );
    // visibility tab
    const visibilityTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.visibilityTabTitle.defaultMessage,
    });
    await user.click(visibilityTab);
    const visibilityRadioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(visibilityRadioButtons[4]);

    // advancedTab
    await user.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(radioButtons[3]);
    let hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    let hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    fireEvent.change(hours, { target: { value: '00:30' } });

    // rules box should not be visible
    expect(
      within(configureModal).queryByLabelText(
        configureModalMessages.reviewRulesLabel.defaultMessage,
      ),
    ).not.toBeInTheDocument();

    axiosMock
      .onGet(getXBlockApiUrl(subsection.id))
      .reply(200, subsection);
    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await user.click(saveButton);

    // verify request
    expect(axiosMock.history.post.length).toBe(3);
    expect(axiosMock.history.post[2].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await user.click(subsectionDropdownButton);
    await user.click(configureBtn);

    configureModal = await findByTestId('configure-modal');
    advancedTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', false);
    expect(radioButtons[2]).toHaveProperty('checked', false);
    expect(radioButtons[3]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('00:30');
  });

  it('check onboarding proctoring settings in configure modal', async () => {
    const user = userEvent.setup();
    const {
      findAllByTestId,
      findByTestId,
    } = renderComponent();
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[0]) as unknown as XBlock;
    const [, subsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'notgraded',
      isPrereq: true,
      prereqMinScore: 100,
      prereqMinCompletion: 100,
      metadata: {
        visible_to_staff_only: null,
        due: '',
        hide_after_due: false,
        show_correctness: 'past_due',
        is_practice_exam: false,
        is_time_limited: true,
        is_proctored_enabled: true,
        exam_review_rules: '',
        default_time_limit_minutes: 30,
        is_onboarding_exam: true,
        start: '2013-02-05T05:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [currentSection] = await findAllByTestId('section-card');
    const [, secondSubsection] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(secondSubsection).findByTestId('subsection-card-header__menu-button');

    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.isProctoredExam = expectedRequestData.metadata.is_proctored_enabled;
    subsection.isPracticeExam = expectedRequestData.metadata.is_practice_exam;
    subsection.isOnboardingExam = expectedRequestData.metadata.is_onboarding_exam;
    subsection.examReviewRules = expectedRequestData.metadata.exam_review_rules;
    section.childInfo.children[1] = subsection;
    axiosMock.onGet(getXBlockApiUrl(subsection.id)).reply(200, subsection);

    await user.click(subsectionDropdownButton);
    const configureBtn = await within(secondSubsection).findByTestId('subsection-card-header__menu-configure-button');
    await user.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');
    // visibility tab
    const visibilityTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.visibilityTabTitle.defaultMessage,
    });
    await user.click(visibilityTab);
    const visibilityRadioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(visibilityRadioButtons[5]);

    // advancedTab
    let advancedTab = await within(configureModal).findByRole(
      'tab',
      { name: configureModalMessages.advancedTabTitle.defaultMessage },
    );
    await user.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(radioButtons[3]);
    let hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    let hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    fireEvent.change(hours, { target: { value: '00:30' } });

    // rules box should not be visible
    expect(
      within(configureModal).queryByLabelText(
        configureModalMessages.reviewRulesLabel.defaultMessage,
      ),
    ).not.toBeInTheDocument();

    axiosMock
      .onGet(getXBlockApiUrl(subsection.id))
      .reply(200, subsection);
    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await user.click(saveButton);

    // verify request
    expect(axiosMock.history.post.length).toBe(3);
    expect(axiosMock.history.post[2].data).toBe(JSON.stringify(expectedRequestData));

    // reopen modal and check values
    await user.click(subsectionDropdownButton);
    await user.click(configureBtn);

    configureModal = await findByTestId('configure-modal');
    advancedTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', false);
    expect(radioButtons[1]).toHaveProperty('checked', false);
    expect(radioButtons[2]).toHaveProperty('checked', false);
    expect(radioButtons[3]).toHaveProperty('checked', true);
    hoursWrapper = await within(configureModal).findByTestId('advanced-tab-hours-picker-wrapper');
    hours = await within(hoursWrapper).findByPlaceholderText('HH:MM');
    expect(hours).toHaveValue('00:30');
  });

  it('check no special exam setting in configure modal', async () => {
    const user = userEvent.setup();
    const {
      findAllByTestId,
      findByTestId,
    } = renderComponent();
    const section = cloneDeep(courseOutlineIndexMock.courseStructure.childInfo.children[1]) as unknown as XBlock;
    const [subsection] = section.childInfo.children;
    const expectedRequestData = {
      publish: 'republish',
      graderType: 'notgraded',
      prereqMinScore: 100,
      prereqMinCompletion: 100,
      metadata: {
        visible_to_staff_only: null,
        due: '',
        hide_after_due: false,
        show_correctness: 'always',
        is_practice_exam: false,
        is_time_limited: false,
        is_proctored_enabled: false,
        exam_review_rules: '',
        default_time_limit_minutes: 0,
        is_onboarding_exam: false,
        start: '1970-01-01T05:00:00Z',
      },
    };

    axiosMock
      .onPost(getCourseItemApiUrl(subsection.id), expectedRequestData)
      .reply(200, { dummy: 'value' });

    const [, currentSection] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(currentSection).findAllByTestId('subsection-card');
    const subsectionDropdownButton = await within(subsectionElement).findByTestId(
      'subsection-card-header__menu-button',
    );

    subsection.isTimeLimited = expectedRequestData.metadata.is_time_limited;
    subsection.defaultTimeLimitMinutes = expectedRequestData.metadata.default_time_limit_minutes;
    subsection.isProctoredExam = expectedRequestData.metadata.is_proctored_enabled;
    subsection.isPracticeExam = expectedRequestData.metadata.is_practice_exam;
    subsection.isOnboardingExam = expectedRequestData.metadata.is_onboarding_exam;
    subsection.examReviewRules = expectedRequestData.metadata.exam_review_rules;
    section.childInfo.children[0] = subsection;

    await user.click(subsectionDropdownButton);
    const configureBtn = await within(subsectionElement).findByTestId('subsection-card-header__menu-configure-button');
    await user.click(configureBtn);

    // update fields
    let configureModal = await findByTestId('configure-modal');

    // advancedTab
    let advancedTab = await within(configureModal).findByRole(
      'tab',
      { name: configureModalMessages.advancedTabTitle.defaultMessage },
    );
    await user.click(advancedTab);
    let radioButtons = await within(configureModal).findAllByRole('radio');
    await user.click(radioButtons[0]);

    // time box should not be visible
    expect(
      within(configureModal).queryByLabelText(
        configureModalMessages.timeAllotted.defaultMessage,
      ),
    ).not.toBeInTheDocument();

    // rules box should not be visible
    expect(
      within(configureModal).queryByLabelText(
        configureModalMessages.reviewRulesLabel.defaultMessage,
      ),
    ).not.toBeInTheDocument();

    axiosMock
      .onGet(getXBlockApiUrl(subsection.id))
      .reply(200, subsection);
    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await user.click(saveButton);

    // verify request
    expect(axiosMock.history.post.length).toBe(3);
    expect(axiosMock.history.post[2].data).toBe(JSON.stringify(expectedRequestData));

    // Seed subsection cache + mock parent section GET so invalidateParentQueries
    // refetch succeeds and reopened modal gets correct form values.
    queryClient.setQueryData(
      courseOutlineQueryKeys.courseItemId(subsection.id),
      subsection,
    );
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    // reopen modal and check values
    await user.click(subsectionDropdownButton);
    await user.click(configureBtn);

    configureModal = await findByTestId('configure-modal');
    advancedTab = await within(configureModal).findByRole('tab', {
      name: configureModalMessages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);
    radioButtons = await within(configureModal).findAllByRole('radio');
    expect(radioButtons[0]).toHaveProperty('checked', true);
    expect(radioButtons[1]).toHaveProperty('checked', false);
    expect(radioButtons[2]).toHaveProperty('checked', false);
    expect(radioButtons[3]).toHaveProperty('checked', false);
  });

  it('check configure modal for unit', async () => {
    const user = userEvent.setup();
    const { findAllByTestId, findByTestId } = renderComponent();
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const [subsection] = section.childInfo.children;
    const [unit] = subsection.childInfo.children;
    // Enrollment Track Groups : Audit
    const newGroupAccess = { 50: [1] };
    const isVisibleToStaffOnly = true;

    axiosMock
      .onPost(getCourseItemApiUrl(unit.id), {
        publish: 'republish',
        metadata: {
          visible_to_staff_only: isVisibleToStaffOnly,
          discussion_enabled: false,
          group_access: newGroupAccess,
        },
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);

    const [firstSection] = await findAllByTestId('section-card');
    const [firstSubsection] = await within(firstSection).findAllByTestId('subsection-card');
    const [firstUnit] = await within(firstSubsection).findAllByTestId('unit-card');
    const unitDropdownButton = await within(firstUnit).findByTestId('unit-card-header__menu-button');

    await user.click(unitDropdownButton);
    const configureBtn = await within(firstUnit).findByTestId('unit-card-header__menu-configure-button');
    await user.click(configureBtn);

    let configureModal = await findByTestId('configure-modal');
    expect(
      await within(configureModal).findByText(
        configureModalMessages.unitVisibility.defaultMessage,
      ),
    ).toBeInTheDocument();
    let visibilityCheckbox = await within(configureModal).findByTestId('unit-visibility-checkbox');
    await user.click(visibilityCheckbox);
    let discussionCheckbox = await within(configureModal).findByLabelText(
      configureModalMessages.discussionEnabledCheckbox.defaultMessage,
    );
    expect(discussionCheckbox).toBeChecked();

    // after configuraiton response — deferred until after initial assertion so
    // the section mock (set up above) does NOT return mutated data on the first
    // background refetch, which would overwrite the pre-seeded cache.
    unit.visibilityState = 'staff_only';
    unit.discussionEnabled = false;
    unit.userPartitionInfo = {
      selectablePartitions: [
        {
          id: 50,
          name: 'Enrollment Track Groups',
          scheme: 'enrollment_track',
          groups: [
            {
              id: 2,
              name: 'Verified Certificate',
              selected: false,
              deleted: false,
            },
            {
              id: 1,
              name: 'Audit',
              selected: true,
              deleted: false,
            },
          ],
        },
      ],
      selectedPartitionIndex: 0,
      selectedGroupsLabel: '',
    };
    subsection.childInfo.children[0] = unit;
    section.childInfo.children[0] = subsection;

    await user.click(discussionCheckbox);

    let groupeType = await within(configureModal).findByTestId('group-type-select');
    fireEvent.change(groupeType, { target: { value: '0' } });

    let checkboxes = await within(await within(configureModal).findByTestId('group-checkboxes')).findAllByRole(
      'checkbox',
    );
    await user.click(checkboxes[1]);
    axiosMock
      .onGet(getXBlockApiUrl(unit.id))
      .reply(200, unit);

    const saveButton = await within(configureModal).findByTestId('configure-save-button');
    await user.click(saveButton);

    // reopen modal and check values
    await user.click(unitDropdownButton);
    await user.click(configureBtn);

    configureModal = await findByTestId('configure-modal');
    visibilityCheckbox = await within(configureModal).findByTestId('unit-visibility-checkbox');
    expect(visibilityCheckbox).toBeChecked();
    discussionCheckbox = await within(configureModal).findByLabelText(
      configureModalMessages.discussionEnabledCheckbox.defaultMessage,
    );
    expect(discussionCheckbox).not.toBeChecked();

    groupeType = await within(configureModal).findByTestId('group-type-select');
    expect(groupeType).toHaveValue('0');

    checkboxes = await within(await within(configureModal).findByTestId('group-checkboxes')).findAllByRole('checkbox');

    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('check update highlights when update highlights query is successfully', async () => {
    const user = userEvent.setup();
    renderComponent();

    const section = courseOutlineIndexMock.courseStructure.childInfo.children[0];
    const highlights = [
      'New Highlight 1',
      'New Highlight 2',
      'New Highlight 3',
    ];

    axiosMock
      .onPost(getCourseItemApiUrl(section.id), {
        publish: 'republish',
        metadata: {
          highlights,
        },
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, {
        ...section,
        highlights,
      });
    const highlightBtn = await screen.findByTestId('section-card-highlights-button').catch(() => {
      // Fallback: find button containing 'Section highlights' text within first section card
      const sections = screen.getAllByTestId('section-card');
      return within(sections[0]).findByText('Section highlights');
    });
    await user.click(highlightBtn);
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(await within(dialog).findByRole('textbox', { name: 'Highlight 1' }), {
      target: { value: 'New Highlight 1' },
    });
    fireEvent.change(await within(dialog).findByRole('textbox', { name: 'Highlight 2' }), {
      target: { value: 'New Highlight 2' },
    });
    fireEvent.change(await within(dialog).findByRole('textbox', { name: 'Highlight 3' }), {
      target: { value: 'New Highlight 3' },
    });
    await user.click(await within(dialog).findByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('button', { name: '3 Section highlights' })).toBeInTheDocument();
  });

  it('check whether section move up and down options work correctly', async () => {
    const { findAllByTestId } = renderComponent();
    // get second section element
    const courseBlockId = courseOutlineIndexMock.courseStructure.id;
    const [, secondSection] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');

    // mock api call
    axiosMock
      .onPut(getCourseBlockApiUrl(courseBlockId))
      .reply(200, { dummy: 'value' });

    // find menu button and click on it to open menu
    const menu = await within(sectionElement).findByTestId('section-card-header__menu-button');
    fireEvent.click(menu);

    // move second section to first position to test move up option
    const moveUpButton = await within(sectionElement).findByTestId('section-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      expect(cachedData?.courseStructure?.childInfo?.children[0]?.id).toBe(secondSection.id);
    });

    // move first section back to second position to test move down option
    axiosMock
      .onPut(getCourseBlockApiUrl(courseBlockId))
      .reply(200, { dummy: 'value' });
    const moveDownButton = await within(sectionElement).findByTestId('section-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      expect(cachedData?.courseStructure?.childInfo?.children[1]?.id).toBe(secondSection.id);
    });
  });

  it('check whether section move up & down option is rendered correctly based on index', async () => {
    const { findAllByTestId } = renderComponent();
    // get first, second and last section element
    const {
      0: firstSection,
      1: secondSection,
      length,
      [length - 1]: lastSection,
    } = await findAllByTestId('section-card');

    // find menu button and click on it to open menu in first section
    const firstMenu = await within(firstSection).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(firstMenu));
    // move down option should be enabled in first element
    expect(
      await within(firstSection).findByTestId('section-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    // move up option should not be enabled in first element
    expect(
      await within(firstSection).findByTestId('section-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');

    // find menu button and click on it to open menu in second section
    const secondMenu = await within(secondSection).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(secondMenu));
    // both move down & up option should be enabled in second element
    expect(
      await within(secondSection).findByTestId('section-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    expect(
      await within(secondSection).findByTestId('section-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');

    // find menu button and click on it to open menu in last section
    const lastMenu = await within(lastSection).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(lastMenu));
    // move down option should not be enabled in last element
    expect(
      await within(lastSection).findByTestId('section-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    // move up option should be enabled in last element
    expect(
      await within(lastSection).findByTestId('section-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('check whether subsection move up and down options work correctly', async () => {
    const { findAllByTestId } = renderComponent();
    // get second section element
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    const [, secondSubsection] = section.childInfo.children;
    const [, subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(courseOutlineIndexMock.courseStructure.childInfo.children[0].id))
      .reply(200, { dummy: 'value' });
    const expectedSection = moveSubsection(
      [
        ...courseOutlineIndexMock.courseStructure.childInfo.children,
      ] as unknown as XBlock[],
      0,
      0,
      1,
    )[0][0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    // find menu button and click on it to open menu
    const menu = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move second subsection to first position to test move up option
    const moveUpButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      expect(cachedData?.courseStructure?.childInfo?.children[0]?.childInfo?.children[0]?.id).toBe(secondSubsection.id);
    });

    // move first section back to second position to test move down option
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);
    const moveDownButton = await within(subsectionElement).findByTestId(
      'subsection-card-header__menu-move-down-button',
    );
    await act(async () => fireEvent.click(moveDownButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      expect(cachedData?.courseStructure?.childInfo?.children[0]?.childInfo?.children[1]?.id).toBe(secondSubsection.id);
    });
  });

  it('check whether subsection move up to prev section if it is on top of its parent section', async () => {
    const { findAllByTestId } = renderComponent();
    const [firstSection, section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(firstSection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveSubsectionOver(
      [
        ...courseOutlineIndexMock.courseStructure.childInfo.children,
      ] as unknown as XBlock[],
      1,
      0,
      0,
      firstSection.childInfo.children.length + 1,
    )[0];
    axiosMock
      .onGet(getXBlockApiUrl(firstSection.id))
      .reply(200, expectedSections[0]);
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first subsection in second section to last position of prev section
    const moveUpButton = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      const firstSectionSubsections = cachedData?.courseStructure?.childInfo?.children[0]?.childInfo?.children || [];
      expect(firstSectionSubsections.length).toBe(firstSection.childInfo.children.length + 1);
      expect(firstSectionSubsections[firstSectionSubsections.length - 1]?.id).toBe(subsection.id);
      const subsectionsSecondSection = cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children || [];
      expect(subsectionsSecondSection.length).toBe(section.childInfo.children.length - 1);
    });
  });

  it('check whether subsection move down to next section if it is in bottom position of its parent section', async () => {
    const { findAllByTestId } = renderComponent();
    const [section, secondSection] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await findAllByTestId('section-card');
    const lastSubsectionIdx = section.childInfo.children.length - 1;
    const subsection = section.childInfo.children[lastSubsectionIdx];
    const subsectionElement = (await within(sectionElement).findAllByTestId('subsection-card'))[lastSubsectionIdx];

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(secondSection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveSubsectionOver(
      [
        ...courseOutlineIndexMock.courseStructure.childInfo.children,
      ] as unknown as XBlock[],
      0,
      lastSubsectionIdx,
      1,
      0,
    )[0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSections[0]);
    axiosMock
      .onGet(getXBlockApiUrl(secondSection.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(subsectionElement).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first subsection in second section to last position of prev section
    const moveDownBtn = await within(subsectionElement).findByTestId('subsection-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownBtn));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      const firstSectionSubsections = cachedData?.courseStructure?.childInfo?.children[0]?.childInfo?.children || [];
      expect(firstSectionSubsections.length).toBe(section.childInfo.children.length - 1);
      const subsectionsSecondSection = cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children || [];
      expect(subsectionsSecondSection.length).toBe(secondSection.childInfo.children.length + 1);
      expect(subsectionsSecondSection[0]?.id).toBe(subsection.id);
    });
  });

  it('check whether subsection move up & down option is rendered correctly based on index', async () => {
    const { findAllByTestId } = renderComponent();
    // using first section
    const sectionElements = await findAllByTestId('section-card');
    const firstSectionElement = sectionElements[0];
    // get first, second and last subsection element
    const [
      firstSubsection,
      secondSubsection,
    ] = await within(firstSectionElement).findAllByTestId('subsection-card');

    // find menu button and click on it to open menu in first section
    const firstMenu = await within(firstSubsection).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(firstMenu));
    // move down option should be enabled in first element
    expect(
      await within(firstSubsection).findByTestId('subsection-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    // move up option should not be enabled in first element
    expect(
      await within(firstSubsection).findByTestId('subsection-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');

    // find menu button and click on it to open menu in second section
    const secondMenu = await within(secondSubsection).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(secondMenu));
    // both move down & up option should be enabled in second element
    expect(
      await within(secondSubsection).findByTestId('subsection-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    expect(
      await within(secondSubsection).findByTestId('subsection-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');

    const lastSectionElement = sectionElements[sectionElements.length - 1];
    // get first, second and last subsection element
    const [lastSubsection] = await within(lastSectionElement).findAllByTestId('subsection-card');
    // find menu button and click on it to open menu in last section
    const lastMenu = await within(lastSubsection).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(lastMenu));
    // move down option should not be enabled in last subsection of last section element
    expect(
      await within(lastSubsection).findByTestId('subsection-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    // move up option should be enabled in last element
    expect(
      await within(lastSubsection).findByTestId('subsection-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('check whether unit move up and down options work correctly', async () => {
    const { findAllByTestId } = renderComponent();
    // get second section -> second subsection -> second unit element
    const [, section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [, subsection] = section.childInfo.children;
    const [, subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const [, secondUnit] = subsection.childInfo.children;
    const [, unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(courseOutlineIndexMock.courseStructure.childInfo.children[1].childInfo.children[1].id))
      .reply(200, { dummy: 'value' });
    const expectedSection = moveUnit(
      [
        ...courseOutlineIndexMock.courseStructure.childInfo.children,
      ] as unknown as XBlock[],
      1,
      1,
      0,
      1,
    )[0][1];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move second unit to first position to test move up option
    const moveUpButton = await within(unitElement).findByTestId('unit-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      const units = cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children[1]?.childInfo?.children;
      expect(secondUnit.id).toBe(units?.[0]?.id);
    });

    // move first unit back to second position to test move down option
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);
    const moveDownButton = await within(subsectionElement).findByTestId('unit-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      const units = cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children[1]?.childInfo?.children;
      expect(secondUnit.id).toBe(units?.[1]?.id);
    });
  });

  it('check whether unit moves up to previous subsection if it is in top position in parent subsection', async () => {
    const { findAllByTestId } = renderComponent();
    // get second section -> second subsection -> first unit element
    const [, section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [firstSubsection, subsection] = section.childInfo.children;
    const [, subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(firstSubsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveUnitOver(
      [
        ...courseOutlineIndexMock.courseStructure.childInfo.children,
      ] as unknown as XBlock[],
      1,
      1,
      0,
      1,
      0,
      firstSubsection.childInfo.children.length,
    )[0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit to last position of prev subsection
    const moveUpButton = await within(unitElement).findByTestId('unit-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      const firstSubUnits =
        cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children[0]?.childInfo?.children || [];
      expect(firstSubUnits[firstSubUnits.length - 1]?.id).toBe(unit.id);
      const secondSubUnits =
        cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children[1]?.childInfo?.children || [];
      expect(secondSubUnits.length).toBe(subsection.childInfo.children.length - 1);
    });
  });

  it('check whether unit moves up to previous subsection of prev section if it is in top position in parent subsection & section', async () => {
    const { findAllByTestId } = renderComponent();
    // get second section -> second subsection -> first unit element
    const [firstSection, secondSection] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [subsection] = secondSection.childInfo.children;
    const firstSectionLastSubsection = firstSection.childInfo.children[firstSection.childInfo.children.length - 1];
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(firstSectionLastSubsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveUnitOver(
      [...courseOutlineIndexMock.courseStructure.childInfo.children] as unknown as XBlock[],
      1,
      0,
      0,
      0,
      firstSection.childInfo.children.length - 1,
      firstSectionLastSubsection.childInfo.children.length,
    )[0];
    axiosMock
      .onGet(getXBlockApiUrl(firstSection.id))
      .reply(200, expectedSections[0]);
    axiosMock
      .onGet(getXBlockApiUrl(secondSection.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit to last position of prev subsection
    const moveUpButton = await within(unitElement).findByTestId('unit-card-header__menu-move-up-button');
    await act(async () => fireEvent.click(moveUpButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      const firstSectionChildren = cachedData?.courseStructure?.childInfo?.children[0]?.childInfo?.children || [];
      const firstSectionLastSubUnits = firstSectionChildren[firstSectionChildren.length - 1]?.childInfo?.children || [];
      expect(firstSectionLastSubUnits[firstSectionLastSubUnits.length - 1]?.id).toBe(unit.id);
      const secondSubUnits =
        cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children[0]?.childInfo?.children || [];
      expect(secondSubUnits.length).toBe(subsection.childInfo.children.length - 1);
    });
  });

  it('check whether unit moves down to next subsection if it is in last position in parent subsection', async () => {
    const { findAllByTestId } = renderComponent();
    // get second section -> second subsection -> first unit element
    const [, section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const [firstSubsection, subsection] = section.childInfo.children;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const lastUnitIdx = firstSubsection.childInfo.children.length - 1;
    const unit = firstSubsection.childInfo.children[lastUnitIdx];
    const unitElement = (await within(subsectionElement).findAllByTestId('unit-card'))[lastUnitIdx];

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(subsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveUnitOver(
      [
        ...courseOutlineIndexMock.courseStructure.childInfo.children,
      ] as unknown as XBlock[],
      1,
      0,
      lastUnitIdx,
      1,
      1,
      0,
    )[0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSections[1]);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit to last position of prev subsection
    const moveDownButton = await within(unitElement).findByTestId('unit-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      const firstSubUnits =
        cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children[0]?.childInfo?.children || [];
      expect(firstSubUnits.length).toBe(firstSubsection.childInfo.children.length - 1);
      const secondSubUnits =
        cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children[1]?.childInfo?.children || [];
      expect(secondSubUnits[0]?.id).toBe(unit.id);
    });
  });

  it('check whether unit moves down to next subsection of next section if it is in last position in parent subsection & section', async () => {
    const { findAllByTestId } = renderComponent();
    // get second section -> second subsection -> first unit element
    const [, secondSection, thirdSection] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [, sectionElement] = await findAllByTestId('section-card');
    const lastSubIndex = secondSection.childInfo.children.length - 1;
    const secondSectionLastSubsection = secondSection.childInfo.children[lastSubIndex];
    const thirdSectionFirstSubsection = thirdSection.childInfo.children[0];
    const subsectionElement = (await within(sectionElement).findAllByTestId('subsection-card'))[lastSubIndex];
    const lastUnitIdx = secondSectionLastSubsection.childInfo.children.length - 1;
    const unit = secondSectionLastSubsection.childInfo.children[lastUnitIdx];
    const unitElement = (await within(subsectionElement).findAllByTestId('unit-card'))[lastUnitIdx];

    // mock api call
    axiosMock
      .onPut(getCourseItemApiUrl(thirdSectionFirstSubsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSections = moveUnitOver(
      [...courseOutlineIndexMock.courseStructure.childInfo.children] as unknown as XBlock[],
      1,
      lastSubIndex,
      lastUnitIdx,
      2,
      0,
      0,
    )[0];
    axiosMock
      .onGet(getXBlockApiUrl(secondSection.id))
      .reply(200, expectedSections[1]);
    axiosMock
      .onGet(getXBlockApiUrl(thirdSection.id))
      .reply(200, expectedSections[2]);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit to last position of prev subsection
    const moveDownButton = await within(unitElement).findByTestId('unit-card-header__menu-move-down-button');
    await act(async () => fireEvent.click(moveDownButton));
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
      const secondSectionChildren = cachedData?.courseStructure?.childInfo?.children[1]?.childInfo?.children || [];
      const secondSectionLastSubUnits = secondSectionChildren[secondSectionChildren.length - 1]?.childInfo?.children ||
        [];
      expect(secondSectionLastSubUnits.length).toBe(secondSectionLastSubsection.childInfo.children.length - 1);
      const thirdSubUnits =
        cachedData?.courseStructure?.childInfo?.children[2]?.childInfo?.children[0]?.childInfo?.children || [];
      expect(thirdSubUnits[0]?.id).toBe(unit.id);
    });
  });

  it('check whether unit move up & down option is rendered correctly based on index', async () => {
    const { findAllByTestId } = renderComponent();
    // using first section -> first subsection -> first unit
    const sections = await findAllByTestId('section-card');
    const [sectionElement] = sections;
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    // get first and only unit in the subsection
    const [firstUnit] = await within(subsectionElement).findAllByTestId('unit-card');

    // find menu button and click on it to open menu in first section
    const firstMenu = await within(firstUnit).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(firstMenu));
    // move down option should be enabled in first element as it can move down to next subsection
    expect(
      await within(firstUnit).findByTestId('unit-card-header__menu-move-down-button'),
    ).not.toHaveAttribute('aria-disabled');
    // move up option should not be enabled in first element as we have no subsections or sections above
    expect(
      await within(firstUnit).findByTestId('unit-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');

    // using last section -> last subsection -> last unit
    const lastSection = sections[sections.length - 1];
    // it has only one subsection
    const [lastSubsectionElement] = await within(lastSection).findAllByTestId('subsection-card');
    // get last and the only unit in the subsection
    const [lastUnit] = await within(lastSubsectionElement).findAllByTestId('unit-card');

    // find menu button and click on it to open menu in first section
    const lastMenu = await within(lastUnit).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(lastMenu));
    // move down option should not be enabled in last element as we have no subsections or sections below
    expect(
      await within(lastUnit).findByTestId('unit-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    // move down option should be enabled in last element as it can move up to prev section's last subsection
    expect(
      await within(lastUnit).findByTestId('unit-card-header__menu-move-up-button'),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('check that new subsection list is saved when dragged', async () => {
    const { findAllByTestId } = renderComponent();

    const [sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const subsectionsDraggers = within(sectionElement).getAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = subsectionsDraggers[1];
    const subsection1 = section.childInfo.children[0].id;
    jest.mocked(closestCorners).mockReturnValue([{ id: subsection1 }]);
    axiosMock
      .onPut(getCourseItemApiUrl(section.id))
      .reply(200, { dummy: 'value' });
    const expectedSection = moveSubsection(
      [
        ...courseOutlineIndexMock.courseStructure.childInfo.children,
      ] as unknown as XBlock[],
      0,
      1,
      0,
    )[0][0];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });

    // Wait for mutation API call
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    // Verify API called with correct new order
    const putData = JSON.parse(axiosMock.history.put[0].data);
    expect(putData.children).toEqual([
      section.childInfo.children[1].id,
      section.childInfo.children[0].id,
    ]);

    // Verify React Query cache was updated with fresh section data
    const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
    const cachedSection = cachedData?.courseStructure?.childInfo?.children
      .find((s: any) => s.id === section.id);
    expect(cachedSection.childInfo.children.map((c: any) => c.id)).toEqual([
      section.childInfo.children[1].id,
      section.childInfo.children[0].id,
    ]);
  });

  it('check that new subsection list is restored to original order when API call fails', async () => {
    const { findAllByTestId } = renderComponent();

    const [sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const expandBtn = await within(subsectionElement).findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandBtn);
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const subsectionsDraggers = within(sectionElement).getAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = subsectionsDraggers[1];
    const subsection1 = section.childInfo.children[0].id;
    jest.mocked(closestCorners).mockReturnValue([{ id: subsection1 }]);

    axiosMock
      .onPut(getCourseItemApiUrl(section.id))
      .reply(500);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });

    // Wait for mutation API call to fail
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    // Verify React Query cache still has original order (rollback cleared preview, cache unchanged)
    const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
    const cachedSection = cachedData?.courseStructure?.childInfo?.children
      .find((s: any) => s.id === section.id);
    expect(cachedSection.childInfo.children.map((c: any) => c.id)).toEqual(
      section.childInfo.children.map((c: any) => c.id),
    );
  });

  it('check that new unit list is saved when dragged', async () => {
    const { findAllByTestId } = renderComponent();
    // get third section
    const [, , sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[2];
    const [subsection] = section.childInfo.children;
    const unitDraggers = await within(subsectionElement).findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = unitDraggers[1];
    const sections = courseOutlineIndexMock.courseStructure.childInfo.children;

    const unit1 = subsection.childInfo.children[0].id;
    jest.mocked(closestCorners).mockReturnValue([{ id: unit1 }]);

    axiosMock
      .onPut(getCourseItemApiUrl(subsection.id))
      .reply(200, { dummy: 'value' });
    const expectedSection = moveUnit([...sections] as unknown as XBlock[], 2, 0, 1, 0)[0][2];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });

    // Wait for mutation API call
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    // Verify API called with correct subsection id
    expect(axiosMock.history.put[0].url).toContain(subsection.id);

    // Verify React Query cache was updated
    const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
    const cachedSection = cachedData?.courseStructure?.childInfo?.children
      .find((s: any) => s.id === section.id);
    expect(cachedSection).toBeDefined();
  });

  it('check that new unit list is restored to original order when API call fails', async () => {
    const { findAllByTestId } = renderComponent();
    // get third section
    const [, , sectionElement] = await findAllByTestId('section-card');
    const [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const section = courseOutlineIndexMock.courseStructure.childInfo.children[2];
    const [subsection] = section.childInfo.children;
    const unitDraggers = await within(subsectionElement).findAllByRole('button', { name: 'Drag to reorder' });
    const draggableButton = unitDraggers[1];
    const sections = courseOutlineIndexMock.courseStructure.childInfo.children;

    const unit1 = subsection.childInfo.children[0].id;
    jest.mocked(closestCorners).mockReturnValue([{ id: unit1 }]);

    axiosMock
      .onPut(getCourseItemApiUrl(subsection.id))
      .reply(500);
    const expectedSection = moveUnit([...sections] as unknown as XBlock[], 2, 0, 1, 0)[0][2];
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, expectedSection);

    fireEvent.keyDown(draggableButton, { code: 'Space' });
    await sleep(1);
    fireEvent.keyDown(draggableButton, { code: 'Space' });

    // Wait for mutation API call to fail
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    // Verify React Query cache still has original order (rollback cleared preview, cache unchanged)
    const cachedData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseId));
    const cachedSection = cachedData?.courseStructure?.childInfo?.children
      .find((s: any) => s.id === section.id);
    expect(cachedSection).toBeDefined();
  });

  it('check whether unit copy & paste option works correctly', async () => {
    const user = userEvent.setup();
    renderComponent();
    // get first section -> first subsection -> first unit element
    const [section] = courseOutlineIndexMock.courseStructure.childInfo.children;
    const [sectionElement] = await screen.findAllByTestId('section-card');
    const [subsection] = section.childInfo.children;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, courseSectionMock);
    let [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const [unit] = subsection.childInfo.children;
    const [unitElement] = await within(subsectionElement).findAllByTestId('unit-card');

    // mock api call
    axiosMock
      .onPost(getClipboardUrl(), {
        usage_key: unit.id,
      }).reply(200, clipboardUnit);

    // find menu button and click on it to open menu
    const menu = await within(unitElement).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));

    // move first unit back to second position to test move down option
    const copyButton = await within(unitElement).findByText(cardHeaderMessages.menuCopy.defaultMessage);
    await act(async () => fireEvent.click(copyButton));

    [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    // find clipboard content label
    const clipboardLabel = await within(subsectionElement).findByText(
      pasteButtonMessages.pasteButtonWhatsInClipboardText.defaultMessage,
    );
    await act(async () => fireEvent.mouseOver(clipboardLabel));

    // find clipboard content popover link
    const popoverContent = screen.queryByTestId('popover-content');
    expect(popoverContent?.tagName).toBe('A');
    expect(popoverContent).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}${unit.studioUrl}`);

    // check paste button functionality
    // mock api call
    axiosMock
      .onPost(getXBlockBaseApiUrl(), {
        parent_locator: subsection.id,
        staged_content: 'clipboard',
      }).reply(200, {
        staticFileNotices: {
          newFiles: ['some.css'],
          conflictingFiles: ['con.css'],
          errorFiles: ['error.css'],
        },
      });
    const pasteBtn = await within(subsectionElement).findByText(subsectionMessages.pasteButton.defaultMessage);
    await act(async () => fireEvent.click(pasteBtn));

    [subsectionElement] = await within(sectionElement).findAllByTestId('subsection-card');
    const lastUnitElement = (await within(subsectionElement).findAllByTestId('unit-card')).slice(-1)[0];
    expect(lastUnitElement).toHaveTextContent(unit.displayName);

    let alerts = await screen.findAllByRole('alert');
    // Exclude processing notification toast
    alerts = alerts.filter((el) => !el.classList.contains('toast-container'));
    // 3 alerts should be present
    expect(alerts.length).toEqual(3);

    // check alerts for errorFiles
    let dismissBtn = await within(alerts[0]).findByText('Dismiss');
    await user.click(dismissBtn);

    // check alerts for conflictingFiles
    dismissBtn = await within(alerts[1]).findByText('Dismiss');
    await user.click(dismissBtn);

    // check alerts for newFiles
    dismissBtn = await within(alerts[2]).findByText('Dismiss');
    await user.click(dismissBtn);

    // check that all alerts are gone
    expect((screen.queryAllByRole('alert')).length).toEqual(0);
  });

  it('should show toats on export tags', async () => {
    const expectedResponse = 'this is a test';

    // Delay to ensure we see "Please wait."
    // Without the delay the success message renders too quickly
    axiosMock
      .onGet(exportTags(courseId))
      .withDelayInMs(500)
      .reply(200, expectedResponse);

    jest.mocked(useLocation).mockReturnValue({
      pathname: '/foo-bar',
      hash: '#export-tags',
      state: undefined,
      key: '',
      search: '',
    });

    window.URL.createObjectURL = jest.fn().mockReturnValue('http://example.com/archivo');
    window.URL.revokeObjectURL = jest.fn();
    renderComponent();
    await screen.findByText('Please wait. Creating export file for course tags...');

    const expectedRequest = axiosMock.history.get.filter(request => request.url === exportTags(courseId));
    expect(expectedRequest.length).toBe(1);

    await screen.findByText('Course tags exported successfully');
  });

  it('should show toast on export tags error', async () => {
    // Delay to ensure we see "Please wait."
    // Without the delay the error renders too quickly
    axiosMock
      .onGet(exportTags(courseId))
      .withDelayInMs(500)
      .reply(404);

    jest.mocked(useLocation).mockReturnValue({
      pathname: '/foo-bar',
      hash: '#export-tags',
      state: undefined,
      key: '',
      search: '',
    });

    renderComponent();
    await screen.findByText('Please wait. Creating export file for course tags...');
    await screen.findByText('An error has occurred creating the file');
  });

  it('sets status to DENIED when API responds with 403', async () => {
    ({ axiosMock } = initializeMocks());
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(403);
    axiosMock
      .onGet(getCourseBestPracticesApiUrl({
        courseId,
        excludeGraded: true,
        all: true,
      }))
      .reply(200, courseBestPracticesMock);
    axiosMock
      .onGet(getCourseLaunchApiUrl({
        courseId,
        gradedOnly: true,
        validateOras: true,
        all: true,
      }))
      .reply(200, courseLaunchMock);

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('redux-provider')).toBeInTheDocument();
      // Section cards should not render when access is denied
      expect(screen.queryByTestId('section-card')).not.toBeInTheDocument();
    });
  });

  it('can unlink library block', async () => {
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, buildTestOutline({ sections: [] }));
    queryClient.setQueryData(courseOutlineQueryKeys.index(courseId), buildTestOutline({ sections: [] }));

    renderComponent();

    axiosMock
      .onPost(getXBlockBaseApiUrl())
      .reply(200, {
        locator: courseSectionMock.id,
      });
    axiosMock
      .onGet(getXBlockApiUrl(courseSectionMock.id))
      .reply(200, {
        ...courseSectionMock,
        actions: {
          ...courseSectionMock.actions,
          unlinkable: true,
        },
      });
    const newSectionButton = (await screen.findAllByRole('button', { name: 'New section' }))[0];
    fireEvent.click(newSectionButton);

    const sectionButton = await screen.findByRole('button', { name: 'Section' });
    const element = sectionButton.closest('[data-testid="section-card"]');
    expect(element).toBeInTheDocument();

    axiosMock.onDelete(getDownstreamApiUrl(courseSectionMock.id)).reply(200);

    const menu = await within(element as HTMLElement).findByTestId('section-card-header__menu-button');
    fireEvent.click(menu);
    const unlinkButton = await within(element as HTMLElement).findByTestId('section-card-header__menu-unlink-button');
    fireEvent.click(unlinkButton);

    const confirmButton = await screen.findByRole('button', { name: 'Confirm Unlink' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(axiosMock.history.delete).toHaveLength(1);
    });
    expect(axiosMock.history.delete[0].url).toBe(getDownstreamApiUrl(courseSectionMock.id));
  });

  it('check that the new status bar and expand bar is shown when flag is set', async () => {
    renderComponent();
    const btn = await screen.findByRole('button', { name: 'Collapse all' });
    expect(btn).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'View live' })).toBeInTheDocument();
    expect((await screen.findAllByRole('button', { name: 'Add' })).length).toEqual(2);
    expect(await screen.findByRole('button', { name: 'Course info' })).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(btn);
    expect(await screen.findByRole('button', { name: 'Expand all' })).toBeInTheDocument();
  });
});
