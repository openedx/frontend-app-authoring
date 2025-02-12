import MockAdapter from 'axios-mock-adapter';
import {
  act, render, waitFor, within, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  camelCaseObject,
  getConfig,
  initializeMockApp,
  setConfig,
} from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { cloneDeep, set } from 'lodash';

import {
  getCourseSectionVerticalApiUrl,
  getCourseUnitApiUrl,
  getCourseVerticalChildrenApiUrl,
  getCourseOutlineInfoUrl,
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
  getCourseOutlineInfoQuery,
  patchUnitItemQuery,
} from './data/thunk';
import initializeStore from '../store';
import {
  courseCreateXblockMock,
  courseSectionVerticalMock,
  courseUnitIndexMock,
  courseUnitMock,
  courseVerticalChildrenMock,
  clipboardMockResponse,
  courseOutlineInfoMock,
} from './__mocks__';
import { clipboardUnit, clipboardXBlock } from '../__mocks__';
import { executeThunk } from '../utils';
import { IFRAME_FEATURE_POLICY } from '../constants';
import pasteComponentMessages from '../generic/clipboard/paste-component/messages';
import pasteNotificationsMessages from './clipboard/paste-notification/messages';
import headerNavigationsMessages from './header-navigations/messages';
import headerTitleMessages from './header-title/messages';
import courseSequenceMessages from './course-sequence/messages';
import sidebarMessages from './sidebar/messages';
import { extractCourseUnitId } from './sidebar/utils';
import CourseUnit from './CourseUnit';

import { getClipboardUrl } from '../generic/data/api';
import configureModalMessages from '../generic/configure-modal/messages';
import { getContentTaxonomyTagsApiUrl, getContentTaxonomyTagsCountApiUrl } from '../content-tags-drawer/data/api';
import addComponentMessages from './add-component/messages';
import { messageTypes, PUBLISH_TYPES, UNIT_VISIBILITY_STATES } from './constants';
import { IframeProvider } from './context/iFrameContext';
import moveModalMessages from './move-modal/messages';
import xblockContainerIframeMessages from './xblock-container-iframe/messages';
import messages from './messages';

let axiosMock;
let store;
const courseId = '123';
const blockId = '567890';
const unitDisplayName = courseUnitIndexMock.metadata.display_name;
const mockedUsedNavigate = jest.fn();
const userName = 'openedx';
const handleConfigureSubmitMock = jest.fn();

const {
  block_id: id,
  user_partition_info: userPartitionInfo,
} = courseVerticalChildrenMock.children[0];
const userPartitionInfoFormatted = camelCaseObject(userPartitionInfo);

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
  useMutation: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
}));

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

global.BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

/**
 * Simulates receiving a post message event for testing purposes.
 * This can be used to mimic events like deletion or other actions
 * sent from Backbone or other sources via postMessage.
 *
 * @param {string} type - The type of the message event (e.g., 'deleteXBlock').
 * @param {Object} payload - The payload data for the message event.
 */
