import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
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

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <HeaderTitle
        unitTitle={unitTitle}
        isTitleEditFormOpen={isTitleEditFormOpen}
        handleTitleEdit={handleTitleEdit}
        handleTitleEditSubmit={handleTitleEditSubmit}
        handleConfigureSubmit={handleConfigureSubmit}
        {...props}
      />
    </IntlProvider>
  </AppProvider>,
);

describe('<HeaderTitle />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
  });

  it('render HeaderTitle component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(unitTitle)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeInTheDocument();
  });

  it('render HeaderTitle with open edit form', () => {
    const { getByRole } = renderComponent({
      isTitleEditFormOpen: true,
    });

    expect(getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toHaveValue(unitTitle);
    expect(getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeEnabled();
    expect(getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeEnabled();
  });

  it('Units sourced from upstream show a disabled edit button', async () => {
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

    const { getByRole } = renderComponent();

    expect(getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeDisabled();
    expect(getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeEnabled();
  });

  it('calls toggle edit title form by clicking on Edit button', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();

    const editTitleButton = getByRole('button', { name: messages.altButtonEdit.defaultMessage });
    await user.click(editTitleButton);
    expect(handleTitleEdit).toHaveBeenCalledTimes(1);
  });

  it('calls saving title by clicking outside or press Enter key', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent({
      isTitleEditFormOpen: true,
    });

    const titleField = getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage });
    await user.type(titleField, ' 1');
    expect(titleField).toHaveValue(`${unitTitle} 1`);
    await user.click(document.body);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(1);

    await user.click(titleField);
    await user.type(titleField, ' 2[Enter]');
    expect(titleField).toHaveValue(`${unitTitle} 1 2`);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(2);
  });

  it('displays a visibility message with the selected groups for the unit', async () => {
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
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    const { getByText } = renderComponent();
    const visibilityMessage = messages.definedVisibilityMessage.defaultMessage
      .replace('{selectedGroupsLabel}', 'Visibility group 1');

    await waitFor(() => {
      expect(getByText(visibilityMessage)).toBeInTheDocument();
    });
  });

  it('displays a visibility message with the selected groups for some of xblock', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          has_partition_group_components: true,
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.commonVisibilityMessage.defaultMessage)).toBeInTheDocument();
    });
  });
});
