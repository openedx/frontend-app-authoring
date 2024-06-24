import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { getTextbookFormInitialValues } from '../utils';
import { getUpdateTextbooksApiUrl } from '../data/api';
import { createTextbookQuery } from '../data/thunk';
import TextbookForm from './TextbookForm';
import messages from './messages';

let axiosMock;
let store;
const courseId = 'course-v1:org+101+101';

const closeTextbookFormMock = jest.fn();
const initialFormValuesMock = getTextbookFormInitialValues();
const onSubmitMock = jest.fn();
const onSavingStatus = jest.fn();

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <TextbookForm
        closeTextbookForm={closeTextbookFormMock}
        initialFormValues={initialFormValuesMock}
        onSubmit={onSubmitMock}
        onSavingStatus={onSavingStatus}
        courseId={courseId}
      />
    </IntlProvider>
  </AppProvider>,
);

describe('<TextbookForm />', () => {
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
  });

  it('renders TextbooksForm component correctly', async () => {
    const {
      getByText, getByRole, getByPlaceholderText, getByTestId,
    } = renderComponent();

    await waitFor(() => {
      expect(getByText(`${messages.tabTitleLabel.defaultMessage} *`)).toBeInTheDocument();
      expect(getByPlaceholderText(messages.tabTitlePlaceholder.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.tabTitleHelperText.defaultMessage)).toBeInTheDocument();

      expect(getByText(`${messages.chapterTitleLabel.defaultMessage} *`)).toBeInTheDocument();
      expect(getByPlaceholderText(
        messages.chapterTitlePlaceholder.defaultMessage.replace('{value}', initialFormValuesMock.chapters.length),
      )).toBeInTheDocument();
      expect(getByText(messages.chapterTitleHelperText.defaultMessage)).toBeInTheDocument();

      expect(getByText(`${messages.chapterUrlLabel.defaultMessage} *`)).toBeInTheDocument();
      expect(getByPlaceholderText(messages.chapterUrlPlaceholder.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.chapterUrlHelperText.defaultMessage)).toBeInTheDocument();

      expect(getByTestId('chapter-upload-button')).toBeInTheDocument();
      expect(getByTestId('chapter-delete-button')).toBeInTheDocument();

      expect(getByRole('button', { name: messages.addChapterButton.defaultMessage }));
      expect(getByRole('button', { name: messages.cancelButton.defaultMessage }));
      expect(getByRole('button', { name: messages.saveButton.defaultMessage }));
    });
  });

  it('calls onSubmit when the "Save" button is clicked with a valid form', async () => {
    const { getByPlaceholderText, getByRole } = renderComponent();

    const tabTitleInput = getByPlaceholderText(messages.tabTitlePlaceholder.defaultMessage);
    const chapterInput = getByPlaceholderText(
      messages.chapterTitlePlaceholder.defaultMessage.replace('{value}', initialFormValuesMock.chapters.length),
    );
    const urlInput = getByPlaceholderText(messages.chapterUrlPlaceholder.defaultMessage);

    const formValues = {
      tab_title: 'Tab title',
      chapters: [
        {
          title: 'Chapter',
          url: 'Url',
        },
      ],
    };

    userEvent.type(tabTitleInput, formValues.tab_title);
    userEvent.type(chapterInput, formValues.chapters[0].title);
    userEvent.type(urlInput, formValues.chapters[0].url);

    userEvent.click(getByRole('button', { name: messages.saveButton.defaultMessage }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        formValues,
        expect.objectContaining({ submitForm: expect.any(Function) }),
      );
    });

    axiosMock
      .onPost(getUpdateTextbooksApiUrl(courseId))
      .reply(200);

    await executeThunk(createTextbookQuery(courseId, formValues), store.dispatch);
  });

  it('"Save" button is disabled when the form is empty', async () => {
    const { getByRole } = renderComponent();

    await waitFor(() => {
      const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });
      expect(saveButton).toBeDisabled();
    });
  });

  it('"Save" button is disabled when the chapters length less than 1', async () => {
    const { getByRole, getByTestId } = renderComponent();

    const deleteChapterButton = getByTestId('chapter-delete-button');
    const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });

    userEvent.click(deleteChapterButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('"Cancel" button is disabled when the form is empty', async () => {
    const { getByRole } = renderComponent();

    await waitFor(() => {
      const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });
      expect(saveButton).toBeDisabled();
    });
  });

  it('"Add a chapter" button add new chapters field', async () => {
    const { getByRole, getAllByTestId } = renderComponent();

    const addChapterButton = getByRole('button', { name: messages.addChapterButton.defaultMessage });

    userEvent.click(addChapterButton);

    await waitFor(() => {
      expect(getAllByTestId('form-chapters-fields')).toHaveLength(2);
    });
  });

  it('open modal dropzone when "Upload" button is clicked', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      const button = getByTestId('chapter-upload-button');
      userEvent.click(button);
      expect(getByTestId('modal-backdrop')).toBeInTheDocument();
    });
  });
});
