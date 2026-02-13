import fetchMock from 'fetch-mock-jest';
import userEvent from '@testing-library/user-event';
import {
  camelCaseObject,
  getConfig,
  setConfig,
} from '@edx/frontend-platform';
import { cloneDeep, set } from 'lodash';

import {
  act,
  cleanup,
  fireEvent,
  initializeMocks,
  render,
  waitFor,
  within,
  screen,
} from '@src/testUtils';
import mockResult from '@src/library-authoring/__mocks__/library-search.json';
import { IFRAME_FEATURE_POLICY } from '@src/constants';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import pasteComponentMessages from '@src/generic/clipboard/paste-component/messages';
import { getClipboardUrl } from '@src/generic/data/api';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { getDownstreamApiUrl } from '@src/generic/unlink-modal/data/api';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import {
  mockContentLibrary,
  mockGetContentLibraryV2List,
  mockLibraryBlockMetadata,
} from '@src/library-authoring/data/api.mocks';

import { mockContentSearchConfig } from '@src/search-manager/data/api.mock';
import {
  getCourseSectionVerticalApiUrl,
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
  fetchCourseVerticalChildrenData,
  getCourseOutlineInfoQuery,
  patchUnitItemQuery,
} from './data/thunk';
import {
  courseCreateXblockMock,
  courseSectionVerticalMock,
  courseUnitMock,
  courseVerticalChildrenMock,
  clipboardMockResponse,
  courseOutlineInfoMock,
} from './__mocks__';
import { clipboardUnit } from '../__mocks__';
import { executeThunk } from '../utils';
import pasteNotificationsMessages from './clipboard/paste-notification/messages';
import headerTitleMessages from './header-title/messages';
import courseSequenceMessages from './course-sequence/messages';
import { extractCourseUnitId } from './legacy-sidebar/utils';
import CourseUnit from './CourseUnit';

import tagsDrawerMessages from '../content-tags-drawer/messages';
import configureModalMessages from '../generic/configure-modal/messages';
import { getContentTaxonomyTagsApiUrl, getContentTaxonomyTagsCountApiUrl } from '../content-tags-drawer/data/api';
import addComponentMessages from './add-component/messages';
import { messageTypes, PUBLISH_TYPES, UNIT_VISIBILITY_STATES } from './constants';
import moveModalMessages from './move-modal/messages';
import xblockContainerIframeMessages from './xblock-container-iframe/messages';
import headerNavigationsMessages from './header-navigations/messages';
import legacySidebarMessages from './legacy-sidebar/messages';
import unitInfoMessages from './unit-sidebar/unit-info/messages';
import messages from './messages';

let axiosMock;
let store;
const courseId = '123';
const blockId = '567890';
const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5';
const unitDisplayName = courseSectionVerticalMock.xblock_info.display_name;
const mockedUsedNavigate = jest.fn();
const userName = 'openedx';
const handleConfigureSubmitMock = jest.fn();
mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockGetContentLibraryV2List.applyMock();
mockLibraryBlockMetadata.applyMock();

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
  useParams: () => ({ blockId, sequenceId }),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('@src/studio-home/hooks', () => ({
  useStudioHome: () => ({
    isLoadingPage: false,
    isFailedLoadingPage: false,
    librariesV2Enabled: true,
  }),
}));

/**
 * Simulates receiving a post message event for testing purposes.
 * This can be used to mimic events like deletion or other actions
 * sent from Backbone or other sources via postMessage.
 *
 * @param type - The type of the message event (e.g., 'deleteXBlock').
 * @param payload - The payload data for the message event.
 */
function simulatePostMessageEvent(type: string, payload?: object) {
  const messageEvent = new MessageEvent('message', {
    data: { type, payload },
  });

  window.dispatchEvent(messageEvent);
}

const RootWrapper = () => (
  <IframeProvider>
    <CourseAuthoringProvider courseId={courseId}>
      <CourseUnit />
    </CourseAuthoringProvider>
  </IframeProvider>
);

