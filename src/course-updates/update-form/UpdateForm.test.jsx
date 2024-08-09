import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import moment from 'moment/moment';

import initializeStore from '../../store';
import { REQUEST_TYPES } from '../constants';
import { courseHandoutsMock, courseUpdatesMock } from '../__mocks__';
import UpdateForm from './UpdateForm';
import messages from './messages';

let store;
const closeMock = jest.fn();
const onSubmitMock = jest.fn();
const addNewUpdateMock = { id: 0, date: moment().utc().toDate(), content: 'Some content' };
const formattedDateMock = '07/11/2023';
const contentMock = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'foo bar',
  };
});

jest.mock('../../editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true, // Required to mock a default export
  default: () => <div>Widget</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

const courseUpdatesInitialValues = (requestType) => {
  switch (requestType) {
    case REQUEST_TYPES.add_new_update:
      return addNewUpdateMock;
    case REQUEST_TYPES.edit_update:
      return courseUpdatesMock[0];
    default:
      return courseHandoutsMock;
  }
};

const renderComponent = ({ requestType }) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <UpdateForm
        isOpen
        close={closeMock}
        requestType={requestType}
        onSubmit={onSubmitMock}
        courseUpdatesInitialValues={courseUpdatesInitialValues(requestType)}
      />
    </IntlProvider>
  </AppProvider>,
);

describe('<UpdateForm />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });
  it('render Add new update form correctly', async () => {
    const { getByText, getByDisplayValue, getByRole } = renderComponent({ requestType: REQUEST_TYPES.add_new_update });
    const { date } = courseUpdatesInitialValues(REQUEST_TYPES.add_new_update);
    const formattedDate = moment(date).utc().format('MM/DD/yyyy');

    expect(getByText(messages.addNewUpdateTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.updateFormDate.defaultMessage)).toBeInTheDocument();
    expect(getByDisplayValue(formattedDate)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage }));
    expect(getByRole('button', { name: messages.postButton.defaultMessage }));
  });

  it('render Edit update form correctly', async () => {
    const { getByText, getByDisplayValue, getByRole } = renderComponent({ requestType: REQUEST_TYPES.edit_update });

    expect(getByText(messages.editUpdateTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.updateFormDate.defaultMessage)).toBeInTheDocument();
    expect(getByDisplayValue(formattedDateMock)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage }));
    expect(getByRole('button', { name: messages.postButton.defaultMessage }));
  });

  it('render Edit handouts form correctly', async () => {
    const {
      getByText, getByRole, queryByTestId, queryByText,
    } = renderComponent({ requestType: REQUEST_TYPES.edit_handouts });

    expect(getByText(messages.editHandoutsTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.updateFormDate.defaultMessage)).not.toBeInTheDocument();
    expect(queryByTestId('course-updates-datepicker')).not.toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage }));
    expect(getByRole('button', { name: messages.saveButton.defaultMessage }));
  });

  it('calls closeMock when clicking cancel button', () => {
    const { getByRole } = renderComponent({ requestType: REQUEST_TYPES.add_new_update });

    const cancelButton = getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmitMock with correct values when clicking post button', async () => {
    const { getByDisplayValue, getByRole } = renderComponent({ requestType: REQUEST_TYPES.edit_update });
    const datePicker = getByDisplayValue(formattedDateMock);
    const postButton = getByRole('button', { name: messages.postButton.defaultMessage });

    fireEvent.change(datePicker, { target: { value: formattedDateMock } });

    await act(async () => {
      fireEvent.click(postButton);
    });

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        {
          id: 1,
          date: 'July 11, 2023',
          content: contentMock,
        },
        expect.objectContaining({ submitForm: expect.any(Function) }),
      );
    });
  });

  it('render error message when date is inValid', async () => {
    const { getByDisplayValue, getByText, getByRole } = renderComponent({ requestType: REQUEST_TYPES.edit_update });
    const datePicker = getByDisplayValue(formattedDateMock);

    fireEvent.change(datePicker, { target: { value: '' } });

    await waitFor(() => {
      expect(getByText(messages.updateFormInValid.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.postButton.defaultMessage })).toBeDisabled();
    });
  });
});