function simulatePostMessageEvent(type, payload) {
  const messageEvent = new MessageEvent('message', {
    data: { type, payload },
  });

  window.dispatchEvent(messageEvent);
}

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <IframeProvider>
        <CourseUnit courseId={courseId} />
      </IframeProvider>
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
    window.scrollTo = jest.fn();
    global.localStorage.clear();
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getClipboardUrl())
      .reply(200, clipboardUnit);
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

  it('renders the course unit iframe with correct attributes', async () => {
    const { getByTitle } = render(<RootWrapper />);

    await waitFor(() => {
      const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toHaveAttribute('src', `${getConfig().STUDIO_BASE_URL}/container_embed/${blockId}`);
      expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
      expect(iframe).toHaveAttribute('style', 'width: 100%; height: 0px;');
      expect(iframe).toHaveAttribute('scrolling', 'no');
      expect(iframe).toHaveAttribute('referrerpolicy', 'origin');
      expect(iframe).toHaveAttribute('loading', 'lazy');
      expect(iframe).toHaveAttribute('frameborder', '0');
    });
  });

  it('adjusts iframe height dynamically based on courseXBlockDropdownHeight postMessage event', async () => {
    const { getByTitle } = render(<RootWrapper />);

    await waitFor(() => {
      const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toHaveAttribute('style', 'width: 100%; height: 0px;');
      simulatePostMessageEvent(messageTypes.toggleCourseXBlockDropdown, {
        courseXBlockDropdownHeight: 200,
      });
      expect(iframe).toHaveAttribute('style', 'width: 100%; height: 200px;');
    });
  });

  it('checks whether xblock is removed when the corresponding delete button is clicked and the sidebar is the updated', async () => {
    const {
      getByTitle, getByText, queryByRole, getAllByRole, getByRole,
    } = render(<RootWrapper />);

    await waitFor(() => {
      const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toHaveAttribute(
        'aria-label',
        xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
          .replace('{xblockCount}', courseVerticalChildrenMock.children.length),
      );

      simulatePostMessageEvent(messageTypes.deleteXBlock, {
        usageId: courseVerticalChildrenMock.children[0].block_id,
      });

      expect(getByText(/Delete this component?/i)).toBeInTheDocument();
      expect(getByText(/Deleting this component is permanent and cannot be undone./i)).toBeInTheDocument();

      expect(getByRole('dialog')).toBeInTheDocument();

      // Find the Cancel and Delete buttons within the iframe by their specific classes
      const cancelButton = getAllByRole('button', { name: /Cancel/i })
        .find(({ classList }) => classList.contains('btn-tertiary'));
      const deleteButton = getAllByRole('button', { name: /Delete/i })
        .find(({ classList }) => classList.contains('btn-primary'));

      expect(cancelButton).toBeInTheDocument();

      simulatePostMessageEvent(messageTypes.deleteXBlock, {
        usageId: courseVerticalChildrenMock.children[0].block_id,
      });

      expect(getByRole('dialog')).toBeInTheDocument();
      userEvent.click(deleteButton);
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
    });

    axiosMock
      .onDelete(getXBlockBaseApiUrl(courseVerticalChildrenMock.children[0].block_id))
      .reply(200, { dummy: 'value' });
    await executeThunk(deleteUnitItemQuery(
      courseId,
      courseVerticalChildrenMock.children[0].block_id,
      simulatePostMessageEvent,
    ), store.dispatch);

    const updatedCourseVerticalChildren = courseVerticalChildrenMock.children.filter(
      child => child.block_id !== courseVerticalChildrenMock.children[0].block_id,
    );

    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, {
        children: updatedCourseVerticalChildren,
        isPublished: false,
        canPasteComponent: true,
      });
    await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);

    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, courseUnitIndexMock);
    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(() => {
      const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toHaveAttribute(
        'aria-label',
        xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
          .replace('{xblockCount}', updatedCourseVerticalChildren.length),
      );
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
  });

  it('checks if xblock is a duplicate when the corresponding duplicate button is clicked and if the sidebar status is updated', async () => {
    const {
      getByTitle, getByRole, getByText, queryByRole,
    } = render(<RootWrapper />);

    simulatePostMessageEvent(messageTypes.duplicateXBlock, {
      id: courseVerticalChildrenMock.children[0].block_id,
    });

    axiosMock
      .onPost(postXBlockBaseApiUrl({
        parent_locator: blockId,
        duplicate_source_locator: courseVerticalChildrenMock.children[0].block_id,
      }))
      .replyOnce(200, { locator: '1234567890' });

    const updatedCourseVerticalChildren = [
      ...courseVerticalChildrenMock.children,
      {
        ...courseVerticalChildrenMock.children[0],
        name: 'New Cloned XBlock',
      },
    ];

    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, {
        ...courseVerticalChildrenMock,
        children: updatedCourseVerticalChildren,
      });

    await waitFor(() => {
      userEvent.click(getByRole('button', { name: sidebarMessages.actionButtonPublishTitle.defaultMessage }));

      const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toHaveAttribute(
        'aria-label',
        xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
          .replace('{xblockCount}', courseVerticalChildrenMock.children.length),
      );

      simulatePostMessageEvent(messageTypes.duplicateXBlock, {
        id: courseVerticalChildrenMock.children[0].block_id,
      });
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
    });

    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, courseUnitIndexMock);
    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(() => {
      const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toHaveAttribute(
        'aria-label',
        xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
          .replace('{xblockCount}', updatedCourseVerticalChildren.length),
      );

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
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          display_name: newDisplayName,
        },
        xblock: {
          ...courseSectionVerticalMock.xblock,
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
    userEvent.click(editTitleButton);
    titleEditField = getByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });

    await userEvent.clear(titleEditField);
    await userEvent.type(titleEditField, newDisplayName);
    await userEvent.tab();

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
        name: new RegExp(`problem ${addComponentMessages.buttonText.defaultMessage} Problem`, 'i'),
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
    userEvent.click(editTitleButton);

    const titleEditField = within(unitHeaderTitle).getByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });

    await userEvent.clear(titleEditField);
    await userEvent.type(titleEditField, newDisplayName);
    await userEvent.tab();

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
    render(<RootWrapper />);

    await waitFor(() => {
      const unpublishedAlert = screen.getAllByRole('alert').find(
        (el) => el.classList.contains('alert-content'),
      );
      expect(unpublishedAlert).toHaveTextContent(messages.alertUnpublishedVersion.defaultMessage);
      expect(unpublishedAlert).toHaveClass('alert-warning');
    });
  });

  it('should not display an unpublished alert for a course unit with explicit staff lock and unpublished status', async () => {
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseUnitApiUrl(courseId))
      .reply(200, {
        ...courseUnitIndexMock,
        currently_visible_to_students: false,
      });

    await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);

    await waitFor(() => {
      const alert = screen.queryAllByRole('alert').find(
        (el) => el.classList.contains('alert-content'),
      );
      expect(alert).toBeUndefined();
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
        metadata: { visible_to_staff_only: true, group_access: { 50: [2] }, discussion_enabled: true },
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

  it('shows the Tags sidebar when enabled', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    const { getByText } = render(<RootWrapper />);
    await waitFor(() => { expect(getByText('Unit tags')).toBeInTheDocument(); });
  });

  it('hides the Tags sidebar when not enabled', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
    });
    const { queryByText } = render(<RootWrapper />);
    await waitFor(() => { expect(queryByText('Unit tags')).not.toBeInTheDocument(); });
  });

  describe('Copy paste functionality', () => {
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

    it('should increase the number of course XBlocks after copying and pasting a block', async () => {
      const { getByRole, getByTitle } = render(<RootWrapper />);

      simulatePostMessageEvent(messageTypes.copyXBlock, {
        id: courseVerticalChildrenMock.children[0].block_id,
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
        const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        expect(iframe).toHaveAttribute(
          'aria-label',
          xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
            .replace('{xblockCount}', courseVerticalChildrenMock.children.length),
        );

        simulatePostMessageEvent(messageTypes.copyXBlock, {
          id: courseVerticalChildrenMock.children[0].block_id,
        });
      });

      const updatedCourseVerticalChildren = [
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
        },
      ];

      axiosMock
        .onGet(getCourseVerticalChildrenApiUrl(blockId))
        .reply(200, {
          ...courseVerticalChildrenMock,
          children: updatedCourseVerticalChildren,
        });

      await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);

      await waitFor(() => {
        const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        expect(iframe).toHaveAttribute(
          'aria-label',
          xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
            .replace('{xblockCount}', updatedCourseVerticalChildren.length),
        );
      });
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
        .reply(200, updatedCourseSectionVerticalData);

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

  describe('Move functionality', () => {
    const requestData = {
      sourceLocator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@867dddb6f55d410caaa9c1eb9c6743ec',
      targetParentLocator: 'block-v1:edX+DemoX+Demo_Course+type@course+block@course',
      title: 'Getting Started',
      currentParentLocator: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5',
      isMoving: true,
      callbackFn: jest.fn(),
    };
    const messageEvent = new MessageEvent('message', {
      data: {
        type: messageTypes.showMoveXBlockModal,
        payload: {
          sourceXBlockInfo: {
            id: requestData.sourceLocator,
            displayName: requestData.title,
          },
          sourceParentXBlockInfo: {
            id: requestData.currentParentLocator,
            category: 'vertical',
            hasChildren: true,
          },
        },
      },
      origin: '*',
    });

    it('should display "Move Modal" on receive trigger message', async () => {
      const {
        getByText,
        getByRole,
      } = render(<RootWrapper />);

      await act(async () => {
        await waitFor(() => {
          expect(getByText(unitDisplayName))
            .toBeInTheDocument();
        });

        axiosMock
          .onGet(getCourseOutlineInfoUrl(courseId))
          .reply(200, courseOutlineInfoMock);
        await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);

        window.dispatchEvent(messageEvent);
      });

      expect(getByText(
        moveModalMessages.moveModalTitle.defaultMessage.replace('{displayName}', requestData.title),
      )).toBeInTheDocument();
      expect(getByRole('button', { name: moveModalMessages.moveModalSubmitButton.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: moveModalMessages.moveModalCancelButton.defaultMessage })).toBeInTheDocument();
    });

    it('should navigates to xBlock current unit', async () => {
      const {
        getByText,
        getByRole,
      } = render(<RootWrapper />);

      await act(async () => {
        await waitFor(() => {
          expect(getByText(unitDisplayName))
            .toBeInTheDocument();
        });

        axiosMock
          .onGet(getCourseOutlineInfoUrl(courseId))
          .reply(200, courseOutlineInfoMock);
        await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);

        window.dispatchEvent(messageEvent);
      });

      expect(getByText(
        moveModalMessages.moveModalTitle.defaultMessage.replace('{displayName}', requestData.title),
      )).toBeInTheDocument();

      const currentSection = courseOutlineInfoMock.child_info.children[1];
      const currentSectionItemBtn = getByRole('button', {
        name: `${currentSection.display_name} ${moveModalMessages.moveModalOutlineItemCurrentLocationText.defaultMessage} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
      });
      expect(currentSectionItemBtn).toBeInTheDocument();
      userEvent.click(currentSectionItemBtn);

      await waitFor(() => {
        const currentSubsection = currentSection.child_info.children[0];
        const currentSubsectionItemBtn = getByRole('button', {
          name: `${currentSubsection.display_name} ${moveModalMessages.moveModalOutlineItemCurrentLocationText.defaultMessage} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
        });
        expect(currentSubsectionItemBtn).toBeInTheDocument();
        userEvent.click(currentSubsectionItemBtn);
      });

      await waitFor(() => {
        const currentComponentLocationText = getByText(
          moveModalMessages.moveModalOutlineItemCurrentComponentLocationText.defaultMessage,
        );
        expect(currentComponentLocationText).toBeInTheDocument();
      });
    });

    it('should allow move operation and handles it successfully', async () => {
      const {
        getByText,
        getByRole,
      } = render(<RootWrapper />);

      axiosMock
        .onPatch(postXBlockBaseApiUrl())
        .reply(200, {});

      axiosMock
        .onGet(getCourseUnitApiUrl(blockId))
        .reply(200, courseUnitIndexMock);

      await act(async () => {
        await waitFor(() => {
          expect(getByText(unitDisplayName))
            .toBeInTheDocument();
        });

        axiosMock
          .onGet(getCourseOutlineInfoUrl(courseId))
          .reply(200, courseOutlineInfoMock);
        await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);

        window.dispatchEvent(messageEvent);
      });

      expect(getByText(
        moveModalMessages.moveModalTitle.defaultMessage.replace('{displayName}', requestData.title),
      )).toBeInTheDocument();

      const currentSection = courseOutlineInfoMock.child_info.children[1];
      const currentSectionItemBtn = getByRole('button', {
        name: `${currentSection.display_name} ${moveModalMessages.moveModalOutlineItemCurrentLocationText.defaultMessage} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
      });
      expect(currentSectionItemBtn).toBeInTheDocument();
      userEvent.click(currentSectionItemBtn);

      const currentSubsection = currentSection.child_info.children[1];
      await waitFor(() => {
        const currentSubsectionItemBtn = getByRole('button', {
          name: `${currentSubsection.display_name} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
        });
        expect(currentSubsectionItemBtn).toBeInTheDocument();
        userEvent.click(currentSubsectionItemBtn);
      });

      await waitFor(() => {
        const currentUnit = currentSubsection.child_info.children[0];
        const currentUnitItemBtn = getByRole('button', {
          name: `${currentUnit.display_name} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
        });
        expect(currentUnitItemBtn).toBeInTheDocument();
        userEvent.click(currentUnitItemBtn);
      });

      const moveModalBtn = getByRole('button', {
        name: moveModalMessages.moveModalSubmitButton.defaultMessage,
      });
      expect(moveModalBtn).toBeInTheDocument();
      expect(moveModalBtn).not.toBeDisabled();
      userEvent.click(moveModalBtn);

      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
      });
    });

    it('should display "Move Confirmation" alert after moving and undo operations', async () => {
      const {
        queryByRole,
        getByText,
      } = render(<RootWrapper />);

      axiosMock
        .onPatch(postXBlockBaseApiUrl())
        .reply(200, {});

      await executeThunk(patchUnitItemQuery({
        sourceLocator: requestData.sourceLocator,
        targetParentLocator: requestData.targetParentLocator,
        title: requestData.title,
        currentParentLocator: requestData.currentParentLocator,
        isMoving: requestData.isMoving,
        callbackFn: requestData.callbackFn,
      }), store.dispatch);

      simulatePostMessageEvent(messageTypes.rollbackMovedXBlock, { locator: requestData.sourceLocator });

      const dismissButton = queryByRole('button', {
        name: /dismiss/i, hidden: true,
      });
      const undoButton = queryByRole('button', {
        name: messages.undoMoveButton.defaultMessage, hidden: true,
      });
      const newLocationButton = queryByRole('button', {
        name: messages.newLocationButton.defaultMessage, hidden: true,
      });

      expect(getByText(messages.alertMoveSuccessTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(`${requestData.title} has been moved`)).toBeInTheDocument();
      expect(dismissButton).toBeInTheDocument();
      expect(undoButton).toBeInTheDocument();
      expect(newLocationButton).toBeInTheDocument();

      userEvent.click(undoButton);

      await waitFor(() => {
        expect(getByText(messages.alertMoveCancelTitle.defaultMessage)).toBeInTheDocument();
      });
      expect(getByText(
        messages.alertMoveCancelDescription.defaultMessage.replace('{title}', requestData.title),
      )).toBeInTheDocument();
      expect(dismissButton).toBeInTheDocument();
      expect(undoButton).not.toBeInTheDocument();
      expect(newLocationButton).not.toBeInTheDocument();
    });

    it('should navigate to new location by button click', async () => {
      const {
        queryByRole,
      } = render(<RootWrapper />);

      axiosMock
        .onPatch(postXBlockBaseApiUrl())
        .reply(200, {});

      await executeThunk(patchUnitItemQuery({
        sourceLocator: requestData.sourceLocator,
        targetParentLocator: requestData.targetParentLocator,
        title: requestData.title,
        currentParentLocator: requestData.currentParentLocator,
        isMoving: requestData.isMoving,
        callbackFn: requestData.callbackFn,
      }), store.dispatch);

      const newLocationButton = queryByRole('button', {
        name: messages.newLocationButton.defaultMessage, hidden: true,
      });
      userEvent.click(newLocationButton);
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        `/course/${courseId}/container/${blockId}/${requestData.currentParentLocator}`,
        { replace: true },
      );
    });
  });

  describe('XBlock restrict access', () => {
    it('opens xblock restrict access modal successfully', () => {
      const {
        getByTitle, getByTestId,
      } = render(<RootWrapper />);

      const modalSubtitleText = configureModalMessages.restrictAccessTo.defaultMessage;
      const modalCancelBtnText = configureModalMessages.cancelButton.defaultMessage;
      const modalSaveBtnText = configureModalMessages.saveButton.defaultMessage;

      waitFor(() => {
        const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        const usageId = courseVerticalChildrenMock.children[0].block_id;
        expect(iframe).toBeInTheDocument();

        simulatePostMessageEvent(messageTypes.manageXBlockAccess, {
          usageId,
        });
      });

      waitFor(() => {
        const configureModal = getByTestId('configure-modal');

        expect(within(configureModal).getByText(modalSubtitleText)).toBeInTheDocument();
        expect(within(configureModal).getByRole('button', { name: modalCancelBtnText })).toBeInTheDocument();
        expect(within(configureModal).getByRole('button', { name: modalSaveBtnText })).toBeInTheDocument();
      });
    });

    it('closes xblock restrict access modal when cancel button is clicked', async () => {
      const {
        getByTitle, queryByTestId, getByTestId,
      } = render(<RootWrapper />);

      waitFor(() => {
        const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        expect(iframe).toBeInTheDocument();
        simulatePostMessageEvent(messageTypes.manageXBlockAccess, {
          usageId: courseVerticalChildrenMock.children[0].block_id,
        });
      });

      waitFor(() => {
        const configureModal = getByTestId('configure-modal');
        expect(configureModal).toBeInTheDocument();
        userEvent.click(within(configureModal).getByRole('button', {
          name: configureModalMessages.cancelButton.defaultMessage,
        }));
        expect(handleConfigureSubmitMock).not.toHaveBeenCalled();
      });

      expect(queryByTestId('configure-modal')).not.toBeInTheDocument();
    });

    it('handles submit xblock restrict access data when save button is clicked', async () => {
      axiosMock
        .onPost(getXBlockBaseApiUrl(id), {
          publish: PUBLISH_TYPES.republish,
          metadata: { visible_to_staff_only: false, group_access: { 970807507: [1959537066] } },
        })
        .reply(200, { dummy: 'value' });

      const {
        getByTitle, getByRole, getByTestId,
      } = render(<RootWrapper />);

      const accessGroupName1 = userPartitionInfoFormatted.selectablePartitions[0].groups[0].name;
      const accessGroupName2 = userPartitionInfoFormatted.selectablePartitions[0].groups[1].name;

      waitFor(() => {
        const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        expect(iframe).toBeInTheDocument();
        simulatePostMessageEvent(messageTypes.manageXBlockAccess, {
          usageId: courseVerticalChildrenMock.children[0].block_id,
        });
      });

      waitFor(() => {
        const configureModal = getByTestId('configure-modal');
        expect(configureModal).toBeInTheDocument();

        expect(within(configureModal).queryByText(accessGroupName1)).not.toBeInTheDocument();
        expect(within(configureModal).queryByText(accessGroupName2)).not.toBeInTheDocument();

        const restrictAccessSelect = getByRole('combobox', {
          name: configureModalMessages.restrictAccessTo.defaultMessage,
        });

        userEvent.selectOptions(restrictAccessSelect, '0');

        // eslint-disable-next-line array-callback-return
        userPartitionInfoFormatted.selectablePartitions[0].groups.map((group) => {
          expect(within(configureModal).getByRole('checkbox', { name: group.name })).not.toBeChecked();
          expect(within(configureModal).queryByText(group.name)).toBeInTheDocument();
        });

        const group1Checkbox = within(configureModal).getByRole('checkbox', { name: accessGroupName1 });
        userEvent.click(group1Checkbox);
        expect(group1Checkbox).toBeChecked();

        const saveModalBtnText = within(configureModal).getByRole('button', {
          name: configureModalMessages.saveButton.defaultMessage,
        });
        expect(saveModalBtnText).toBeInTheDocument();

        userEvent.click(saveModalBtnText);
        expect(handleConfigureSubmitMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('renders and navigates to the new HTML XBlock editor after xblock duplicating', async () => {
    const { getByTitle } = render(<RootWrapper />);
    const updatedCourseVerticalChildrenMock = JSON.parse(JSON.stringify(courseVerticalChildrenMock));
    const targetBlockId = updatedCourseVerticalChildrenMock.children[1].block_id;

    updatedCourseVerticalChildrenMock.children = updatedCourseVerticalChildrenMock.children
      .map((child) => (child.block_id === targetBlockId
        ? { ...child, block_type: 'html' }
        : child));

    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, updatedCourseVerticalChildrenMock);

    await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);

    await waitFor(() => {
      const iframe = getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toBeInTheDocument();
      simulatePostMessageEvent(messageTypes.currentXBlockId, {
        id: targetBlockId,
      });
    });

    waitFor(() => {
      simulatePostMessageEvent(messageTypes.duplicateXBlock, {});
      simulatePostMessageEvent(messageTypes.newXBlockEditor, {});
      expect(mockedUsedNavigate)
        .toHaveBeenCalledWith(`/course/${courseId}/editor/html/${targetBlockId}`, { replace: true });
    });
  });

  describe('Library Content page', () => {
    const newUnitId = '12345';
    const sequenceId = courseSectionVerticalMock.subsection_location;

    beforeEach(async () => {
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          xblock: {
            ...courseSectionVerticalMock.xblock,
            category: 'library_content',
          },
          xblock_info: {
            ...courseSectionVerticalMock.xblock_info,
            category: 'library_content',
          },
        });
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    });

    it('navigates to library content page on receive window event', () => {
      render(<RootWrapper />);

      simulatePostMessageEvent(messageTypes.handleViewXBlockContent, { usageId: newUnitId });
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseId}/container/${newUnitId}/${sequenceId}`);
    });

    it('should render library content page correctly', async () => {
      const {
        getByText,
        getByRole,
        queryByRole,
        getByTestId,
      } = render(<RootWrapper />);

      const currentSectionName = courseUnitIndexMock.ancestor_info.ancestors[1].display_name;
      const currentSubSectionName = courseUnitIndexMock.ancestor_info.ancestors[1].display_name;

      await waitFor(() => {
        const unitHeaderTitle = getByTestId('unit-header-title');
        expect(getByText(unitDisplayName)).toBeInTheDocument();
        expect(within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage })).toBeInTheDocument();
        expect(within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonSettings.defaultMessage })).toBeInTheDocument();
        expect(getByRole('button', { name: currentSectionName })).toBeInTheDocument();
        expect(getByRole('button', { name: currentSubSectionName })).toBeInTheDocument();

        expect(queryByRole('heading', { name: addComponentMessages.title.defaultMessage })).not.toBeInTheDocument();
        expect(queryByRole('button', { name: headerNavigationsMessages.viewLiveButton.defaultMessage })).not.toBeInTheDocument();
        expect(queryByRole('button', { name: headerNavigationsMessages.previewButton.defaultMessage })).not.toBeInTheDocument();

        expect(queryByRole('heading', { name: /unit tags/i })).not.toBeInTheDocument();
        expect(queryByRole('heading', { name: /unit location/i })).not.toBeInTheDocument();
      });
    });
  });
});
