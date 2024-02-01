import MockAdapter from 'axios-mock-adapter';
import {
  act, render, waitFor, fireEvent, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { cloneDeep, set } from 'lodash';

import {
  getCourseSectionVerticalApiUrl,
  getCourseUnitApiUrl,
  getCourseVerticalChildrenApiUrl,
  getXBlockBaseApiUrl,
  postXBlockBaseApiUrl,
} from './data/api';
import {
  createNewCourseXBlock,
  deleteUnitItemQuery,
  editCourseUnitVisibilityAndData,
  fetchCourseSectionVerticalData,
  fetchCourseUnitQuery,
  fetchCourseVerticalChildrenData,
} from './data/thunk';
import initializeStore from '../store';
import {
  courseCreateXblockMock,
  courseSectionVerticalMock,
  courseUnitIndexMock,
  courseUnitMock,
  courseVerticalChildrenMock,
  clipboardMockResponse,
} from './__mocks__';
import {
  clipboardUnit,
  clipboardXBlock,
} from '../__mocks__';
import { executeThunk } from '../utils';
import deleteModalMessages from '../generic/delete-modal/messages';
import pasteComponentMessages from '../generic/clipboard/paste-component/messages';
import pasteNotificationsMessages from './clipboard/paste-notification/messages';
import headerNavigationsMessages from './header-navigations/messages';
import headerTitleMessages from './header-title/messages';
import courseSequenceMessages from './course-sequence/messages';
import sidebarMessages from './sidebar/messages';
import { extractCourseUnitId } from './sidebar/utils';
import CourseUnit from './CourseUnit';

import configureModalMessages from '../generic/configure-modal/messages';
import courseXBlockMessages from './course-xblock/messages';
import addComponentMessages from './add-component/messages';
import { PUBLISH_TYPES, UNIT_VISIBILITY_STATES } from './constants';
import messages from './messages';
import { getContentTaxonomyTagsApiUrl, getContentTaxonomyTagsCountApiUrl } from '../content-tags-drawer/data/api';
import { RequestStatus } from '../data/constants';

let axiosMock;
let store;
const courseId = '123';
const blockId = '567890';
const unitDisplayName = courseUnitIndexMock.metadata.display_name;
const mockedUsedNavigate = jest.fn();
const userName = 'openedx';

const postXBlockBody = {
  parent_locator: blockId,
  staged_content: 'clipboard',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ blockId }),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(({ queryKey }) => {
    if (queryKey[0] === 'contentTaxonomyTags') {
      return {
        data: {
          taxonomies: [],
        },
        isSuccess: true,
      };
    } if (queryKey[0] === 'contentTagsCount') {
      return {
        data: 17,
        isSuccess: true,
      };
    }
    return {
      data: {},
      isSuccess: true,
    };
  }),
  useQueryClient: jest.fn(() => ({
    setQueryData: jest.fn(),
  })),
}));

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

