import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { executeThunk } from '@src/utils';

import { getCourseSectionVerticalApiUrl } from '../data/api';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { courseSectionVerticalMock } from '../__mocks__';
import HeaderTitle from './HeaderTitle';
import messages from './messages';

const blockId = '123';
const unitTitle = 'Getting Started';
const isTitleEditFormOpen = false;
const handleTitleEdit = jest.fn();
const handleTitleEditSubmit = jest.fn();
const handleConfigureSubmit = jest.fn();
let store;
let axiosMock;

const renderComponent = (props?: any) => render(
  <HeaderTitle
    unitTitle={unitTitle}
    isTitleEditFormOpen={isTitleEditFormOpen}
    handleTitleEdit={handleTitleEdit}
    handleTitleEditSubmit={handleTitleEditSubmit}
    handleConfigureSubmit={handleConfigureSubmit}
    {...props}
  />,
);

describe('<HeaderTitle />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();

    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
  });

  it('render HeaderTitle component correctly', () => {
    renderComponent();

    expect(screen.getByText(unitTitle)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeInTheDocument();
  });

  it('render HeaderTitle with open edit form', () => {
    renderComponent({
      isTitleEditFormOpen: true,
    });

    expect(screen.getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toHaveValue(unitTitle);
    expect(screen.getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeEnabled();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeEnabled();
  });

  it('Units sourced from upstream show a enabled edit button', async () => {
    // Override mock unit with one sourced from an upstream library
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          upstreamInfo: {
            ...courseSectionVerticalMock.xblock_info.upstreamInfo,
            upstreamRef: 'lct:org:lib:unit:unit-1',
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    renderComponent();

    expect(screen.getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeEnabled();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeEnabled();
  });

  it('calls toggle edit title form by clicking on Edit button', async () => {
    const user = userEvent.setup();
    renderComponent();

    const editTitleButton = screen.getByRole('button', { name: messages.altButtonEdit.defaultMessage });
    await user.click(editTitleButton);
    expect(handleTitleEdit).toHaveBeenCalledTimes(1);
  });

  it('calls saving title by clicking outside or press Enter key', async () => {
    const user = userEvent.setup();
    renderComponent({
      isTitleEditFormOpen: true,
    });

    const titleField = screen.getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage });
    await user.type(titleField, ' 1');
    expect(titleField).toHaveValue(`${unitTitle} 1`);
    await user.click(document.body);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(1);

    await user.click(titleField);
    await user.type(titleField, ' 2[Enter]');
    expect(titleField).toHaveValue(`${unitTitle} 1 2`);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(2);
  });

  it('displays the live state in the status bar', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            ...courseSectionVerticalMock.xblock_info.user_partition_info,
            selected_partition_index: 1,
            selected_groups_label: 'Visibility group 1',
          },
          currently_visible_to_students: true,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    renderComponent();
    expect(await screen.findByText('Live')).toBeInTheDocument();
  });

  it('displays the ready state in the status bar', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            ...courseSectionVerticalMock.xblock_info.user_partition_info,
            selected_partition_index: 1,
            selected_groups_label: 'Visibility group 1',
          },
          currently_visible_to_students: false,
          visibility_state: 'ready',
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    renderComponent();
    expect(await screen.findByText('Ready')).toBeInTheDocument();
  });

  it('displays the unpublished state in the status bar', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            ...courseSectionVerticalMock.xblock_info.user_partition_info,
            selected_partition_index: 1,
            selected_groups_label: 'Visibility group 1',
          },
          visibility_state: 'staff_only',
          discussion_enabled: true,
          published: false,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    renderComponent();
    expect(await screen.findByText('Unpublished')).toBeInTheDocument();
  });

  it('displays the published state in the status bar', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            ...courseSectionVerticalMock.xblock_info.user_partition_info,
            selected_partition_index: 1,
            selected_groups_label: 'Visibility group 1',
          },
          visibility_state: 'staff_only',
          discussion_enabled: true,
          published: true,
          has_changes: false,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    renderComponent();
    expect(await screen.findByText('Published')).toBeInTheDocument();
  });

  it('displays the draft changes state in the status bar', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            ...courseSectionVerticalMock.xblock_info.user_partition_info,
            selected_partition_index: 1,
            selected_groups_label: 'Visibility group 1',
          },
          visibility_state: 'staff_only',
          discussion_enabled: true,
          published: true,
          has_changes: true,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    renderComponent();
    expect(await screen.findByText('Draft Changes')).toBeInTheDocument();
  });

  it('displays extra setting labels in the status bar', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          user_partition_info: {
            ...courseSectionVerticalMock.xblock_info.user_partition_info,
            selected_partition_index: 1,
            selected_groups_label: 'Visibility group 1',
          },
          visibility_state: 'staff_only',
          discussion_enabled: true,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    renderComponent();
    // Staff visibility label
    expect(await screen.findByText('Visible to Staff-Only')).toBeInTheDocument();
    // Group visibility names
    expect(await screen.findByText('Visibility group 1')).toBeInTheDocument();
    // Discussions setting label
    expect(await screen.findByText('Discussions Enabled')).toBeInTheDocument();
  });
});
