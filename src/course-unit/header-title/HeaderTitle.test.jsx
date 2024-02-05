import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { getCourseUnitApiUrl } from '../data/api';
import { fetchCourseUnitQuery } from '../data/thunk';
import { courseUnitIndexMock } from '../__mocks__';
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
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, courseUnitIndexMock);
    await executeThunk(fetchCourseUnitQuery(blockId), store.dispatch);
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
    expect(getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeInTheDocument();
  });

  it('calls toggle edit title form by clicking on Edit button', () => {
    const { getByRole } = renderComponent();

    const editTitleButton = getByRole('button', { name: messages.altButtonEdit.defaultMessage });
    userEvent.click(editTitleButton);
    expect(handleTitleEdit).toHaveBeenCalledTimes(1);
  });

  it('calls saving title by clicking outside or press Enter key', async () => {
    const { getByRole } = renderComponent({
      isTitleEditFormOpen: true,
    });

    const titleField = getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage });
    userEvent.type(titleField, ' 1');
    expect(titleField).toHaveValue(`${unitTitle} 1`);
    userEvent.click(document.body);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(1);

    userEvent.click(titleField);
    userEvent.type(titleField, ' 2[Enter]');
    expect(titleField).toHaveValue(`${unitTitle} 1 2`);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(2);
  });

  it('displays a visibility message with the selected groups for the unit', async () => {
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        user_partition_info: {
          ...courseUnitIndexMock.user_partition_info,
          selected_partition_index: '1',
          selected_groups_label: 'Visibility group 1',
        },
      });
    await executeThunk(fetchCourseUnitQuery(blockId), store.dispatch);
    const { getByText } = renderComponent();
    const visibilityMessage = messages.definedVisibilityMessage.defaultMessage
      .replace('{selectedGroupsLabel}', 'Visibility group 1');

    expect(getByText(visibilityMessage)).toBeInTheDocument();
  });

  it('displays a visibility message with the selected groups for some of xblock', async () => {
    axiosMock
      .onGet(getCourseUnitApiUrl(blockId))
      .reply(200, {
        ...courseUnitIndexMock,
        has_partition_group_components: true,
      });
    await executeThunk(fetchCourseUnitQuery(blockId), store.dispatch);
    const { getByText } = renderComponent();

    expect(getByText(messages.commonVisibilityMessage.defaultMessage)).toBeInTheDocument();
  });
});