describe('<CourseUnit />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    window.scrollTo = jest.fn();
    global.localStorage.clear();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getClipboardUrl())
      .reply(200, clipboardUnit);
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId, courseId), store.dispatch);
    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, courseVerticalChildrenMock);
    await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);
    axiosMock
      .onGet(getContentTaxonomyTagsApiUrl(blockId))
      .reply(200, { taxonomies: [] });
    axiosMock
      .onGet(getContentTaxonomyTagsCountApiUrl(blockId))
      .reply(200, 17);
  });

  it('render CourseUnit component correctly', async () => {
    render(<RootWrapper />);
    const currentSectionName = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[1].display_name;
    const currentSubSectionName = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[1].display_name;

    const unitHeaderTitle = await screen.findByTestId('unit-header-title');
    expect(screen.getByText(unitDisplayName)).toBeInTheDocument();
    expect(within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonSettings.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: headerNavigationsMessages.viewLiveButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: headerNavigationsMessages.previewButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: currentSectionName })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: currentSubSectionName })).toBeInTheDocument();
  });

  it('renders the course unit iframe with correct attributes', async () => {
    render(<RootWrapper />);

    const iframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(iframe).toHaveAttribute('src', `${getConfig().STUDIO_BASE_URL}/container_embed/${blockId}`);
    expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
    expect(iframe).toHaveAttribute('style', 'height: 0px;');
    expect(iframe).toHaveAttribute('scrolling', 'no');
    expect(iframe).toHaveAttribute('referrerpolicy', 'origin');
    expect(iframe).toHaveAttribute('loading', 'lazy');
    expect(iframe).toHaveAttribute('frameborder', '0');
  });

  it('adjusts iframe height dynamically based on courseXBlockDropdownHeight postMessage event', async () => {
    render(<RootWrapper />);

    let iframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(iframe).toHaveAttribute('style', 'height: 0px;');
    simulatePostMessageEvent(messageTypes.toggleCourseXBlockDropdown, {
      courseXBlockDropdownHeight: 200,
    });
    iframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(iframe).toHaveAttribute('style', 'height: 200px;');
  });

  it('displays an error alert when a studioAjaxError message is received', async () => {
    render(<RootWrapper />);

    const xblocksIframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(xblocksIframe).toBeInTheDocument();
    simulatePostMessageEvent(messageTypes.studioAjaxError, {
      error: 'Some error text...',
    });
    expect(await screen.findByTestId('saving-error-alert')).toBeInTheDocument();
  });

  it('renders XBlock iframe and opens legacy edit modal on editXBlock message', async () => {
    render(<RootWrapper />);

    const xblocksIframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(xblocksIframe).toBeInTheDocument();
    simulatePostMessageEvent(messageTypes.editXBlock, { id: blockId });

    const legacyXBlockEditModalIframe = await screen.findByTitle(
      xblockContainerIframeMessages.legacyEditModalIframeTitle.defaultMessage,
    );
    expect(legacyXBlockEditModalIframe).toBeInTheDocument();
  });

  it('renders the xBlocks iframe and opens the tags drawer on postMessage event', async () => {
    render(<RootWrapper />);

    await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);

    simulatePostMessageEvent(messageTypes.openManageTags, { contentId: blockId });

    await screen.findByText(tagsDrawerMessages.headerSubtitle.defaultMessage);
  });

  it('closes the legacy edit modal when closeXBlockEditorModal message is received', async () => {
    render(<RootWrapper />);

    const xblocksIframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(xblocksIframe).toBeInTheDocument();
    simulatePostMessageEvent(messageTypes.closeXBlockEditorModal, { id: blockId });

    const legacyXBlockEditModalIframe = screen.queryByTitle(
      xblockContainerIframeMessages.legacyEditModalIframeTitle.defaultMessage,
    );
    expect(legacyXBlockEditModalIframe).not.toBeInTheDocument();
  });

  it('closes legacy edit modal and updates course unit sidebar after saveEditedXBlockData message', async () => {
    render(<RootWrapper />);

    const xblocksIframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(xblocksIframe).toBeInTheDocument();
    simulatePostMessageEvent(messageTypes.saveEditedXBlockData);

    const legacyXBlockEditModalIframe = screen.queryByTitle(
      xblockContainerIframeMessages.legacyEditModalIframeTitle.defaultMessage,
    );
    expect(legacyXBlockEditModalIframe).not.toBeInTheDocument();

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          has_changes: true,
          published_by: userName,
        },
      });

    const courseUnitSidebar = await screen.findByTestId('course-unit-sidebar');
    expect(
      within(courseUnitSidebar).getByText(legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage),
    ).toBeInTheDocument();
    expect(
      within(courseUnitSidebar).getByText(legacySidebarMessages.releaseStatusTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      within(courseUnitSidebar).queryByRole('button', {
        name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage,
      }),
    ).toBeInTheDocument();
  });

  it('updates course unit sidebar after receiving refreshPositions message', async () => {
    render(<RootWrapper />);

    const xblocksIframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(xblocksIframe).toBeInTheDocument();
    simulatePostMessageEvent(messageTypes.refreshPositions);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          has_changes: true,
          published_by: userName,
        },
      });

    const courseUnitSidebar = await screen.findByTestId('course-unit-sidebar');
    expect(
      within(courseUnitSidebar).getByText(legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage),
    ).toBeInTheDocument();
    expect(
      within(courseUnitSidebar).getByText(legacySidebarMessages.releaseStatusTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      within(courseUnitSidebar).queryByRole('button', {
        name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage,
      }),
    ).toBeInTheDocument();
  });

  it('checks whether xblock is removed when the corresponding delete button is clicked and the sidebar is the updated', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);

    const iframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(iframe).toHaveAttribute(
      'aria-label',
      xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
        .replace('{xblockCount}', courseVerticalChildrenMock.children.length.toString()),
    );

    simulatePostMessageEvent(messageTypes.deleteXBlock, {
      usageId: courseVerticalChildrenMock.children[0].block_id,
    });

    expect(await screen.findByText(/Delete this component?/i)).toBeInTheDocument();
    expect(await screen.findByText(/Deleting this component is permanent and cannot be undone./i)).toBeInTheDocument();

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Find the Cancel and Delete buttons within the iframe by their specific classes
    const cancelButton = await within(dialog).findByRole('button', { name: /Cancel/i });
    const deleteButton = await within(dialog).findByRole('button', { name: /Delete/i });

    expect(cancelButton).toBeInTheDocument();

    simulatePostMessageEvent(messageTypes.deleteXBlock, {
      usageId: courseVerticalChildrenMock.children[0].block_id,
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.click(deleteButton);

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.live,
          has_changes: false,
          published_by: userName,
        },
      });
    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    // check if the sidebar status is Published and Live
    expect(await screen.findByText(
      legacySidebarMessages.sidebarTitlePublishedAndLive.defaultMessage,
    )).toBeInTheDocument();
    expect(await screen.findByText(
      unitInfoMessages.publishLastPublished.defaultMessage
        .replace('{publishedOn}', courseSectionVerticalMock.xblock_info.published_on)
        .replace('{publishedBy}', userName),
    )).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage })).not.toBeInTheDocument();
    expect(await screen.findByText(unitDisplayName)).toBeInTheDocument();

    axiosMock
      .onDelete(getXBlockBaseApiUrl(courseVerticalChildrenMock.children[0].block_id))
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, courseSectionVerticalMock);
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
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    expect(await screen.findByTitle(
      xblockContainerIframeMessages.xblockIframeTitle.defaultMessage,
    )).toHaveAttribute(
      'aria-label',
      xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
        .replace('{xblockCount}', updatedCourseVerticalChildren.length.toString()),
    );
    // after removing the xblock, the sidebar status changes to Draft (unpublished changes)
    expect(await screen.findByText(
      legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage,
    )).toBeInTheDocument();
    expect(await screen.findByText(legacySidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(unitInfoMessages.visibilityVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(unitInfoMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(legacySidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(
      legacySidebarMessages.actionButtonDiscardChangesTitle.defaultMessage,
    )).toBeInTheDocument();
    expect(await screen.findByText(courseSectionVerticalMock.xblock_info.release_date)).toBeInTheDocument();
    expect(await screen.findByText(
      unitInfoMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseSectionVerticalMock.xblock_info.edited_on)
        .replace('{editedBy}', courseSectionVerticalMock.xblock_info.edited_by),
    )).toBeInTheDocument();
    expect(await screen.findByText(
      legacySidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseSectionVerticalMock.xblock_info.release_date_from),
    )).toBeInTheDocument();
  });

  it('checks if the xblock unlink is called when the corresponding unlink button is clicked', async () => {
    render(<RootWrapper />);
    const usageId = courseVerticalChildrenMock.children[0].block_id;
    axiosMock
      .onDelete(getDownstreamApiUrl(usageId))
      .reply(200);

    await waitFor(() => {
      const iframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toBeInTheDocument();
    });

    simulatePostMessageEvent(messageTypes.unlinkXBlock, {
      usageId,
    });
    expect(await screen.findByText(/Unlink this component?/i)).toBeInTheDocument();

    const dialog = await screen.findByRole('dialog');
    // Find the Unlink button
    const unlinkButton = await within(dialog).findByRole('button', { name: /confirm unlink/i });
    expect(unlinkButton).toBeInTheDocument();
    fireEvent.click(unlinkButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe(getDownstreamApiUrl(usageId));
  });

  it('checks if xblock is a duplicate when the corresponding duplicate button is clicked and if the sidebar status is updated', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);

    simulatePostMessageEvent(messageTypes.duplicateXBlock, {
      id: courseVerticalChildrenMock.children[0].block_id,
    });

    axiosMock
      .onPost(postXBlockBaseApiUrl())
      .replyOnce(200, { locator: '1234567890' });

    const updatedCourseVerticalChildren = [
      ...courseVerticalChildrenMock.children,
      {
        name: 'New Cloned XBlock',
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

    await user.click(
      await screen.findByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage }),
    );

    const iframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(iframe).toHaveAttribute(
      'aria-label',
      xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
        .replace('{xblockCount}', courseVerticalChildrenMock.children.length.toString()),
    );

    simulatePostMessageEvent(messageTypes.duplicateXBlock, {
      id: courseVerticalChildrenMock.children[0].block_id,
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.live,
          has_changes: false,
          published_by: userName,
        },
      });
    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(() => {
      // check if the sidebar status is Published and Live
      expect(screen.getByText(legacySidebarMessages.sidebarTitlePublishedAndLive.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(
        unitInfoMessages.publishLastPublished.defaultMessage
          .replace('{publishedOn}', courseSectionVerticalMock.xblock_info.published_on)
          .replace('{publishedBy}', userName),
      )).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage })).not.toBeInTheDocument();
      expect(screen.getByText(unitDisplayName)).toBeInTheDocument();
    });

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    const xblockIframe = await screen.findByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
    expect(xblockIframe).toHaveAttribute(
      'aria-label',
      xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
        .replace('{xblockCount}', updatedCourseVerticalChildren.length.toString()),
    );

    // after duplicate the xblock, the sidebar status changes to Draft (unpublished changes)
    expect(screen.getByText(
      legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage,
    )).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(unitInfoMessages.visibilityVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(unitInfoMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(courseSectionVerticalMock.xblock_info.release_date)).toBeInTheDocument();
    expect(screen.getByText(
      unitInfoMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseSectionVerticalMock.xblock_info.edited_on)
        .replace('{editedBy}', courseSectionVerticalMock.xblock_info.edited_by),
    )).toBeInTheDocument();
    expect(screen.getByText(
      legacySidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseSectionVerticalMock.xblock_info.release_date_from),
    )).toBeInTheDocument();
  });

  it('handles CourseUnit header action buttons', async () => {
    const user = userEvent.setup();
    const { open } = window;
    window.open = jest.fn();
    render(<RootWrapper />);
    const {
      draft_preview_link: draftPreviewLink,
      published_preview_link: publishedPreviewLink,
    } = courseSectionVerticalMock;

    const viewLiveButton = await screen.findByRole('button', { name: headerNavigationsMessages.viewLiveButton.defaultMessage });
    await user.click(viewLiveButton);
    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith(publishedPreviewLink, '_blank');

    const previewButton = await screen.findByRole('button', { name: headerNavigationsMessages.previewButton.defaultMessage });
    await user.click(previewButton);
    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith(draftPreviewLink, '_blank');

    window.open = open;
  });

  it('checks courseUnit title changing when edit query is successfully', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);
    const newDisplayName = `${unitDisplayName} new`;

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        metadata: {
          display_name: newDisplayName,
        },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          metadata: {
            display_name: newDisplayName,
          },
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

    const unitHeaderTitle = await screen.findByTestId('unit-header-title');
    const editTitleButton = within(unitHeaderTitle)
      .getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage });
    let titleEditField = within(unitHeaderTitle)
      .queryByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    expect(titleEditField).not.toBeInTheDocument();
    await user.click(editTitleButton);

    titleEditField = screen.getByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });

    await user.clear(titleEditField);
    await user.type(titleEditField, newDisplayName);
    await user.tab();

    expect(titleEditField).toHaveValue(newDisplayName);

    titleEditField = screen.queryByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    titleEditField = screen.queryByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });
    expect(titleEditField).not.toBeInTheDocument();
    expect(await screen.findByText(newDisplayName)).toBeInTheDocument();
  });

  it('doesn\'t handle creating xblock and displays an error message', async () => {
    const user = userEvent.setup();
    const { courseKey, locator } = courseCreateXblockMock;
    axiosMock
      .onPost(postXBlockBaseApiUrl(), { type: 'video', category: 'video', parent_locator: blockId })
      .reply(500, {});
    render(<RootWrapper />);

    const videoButton = await screen.findByRole('button', {
      name: new RegExp(`${addComponentMessages.buttonText.defaultMessage} Video`, 'i'),
    });

    await user.click(videoButton);
    expect(mockedUsedNavigate).not.toHaveBeenCalledWith(`/course/${courseKey}/editor/video/${locator}`);
  });

  it('handle creating Problem xblock and showing editor modal', async () => {
    const user = userEvent.setup();
    axiosMock
      .onPost(postXBlockBaseApiUrl(), { type: 'problem', category: 'problem', parent_locator: blockId })
      .reply(200, courseCreateXblockMock);
    render(<RootWrapper />);

    await user.click(await screen.findByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage }));

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.live,
          has_changes: false,
          published_by: userName,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(async () => {
      const problemButton = screen.getByRole('button', {
        name: new RegExp(`problem ${addComponentMessages.buttonText.defaultMessage} Problem`, 'i'),
        hidden: true,
      });

      await user.click(problemButton);
    });

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    // after creating problem xblock, the sidebar status changes to Draft (unpublished changes)
    expect(screen.getByText(
      legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage,
    )).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(unitInfoMessages.visibilityVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(unitInfoMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(courseSectionVerticalMock.xblock_info.release_date)).toBeInTheDocument();
    expect(screen.getByText(
      unitInfoMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseSectionVerticalMock.xblock_info.edited_on)
        .replace('{editedBy}', courseSectionVerticalMock.xblock_info.edited_by),
    )).toBeInTheDocument();
    expect(screen.getByText(
      legacySidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseSectionVerticalMock.xblock_info.release_date_from),
    )).toBeInTheDocument();
  });

  it('correct addition of a new course unit after click on the "Add new unit" button', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);
    let units: HTMLElement[] | null = null;
    const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
    const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
    set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
      ...updatedAncestorsChild.child_info!.children,
      courseUnitMock,
    ]);

    await waitFor(async () => {
      units = screen.getAllByTestId('course-unit-btn');
      const courseUnits = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[0].child_info!.children;
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

    const addNewUnitBtn = screen.getByRole('button', { name: courseSequenceMessages.newUnitBtnText.defaultMessage });
    units = screen.getAllByTestId('course-unit-btn');
    const updatedCourseUnits = updatedCourseSectionVerticalData
      .xblock_info.ancestor_info.ancestors[0].child_info!.children;

    await user.click(addNewUnitBtn);
    expect(units.length).toEqual(updatedCourseUnits.length);
    expect(mockedUsedNavigate).toHaveBeenCalled();
    expect(mockedUsedNavigate)
      .toHaveBeenCalledWith(`/course/${courseId}/container/${blockId}/${updatedAncestorsChild.id}`, { replace: true });
  });

  it('Show or hide new unit button based on parent sequence childAddable action', async () => {
    render(<RootWrapper />);
    // The new unit button should be visible when childAddable is true
    await screen.findByRole('button', { name: courseSequenceMessages.newUnitBtnText.defaultMessage });

    const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
    // Set childAddable to false for sequence i.e. current units parent.
    set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].actions.childAddable', false);
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...updatedCourseSectionVerticalData,
      });
    cleanup(); // clear the first render before we create the second.
    render(<RootWrapper />);
    // to wait for loading
    await screen.findByTestId('unit-header-title');
    // The new unit button should not be visible when childAddable is false
    expect(
      screen.queryByRole('button', { name: courseSequenceMessages.newUnitBtnText.defaultMessage }),
    ).not.toBeInTheDocument();
  });

  it('the sequence unit is updated after changing the unit header', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);
    const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
    const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
    set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
      ...updatedAncestorsChild.child_info!.children,
      courseUnitMock,
    ]);

    const newDisplayName = `${unitDisplayName} new`;

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        metadata: {
          display_name: newDisplayName,
        },
      })
      .reply(200, { dummy: 'value' })
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          metadata: {
            display_name: newDisplayName,
          },
        },
      })
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...updatedCourseSectionVerticalData,
      });

    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    const unitHeaderTitle = screen.getByTestId('unit-header-title');

    const editTitleButton = within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage });
    await user.click(editTitleButton);

    const titleEditField = within(unitHeaderTitle).getByRole('textbox', { name: headerTitleMessages.ariaLabelButtonEdit.defaultMessage });

    await user.clear(titleEditField);
    await user.type(titleEditField, newDisplayName);
    await user.tab();

    await waitFor(async () => {
      const units = screen.getAllByTestId('course-unit-btn');
      expect(units.some(unit => unit.title === newDisplayName)).toBe(true);
    });
  });

  it('handles creating Video xblock and showing editor modal using videogalleryflow', async () => {
    const user = userEvent.setup();
    const waffleSpy = mockWaffleFlags({ useVideoGalleryFlow: true });

    axiosMock
      .onPost(postXBlockBaseApiUrl(), { type: 'video', category: 'video', parent_locator: blockId })
      .reply(200, courseCreateXblockMock);
    render(<RootWrapper />);

    const publishButton = await screen.findByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage });
    await user.click(publishButton);

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.live,
          has_changes: false,
          published_by: userName,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(() => {
      // check if the sidebar status is Published and Live
      expect(screen.getByText(legacySidebarMessages.sidebarTitlePublishedAndLive.defaultMessage)).toBeInTheDocument();
    });

    expect(screen.getByText(
      unitInfoMessages.publishLastPublished.defaultMessage
        .replace('{publishedOn}', courseSectionVerticalMock.xblock_info.published_on)
        .replace('{publishedBy}', userName),
    )).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage })).not.toBeInTheDocument();

    const videoButton = screen.getByRole('button', {
      name: new RegExp(`${addComponentMessages.buttonText.defaultMessage} Video`, 'i'),
      hidden: true,
    });

    await user.click(videoButton);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    // after creating video xblock, the sidebar status changes to Draft (unpublished changes)
    expect(screen.getByText(
      legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage,
    )).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(unitInfoMessages.visibilityVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(unitInfoMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(courseSectionVerticalMock.xblock_info.release_date)).toBeInTheDocument();
    expect(screen.getByText(
      unitInfoMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseSectionVerticalMock.xblock_info.edited_on)
        .replace('{editedBy}', courseSectionVerticalMock.xblock_info.edited_by),
    )).toBeInTheDocument();
    expect(screen.getByText(
      legacySidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseSectionVerticalMock.xblock_info.release_date_from),
    )).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add video to your course/i, hidden: true })).toBeInTheDocument();

    waffleSpy.mockRestore();
  });

  it('handles creating Video xblock and showing editor modal', async () => {
    axiosMock
      .onPost(postXBlockBaseApiUrl(), { type: 'video', category: 'video', parent_locator: blockId })
      .reply(200, courseCreateXblockMock);
    const user = userEvent.setup();
    render(<RootWrapper />);

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage }));
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.live,
          has_changes: false,
          published_by: userName,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    await waitFor(async () => {
      // check if the sidebar status is Published and Live
      expect(screen.getByText(legacySidebarMessages.sidebarTitlePublishedAndLive.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(
        unitInfoMessages.publishLastPublished.defaultMessage
          .replace('{publishedOn}', courseSectionVerticalMock.xblock_info.published_on)
          .replace('{publishedBy}', userName),
      )).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage })).not.toBeInTheDocument();

      const videoButton = screen.getByRole('button', {
        name: new RegExp(`${addComponentMessages.buttonText.defaultMessage} Video`, 'i'),
        hidden: true,
      });

      await user.click(videoButton);
    });

    /** TODO -- fix this test.
    await waitFor(() => {
      expect(getByRole('textbox', { name: /paste your video id or url/i })).toBeInTheDocument();
    });
    */

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    // after creating video xblock, the sidebar status changes to Draft (unpublished changes)
    expect(screen.getByText(
      legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage,
    )).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(unitInfoMessages.visibilityVisibleToTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(unitInfoMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(legacySidebarMessages.actionButtonDiscardChangesTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(courseSectionVerticalMock.xblock_info.release_date)).toBeInTheDocument();
    expect(screen.getByText(
      unitInfoMessages.publishInfoDraftSaved.defaultMessage
        .replace('{editedOn}', courseSectionVerticalMock.xblock_info.edited_on)
        .replace('{editedBy}', courseSectionVerticalMock.xblock_info.edited_by),
    )).toBeInTheDocument();
    expect(screen.getByText(
      legacySidebarMessages.releaseInfoWithSection.defaultMessage
        .replace('{sectionName}', courseSectionVerticalMock.xblock_info.release_date_from),
    )).toBeInTheDocument();
  });

  it('renders course unit details for a draft with unpublished changes', async () => {
    render(<RootWrapper />);

    await waitFor(() => {
      expect(screen.getByText(
        legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage,
      )).toBeInTheDocument();
      expect(screen.getByText(legacySidebarMessages.releaseStatusTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(unitInfoMessages.visibilityVisibleToTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(unitInfoMessages.visibilityCheckboxTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(legacySidebarMessages.actionButtonPublishTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(
        legacySidebarMessages.actionButtonDiscardChangesTitle.defaultMessage,
      )).toBeInTheDocument();
      expect(screen.getByText(courseSectionVerticalMock.xblock_info.release_date)).toBeInTheDocument();
      expect(screen.getByText(
        unitInfoMessages.publishInfoDraftSaved.defaultMessage
          .replace('{editedOn}', courseSectionVerticalMock.xblock_info.edited_on)
          .replace('{editedBy}', courseSectionVerticalMock.xblock_info.edited_by),
      )).toBeInTheDocument();
      expect(screen.getByText(
        legacySidebarMessages.releaseInfoWithSection.defaultMessage
          .replace('{sectionName}', courseSectionVerticalMock.xblock_info.release_date_from),
      )).toBeInTheDocument();
    });
  });

  it('renders course unit details in the sidebar', async () => {
    render(<RootWrapper />);
    const courseUnitLocationId = extractCourseUnitId(courseSectionVerticalMock.xblock_info.id);

    await waitFor(() => {
      expect(screen.getByText(legacySidebarMessages.sidebarHeaderUnitLocationTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(legacySidebarMessages.unitLocationTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(courseUnitLocationId)).toBeInTheDocument();
      expect(screen.getByText(legacySidebarMessages.unitLocationDescription.defaultMessage
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
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          currently_visible_to_students: false,
        },
      });

    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);

    await waitFor(() => {
      const alert = screen.queryAllByRole('alert').find(
        (el) => el.classList.contains('alert-content'),
      );
      expect(alert).toBeUndefined();
    });
  });

  it('should toggle visibility from sidebar and update course unit state accordingly', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);
    let courseUnitSidebar;
    let draftUnpublishedChangesHeading;
    let visibilityCheckbox;

    await waitFor(async () => {
      courseUnitSidebar = screen.getByTestId('course-unit-sidebar');

      draftUnpublishedChangesHeading = within(courseUnitSidebar)
        .getByText(legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage);
      expect(draftUnpublishedChangesHeading).toBeInTheDocument();

      visibilityCheckbox = within(courseUnitSidebar)
        .getByLabelText(unitInfoMessages.visibilityCheckboxTitle.defaultMessage);
      expect(visibilityCheckbox).not.toBeChecked();
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.republish,
        metadata: { visible_to_staff_only: true },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.staffOnly,
          has_explicit_staff_lock: true,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, true), store.dispatch);

    await waitFor(async () => {
      expect(visibilityCheckbox).toBeChecked();
    });
    expect(within(courseUnitSidebar)
      .getByText(legacySidebarMessages.sidebarTitleVisibleToStaffOnly.defaultMessage)).toBeInTheDocument();
    expect(within(courseUnitSidebar)
      .getByText(unitInfoMessages.visibilityStaffOnlyTitle.defaultMessage)).toBeInTheDocument();

    await user.click(visibilityCheckbox);

    const modalNotification = screen.getByRole('dialog');
    const makeVisibilityBtn = within(modalNotification).getByRole('button', { name: unitInfoMessages.modalMakeVisibilityActionButtonText.defaultMessage });
    const cancelBtn = within(modalNotification).getByRole('button', { name: unitInfoMessages.modalMakeVisibilityCancelButtonText.defaultMessage });
    const headingElement = within(modalNotification).getByRole('heading', { name: unitInfoMessages.modalMakeVisibilityTitle.defaultMessage });

    expect(makeVisibilityBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveClass('pgn__modal-title');
    expect(within(modalNotification)
      .getByText(unitInfoMessages.modalMakeVisibilityDescription.defaultMessage)).toBeInTheDocument();

    await user.click(makeVisibilityBtn);

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.republish,
        metadata: { visible_to_staff_only: null },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, null), store.dispatch);

    expect(visibilityCheckbox).not.toBeChecked();
    expect(draftUnpublishedChangesHeading).toBeInTheDocument();
  });

  it('should publish course unit after click on the "Publish" button', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);
    let courseUnitSidebar;
    let publishBtn;

    await waitFor(async () => {
      courseUnitSidebar = screen.getByTestId('course-unit-sidebar');
      publishBtn = within(courseUnitSidebar).queryByRole('button', { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage });
      expect(publishBtn).toBeInTheDocument();

      await user.click(publishBtn);
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.makePublic,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.live,
          has_changes: false,
          published_by: userName,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.makePublic, true), store.dispatch);

    expect(within(courseUnitSidebar)
      .getByText(legacySidebarMessages.sidebarTitlePublishedAndLive.defaultMessage)).toBeInTheDocument();
    expect(within(courseUnitSidebar).getByText(
      unitInfoMessages.publishLastPublished.defaultMessage
        .replace('{publishedOn}', courseSectionVerticalMock.xblock_info.published_on)
        .replace('{publishedBy}', userName),
    )).toBeInTheDocument();
    expect(publishBtn).not.toBeInTheDocument();
  });

  it('should discard changes after click on the "Discard changes" button', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);
    let courseUnitSidebar;
    let discardChangesBtn;

    await waitFor(async () => {
      courseUnitSidebar = screen.getByTestId('course-unit-sidebar');

      const draftUnpublishedChangesHeading = within(courseUnitSidebar)
        .getByText(legacySidebarMessages.sidebarTitleDraftUnpublishedChanges.defaultMessage);
      expect(draftUnpublishedChangesHeading).toBeInTheDocument();
      discardChangesBtn = await within(courseUnitSidebar).findByRole('button', { name: legacySidebarMessages.actionButtonDiscardChangesTitle.defaultMessage });
      expect(discardChangesBtn).toBeInTheDocument();

      await user.click(discardChangesBtn);

      const modalNotification = screen.getByRole('dialog');
      expect(modalNotification).toBeInTheDocument();
      expect(within(modalNotification)
        .getByText(unitInfoMessages.modalDiscardUnitChangesDescription.defaultMessage)).toBeInTheDocument();
      expect(within(modalNotification)
        .getByText(unitInfoMessages.modalDiscardUnitChangesCancelButtonText.defaultMessage)).toBeInTheDocument();
      const headingElement = within(modalNotification).getByRole('heading', { name: unitInfoMessages.modalDiscardUnitChangesTitle.defaultMessage });
      expect(headingElement).toBeInTheDocument();
      expect(headingElement).toHaveClass('pgn__modal-title');
      const actionBtn = within(modalNotification).getByRole('button', { name: unitInfoMessages.modalDiscardUnitChangesActionButtonText.defaultMessage });
      expect(actionBtn).toBeInTheDocument();

      await user.click(actionBtn);
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.discardChanges,
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          published: true,
          has_changes: false,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(
      blockId,
      PUBLISH_TYPES.discardChanges,
      true,
    ), store.dispatch);

    expect(within(courseUnitSidebar)
      .getByText(legacySidebarMessages.sidebarTitlePublishedNotYetReleased.defaultMessage)).toBeInTheDocument();
    expect(discardChangesBtn).not.toBeInTheDocument();
  });

  it('should toggle visibility from header configure modal and update course unit state accordingly', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);
    let courseUnitSidebar;
    let sidebarVisibilityCheckbox;
    let modalVisibilityCheckbox;
    let configureModal;
    let restrictAccessSelect;

    await waitFor(async () => {
      courseUnitSidebar = screen.getByTestId('course-unit-sidebar');
      sidebarVisibilityCheckbox = within(courseUnitSidebar)
        .getByLabelText(unitInfoMessages.visibilityCheckboxTitle.defaultMessage);
      expect(sidebarVisibilityCheckbox).not.toBeChecked();

      const headerConfigureBtn = screen.getByRole('button', { name: /settings/i });
      expect(headerConfigureBtn).toBeInTheDocument();

      await user.click(headerConfigureBtn);
      configureModal = screen.getByTestId('configure-modal');
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

      await user.click(modalVisibilityCheckbox);
      expect(modalVisibilityCheckbox).toBeChecked();

      await user.selectOptions(restrictAccessSelect, '0');
      const [, group1Checkbox] = within(configureModal).getAllByRole('checkbox');

      await user.click(group1Checkbox);
      expect(group1Checkbox).toBeChecked();
    });

    axiosMock
      .onPost(getXBlockBaseApiUrl(courseSectionVerticalMock.xblock_info.id), {
        publish: null,
        metadata: { visible_to_staff_only: true, group_access: { 50: [2] }, discussion_enabled: true },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.staffOnly,
          has_explicit_staff_lock: true,
        },
      });

    const modalSaveBtn = within(configureModal)
      .getByRole('button', { name: configureModalMessages.saveButton.defaultMessage });
    await user.click(modalSaveBtn);

    await waitFor(() => {
      expect(sidebarVisibilityCheckbox).toBeChecked();
      expect(within(courseUnitSidebar)
        .getByText(legacySidebarMessages.sidebarTitleVisibleToStaffOnly.defaultMessage)).toBeInTheDocument();
      expect(within(courseUnitSidebar)
        .getByText(unitInfoMessages.visibilityStaffOnlyTitle.defaultMessage)).toBeInTheDocument();
    });
  });

  it('shows the Tags sidebar when enabled', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    render(<RootWrapper />);
    await waitFor(() => { expect(screen.getByText('Unit tags')).toBeInTheDocument(); });
  });

  it('hides the Tags sidebar when not enabled', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
    });
    render(<RootWrapper />);
    await waitFor(() => { expect(screen.queryByText('Unit tags')).not.toBeInTheDocument(); });
  });

  describe('Copy paste functionality', () => {
    it('should copy a unit, paste it as a new unit, and update the course section vertical data', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          xblock_info: {
            ...courseSectionVerticalMock.xblock_info,
            enable_copy_paste_units: true,
          },
        });

      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      await user.click(screen.getByRole('button', { name: legacySidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      await user.click(screen.getByRole('button', { name: courseSequenceMessages.pasteAsNewUnitLink.defaultMessage }));

      let units: HTMLElement[] | null = null;
      const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
      const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
      set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
        ...updatedAncestorsChild.child_info!.children,
        courseUnitMock,
      ]);

      await waitFor(() => {
        units = screen.getAllByTestId('course-unit-btn');
        const courseUnits = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[0].child_info!.children;
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

      units = screen.getAllByTestId('course-unit-btn');
      const updatedCourseUnits = updatedCourseSectionVerticalData
        .xblock_info.ancestor_info.ancestors[0].child_info!.children;

      expect(units.length).toEqual(updatedCourseUnits.length);
      expect(mockedUsedNavigate).toHaveBeenCalled();
      expect(mockedUsedNavigate)
        .toHaveBeenCalledWith(`/course/${courseId}/container/${blockId}/${updatedAncestorsChild.id}`, { replace: true });
    });

    it('should increase the number of course XBlocks after copying and pasting a block', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

      simulatePostMessageEvent(messageTypes.copyXBlock, {
        id: courseVerticalChildrenMock.children[0].block_id,
      });

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          xblock_info: {
            ...courseSectionVerticalMock.xblock_info,
            enable_copy_paste_units: true,
          },
        });
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      await user.click(screen.getByRole('button', { name: legacySidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));

      await waitFor(() => {
        const iframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        expect(iframe).toHaveAttribute(
          'aria-label',
          xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
            .replace('{xblockCount}', courseVerticalChildrenMock.children.length.toString()),
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
        const iframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        expect(iframe).toHaveAttribute(
          'aria-label',
          xblockContainerIframeMessages.xblockIframeLabel.defaultMessage
            .replace('{xblockCount}', updatedCourseVerticalChildren.length.toString()),
        );
      });
    });

    it('displays a notification about new files after pasting a component', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          xblock_info: {
            ...courseSectionVerticalMock.xblock_info,
            enable_copy_paste_units: true,
          },
        });

      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      await user.click(screen.getByRole('button', { name: legacySidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      await user.click(screen.getByRole('button', { name: courseSequenceMessages.pasteAsNewUnitLink.defaultMessage }));

      const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
      const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
      set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
        ...updatedAncestorsChild.child_info!.children,
        courseUnitMock,
      ]);

      axiosMock
        .onPost(postXBlockBaseApiUrl(), postXBlockBody)
        .reply(200, clipboardMockResponse);
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, updatedCourseSectionVerticalData);

      global.localStorage.setItem('staticFileNotices', JSON.stringify(clipboardMockResponse.staticFileNotices));
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      await executeThunk(createNewCourseXBlock(camelCaseObject(postXBlockBody), null, blockId), store.dispatch);
      const newFilesAlert = screen.getByTestId('has-new-files-alert');

      expect(within(newFilesAlert)
        .getByText(pasteNotificationsMessages.hasNewFilesTitle.defaultMessage)).toBeInTheDocument();
      expect(within(newFilesAlert)
        .getByText(pasteNotificationsMessages.hasNewFilesDescription.defaultMessage)).toBeInTheDocument();
      expect(within(newFilesAlert)
        .getByText(pasteNotificationsMessages.hasNewFilesButtonText.defaultMessage)).toBeInTheDocument();
      clipboardMockResponse.staticFileNotices.newFiles.forEach((fileName) => {
        expect(within(newFilesAlert).getByText(fileName)).toBeInTheDocument();
      });

      await user.click(within(newFilesAlert).getByText(/Dismiss/i));

      expect(screen.queryByTestId('has-new-files-alert')).toBeNull();
    });

    it('displays a notification about conflicting errors after pasting a component', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          xblock_info: {
            ...courseSectionVerticalMock.xblock_info,
            enable_copy_paste_units: true,
          },
        });

      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      await user.click(screen.getByRole('button', { name: legacySidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      await user.click(screen.getByRole('button', { name: courseSequenceMessages.pasteAsNewUnitLink.defaultMessage }));

      const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
      const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
      set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
        ...updatedAncestorsChild.child_info!.children,
        courseUnitMock,
      ]);

      axiosMock
        .onPost(postXBlockBaseApiUrl(), postXBlockBody)
        .reply(200, clipboardMockResponse);
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...updatedCourseSectionVerticalData,
        });

      global.localStorage.setItem('staticFileNotices', JSON.stringify(clipboardMockResponse.staticFileNotices));
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      await executeThunk(createNewCourseXBlock(camelCaseObject(postXBlockBody), null, blockId), store.dispatch);
      const conflictingErrorsAlert = screen.getByTestId('has-conflicting-errors-alert');

      expect(within(conflictingErrorsAlert)
        .getByText(pasteNotificationsMessages.hasConflictingErrorsTitle.defaultMessage)).toBeInTheDocument();
      expect(within(conflictingErrorsAlert)
        .getByText(pasteNotificationsMessages.hasConflictingErrorsDescription.defaultMessage)).toBeInTheDocument();
      expect(within(conflictingErrorsAlert)
        .getByText(pasteNotificationsMessages.hasConflictingErrorsButtonText.defaultMessage)).toBeInTheDocument();
      clipboardMockResponse.staticFileNotices.conflictingFiles.forEach((fileName) => {
        expect(within(conflictingErrorsAlert).getByText(fileName)).toBeInTheDocument();
      });

      await user.click(within(conflictingErrorsAlert).getByText(/Dismiss/i));

      expect(screen.queryByTestId('has-conflicting-errors-alert')).toBeNull();
    });

    it('displays a notification about error files after pasting a component', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          xblock_info: {
            ...courseSectionVerticalMock.xblock_info,
            enable_copy_paste_units: true,
          },
        });

      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

      await user.click(screen.getByRole('button', { name: legacySidebarMessages.actionButtonCopyUnitTitle.defaultMessage }));
      await user.click(screen.getByRole('button', { name: courseSequenceMessages.pasteAsNewUnitLink.defaultMessage }));

      const updatedCourseSectionVerticalData = cloneDeep(courseSectionVerticalMock);
      const updatedAncestorsChild = updatedCourseSectionVerticalData.xblock_info.ancestor_info.ancestors[0];
      set(updatedCourseSectionVerticalData, 'xblock_info.ancestor_info.ancestors[0].child_info.children', [
        ...updatedAncestorsChild.child_info!.children,
        courseUnitMock,
      ]);

      axiosMock
        .onPost(postXBlockBaseApiUrl(), postXBlockBody)
        .reply(200, clipboardMockResponse);
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...updatedCourseSectionVerticalData,
        });

      global.localStorage.setItem('staticFileNotices', JSON.stringify(clipboardMockResponse.staticFileNotices));
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      await executeThunk(createNewCourseXBlock(camelCaseObject(postXBlockBody), null, blockId), store.dispatch);
      const errorFilesAlert = screen.getByTestId('has-error-files-alert');

      expect(within(errorFilesAlert)
        .getByText(pasteNotificationsMessages.hasErrorsTitle.defaultMessage)).toBeInTheDocument();
      expect(within(errorFilesAlert)
        .getByText(pasteNotificationsMessages.hasErrorsDescription.defaultMessage)).toBeInTheDocument();

      await user.click(within(errorFilesAlert).getByText(/Dismiss/i));

      expect(screen.queryByTestId('has-error-files')).toBeNull();
    });

    it('should hide the "Paste component" block if canPasteComponent is false', async () => {
      render(<RootWrapper />);

      axiosMock
        .onGet(getCourseVerticalChildrenApiUrl(blockId))
        .reply(200, {
          ...courseVerticalChildrenMock,
          canPasteComponent: false,
        });

      await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);

      expect(screen.queryByRole('button', {
        name: messages.pasteButtonText.defaultMessage,
      })).not.toBeInTheDocument();
      expect(screen.queryByText(
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
      render(<RootWrapper />);

      await screen.findByText(unitDisplayName);

      axiosMock
        .onGet(getCourseOutlineInfoUrl(courseId))
        .reply(200, courseOutlineInfoMock);
      await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);

      window.dispatchEvent(messageEvent);

      await screen.findByText(
        moveModalMessages.moveModalTitle.defaultMessage.replace('{displayName}', requestData.title),
      );
      expect(screen.getByRole('button', { name: moveModalMessages.moveModalSubmitButton.defaultMessage })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: moveModalMessages.moveModalCancelButton.defaultMessage })).toBeInTheDocument();
    });

    it('should navigates to xBlock current unit', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

      await screen.findByText(unitDisplayName);

      axiosMock
        .onGet(getCourseOutlineInfoUrl(courseId))
        .reply(200, courseOutlineInfoMock);
      await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);

      window.dispatchEvent(messageEvent);

      await screen.findByText(
        moveModalMessages.moveModalTitle.defaultMessage.replace('{displayName}', requestData.title),
      );

      const currentSection = courseOutlineInfoMock.child_info.children[1];
      const currentSectionItemBtn = screen.getByRole('button', {
        name: `${currentSection.display_name} ${moveModalMessages.moveModalOutlineItemCurrentLocationText.defaultMessage} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
      });
      expect(currentSectionItemBtn).toBeInTheDocument();
      await user.click(currentSectionItemBtn);

      await waitFor(async () => {
        const currentSubsection = currentSection.child_info.children[0];
        const currentSubsectionItemBtn = screen.getByRole('button', {
          name: `${currentSubsection.display_name} ${moveModalMessages.moveModalOutlineItemCurrentLocationText.defaultMessage} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
        });
        expect(currentSubsectionItemBtn).toBeInTheDocument();
        await user.click(currentSubsectionItemBtn);
      });

      await waitFor(() => {
        const currentComponentLocationText = screen.getByText(
          moveModalMessages.moveModalOutlineItemCurrentComponentLocationText.defaultMessage,
        );
        expect(currentComponentLocationText).toBeInTheDocument();
      });
    });

    it('should allow move operation and handles it successfully', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

      axiosMock
        .onPatch(postXBlockBaseApiUrl())
        .reply(200, {});

      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, courseSectionVerticalMock);

      await screen.findByText(unitDisplayName);

      axiosMock
        .onGet(getCourseOutlineInfoUrl(courseId))
        .reply(200, courseOutlineInfoMock);
      await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);

      window.dispatchEvent(messageEvent);

      await screen.findByText(
        moveModalMessages.moveModalTitle.defaultMessage.replace('{displayName}', requestData.title),
      );

      const currentSection = courseOutlineInfoMock.child_info.children[1];
      const currentSectionItemBtn = screen.getByRole('button', {
        name: `${currentSection.display_name} ${moveModalMessages.moveModalOutlineItemCurrentLocationText.defaultMessage} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
      });
      expect(currentSectionItemBtn).toBeInTheDocument();
      await user.click(currentSectionItemBtn);

      const currentSubsection = currentSection.child_info.children[1];
      await waitFor(async () => {
        const currentSubsectionItemBtn = screen.getByRole('button', {
          name: `${currentSubsection.display_name} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
        });
        expect(currentSubsectionItemBtn).toBeInTheDocument();
        await user.click(currentSubsectionItemBtn);
      });

      await waitFor(async () => {
        const currentUnit = currentSubsection.child_info!.children[0];
        const currentUnitItemBtn = screen.getByRole('button', {
          name: `${currentUnit.display_name} ${moveModalMessages.moveModalOutlineItemViewText.defaultMessage}`,
        });
        expect(currentUnitItemBtn).toBeInTheDocument();
        await user.click(currentUnitItemBtn);
      });

      const moveModalBtn = screen.getByRole('button', {
        name: moveModalMessages.moveModalSubmitButton.defaultMessage,
      });
      expect(moveModalBtn).toBeInTheDocument();
      expect(moveModalBtn).not.toBeDisabled();
      await user.click(moveModalBtn);

      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
      });
    });

    it('should display "Move Confirmation" alert after moving and undo operations', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

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

      const dismissButton = screen.getByRole('button', {
        name: /dismiss/i, hidden: true,
      });
      const undoButton = screen.getByRole('button', {
        name: messages.undoMoveButton.defaultMessage, hidden: true,
      });
      const newLocationButton = screen.getByRole('button', {
        name: messages.newLocationButton.defaultMessage, hidden: true,
      });

      expect(screen.getByText(messages.alertMoveSuccessTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(`${requestData.title} has been moved`)).toBeInTheDocument();
      expect(dismissButton).toBeInTheDocument();
      expect(undoButton).toBeInTheDocument();
      expect(newLocationButton).toBeInTheDocument();

      await user.click(undoButton);

      await waitFor(() => {
        expect(screen.getByText(messages.alertMoveCancelTitle.defaultMessage)).toBeInTheDocument();
      });
      expect(screen.getByText(
        messages.alertMoveCancelDescription.defaultMessage.replace('{title}', requestData.title),
      )).toBeInTheDocument();
      expect(dismissButton).toBeInTheDocument();
      expect(undoButton).not.toBeInTheDocument();
      expect(newLocationButton).not.toBeInTheDocument();
    });

    it('should navigate to new location by button click', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

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

      const newLocationButton = screen.getByRole('button', {
        name: messages.newLocationButton.defaultMessage, hidden: true,
      });
      await user.click(newLocationButton);
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        `/course/${courseId}/container/${blockId}/${requestData.currentParentLocator}`,
        { replace: true },
      );
    });
  });

  describe('XBlock restrict access', () => {
    it('opens xblock restrict access modal successfully', async () => {
      render(<RootWrapper />);

      const modalSubtitleText = configureModalMessages.restrictAccessTo.defaultMessage;
      const modalCancelBtnText = configureModalMessages.cancelButton.defaultMessage;
      const modalSaveBtnText = configureModalMessages.saveButton.defaultMessage;

      await waitFor(() => {
        const iframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        const usageId = courseVerticalChildrenMock.children[0].block_id;
        expect(iframe).toBeInTheDocument();

        simulatePostMessageEvent(messageTypes.manageXBlockAccess, {
          usageId,
        });
      });

      await waitFor(() => {
        const configureModal = screen.getByTestId('configure-modal');

        expect(within(configureModal).getByText(modalSubtitleText)).toBeInTheDocument();
        expect(within(configureModal).getByRole('button', { name: modalCancelBtnText })).toBeInTheDocument();
        expect(within(configureModal).getByRole('button', { name: modalSaveBtnText })).toBeInTheDocument();
      });
    });

    it('closes xblock restrict access modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<RootWrapper />);

      await waitFor(() => {
        const iframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        expect(iframe).toBeInTheDocument();
        simulatePostMessageEvent(messageTypes.manageXBlockAccess, {
          usageId: courseVerticalChildrenMock.children[0].block_id,
        });
      });

      await waitFor(async () => {
        const configureModal = screen.getByTestId('configure-modal');
        expect(configureModal).toBeInTheDocument();
        await user.click(within(configureModal).getByRole('button', {
          name: configureModalMessages.cancelButton.defaultMessage,
        }));
        expect(handleConfigureSubmitMock).not.toHaveBeenCalled();
      });

      expect(screen.queryByTestId('configure-modal')).not.toBeInTheDocument();
    });

    it('handles submit xblock restrict access data when save button is clicked', async () => {
      const user = userEvent.setup();
      axiosMock
        .onPost(getXBlockBaseApiUrl(id), {
          publish: PUBLISH_TYPES.republish,
          metadata: { visible_to_staff_only: false, group_access: { 970807507: [1959537066] } },
        })
        .reply(200, { dummy: 'value' });

      render(<RootWrapper />);

      const accessGroupName1 = userPartitionInfoFormatted.selectablePartitions[0].groups[0].name;
      const accessGroupName2 = userPartitionInfoFormatted.selectablePartitions[0].groups[1].name;

      await waitFor(() => {
        const iframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
        expect(iframe).toBeInTheDocument();
      });

      await act(async () => {
        simulatePostMessageEvent(messageTypes.manageXBlockAccess, {
          usageId: courseVerticalChildrenMock.children[0].block_id,
        });
      });

      const configureModal = await waitFor(() => screen.getByTestId('configure-modal'));
      expect(configureModal).toBeInTheDocument();

      expect(within(configureModal).queryByText(accessGroupName1)).not.toBeInTheDocument();
      expect(within(configureModal).queryByText(accessGroupName2)).not.toBeInTheDocument();

      const restrictAccessSelect = screen.getByRole('combobox', {
        name: configureModalMessages.restrictAccessTo.defaultMessage,
      });

      await user.selectOptions(restrictAccessSelect, '0');

      await waitFor(() => {
        userPartitionInfoFormatted.selectablePartitions[0].groups.forEach((group) => {
          const checkbox = within(configureModal).getByRole('checkbox', { name: group.name });
          expect(checkbox).not.toBeChecked();
          expect(checkbox).toBeInTheDocument();
        });
      });

      const group1Checkbox = within(configureModal).getByRole('checkbox', { name: accessGroupName1 });
      await user.click(group1Checkbox);
      expect(group1Checkbox).toBeChecked();

      const saveModalBtnText = within(configureModal).getByRole('button', {
        name: configureModalMessages.saveButton.defaultMessage,
      });

      expect(saveModalBtnText).toBeInTheDocument();
      await user.click(saveModalBtnText);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBeGreaterThan(0);
        expect(axiosMock.history.post[0].url).toBe(getXBlockBaseApiUrl(id));
      });

      expect(screen.queryByTestId('configure-modal')).not.toBeInTheDocument();
    });
  });

  const checkLegacyEditModalOnEditMessage = async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);

    await waitFor(async () => {
      const editButton = screen.getByTestId('header-edit-button');
      expect(editButton).toBeInTheDocument();
      const xblocksIframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(xblocksIframe).toBeInTheDocument();
      await user.click(editButton);
    });
  };

  const checkRenderVisibilityModal = async (headingMessageId) => {
    const user = userEvent.setup();
    const { findByRole, getByTestId } = render(<RootWrapper />);
    let configureModal;
    let restrictAccessSelect;

    const headerConfigureBtn = await findByRole('button', { name: /settings/i });
    await user.click(headerConfigureBtn);

    await waitFor(() => {
      configureModal = getByTestId('configure-modal');
      restrictAccessSelect = within(configureModal)
        .getByRole('combobox', { name: configureModalMessages.restrictAccessTo.defaultMessage });
      expect(within(configureModal)
        .getByRole('heading', { name: configureModalMessages[headingMessageId].defaultMessage })).toBeInTheDocument();
      expect(within(configureModal)
        .queryByText(configureModalMessages.unitVisibility.defaultMessage)).not.toBeInTheDocument();
      expect(within(configureModal)
        .getByText(configureModalMessages.restrictAccessTo.defaultMessage)).toBeInTheDocument();
      expect(restrictAccessSelect).toBeInTheDocument();
      expect(restrictAccessSelect).toHaveValue('-1');
    });

    const modalSaveBtn = within(configureModal)
      .getByRole('button', { name: configureModalMessages.saveButton.defaultMessage });
    await user.click(modalSaveBtn);
  };

  describe('Library Content page', () => {
    const newUnitId = '12345';

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

    it('navigates to library content page on receive window event', async () => {
      render(<RootWrapper />);

      await waitFor(() => {
        simulatePostMessageEvent(messageTypes.handleViewXBlockContent, { usageId: newUnitId });
        expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseId}/container/${newUnitId}/${sequenceId}`);
      });
    });

    it('should render library content page correctly', async () => {
      const {
        findByText,
        getByRole,
        queryByRole,
        findByTestId,
      } = render(<RootWrapper />);

      const currentSectionName = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[1].display_name;
      const currentSubSectionName = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[1].display_name;

      const unitHeaderTitle = await findByTestId('unit-header-title');
      await findByText(unitDisplayName);
      await waitFor(() => {
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

    it('should display visibility modal correctly', async () => (
      checkRenderVisibilityModal('libraryContentAccess')
    ));

    it('opens legacy edit modal on edit button click', checkLegacyEditModalOnEditMessage);
  });

  describe('Split Test Content page', () => {
    const newUnitId = '12345';

    beforeEach(async () => {
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          xblock: {
            ...courseSectionVerticalMock.xblock,
            category: 'split_test',
          },
          xblock_info: {
            ...courseSectionVerticalMock.xblock_info,
            category: 'split_test',
          },
        });
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    });

    it('navigates to split test content page on receive window event', async () => {
      render(<RootWrapper />);

      simulatePostMessageEvent(messageTypes.handleViewXBlockContent, { usageId: newUnitId });
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseId}/container/${newUnitId}/${sequenceId}`);
    });

    it('navigates to group configuration page on receive window event', async () => {
      const groupId = 12345;
      render(<RootWrapper />);

      simulatePostMessageEvent(messageTypes.handleViewGroupConfigurations, { usageId: `${courseId}#${groupId}` });
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseId}/group_configurations#${groupId}`);
    });

    it('displays processing notification on receiving post message', async () => {
      const { getByText, queryByText } = render(<RootWrapper />);

      await waitFor(() => {
        simulatePostMessageEvent(messageTypes.addNewComponent);
        expect(getByText(('Adding'))).toBeInTheDocument();
      });

      await waitFor(() => {
        simulatePostMessageEvent(messageTypes.hideProcessingNotification);
        expect(queryByText(('Adding'))).not.toBeInTheDocument();
      });

      await waitFor(() => {
        simulatePostMessageEvent(messageTypes.pasteNewComponent);
        expect(getByText(('Pasting'))).toBeInTheDocument();
      });

      await waitFor(() => {
        simulatePostMessageEvent(messageTypes.hideProcessingNotification);
        expect(queryByText(('Pasting'))).not.toBeInTheDocument();
      });
    });

    it('should render split test content page correctly', async () => {
      render(<RootWrapper />);

      const currentSectionName = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[1].display_name;
      const currentSubSectionName = courseSectionVerticalMock.xblock_info.ancestor_info.ancestors[1].display_name;
      const helpLinkUrl = 'https://docs.openedx.org/en/latest/educators/references/course_development/parent_child_components.html';

      await waitFor(() => {
        const unitHeaderTitle = screen.getByTestId('unit-header-title');
        expect(screen.getByText(unitDisplayName)).toBeInTheDocument();
        expect(within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonEdit.defaultMessage })).toBeInTheDocument();
        expect(within(unitHeaderTitle).getByRole('button', { name: headerTitleMessages.altButtonSettings.defaultMessage })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: currentSectionName })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: currentSubSectionName })).toBeInTheDocument();

        expect(screen.queryByRole('heading', { name: addComponentMessages.title.defaultMessage })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: headerNavigationsMessages.viewLiveButton.defaultMessage })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: headerNavigationsMessages.previewButton.defaultMessage })).not.toBeInTheDocument();

        expect(screen.queryByRole('heading', { name: /unit tags/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /unit location/i })).not.toBeInTheDocument();

        // Sidebar
        const sidebarContent = [
          { query: screen.queryByRole, type: 'heading', name: legacySidebarMessages.sidebarSplitTestAddComponentTitle.defaultMessage },
          { query: screen.queryByText, name: legacySidebarMessages.sidebarSplitTestSelectComponentType.defaultMessage.replaceAll('{bold_tag}', '') },
          { query: screen.queryByText, name: legacySidebarMessages.sidebarSplitTestComponentAdded.defaultMessage },
          { query: screen.queryByRole, type: 'heading', name: legacySidebarMessages.sidebarSplitTestEditComponentTitle.defaultMessage },
          {
            query: screen.queryByText,
            name: legacySidebarMessages.sidebarSplitTestEditComponentInstruction.defaultMessage
              .replaceAll('{bold_tag}', ''),
          },
          {
            query: screen.queryByRole,
            type: 'heading',
            name: legacySidebarMessages.sidebarSplitTestReorganizeComponentTitle.defaultMessage,
          },
          {
            query: screen.queryByText,
            name: legacySidebarMessages.sidebarSplitTestReorganizeComponentInstruction.defaultMessage,
          },
          {
            query: screen.queryByText,
            name: legacySidebarMessages.sidebarSplitTestReorganizeGroupsInstruction.defaultMessage,
          },
          {
            query: screen.queryByRole,
            type: 'heading',
            name: legacySidebarMessages.sidebarSplitTestExperimentComponentTitle.defaultMessage,
          },
          {
            query: screen.queryByText,
            name: legacySidebarMessages.sidebarSplitTestExperimentComponentInstruction.defaultMessage,
          },
          {
            query: screen.queryByRole,
            type: 'link',
            name: legacySidebarMessages.sidebarSplitTestLearnMoreLinkLabel.defaultMessage,
          },
        ];

        sidebarContent.forEach(({ query, type, name }) => {
          // @ts-ignore
          expect(type ? query(type, { name }) : query(name)).toBeInTheDocument();
        });

        expect(
          screen.queryByRole('link', { name: legacySidebarMessages.sidebarSplitTestLearnMoreLinkLabel.defaultMessage }),
        ).toHaveAttribute('href', helpLinkUrl);
      });
    });

    it('should display visibility modal correctly', async () => (
      checkRenderVisibilityModal('splitTestAccess')
    ));

    it('opens legacy edit modal on edit button click', checkLegacyEditModalOnEditMessage);
  });

  it('renders and navigates to the new HTML XBlock editor after xblock duplicating', async () => {
    const updatedCourseVerticalChildrenMock = JSON.parse(JSON.stringify(courseVerticalChildrenMock));
    // Convert the second child from drag and drop to HTML:
    const targetChild = updatedCourseVerticalChildrenMock.children[1];
    targetChild.block_type = 'html';
    targetChild.name = 'Test HTML Block';
    targetChild.block_id = 'block-v1:OpenedX+L153+3T2023+type@html+block@test123original';

    axiosMock
      .onPost(postXBlockBaseApiUrl(), {
        parent_locator: blockId,
        duplicate_source_locator: targetChild.block_id,
      })
      .replyOnce(200, { locator: '1234567890' });

    axiosMock
      .onGet(getCourseVerticalChildrenApiUrl(blockId))
      .reply(200, updatedCourseVerticalChildrenMock);

    render(<RootWrapper />);
    await executeThunk(fetchCourseVerticalChildrenData(blockId), store.dispatch);

    await waitFor(() => {
      const iframe = screen.getByTitle(xblockContainerIframeMessages.xblockIframeTitle.defaultMessage);
      expect(iframe).toBeInTheDocument();
    });

    // After duplicating, the editor modal will open:
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    simulatePostMessageEvent(messageTypes.duplicateXBlock, { usageId: targetChild.block_id });
    simulatePostMessageEvent(messageTypes.newXBlockEditor, { blockType: 'html', usageId: targetChild.block_id });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });
  });

  it('renders units from libraries with some components read-only', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          upstreamInfo: {
            ...courseSectionVerticalMock.xblock_info,
            upstreamRef: 'lct:org:lib:unit:unit-1',
            upstreamLink: 'some-link',
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);

    expect(screen.getByText(/this unit can only be edited from the \./i)).toBeInTheDocument();

    // Edit button should be enabled even for library imported units
    const unitHeaderTitle = screen.getByTestId('unit-header-title');
    const editButton = within(unitHeaderTitle).getByRole(
      'button',
      { name: 'Edit' },
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toBeEnabled();

    // The "Publish" button should still be enabled
    const courseUnitSidebar = screen.getByTestId('course-unit-sidebar');
    const publishButton = within(courseUnitSidebar).getByRole(
      'button',
      { name: legacySidebarMessages.actionButtonPublishTitle.defaultMessage },
    );
    expect(publishButton).toBeInTheDocument();
    expect(publishButton).toBeEnabled();

    // Does not render the "Add Components" section
    expect(screen.queryByText(addComponentMessages.title.defaultMessage)).not.toBeInTheDocument();
  });

  it('renders new unit info/settings sidebar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    const user = userEvent.setup();
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);

    expect(await screen.findByRole('tab', { name: /details/i })).toBeInTheDocument();
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    expect(settingsTab).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /unit content summary/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /taxonomy alignments/i })).toBeInTheDocument();

    await user.click(settingsTab);

    expect(screen.getByRole('heading', { name: /visibility/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /access restrictions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /discussion/i })).toBeInTheDocument();
  });

  it('displays the live state in the status bar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          currently_visible_to_students: true,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    render(<RootWrapper />);
    expect(await screen.findByText('Live')).toBeInTheDocument();
  });

  it('should change the visibility of the unit in the settings sidebar', async () => {
    const user = userEvent.setup();
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);

    // Move to settings
    expect(await screen.findByRole('heading', { name: /draft \(unpublished changes\)/i })).toBeInTheDocument();
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    expect(settingsTab).toBeInTheDocument();
    await user.click(settingsTab);

    // Change Visibility to Staff Only
    expect(screen.getByRole('heading', { name: /visibility/i })).toBeInTheDocument();
    const staffOnlyButton = screen.getByRole('button', { name: /staff only/i });
    expect(staffOnlyButton).toBeInTheDocument();
    await user.click(staffOnlyButton);

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.republish,
        metadata: { visible_to_staff_only: true },
      })
      .reply(200, { dummy: 'value' });

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: UNIT_VISIBILITY_STATES.staffOnly,
          has_explicit_staff_lock: true,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, true), store.dispatch);
    // Move to Details
    const detailsTab = screen.getByRole('tab', { name: /details/i });
    await user.click(detailsTab);
    expect(screen.getByRole('heading', { name: /visible to staff only/i })).toBeInTheDocument();

    // Move to settings and change visibility to all
    const editVisibilityButton = screen.getByRole('button', { name: /edit visibility/i });
    await user.click(editVisibilityButton);
    const studentVisibleButton = screen.getByRole('button', { name: /student visible/i });
    await user.click(studentVisibleButton);

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.republish,
        metadata: {
          visible_to_staff_only: null,
        },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          visibility_state: 'needs_attention',
          has_explicit_staff_lock: false,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, false), store.dispatch);

    // Move to Details
    await user.click(detailsTab);
    expect(
      screen.getByRole('heading', { name: /draft \(unpublished changes\)/i }),
    ).toBeInTheDocument();
  });

  it('displays the staff only state in the status bar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          currently_visible_to_students: false,
          visibility_state: 'staff_only',
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    render(<RootWrapper />);
    // (1) Chip in the header.
    // (2) Status title in the unit sidebar.
    expect((await screen.findAllByText('Staff Only')).length).toBe(2);
  });

  it('should disable discussions in the settings sidebar', async () => {
    const user = userEvent.setup();
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);

    // Move to settings
    expect(await screen.findByRole('heading', { name: /draft \(unpublished changes\)/i })).toBeInTheDocument();
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    expect(settingsTab).toBeInTheDocument();
    await user.click(settingsTab);

    // Disable discussions
    const discussionButton = screen.getByRole('checkbox', { name: /enable discussion/i });
    expect(discussionButton).toBeChecked();
    await user.click(discussionButton);

    axiosMock
      .onPost(getXBlockBaseApiUrl(blockId), {
        publish: PUBLISH_TYPES.republish,
        metadata: {
          visible_to_staff_only: null,
          discussion_enabled: false,
        },
      })
      .reply(200, { dummy: 'value' });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          discussion_enabled: false,
        },
      });

    await executeThunk(editCourseUnitVisibilityAndData(
      blockId,
      PUBLISH_TYPES.republish,
      false,
      null,
      false,
    ), store.dispatch);

    expect(discussionButton).not.toBeChecked();
  });

  it('should update the group access in the unit sidebar', async () => {
    const user = userEvent.setup();

    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
      });
    axiosMock
      .onPost(getXBlockBaseApiUrl(courseSectionVerticalMock.xblock_info.id))
      .reply(200, {
        ...courseSectionVerticalMock,
      });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            selected_partition_index: 0,
            selected_groups_label: 'Group A',
            selectable_partitions: [{
              id: 10,
              name: 'Content Groups',
              scheme: 'cohort',
              groups: [
                {
                  deleted: false,
                  id: 1,
                  name: 'Group A',
                  selected: true,
                },
                {
                  deleted: false,
                  id: 2,
                  name: 'Group B',
                  selected: false,
                },
                {
                  deleted: false,
                  id: 3,
                  name: 'Group C',
                  selected: false,
                },
              ],
            }],
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);
    await executeThunk(fetchCourseSectionVerticalData(blockId, courseId), store.dispatch);

    // Move to settings
    expect(await screen.findByRole('heading', { name: /draft \(unpublished changes\)/i })).toBeInTheDocument();
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    expect(settingsTab).toBeInTheDocument();
    await user.click(settingsTab);

    // Select groub
    const groupCombobox = screen.getByTestId('group-type-select');
    await user.selectOptions(groupCombobox, 'Content Groups');
    await user.click(screen.getByRole('checkbox', { name: /Group A/i }));
    await user.click(screen.getByRole('checkbox', { name: /Group B/i }));
    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    // Check that the group access is being updated
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBeGreaterThan(0);
    });

    expect(axiosMock.history.post[0].url).toBe(getXBlockBaseApiUrl(courseSectionVerticalMock.xblock_info.id));
    expect(axiosMock.history.post[0].data).toMatch(/"group_access":\{"10":\[1,2\]\}/);
  });

  it('should one group in the visibility field in the unit sidebar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
      });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            selected_partition_index: 0,
            selected_groups_label: 'Group A',
            selectable_partitions: [{
              id: 10,
              name: 'Content Groups',
              scheme: 'cohort',
              groups: [
                {
                  deleted: false,
                  id: 1,
                  name: 'Group A',
                  selected: true,
                },
                {
                  deleted: false,
                  id: 2,
                  name: 'Group B',
                  selected: false,
                },
                {
                  deleted: false,
                  id: 3,
                  name: 'Group C',
                  selected: false,
                },
              ],
            }],
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);
    await executeThunk(fetchCourseSectionVerticalData(blockId, courseId), store.dispatch);
    expect(await screen.findByRole('heading', { name: /draft \(unpublished changes\)/i })).toBeInTheDocument();
    expect(await screen.findByText(/this unit is restricted to group a and staff/i)).toBeInTheDocument();
  });

  it('should multiple groups in the visibility field in the unit sidebar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
      });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            selected_partition_index: 0,
            selected_groups_label: 'Group A, Group B, Group C',
            selectable_partitions: [{
              id: 10,
              name: 'Content Groups',
              scheme: 'cohort',
              groups: [
                {
                  deleted: false,
                  id: 1,
                  name: 'Group A',
                  selected: true,
                },
                {
                  deleted: false,
                  id: 2,
                  name: 'Group B',
                  selected: true,
                },
                {
                  deleted: false,
                  id: 3,
                  name: 'Group C',
                  selected: true,
                },
              ],
            }],
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);
    await executeThunk(fetchCourseSectionVerticalData(blockId, courseId), store.dispatch);
    expect(await screen.findByRole('heading', { name: /draft \(unpublished changes\)/i })).toBeInTheDocument();
    expect(await screen.findByText(/access restrictions applied/i)).toBeInTheDocument();
    expect(await screen.findByText(
      /access to some content in this unit is restricted to specific groups of learners\./i,
    ));
  });

  it('should render never published state in the unit sidebar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
      });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          published: false,
          released_to_students: false,
          currently_visible_to_students: false,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);
    await executeThunk(fetchCourseSectionVerticalData(blockId, courseId), store.dispatch);

    // Move to settings
    expect(await screen.findByRole('heading', { name: /draft \(never published\)/i })).toBeInTheDocument();
  });

  it('displays the scheduled state in the status bar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          currently_visible_to_students: false,
          published: true,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    render(<RootWrapper />);
    expect(await screen.findByText('Scheduled')).toBeInTheDocument();
  });

  it('displays the draft changes state in the status bar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          published: true,
          has_changes: true,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    render(<RootWrapper />);
    expect(await screen.findByText('Unpublished changes')).toBeInTheDocument();
  });

  it('displays discussions enabled label in the status bar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          discussion_enabled: true,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    render(<RootWrapper />);
    expect(await screen.findByText('Discussions Enabled')).toBeInTheDocument();
  });

  it('displays group access with one group in the status bar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            selected_partition_index: 0,
            selected_groups_label: 'Visibility group 1',
            selectable_partitions: [{
              id: 10,
              name: 'Content Groups',
              scheme: 'cohort',
              groups: [
                {
                  deleted: false,
                  id: 1,
                  name: 'Visibility group 1',
                  selected: true,
                },
                {
                  deleted: false,
                  id: 2,
                  name: 'Visibility group 2',
                  selected: false,
                },
                {
                  deleted: false,
                  id: 3,
                  name: 'Visibility group 3',
                  selected: false,
                },
              ],
            }],
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    render(<RootWrapper />);
    expect(await screen.findByText('Access: Visibility group 1')).toBeInTheDocument();
  });

  it('displays group access with multiple groups in the status bar', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            selected_partition_index: 0,
            selected_groups_label: 'Visibility group 1, Visibility group 2, Visibility group 3',
            selectable_partitions: [{
              id: 10,
              name: 'Content Groups',
              scheme: 'cohort',
              groups: [
                {
                  deleted: false,
                  id: 1,
                  name: 'Visibility group 1',
                  selected: true,
                },
                {
                  deleted: false,
                  id: 2,
                  name: 'Visibility group 2',
                  selected: true,
                },
                {
                  deleted: false,
                  id: 3,
                  name: 'Visibility group 3',
                  selected: true,
                },
              ],
            }],
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    render(<RootWrapper />);
    expect(await screen.findByText('Access: 3 Groups')).toBeInTheDocument();
  });

  describe('Add sidebar', () => {
    let user;

    const searchEndpoint = 'http://mock.meilisearch.local/multi-search';
    const searchResult = {
      ...mockResult,
      results: [
        {
          ...mockResult.results[0],
          hits: mockResult.results[0].hits.slice(0, 10),
        },
        {
          ...mockResult.results[1],
        },
      ],
    };

    beforeEach(async () => {
      setConfig({
        ...getConfig(),
        ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
      });

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
        newMockResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
        return newMockResult;
      });

      axiosMock
        .onPost(postXBlockBaseApiUrl())
        .reply(200, courseCreateXblockMock);

      user = userEvent.setup();
      render(<RootWrapper />);

      // Moving to the add sidebar
      const sidebarToggle = await screen.findByTestId('sidebar-toggle');
      expect(sidebarToggle).toBeInTheDocument();
      const addButton = within(sidebarToggle).getByRole('button', { name: 'Add' });
      expect(addButton).toBeInTheDocument();
      await user.click(addButton);
    });

    it('renders the add sidebar component without any errors', async () => {
      // Check add new tab content
      expect(await screen.findByRole('button', { name: 'Video' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Drag Drop' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Add New' })).toBeInTheDocument();
      const textCollapsible = screen.getByTestId('html-collapsible');
      expect(textCollapsible).toBeInTheDocument();
      const openResponseCollapsible = screen.getByTestId('openassessment-collapsible');
      expect(openResponseCollapsible).toBeInTheDocument();
      const problemCollapsible = screen.getByTestId('problem-collapsible');
      expect(problemCollapsible).toBeInTheDocument();

      // Check text templates
      await user.click(within(textCollapsible).getByText(/text/i));
      expect(within(textCollapsible).getByText('Raw HTML'));
      expect(within(textCollapsible).getByText('IFrame Tool'));
      expect(within(textCollapsible).getByText('Anonymous User ID'));
      expect(within(textCollapsible).getByText('Announcement'));

      // Check Open response templates
      await user.click(within(openResponseCollapsible).getByText(/open response/i));
      expect(within(openResponseCollapsible).getByText('Peer Assessment Only'));
      expect(within(openResponseCollapsible).getByText('Self Assessment Only'));
      expect(within(openResponseCollapsible).getByText('Staff Assessment Only'));
      expect(within(openResponseCollapsible).getByText('Self Assessment to Peer Assessment'));
      expect(within(openResponseCollapsible).getByText('Self Assessment to Staff Assessment'));

      // Check problem templates
      await user.click(within(problemCollapsible).getByText(/problem/i));
      expect(within(problemCollapsible).getByText('Single select'));
      expect(within(problemCollapsible).getByText('Multi-select'));
      expect(within(problemCollapsible).getByText('Dropdown'));
      expect(within(problemCollapsible).getByText('Text input'));
      expect(within(problemCollapsible).getByText('Advanced Problem'));

      // Check Advanced blocks
      const advancedButton = screen.getByRole('button', { name: 'Advanced' });
      expect(advancedButton).toBeInTheDocument();
      await user.click(advancedButton);
      expect(await screen.findByRole('button', { name: 'Annotation' })).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: 'Video' })).toBeInTheDocument();
      const backButton = screen.getByRole('button', { name: 'Back' });
      expect(backButton).toBeInTheDocument();
      await user.click(backButton);
      expect(await screen.findByRole('button', { name: 'Advanced' })).toBeInTheDocument();

      // Check existing tab content
      const existingTab = screen.getByRole('tab', { name: 'Add Existing' });
      expect(existingTab).toBeInTheDocument();
      await user.click(existingTab);
      expect(await screen.findByRole('button', { name: 'All libraries' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'See more' })).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
    });

    [
      {
        name: 'Video',
        blockType: 'video',
      },
      {
        name: 'Drag Drop',
        blockType: 'drag-and-drop-v2',
      },
    ].forEach(({ name, blockType }) => {
      it(`calls appropriate handlers on new button click for ${name} block`, async () => {
        const blockButton = await screen.findByRole('button', { name });
        expect(blockButton).toBeInTheDocument();

        await user.click(blockButton);
        await waitFor(() => {
          expect(axiosMock.history.post.length).toBe(1);
        });
        expect(axiosMock.history.post[0].url).toBe(postXBlockBaseApiUrl());
        expect(JSON.parse(axiosMock.history.post[0].data)).toMatchObject({
          category: blockType,
          parent_locator: blockId,
          type: blockType,
        });
      });
    });

    [
      {
        name: 'Text',
        blockType: 'html',
        templates: [
          {
            name: 'Raw HTML',
            boilerplate: 'raw.yaml',
          },
          {
            name: 'IFrame Tool',
            boilerplate: 'iframe.yaml',
          },
          {
            name: 'Anonymous User ID',
            boilerplate: 'anon_user_id.yaml',
          },
          {
            name: 'Announcement',
            boilerplate: 'announcement.yaml',
          },
        ],
      },
      {
        name: 'Open Response',
        blockType: 'openassessment',
        templates: [
          {
            name: 'Peer Assessment Only',
            boilerplate: 'peer-assessment',
          },
          {
            name: 'Self Assessment Only',
            boilerplate: 'self-assessment',
          },
          {
            name: 'Staff Assessment Only',
            boilerplate: 'staff-assessment',
          },
          {
            name: 'Self Assessment to Peer Assessment',
            boilerplate: 'self-to-peer',
          },
          {
            name: 'Self Assessment to Staff Assessment',
            boilerplate: 'self-to-staff',
          },
        ],
      },
    ].forEach(({ name, blockType, templates }) => {
      templates.forEach((template) => {
        it(`calls appropriate handlers on new button click for ${name} block with ${template.name} template`, async () => {
          const collapsible = screen.getByTestId(`${blockType}-collapsible`);
          expect(collapsible).toBeInTheDocument();
          await user.click(within(collapsible).getByText(name));
          const templateButton = within(collapsible).getByText(template.name);
          expect(templateButton).toBeInTheDocument();
          await user.click(templateButton);

          await waitFor(() => {
            expect(axiosMock.history.post[0].url).toBe(postXBlockBaseApiUrl());
          });

          expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
            category: blockType,
            parent_locator: blockId,
            boilerplate: template.boilerplate,
            ...(blockType !== 'openassessment' ? { type: blockType } : {}),
          });
        });
      });
    });

    [
      {
        name: 'Annotation',
        blockType: 'annotatable',
      },
      {
        name: 'Video',
        blockType: 'videoalpha',
      },
    ].forEach(({ name, blockType }) => {
      it(`calls appropriate handlers on new button click for Advanced ${name} block`, async () => {
        const advancedButton = await screen.findByRole('button', { name: 'Advanced' });
        expect(advancedButton).toBeInTheDocument();
        await user.click(advancedButton);

        const blockButton = await screen.findByRole('button', { name });
        expect(blockButton).toBeInTheDocument();
        await user.click(blockButton);

        await waitFor(() => {
          expect(axiosMock.history.post.length).toBe(1);
        });
        expect(axiosMock.history.post[0].url).toBe(postXBlockBaseApiUrl());
        expect(JSON.parse(axiosMock.history.post[0].data)).toMatchObject({
          category: blockType,
          parent_locator: blockId,
          type: blockType,
        });
      });
    });

    it('calls appropriate handlers on existing button click', async () => {
      // Check existing tab content
      await user.click(await screen.findByRole('tab', { name: 'Add Existing' }));

      // Add text
      const textCard = await screen.findByText(/introduction to testing/i);
      expect(textCard).toBeInTheDocument();
      await user.click(textCard);
      const addButton = await screen.findByRole('button', { name: 'Add to Course' });
      expect(addButton).toBeInTheDocument();
      await user.click(addButton);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
      });
      expect(axiosMock.history.post[0].url).toBe(postXBlockBaseApiUrl());
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        category: 'html',
        parent_locator: blockId,
        library_content_key: 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
        type: 'library_v2',
      });
    });
  });

  it('not render add sidebar in units from libraries (read-only)', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    render(<RootWrapper />);

    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          upstreamInfo: {
            ...courseSectionVerticalMock.xblock_info,
            upstreamRef: 'lct:org:lib:unit:unit-1',
            upstreamLink: 'some-link',
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);

    expect(screen.getByText(/this unit can only be edited from the \./i)).toBeInTheDocument();

    // Does not render the "Add Components" section
    expect(screen.queryByText(addComponentMessages.title.defaultMessage)).not.toBeInTheDocument();

    // Does not render the Add button in the header to open the add sidebar
    expect(screen.queryByText('Add')).not.toBeInTheDocument();

    // Does not render the Add button in the navbar.
    const sidebarToggle = await screen.findByTestId('sidebar-toggle');
    expect(sidebarToggle).toBeInTheDocument();
    expect(within(sidebarToggle).queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
  });
});
