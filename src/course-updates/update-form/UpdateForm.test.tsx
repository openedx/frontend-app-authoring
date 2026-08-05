import {
  render,
  fireEvent,
  waitFor,
  act,
  initializeMocks,
  screen,
} from '@src/testUtils';
import moment from 'moment/moment';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { REQUEST_TYPES } from '../constants';
import { courseHandoutsMock, courseUpdatesMock } from '../__mocks__';
import UpdateForm from './UpdateForm';
import type { ValueOf } from '@src/types';
import type { CourseHandouts } from '../data/api';
import type { UpdateFormValues } from './utils';
import messages from './messages';

const closeMock = jest.fn();
const onSubmitMock = jest.fn();
const addNewUpdateMock = { id: 0, date: moment().utc().toDate(), content: 'Some content' };
const formattedDateMock = '07/11/2023';
const contentMock =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'foo bar',
  };
});

jest.mock('@src/editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true, // Required to mock a default export
  default: () => <div>Widget</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

type RequestType = ValueOf<typeof REQUEST_TYPES>;

const courseUpdatesInitialValues = (requestType: RequestType): UpdateFormValues | CourseHandouts => {
  switch (requestType) {
    case REQUEST_TYPES.add_new_update:
      return addNewUpdateMock;
    case REQUEST_TYPES.edit_update:
      return courseUpdatesMock[0];
    default:
      return courseHandoutsMock;
  }
};

const renderComponent = ({
  requestType,
  initialValues,
}: {
  requestType: RequestType;
  initialValues?: UpdateFormValues | CourseHandouts;
}) =>
  render(
    <CourseAuthoringProvider courseId="1">
      <UpdateForm
        isOpen
        close={closeMock}
        requestType={requestType}
        onSubmit={onSubmitMock}
        courseUpdatesInitialValues={initialValues || courseUpdatesInitialValues(requestType)}
      />,
    </CourseAuthoringProvider>,
  );

describe('<UpdateForm />', () => {
  beforeEach(() => {
    initializeMocks();
  });
  it('render Add new update form correctly', async () => {
    renderComponent({
      requestType: REQUEST_TYPES.add_new_update,
    });
    const { date } = courseUpdatesInitialValues(REQUEST_TYPES.add_new_update) as UpdateFormValues;
    const formattedDate = moment(date).utc().format('MM/DD/yyyy');

    expect(await screen.findByText(messages.addNewUpdateTitle.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.updateFormDate.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByLabelText(messages.updateFormDate.defaultMessage)).toHaveValue(formattedDate);
    expect(await screen.findByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.postButton.defaultMessage })).toBeInTheDocument();
  });

  it('render Edit update form correctly', async () => {
    renderComponent({ requestType: REQUEST_TYPES.edit_update });

    expect(await screen.findByText(messages.editUpdateTitle.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.updateFormDate.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByLabelText(messages.updateFormDate.defaultMessage)).toHaveValue(formattedDateMock);
    expect(await screen.findByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.postButton.defaultMessage })).toBeInTheDocument();
  });

  it('render Edit handouts form correctly', async () => {
    renderComponent({ requestType: REQUEST_TYPES.edit_handouts });

    expect(await screen.findByText(messages.editHandoutsTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.updateFormDate.defaultMessage)).not.toBeInTheDocument();
    expect(screen.queryByTestId('course-updates-datepicker')).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls closeMock when clicking cancel button', async () => {
    renderComponent({ requestType: REQUEST_TYPES.add_new_update });

    const cancelButton = await screen.findByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmitMock with correct values when clicking post button', async () => {
    renderComponent({ requestType: REQUEST_TYPES.edit_update });
    const datePicker = await screen.findByDisplayValue(formattedDateMock);
    const postButton = await screen.findByRole('button', { name: messages.postButton.defaultMessage });

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

  it('does not show a date error for a valid date when content is blank', async () => {
    renderComponent({
      requestType: REQUEST_TYPES.add_new_update,
      initialValues: { ...addNewUpdateMock, content: '' },
    });

    await waitFor(() => {
      expect(screen.queryByText(messages.updateFormInValid.defaultMessage)).not.toBeInTheDocument();
    });
    expect(await screen.findByRole('button', { name: messages.postButton.defaultMessage })).toBeDisabled();
  });

  it('shows the required content error and disables Post when content is blank', async () => {
    renderComponent({
      requestType: REQUEST_TYPES.add_new_update,
      initialValues: { ...addNewUpdateMock, content: '' },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.updateFormContentRequired.defaultMessage);
    expect(await screen.findByRole('button', { name: messages.postButton.defaultMessage })).toBeDisabled();
  });

  it('shows the date error when the date is invalid', async () => {
    renderComponent({ requestType: REQUEST_TYPES.edit_update });
    const datePicker = await screen.findByDisplayValue(formattedDateMock);

    fireEvent.change(datePicker, { target: { value: '' } });

    expect(await screen.findByText(messages.updateFormInValid.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.postButton.defaultMessage })).toBeDisabled();
  });
});