global.BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseUnit courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseUnit />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    global.localStorage.clear();
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseUnitApiUrl(courseId))
      .reply(200, courseUnitIndexMock);
    await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, courseVerticalChildrenMock);
    await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);
    axiosMock
      .onGet(getContentTaxonomyTagsApiUrl(blockId))
      .reply(200, {});
    axiosMock
      .onGet(getContentTaxonomyTagsCountApiUrl(blockId))
      .reply(200, 17);
  });

  it('render CourseUnit component correctly', async () => {
    const { getByText, getByRole, getByTestId } = render(<RootWrapper />);
    const currentSectionName = courseUnitIndexMock.ancestor_info.ancestors[1].display_name;
    const currentSubSectionName = courseUnitIndexMock.ancestor_info.ancestors[1].display_name;

    await waitFor(() => {
      const unitHeaderTitle = getByTestId('unit-header-title');
      expect(getByText(unitDisplayName)).toBeInTheDocument();
      expect(within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage })).toBeInTheDocument();
      expect(within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonSettings.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: headerNavigationsMessages.viewLiveButton.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: headerNavigationsMessages.previewButton.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: currentSectionName })).toBeInTheDocument();
      expect(getByRole('button', { name: currentSubSectionName })).toBeInTheDocument();
    });
  });

  it('handles CourseUnit header action buttons', async () => {
    const { open } = window;
    window.open = jest.fn();
    const { getByRole } = render(<RootWrapper />);
    const {
      draft_preview_link: draftPreviewLink,
      published_preview_link: publishedPreviewLink,
    } = courseSectionVerticalMock;

    await waitFor(() => {
      const viewLiveButton = getByRole('button', { name: headerNavigationsMessages.viewLiveButton.defaultMessage });
      userEvent.click(viewLiveButton);
      expect(window.open).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(publishedPreviewLink, '_blank');

      const previewButton = getByRole('button', { name: headerNavigationsMessages.previewButton.defaultMessage });
      userEvent.click(previewButton);
      expect(window.open).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(draftPreviewLink, '_blank');
    });

    window.open = open;
  });

  it('checks courseUnit title changing when edit query is successfully', async () => {
    const {
      findByText,
      queryByRole,
      getByRole,
      getByTestId,
    } = render(<RootWrapper />);
    let editTitleButton = null;
    let titleEditField = null;
    const newDisplayName = `${unitDisplayName} new`;

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId, {
        metadata: {
          display_name: newDisplayName,
        },
      }))
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        metadata: {
          ...courseUnitIndexMock.metadata,
          display_name: newDisplayName,
        },
      });

    await waitFor(() => {
      const unitHeaderTitle = getByTestId('unit-header-title');
      editTitleButton = within(unitHeaderTitle)
        .getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage });
      titleEditField = within(unitHeaderTitle)
        .queryByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    });
    expect(titleEditField).not.toBeInTheDocument();
    fireEvent.click(editTitleButton);
    titleEditField = getByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    fireEvent.change(titleEditField, { target: { value: newDisplayName } });
    await act(async () => {
      fireEvent.blur(titleEditField);
    });
    expect(titleEditField).toHaveValue(newDisplayName);

    titleEditField = queryByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    expect(titleEditField).not.toBeInTheDocument();
    expect(await findByText(newDisplayName)).toBeInTheDocument();
  });

  it('doesn\'t handle creating xblock and displays an error message', async () => {
    const { courseKey, locator } = courseCreateXblockMock;
    axiosMock
      .onPost(postXBlockBaseApiUrl({ type: 'video', category: 'video', parentLocator: blockId }))
      .reply(500, {});
    const { getByRole } = render(<RootWrapper />);

    await waitFor(() => {
      const videoButton = getByRole('button', {
        name: new RegExp(`${addComponentMessages.buttonText.defaultMessage} Video`, 'i'),
      });

      userEvent.click(videoButton);
      expect(mockedUsedNavigate).not.toHaveBeenCalledWith(`/course/${courseKey}/editor/video/${locator}`);
    });
  });

  it('handle creating Problem xblock and navigate to editor page', async () => {
    const { courseKey, locator } = courseCreateXblockMock;
    axiosMock
      .onPost(postXBlockBaseApiUrl({ type: 'problem', category: 'problem', parentLocator: blockId }))
      .reply(200, courseCreateXblockMock);
    const { getByText, getByRole } = render(<RootWrapper />);

    await waitFor(() => {
      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage }));
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        visibility_state: UNIT_VISIBILITY_STATES.live,
        has_changes: false,
        published_by: userName,
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(() => {
      const problemButton = getByRole('button', {
        name: new RegExp(`${addComponentMessages.buttonText.defaultMessage} Problem`, 'i'),
      });

      userEvent.click(problemButton);
      expect(mockedUsedNavigate).toHaveBeenCalled();
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseKey}/editor/problem/${locator}`);
    });

    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, courseUnitIndexMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    // after creating problem xblock, the sidebar status changes to Draft (unpublished changes)
    expect(getByText(sidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityStaffAndLearnersTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.sidebarBodyNote.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityWillBeVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(courseUnitIndexMock.release_date)).toBeInTheDocument();
    expect(getByText(
      sidebarMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseUnitIndexMock.edited_on)
        .replace('{editedBy}', courseUnitIndexMock.edited_by),
    )).toBeInTheDocument();
    expect(getByText(
      sidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseUnitIndexMock.release_date_from),
    )).toBeInTheDocument();
  });

  it('correct addition of a new course unit after click on the "Add new unit" button', async () => {
    const { getByRole, getAllByTestId } = render(<RootWrapper />);
    let units = null;
    const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
    const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
    set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
      ...updatedAncestorsChild.child_info.children,
      courseUnitMock,
    ]);

    await waitFor(async () => {
      units = getAllByTestId('course-unit-btn');
      const courseUnits = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[0].child_info.children;
      expect(units).toHaveLength(courseUnits.length);
    });

    axiosMock
      .onPost(postXBlockBaseApiUrl(), { parent_locator: blockId, category: 'vertical', display_name: 'Unit' })
      .reply(200, { dummy: 'value' });
    axiosMock.reset();
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...updatedCourseSectionVerticalData,
      });

    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    const addNewUnitBtn = getByRole('button', { name: courseSequenceMessages.newUnitBtnText.defaultMessage });
    units = getAllByTestId('course-unit-btn');
    const updatedCourseUnits = updatedCourseSectionVerticalData
      .xblock_info.ancestor_info.ancestors[0].child_info.children;

    userEvent.click(addNewUnitBtn);
    expect(units.length).toEqual(updatedCourseUnits.length);
    expect(mockedUsedNavigate).toHaveBeenCalled();
    expect(mockedUsedNavigate)
      .toHaveBeenCalledWith(`/course/${courseId}/container/${blockId}/${updatedAncestorsChild.id}`, { replace: true });
  });

  it('the sequence unit is updated after changing the unit header', async () => {
    const { getAllByTestId, getByTestId } = render(<RootWrapper />);
    const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
    const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
    set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
      ...updatedAncestorsChild.child_info.children,
      courseUnitMock,
    ]);

    const newDisplayName = `${unitDisplayName} new`;

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId, {
        metadata: {
          display_name: newDisplayName,
        },
      }))
      .reply(200, { dummy: 'value' })
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        metadata: {
          ...courseUnitIndexMock.metadata,
          display_name: newDisplayName,
        },
      })
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...updatedCourseSectionVerticalData,
      });

    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    const unitHeaderTitle = getByTestId('unit-header-title');

    const editTitleButton = within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage });
    fireEvent.click(editTitleButton);

    const titleEditField = within(unitHeaderTitle).getByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    fireEvent.change(titleEditField, { target: { value: newDisplayName } });

    await act(async () => fireEvent.blur(titleEditField));

    await waitFor(async () => {
      const units = getAllByTestId('course-unit-btn');
      expect(units.some(unit => unit.title === newDisplayName)).toBe(true);
    });
  });

  it('handles creating Video xblock and navigates to editor page', async () => {
    const { courseKey, locator } = courseCreateXblockMock;
    axiosMock
      .onPost(postXBlockBaseApiUrl({ type: 'video', category: 'video', parentLocator: blockId }))
      .reply(200, courseCreateXblockMock);
    const { getByText, queryByRole, getByRole } = render(<RootWrapper />);

    await waitFor(() => {
      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage }));
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        visibility_state: UNIT_VISIBILITY_STATES.live,
        has_changes: false,
        published_by: userName,
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(() => {
      // check if the sidebar status is Published and Live
      expect(getByText(sidebarMessages.sidebarTitlePublishedAndLive.defaultMessage)).toBeInTheDocument();
      expect(getByText(
        sidebarMessages.publishLastPublished.defaultMessage
          .replace('{publishedOn}', courseUnitIndexMock.published_on)
          .replace('{publishedBy}', userName),
      )).toBeInTheDocument();
      expect(queryByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage })).not.toBeInTheDocument();

      const videoButton = getByRole('button', {
        name: new RegExp(`${addComponentMessages.buttonText.defaultMessage} Video`, 'i'),
      });

      userEvent.click(videoButton);
      expect(mockedUsedNavigate).toHaveBeenCalled();
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseKey}/editor/video/${locator}`);
    });

    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, courseUnitIndexMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    // after creating video xblock, the sidebar status changes to Draft (unpublished changes)
    expect(getByText(sidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityStaffAndLearnersTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.sidebarBodyNote.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityWillBeVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(courseUnitIndexMock.release_date)).toBeInTheDocument();
    expect(getByText(
      sidebarMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseUnitIndexMock.edited_on)
        .replace('{editedBy}', courseUnitIndexMock.edited_by),
    )).toBeInTheDocument();
    expect(getByText(
      sidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseUnitIndexMock.release_date_from),
    )).toBeInTheDocument();
  });

  it('renders course unit details for a draft with unpublished changes', async () => {
    const { getByText } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(sidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage)).toBeInTheDocument();
      expect(getByText(sidebarMessages.visibilityStaffAndLearnersTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(sidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(sidebarMessages.sidebarBodyNote.defaultMessage)).toBeInTheDocument();
      expect(getByText(sidebarMessages.visibilityWillBeVisibleToTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(sidebarMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(sidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(sidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(courseUnitIndexMock.release_date)).toBeInTheDocument();
      expect(getByText(
        sidebarMessages.publishInfoDraftSaved.defaultMessage
          .replace('{editedOn}', courseUnitIndexMock.edited_on)
          .replace('{editedBy}', courseUnitIndexMock.edited_by),
      )).toBeInTheDocument();
      expect(getByText(
        sidebarMessages.releaseInfoWithSection.defaultMessage
          .replace('{sectionName}', courseUnitIndexMock.release_date_from),
      )).toBeInTheDocument();
    });
  });

  it('renders course unit details in the sidebar', async () => {
    const { getByText } = render(<RootWrapper />);
    const courseUnitLocationId = extractCourseUnitId(courseUnitIndexMock.id);

    await waitFor(() => {
      expect(getByText(sidebarMessages.sidebarHeaderUnitLocationTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(sidebarMessages.unitLocationTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(courseUnitLocationId)).toBeInTheDocument();
      expect(getByText(sidebarMessages.unitLocationDescription.defaultMessage
        .replace('{id}', courseUnitLocationId))).toBeInTheDocument();
    });
  });

  it('should display a warning alert for unpublished course unit version', async () => {
    const { getByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      const unpublishedAlert = getByTestId('course-unit-unpublished-alert');
      expect(unpublishedAlert).toHaveTextContent(messages.alertUnpublishedVersion.defaultMessage);
      expect(unpublishedAlert).toHaveClass('alert-warning');
    });
  });

  it('should not display an unpublished alert for a course unit with explicit staff lock and unpublished status', async () => {
    const { queryByRole } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseUnitApiUrl(courseId))
      .reply(200, {
        ...courseUnitIndexMock,
        currently_visible_to_students: false,
      });

    await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);

    await waitFor(() => {
      const unpublishedAlert = queryByRole('alert', { name: messages.alertUnpublishedVersion });
      expect(unpublishedAlert).toBeNull();
    });
  });

  it('checks whether xblock is deleted when corresponding delete button is clicked', async () => {
    axiosMock
      .onDelete(getXBlockBaseApiUrl(courseVerticalChildrenMock.children[0].block_id))
      .replyOnce(200, { dummy: 'value' });

    const {
      getByText,
      getAllByLabelText,
      getByRole,
      getAllByTestId,
    } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(unitDisplayName)).toBeInTheDocument();
      const [xblockActionBtn] = getAllByLabelText(courseXBlockMessages.blockActionsDropdownAlt.defaultMessage);
      userEvent.click(xblockActionBtn);

      const deleteBtn = getByRole('button', { name: courseXBlockMessages.blockLabelButtonDelete.defaultMessage });
      userEvent.click(deleteBtn);
      expect(getByText(/Delete this component?/)).toBeInTheDocument();

      const deleteConfirmBtn = getByRole('button', { name: deleteModalMessages.deleteButton.defaultMessage });
      userEvent.click(deleteConfirmBtn);

      expect(getAllByTestId('course-xblock')).toHaveLength(1);
    });
  });

  it('checks whether xblock is duplicate when corresponding delete button is clicked', async () => {
    axiosMock
      .onPost(postXBlockBaseApiUrl({
        parent_locator: blockId,
        duplicate_source_locator: courseVerticalChildrenMock.children[0].block_id,
      }))
      .replyOnce(200, { locator: '1234567890' });

    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, {
        ...courseVerticalChildrenMock,
        children: [
          ...courseVerticalChildrenMock.children,
          {
            name: 'New Cloned XBlock',
            block_id: '1234567890',
            block_type: 'drag-and-drop-v2',
            user_partition_info: {},
            actions: courseVerticalChildrenMock.children[0].actions,
          },
        ],
      });

    const {
      getByText,
      getAllByLabelText,
      getAllByTestId,
    } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(unitDisplayName)).toBeInTheDocument();
      const [xblockActionBtn] = getAllByLabelText(courseXBlockMessages.blockActionsDropdownAlt.defaultMessage);
      userEvent.click(xblockActionBtn);

      const duplicateBtn = getByText(courseXBlockMessages.blockLabelButtonDuplicate.defaultMessage);
      userEvent.click(duplicateBtn);

      expect(getAllByTestId('course-xblock')).toHaveLength(3);
      expect(getByText('New Cloned XBlock')).toBeInTheDocument();
    });
  });

  it('should toggle visibility from sidebar and update course unit state accordingly', async () => {
    const { getByRole, getByTestId } = render(<RootWrapper />);
    let courseUnitSidebar;
    let draftUnpublishedChangesHeading;
    let visibilityCheckbox;

    await waitFor(() => {
      courseUnitSidebar = getByTestId('course-unit-sidebar');

      draftUnpublishedChangesHeading = within(courseUnitSidebar)
        .getByText(sidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage);
      expect(draftUnpublishedChangesHeading).toBeInTheDocument();

      visibilityCheckbox = within(courseUnitSidebar)
        .getByLabelText(sidebarMessages.visibilityCheckboxTitle.defaultMessage);
      expect(visibilityCheckbox).not.toBeChecked();

      userEvent.click(visibilityCheckbox);
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.republish,
        metadata: { visible_to_staff_only: true, group_access: null },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        visibility_state: UNIT_VISIBILITY_STATES.staffOnly,
        has_explicit_staff_lock: true,
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, true), store.dispatch);

    expect(visibilityCheckbox).toBeChecked();
    expect(within(courseUnitSidebar)
      .getByText(sidebarMessages.sidebarTitleVisibleToStaffOnly.defaultMessage)).toBeInTheDocument();
    expect(within(courseUnitSidebar)
      .getByText(sidebarMessages.visibilityStaffOnlyTitle.defaultMessage)).toBeInTheDocument();

    userEvent.click(visibilityCheckbox);

    const modalNotification = getByRole('dialog');
    const makeVisibilityBtn = within(modalNotification).getByRole('button', { name: sidebarMessages.modalMakeVisibilityActionButtonText.defaultMessage });
    const cancelBtn = within(modalNotification).getByRole('button', { name: sidebarMessages.modalMakeVisibilityCancelButtonText.defaultMessage });
    const headingElement = within(modalNotification).getByRole('heading', { name: sidebarMessages.modalMakeVisibilityTitle.defaultMessage, class: 'pgn__modal-title' });

    expect(makeVisibilityBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();
    expect(headingElement).toBeInTheDocument();
    expect(within(modalNotification)
      .getByText(sidebarMessages.modalMakeVisibilityDescription.defaultMessage)).toBeInTheDocument();

    userEvent.click(makeVisibilityBtn);

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.republish,
        metadata: { visible_to_staff_only: null, group_access: null },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, courseUnitIndexMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, null), store.dispatch);

    expect(within(courseUnitSidebar)
      .getByText(sidebarMessages.visibilityStaffAndLearnersTitle.defaultMessage)).toBeInTheDocument();
    expect(visibilityCheckbox).not.toBeChecked();
    expect(draftUnpublishedChangesHeading).toBeInTheDocument();
  });

  it('should publish course unit after click on the "Publish" button', async () => {
    const { getByTestId } = render(<RootWrapper />);
    let courseUnitSidebar;
    let publishBtn;

    await waitFor(() => {
      courseUnitSidebar = getByTestId('course-unit-sidebar');
      publishBtn = within(courseUnitSidebar).queryByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage });
      expect(publishBtn).toBeInTheDocument();

      userEvent.click(publishBtn);
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        visibility_state: UNIT_VISIBILITY_STATES.live,
        has_changes: false,
        published_by: userName,
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    expect(within(courseUnitSidebar)
      .getByText(sidebarMessages.sidebarTitlePublishedAndLive.defaultMessage)).toBeInTheDocument();
    expect(within(courseUnitSidebar).getByText(
      sidebarMessages.publishLastPublished.defaultMessage
        .replace('{publishedOn}', courseUnitIndexMock.published_on)
        .replace('{publishedBy}', userName),
    )).toBeInTheDocument();
    expect(publishBtn).not.toBeInTheDocument();
  });

  it('should discard changes after click on the "Discard changes" button', async () => {
    const { getByTestId, getByRole } = render(<RootWrapper />);
    let courseUnitSidebar;
    let discardChangesBtn;

    await waitFor(() => {
      courseUnitSidebar = getByTestId('course-unit-sidebar');

      const draftUnpublishedChangesHeading = within(courseUnitSidebar)
        .getByText(sidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage);
      expect(draftUnpublishedChangesHeading).toBeInTheDocument();
      discardChangesBtn = within(courseUnitSidebar).queryByRole('button', { name: sidebarMessages.actionButtonDiscardChangesTitle.defaultMessage });
      expect(discardChangesBtn).toBeInTheDocument();

      userEvent.click(discardChangesBtn);

      const modalNotification = getByRole('dialog');
      expect(modalNotification).toBeInTheDocument();
      expect(within(modalNotification)
        .getByText(sidebarMessages.modalDiscardUnitChangesDescription.defaultMessage)).toBeInTheDocument();
      expect(within(modalNotification)
        .getByText(sidebarMessages.modalDiscardUnitChangesCancelButtonText.defaultMessage)).toBeInTheDocument();
      const headingElement = within(modalNotification).getByRole('heading', { name: sidebarMessages.modalDiscardUnitChangesTitle.defaultMessage, class: 'pgn__modal-title' });
      expect(headingElement).toBeInTheDocument();
      const actionBtn = within(modalNotification).getByRole('button', { name: sidebarMessages.modalDiscardUnitChangesActionButtonText.defaultMessage });
      expect(actionBtn).toBeInTheDocument();

      userEvent.click(actionBtn);
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.discardChanges,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock, published: true, has_changes: false,
      });

    await executeThunk(editCourseUnitVisibilityAndData(
      blockId,
      PUBLISH_TYPES.discardChanges,
      true,
    ), store.dispatch);

    expect(within(courseUnitSidebar)
      .getByText(sidebarMessages.sidebarTitlePublishedNotYetReleased.defaultMessage)).toBeInTheDocument();
    expect(discardChangesBtn).not.toBeInTheDocument();
  });

  it('checks whether xblock is removed when the corresponding delete button is clicked and the sidebar is the updated', async () => {
    const {
      getByText,
      getAllByLabelText,
      getByRole,
      getAllByTestId,
      queryByRole,
    } = render(<RootWrapper />);

    await waitFor(() => {
      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage }));
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        visibility_state: UNIT_VISIBILITY_STATES.live,
        has_changes: false,
        published_by: userName,
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    axiosMock
      .onDelete(getXBlockBaseApiUrl(courseVerticalChildrenMock.children[0].block_id))
      .replyOnce(200, { dummy: 'value' });

    await executeThunk(deleteUnitItemQuery(courseId, blockId), store.dispatch);

    await waitFor(() => {
      // check if the sidebar status is Published and Live
      expect(getByText(sidebarMessages.sidebarTitlePublishedAndLive.defaultMessage)).toBeInTheDocument();
      expect(getByText(
        sidebarMessages.publishLastPublished.defaultMessage
          .replace('{publishedOn}', courseUnitIndexMock.published_on)
          .replace('{publishedBy}', userName),
      )).toBeInTheDocument();
      expect(queryByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage })).not.toBeInTheDocument();

      expect(getByText(unitDisplayName)).toBeInTheDocument();
      const [xblockActionBtn] = getAllByLabelText(courseXBlockMessages.blockActionsDropdownAlt.defaultMessage);
      userEvent.click(xblockActionBtn);

      const deleteBtn = getByRole('button', { name: courseXBlockMessages.blockLabelButtonDelete.defaultMessage });
      userEvent.click(deleteBtn);
      expect(getByText(/Delete this component?/)).toBeInTheDocument();

      const deleteConfirmBtn = getByRole('button', { name: deleteModalMessages.deleteButton.defaultMessage });
      userEvent.click(deleteConfirmBtn);

      expect(getAllByTestId('course-xblock')).toHaveLength(1);
    });

    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, courseUnitIndexMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    // after removing the xblock, the sidebar status changes to Draft (unpublished changes)
    expect(getByText(sidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityStaffAndLearnersTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.sidebarBodyNote.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityWillBeVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(courseUnitIndexMock.release_date)).toBeInTheDocument();
    expect(getByText(
      sidebarMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseUnitIndexMock.edited_on)
        .replace('{editedBy}', courseUnitIndexMock.edited_by),
    )).toBeInTheDocument();
    expect(getByText(
      sidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseUnitIndexMock.release_date_from),
    )).toBeInTheDocument();
  });

  it('checks if xblock is a duplicate when the corresponding duplicate button is clicked and if the sidebar status is updated', async () => {
    axiosMock
      .onPost(postXBlockBaseApiUrl({
        parent_locator: blockId,
        duplicate_source_locator: courseVerticalChildrenMock.children[0].block_id,
      }))
      .replyOnce(200, { locator: '1234567890' });

    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, {
        ...courseVerticalChildrenMock,
        children: [
          ...courseVerticalChildrenMock.children,
          {
            ...courseVerticalChildrenMock.children[0],
            name: 'New Cloned XBlock',
          },
        ],
      });

    const {
      getByText,
      getAllByLabelText,
      getAllByTestId,
      queryByRole,
      getByRole,
    } = render(<RootWrapper />);

    await waitFor(() => {
      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage }));
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        visibility_state: UNIT_VISIBILITY_STATES.live,
        has_changes: false,
        published_by: userName,
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(() => {
      // check if the sidebar status is Published and Live
      expect(getByText(sidebarMessages.sidebarTitlePublishedAndLive.defaultMessage)).toBeInTheDocument();
      expect(getByText(
        sidebarMessages.publishLastPublished.defaultMessage
          .replace('{publishedOn}', courseUnitIndexMock.published_on)
          .replace('{publishedBy}', userName),
      )).toBeInTheDocument();
      expect(queryByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage })).not.toBeInTheDocument();

      expect(getByText(unitDisplayName)).toBeInTheDocument();
      const [xblockActionBtn] = getAllByLabelText(courseXBlockMessages.blockActionsDropdownAlt.defaultMessage);
      userEvent.click(xblockActionBtn);

      const duplicateBtn = getByText(courseXBlockMessages.blockLabelButtonDuplicate.defaultMessage);
      userEvent.click(duplicateBtn);

      expect(getAllByTestId('course-xblock')).toHaveLength(3);
      expect(getByText('New Cloned XBlock')).toBeInTheDocument();
    });

    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, courseUnitIndexMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    // after duplicate the xblock, the sidebar status changes to Draft (unpublished changes)
    expect(getByText(sidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityStaffAndLearnersTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.sidebarBodyNote.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityWillBeVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(sidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(courseUnitIndexMock.release_date)).toBeInTheDocument();
    expect(getByText(
      sidebarMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseUnitIndexMock.edited_on)
        .replace('{editedBy}', courseUnitIndexMock.edited_by),
    )).toBeInTheDocument();
    expect(getByText(
      sidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseUnitIndexMock.release_date_from),
    )).toBeInTheDocument();
  });

  it('should hide action buttons when their corresponding properties are set to false', async () => {
    const {
      getByText,
      getAllByLabelText,
      queryByRole,
    } = render(<RootWrapper />);

    const convertedXBlockActions = camelCaseObject(courseVerticalChildrenMock.children[0].actions);

    const updatedXBlockActions = Object.keys(convertedXBlockActions).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, {
        children: [
          {
            ...courseVerticalChildrenMock.children[0],
            actions: updatedXBlockActions,
          },
        ],
      });

    await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);

    await waitFor(() => {
      expect(getByText(unitDisplayName)).toBeInTheDocument();
      const [xblockActionBtn] = getAllByLabelText(courseXBlockMessages.blockActionsDropdownAlt.defaultMessage);
      userEvent.click(xblockActionBtn);
      const deleteBtn = queryByRole('button', { name: courseXBlockMessages.blockLabelButtonDelete.defaultMessage });
      const duplicateBtn = queryByRole('button', { name: courseXBlockMessages.blockLabelButtonDuplicate.defaultMessage });
      const moveBtn = queryByRole('button', { name: courseXBlockMessages.blockLabelButtonMove.defaultMessage });
      const copyToClipboardBtn = queryByRole('button', { name: courseXBlockMessages.blockLabelButtonCopyToClipboard.defaultMessage });
      const manageAccessBtn = queryByRole('button', { name: courseXBlockMessages.blockLabelButtonManageAccess.defaultMessage });
      // ToDo: uncomment next lines when manage tags will be realized
      // eslint-disable-next-line max-len
      // const manageTagsBtn = queryByRole('button', { name: courseXBlockMessages.blockLabelButtonManageTags.defaultMessage });

      expect(deleteBtn).not.toBeInTheDocument();
      expect(duplicateBtn).not.toBeInTheDocument();
      expect(moveBtn).not.toBeInTheDocument();
      expect(copyToClipboardBtn).not.toBeInTheDocument();
      expect(manageAccessBtn).not.toBeInTheDocument();
      // expect(manageTagsBtn).not.toBeInTheDocument();
    });
  });

  it('should toggle visibility from header configure modal and update course unit state accordingly', async () => {
    const { getByRole, getByTestId } = render(<RootWrapper />);
    let courseUnitSidebar;
    let sidebarVisibilityCheckbox;
    let modalVisibilityCheckbox;
    let configureModal;
    let restrictAccessSelect;

    await waitFor(() => {
      courseUnitSidebar = getByTestId('course-unit-sidebar');
      sidebarVisibilityCheckbox = within(courseUnitSidebar)
        .getByLabelText(sidebarMessages.visibilityCheckboxTitle.defaultMessage);
      expect(sidebarVisibilityCheckbox).not.toBeChecked();

      const headerConfigureBtn = getByRole('button', { name: /settings/i });
      expect(headerConfigureBtn).toBeInTheDocument();

      userEvent.click(headerConfigureBtn);
      configureModal = getByTestId('configure-modal');
      restrictAccessSelect = within(configureModal)
        .getByRole('combobox', { name: configureModalMessages.restrictAccessTo.defaultMessage });
      expect(within(configureModal)
        .getByText(configureModalMessages.unitVisibility.defaultMessage)).toBeInTheDocument();
      expect(within(configureModal)
        .getByText(configureModalMessages.restrictAccessTo.defaultMessage)).toBeInTheDocument();
      expect(restrictAccessSelect).toBeInTheDocument();
      expect(restrictAccessSelect).toHaveValue('-1');

      modalVisibilityCheckbox = within(configureModal)
        .getByRole('checkbox', { name: configureModalMessages.hideFromLearners.defaultMessage });
      expect(modalVisibilityCheckbox).not.toBeChecked();

      userEvent.click(modalVisibilityCheckbox);
      expect(modalVisibilityCheckbox).toBeChecked();

      userEvent.selectOptions(restrictAccessSelect, '0');
      const [, group1Checkbox] = within(configureModal).getAllByRole('checkbox');

      userEvent.click(group1Checkbox);
      expect(group1Checkbox).toBeChecked();
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(courseUnitIndexMock.id), {
        publish: null,
        metadata: { visible_to_staff_only: true, group_access: { 50: [2] } },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .replyOnce(200, {
        ...courseUnitIndexMock,
        visibility_state: UNIT_VISIBILITY_STATES.staffOnly,
        has_explicit_staff_lock: true,
      });

    const modalSaveBtn = within(configureModal)
      .getByRole('button', { name: configureModalMessages.saveButton.defaultMessage });
    userEvent.click(modalSaveBtn);

    await waitFor(() => {
      expect(sidebarVisibilityCheckbox).toBeChecked();
      expect(within(courseUnitSidebar)
        .getByText(sidebarMessages.sidebarTitleVisibleToStaffOnly.defaultMessage)).toBeInTheDocument();
      expect(within(courseUnitSidebar)
        .getByText(sidebarMessages.visibilityStaffOnlyTitle.defaultMessage)).toBeInTheDocument();
    });
  });

  describe('Copy paste functionality', () => {
    it('should display "Copy Unit" action button after enabling copy-paste units', async () => {
      const { queryByText, queryByRole } = render(<RootWrapper />);

      await waitFor(() => {
        expect(queryByText(sidebarMessages.actionButtonCopyUnitTitle.defaultMessage)).toBeNull();
        expect(queryByRole('button', { name: messages.pasteButtonText.defaultMessage })).toBeNull();
      });

      axiosMock
        .onGet(getCourseUnitApiUrl(courseId))
        .reply(200, {
          ...courseUnitIndexMock,
          enable_copy_paste_units: true,
        });

      await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
      expect(queryByRole('button', { name: sidebarMessages.actionButtonCopyUnitTitle.defaultMessage })).toBeInTheDocument();
    });

    it('should display clipboard information in popover when hovering over What\'s in clipboard text', async () => {
      const {
        queryByTestId, getByRole, getAllByLabelText, getByText,
      } = render(<RootWrapper />);

      await waitFor(() => {
        const [xblockActionBtn] = getAllByLabelText(courseXBlockMessages.blockActionsDropdownAlt.defaultMessage);
        userEvent.click(xblockActionBtn);
        userEvent.click(getByRole('button', { name: courseXBlockMessages.blockLabelButtonCopyToClipboard.defaultMessage }));
      });

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          user_clipboard: clipboardXBlock,
        });

      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      expect(getByRole('button', { name: messages.pasteButtonText.defaultMessage })).toBeInTheDocument();

      const whatsInClipboardText = getByText(
        pasteComponentMessages.pasteButtonWhatsInClipboardText.defaultMessage,
      );

      userEvent.hover(whatsInClipboardText);

      const popoverContent = queryByTestId('popover-content');
      expect(popoverContent.tagName).toBe('A');
      expect(popoverContent).toHaveAttribute('href', clipboardXBlock.sourceEditUrl);
      expect(within(popoverContent).getByText(clipboardXBlock.content.displayName)).toBeInTheDocument();
      expect(within(popoverContent).getByText(clipboardXBlock.sourceContextTitle)).toBeInTheDocument();
      expect(within(popoverContent).getByText(clipboardXBlock.content.blockTypeDisplay)).toBeInTheDocument();

      fireEvent.blur(whatsInClipboardText);
      await waitFor(() => expect(queryByTestId('popover-content')).toBeNull());

      fireEvent.focus(whatsInClipboardText);
      await waitFor(() => expect(queryByTestId('popover-content')).toBeInTheDocument());

      fireEvent.mouseLeave(whatsInClipboardText);
      await waitFor(() => expect(queryByTestId('popover-content')).toBeNull());

      fireEvent.mouseEnter(whatsInClipboardText);
      await waitFor(() => expect(queryByTestId('popover-content')).toBeInTheDocument());
    });

    it('should increase the number of course XBlocks after copying and pasting a block', async () => {
      const {
        getAllByTestId, getByRole, getAllByLabelText,
      } = render(<RootWrapper />);

      await waitFor(() => {
        const [xblockActionBtn] = getAllByLabelText(courseXBlockMessages.blockActionsDropdownAlt.defaultMessage);
        userEvent.click(xblockActionBtn);
        userEvent.click(getByRole('button', { name: courseXBlockMessages.blockLabelButtonCopyToClipboard.defaultMessage }));
      });

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          user_clipboard: clipboardXBlock,
        });

      axiosMock
        .onGet(getCourseUnitApiUrl(courseId))
        .reply(200, {
          ...courseUnitIndexMock,
          enable_copy_paste_units: true,
        });

      await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      userEvent.click(getByRole('button', { name: messages.pasteButtonText.defaultMessage }));

      await waitFor(() => {
        expect(getAllByTestId('course-xblock')).toHaveLength(2);
      });

      axiosMock
        .onGet(getCourseVerticalChildrenApiUrl(blockId))
        .reply(200, {
          ...courseVerticalChildrenMock,
          children: [
            ...courseVerticalChildrenMock.children,
            {
              name: 'Copy XBlock',
              block_id: '1234567890',
              block_type: 'drag-and-drop-v2',
              user_partition_info: {
                selectable_partitions: [],
                selected_partition_index: -1,
                selected_groups_label: '',
              },
              actions: courseVerticalChildrenMock.children[0].actions,
            },
          ],
        });

      await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);
      expect(getAllByTestId('course-xblock')).toHaveLength(3);
    });

    it('should display the "Paste component" button after copying a xblock to clipboard', async () => {
      const { getByRole, getAllByLabelText } = render(<RootWrapper />);

      await waitFor(() => {
        const [xblockActionBtn] = getAllByLabelText(courseXBlockMessages.blockActionsDropdownAlt.defaultMessage);
        userEvent.click(xblockActionBtn);
        userEvent.click(getByRole('button', { name: courseXBlockMessages.blockLabelButtonCopyToClipboard.defaultMessage }));
      });

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          user_clipboard: clipboardXBlock,
        });

      axiosMock
        .onGet(getCourseUnitApiUrl(courseId))
        .reply(200, {
          ...courseUnitIndexMock,
          enable_copy_paste_units: true,
        });

      await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      expect(getByRole('button', { name: messages.pasteButtonText.defaultMessage })).toBeInTheDocument();
    });

    it('should copy a unit, paste it as a new unit, and update the course section vertical data', async () => {
      const {
        getAllByTestId, getByRole,
      } = render(<RootWrapper />);

      axiosMock
        .onGet(getCourseUnitApiUrl(courseId))
        .reply(200, {
          ...courseUnitIndexMock,
          enable_copy_paste_units: true,
        });

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          user_clipboard: clipboardUnit,
        });

      await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      userEvent.click(getByRole('button', { name: courseSequenceMessages.pasteAsNewUnitLink.defaultMessage }));

      let units = null;
      const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
      const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
      set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
        ...updatedAncestorsChild.child_info.children,
        courseUnitMock,
      ]);

      await waitFor(() => {
        units = getAllByTestId('course-unit-btn');
        const courseUnits = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[0].child_info.children;
        expect(units).toHaveLength(courseUnits.length);
      });

      axiosMock
        .onPost(postXBlockBaseApiUrl(), postXBlockBody)
        .reply(200, { dummy: 'value' });
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...updatedCourseSectionVerticalData,
        });

      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      units = getAllByTestId('course-unit-btn');
      const updatedCourseUnits = updatedCourseSectionVerticalData
        .xblock_info.ancestor_info.ancestors[0].child_info.children;

      expect(units.length).toEqual(updatedCourseUnits.length);
      expect(mockedUsedNavigate).toHaveBeenCalled();
      expect(mockedUsedNavigate)
        .toHaveBeenCalledWith(`/course/${courseId}/container/${blockId}/${updatedAncestorsChild.id}`, { replace: true });
    });

    it('displays a notification about new files after pasting a component', async () => {
      const {
        queryByTestId, getByTestId, getByRole,
      } = render(<RootWrapper />);

      axiosMock
        .onGet(getCourseUnitApiUrl(courseId))
        .reply(200, {
          ...courseUnitIndexMock,
          enable_copy_paste_units: true,
        });

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          user_clipboard: clipboardUnit,
        });

      await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      userEvent.click(getByRole('button', { name: courseSequenceMessages.pasteAsNewUnitLink.defaultMessage }));

      const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
      const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
      set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
        ...updatedAncestorsChild.child_info.children,
        courseUnitMock,
      ]);

      axiosMock
        .onPost(postXBlockBaseApiUrl(postXBlockBody))
        .reply(200, clipboardMockResponse);
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...updatedCourseSectionVerticalData,
        });

      global.localStorage.setItem('staticFileNotices', JSON.stringify(clipboardMockResponse.staticFileNotices));
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      await executeThunk(createNewCourseXBlock(camelCaseObject(postXBlockBody), null, blockId), store.dispatch);
      const newFilesAlert = getByTestId('has-new-files-alert');

      expect(within(newFilesAlert)
        .getByText(pasteNotificationsMessages.hasNewFilesTitle.defaultMessage)).toBeInTheDocument();
      expect(within(newFilesAlert)
        .getByText(pasteNotificationsMessages.hasNewFilesDescription.defaultMessage)).toBeInTheDocument();
      expect(within(newFilesAlert)
        .getByText(pasteNotificationsMessages.hasNewFilesButtonText.defaultMessage)).toBeInTheDocument();
      clipboardMockResponse.staticFileNotices.newFiles.forEach((fileName) => {
        expect(within(newFilesAlert).getByText(fileName)).toBeInTheDocument();
      });

      userEvent.click(within(newFilesAlert).getByText(/Dismiss/i));

      expect(queryByTestId('has-new-files-alert')).toBeNull();
    });

    it('displays a notification about conflicting errors after pasting a component', async () => {
      const {
        queryByTestId, getByTestId, getByRole,
      } = render(<RootWrapper />);

      axiosMock
        .onGet(getCourseUnitApiUrl(courseId))
        .reply(200, {
          ...courseUnitIndexMock,
          enable_copy_paste_units: true,
        });

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          user_clipboard: clipboardUnit,
        });

      await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      userEvent.click(getByRole('button', { name: courseSequenceMessages.pasteAsNewUnitLink.defaultMessage }));

      const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
      const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
      set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
        ...updatedAncestorsChild.child_info.children,
        courseUnitMock,
      ]);

      axiosMock
        .onPost(postXBlockBaseApiUrl(postXBlockBody))
        .reply(200, clipboardMockResponse);
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...updatedCourseSectionVerticalData,
        });

      global.localStorage.setItem('staticFileNotices', JSON.stringify(clipboardMockResponse.staticFileNotices));
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      await executeThunk(createNewCourseXBlock(camelCaseObject(postXBlockBody), null, blockId), store.dispatch);
      const conflictingErrorsAlert = getByTestId('has-conflicting-errors-alert');

      expect(within(conflictingErrorsAlert)
        .getByText(pasteNotificationsMessages.hasConflictingErrorsTitle.defaultMessage)).toBeInTheDocument();
      expect(within(conflictingErrorsAlert)
        .getByText(pasteNotificationsMessages.hasConflictingErrorsDescription.defaultMessage)).toBeInTheDocument();
      expect(within(conflictingErrorsAlert)
        .getByText(pasteNotificationsMessages.hasConflictingErrorsButtonText.defaultMessage)).toBeInTheDocument();
      clipboardMockResponse.staticFileNotices.conflictingFiles.forEach((fileName) => {
        expect(within(conflictingErrorsAlert).getByText(fileName)).toBeInTheDocument();
      });

      userEvent.click(within(conflictingErrorsAlert).getByText(/Dismiss/i));

      expect(queryByTestId('has-conflicting-errors-alert')).toBeNull();
    });

    it('displays a notification about error files after pasting a component', async () => {
      const {
        queryByTestId, getByTestId, getByRole,
      } = render(<RootWrapper />);

      axiosMock
        .onGet(getCourseUnitApiUrl(courseId))
        .reply(200, {
          ...courseUnitIndexMock,
          enable_copy_paste_units: true,
        });

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          user_clipboard: clipboardUnit,
        });

      await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      userEvent.click(getByRole('button', { name: courseSequenceMessages.pasteAsNewUnitLink.defaultMessage }));

      const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
      const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
      set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
        ...updatedAncestorsChild.child_info.children,
        courseUnitMock,
      ]);

      axiosMock
        .onPost(postXBlockBaseApiUrl(postXBlockBody))
        .reply(200, clipboardMockResponse);
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...updatedCourseSectionVerticalData,
        });

      global.localStorage.setItem('staticFileNotices', JSON.stringify(clipboardMockResponse.staticFileNotices));
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      await executeThunk(createNewCourseXBlock(camelCaseObject(postXBlockBody), null, blockId), store.dispatch);
      const errorFilesAlert = getByTestId('has-error-files-alert');

      expect(within(errorFilesAlert)
        .getByText(pasteNotificationsMessages.hasErrorsTitle.defaultMessage)).toBeInTheDocument();
      expect(within(errorFilesAlert)
        .getByText(pasteNotificationsMessages.hasErrorsDescription.defaultMessage)).toBeInTheDocument();

      userEvent.click(within(errorFilesAlert).getByText(/Dismiss/i));

      expect(queryByTestId('has-error-files')).toBeNull();
    });

    it('should hide the "Paste component" block if canPasteComponent is false', async () => {
      const { queryByText, queryByRole } = render(<RootWrapper />);

      axiosMock
        .onGet(getCourseVerticalChildrenApiUrl(blockId))
        .reply(200, {
          ...courseVerticalChildrenMock,
          canPasteComponent: false,
        });

      await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);

      expect(queryByRole('button', {
        name: messages.pasteButtonText.defaultMessage,
      })).not.toBeInTheDocument();
      expect(queryByText(
        pasteComponentMessages.pasteButtonWhatsInClipboardText.defaultMessage,
      )).not.toBeInTheDocument();
    });
  });

  describe('Drag and drop', () => {
    it('checks xblock list is restored to original order when API call fails', async () => {
      const { findAllByRole } = render(<RootWrapper />);

      const xBlocksDraggers = await findAllByRole('button', { name: 'Drag to reorder' });
      const draggableButton = xBlocksDraggers[1];

      axiosMock
        .onPut(getXBlockBaseApiUrl(blockId))
        .reply(500, { dummy: 'value' });

      const xBlock1 = store.getState().courseUnit.courseVerticalChildren.children[0].id;

      fireEvent.keyDown(draggableButton, { key: 'ArrowUp' });

      await waitFor(async () => {
        fireEvent.keyDown(draggableButton, { code: 'Space' });

        const saveStatus = store.getState().courseUnit.savingStatus;
        expect(saveStatus).toEqual(RequestStatus.FAILED);
      });

      const xBlock1New = store.getState().courseUnit.courseVerticalChildren.children[0].id;
      expect(xBlock1).toBe(xBlock1New);
    });

    it('check that new xblock list is saved when dragged', async () => {
      const { findAllByRole } = render(<RootWrapper />);

      const xBlocksDraggers = await findAllByRole('button', { name: 'Drag to reorder' });
      const draggableButton = xBlocksDraggers[1];

      axiosMock
        .onPut(getXBlockBaseApiUrl(blockId))
        .reply(200, { dummy: 'value' });

      const xBlock1 = store.getState().courseUnit.courseVerticalChildren.children[0].id;

      fireEvent.keyDown(draggableButton, { key: 'ArrowUp' });

      await waitFor(async () => {
        fireEvent.keyDown(draggableButton, { code: 'Space' });

        const saveStatus = store.getState().courseUnit.savingStatus;
        expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      const xBlock2 = store.getState().courseUnit.courseVerticalChildren.children[1].id;
      expect(xBlock1).toBe(xBlock2);
    });
  });

  it('should expand xblocks when "Expand all" button is clicked', async () => {
    const { getByRole, getAllByTestId } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, courseVerticalChildrenMock);

    await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);

    const expandAllXBlocksBtn = getByRole('button', { name: messages.expandAllButton.defaultMessage });
    const unitXBlocks = getAllByTestId('course-xblock');

    unitXBlocks.forEach((unitXBlock) => {
      const unitXBlockContentSections = unitXBlock.querySelectorAll('.pgn__card-section');
      expect(unitXBlockContentSections).toHaveLength(0);
    });

    userEvent.click(expandAllXBlocksBtn);

    await waitFor(() => {
      const collapseAllXBlocksBtn = getByRole('button', { name: messages.collapseAllButton.defaultMessage });
      expect(collapseAllXBlocksBtn).toBeInTheDocument();

      unitXBlocks.forEach((unitXBlock) => {
        const unitXBlockContentSections = unitXBlock.querySelectorAll('.pgn__card-section');
        // xblock content appears inside the xblock element
        expect(unitXBlockContentSections.length).toBeGreaterThan(0);
      });
    });
  });
});
