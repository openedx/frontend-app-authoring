import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform';

import { getEditTextbooksApiUrl } from '../data/api';
import { deleteTextbookQuery, editTextbookQuery } from '../data/thunk';
import { textbooksMock } from '../__mocks__';
import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import TextbookCard from './TextbooksCard';
import messages from '../textbook-form/messages';
import textbookCardMessages from './messages';

let axiosMock;
let store;

const courseId = 'course-v1:org+101+101';
const textbook = textbooksMock.textbooks[1];
const onEditSubmitMock = jest.fn();
const onDeleteSubmitMock = jest.fn();
const handleSavingStatusDispatchMock = jest.fn();

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <TextbookCard
        textbook={textbook}
        courseId={courseId}
        onEditSubmit={onEditSubmitMock}
        onDeleteSubmit={onDeleteSubmitMock}
        handleSavingStatusDispatch={handleSavingStatusDispatchMock}
      />
    </IntlProvider>
  </AppProvider>,
);

describe('<TextbookCard />', () => {
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

  it('render TextbookCard component correctly', () => {
    const { getByText, getByTestId } = renderComponent();

    expect(getByText(textbook.tabTitle)).toBeInTheDocument();
    expect(getByTestId('textbook-view-button')).toBeInTheDocument();
    expect(getByTestId('textbook-edit-button')).toBeInTheDocument();
    expect(getByTestId('textbook-delete-button')).toBeInTheDocument();
    expect(getByText('1 PDF chapters')).toBeInTheDocument();

    const collapseButton = document.querySelector('.collapsible-trigger');
    userEvent.click(collapseButton);

    textbook.chapters.forEach(({ title, url }) => {
      expect(getByText(title)).toBeInTheDocument();
      expect(getByText(url)).toBeInTheDocument();
    });
  });

  it('renders edit TextbookForm after clicking on edit button', () => {
    const { getByTestId, queryByTestId } = renderComponent();

    const editButton = getByTestId('textbook-edit-button');
    userEvent.click(editButton);

    expect(getByTestId('textbook-form')).toBeInTheDocument();
    expect(queryByTestId('textbook-card')).not.toBeInTheDocument();
  });

  it('closes edit TextbookForm after clicking on cancel button', () => {
    const { getByTestId, queryByTestId } = renderComponent();

    const editButton = getByTestId('textbook-edit-button');
    userEvent.click(editButton);

    expect(getByTestId('textbook-form')).toBeInTheDocument();
    expect(queryByTestId('textbook-card')).not.toBeInTheDocument();

    const cancelButton = getByTestId('cancel-button');
    userEvent.click(cancelButton);

    expect(queryByTestId('textbook-form')).not.toBeInTheDocument();
    expect(getByTestId('textbook-card')).toBeInTheDocument();
  });

  it('calls onEditSubmit when the "Save" button is clicked with a valid form', async () => {
    const { getByPlaceholderText, getByRole, getByTestId } = renderComponent();

    const editButton = getByTestId('textbook-edit-button');
    userEvent.click(editButton);

    const tabTitleInput = getByPlaceholderText(messages.tabTitlePlaceholder.defaultMessage);
    const chapterInput = getByPlaceholderText(
      messages.chapterTitlePlaceholder.defaultMessage.replace('{value}', textbooksMock.textbooks[1].chapters.length),
    );
    const urlInput = getByPlaceholderText(messages.chapterUrlPlaceholder.defaultMessage);

    const newFormValues = {
      tab_title: 'Tab title',
      chapters: [
        {
          title: 'Chapter',
          url: 'Url',
        },
      ],
      id: textbooksMock.textbooks[1].id,
    };

    userEvent.clear(tabTitleInput);
    userEvent.type(tabTitleInput, newFormValues.tab_title);
    userEvent.clear(chapterInput);
    userEvent.type(chapterInput, newFormValues.chapters[0].title);
    userEvent.clear(urlInput);
    userEvent.type(urlInput, newFormValues.chapters[0].url);

    userEvent.click(getByRole('button', { name: messages.saveButton.defaultMessage }));

    await waitFor(() => {
      expect(onEditSubmitMock).toHaveBeenCalledTimes(1);
      expect(onEditSubmitMock).toHaveBeenCalledWith(
        newFormValues,
        expect.objectContaining({ submitForm: expect.any(Function) }),
      );
    });

    axiosMock
      .onPost(getEditTextbooksApiUrl(courseId, textbooksMock.textbooks[1].id))
      .reply(200);

    await executeThunk(editTextbookQuery(courseId, newFormValues), store.dispatch);
  });

  it('DeleteModal is open when delete button is clicked', async () => {
    const { getByTestId, getByRole } = renderComponent();

    const deleteButton = getByTestId('textbook-delete-button');
    userEvent.click(deleteButton);

    await waitFor(() => {
      const deleteModal = getByRole('dialog');

      const modalTitle = within(deleteModal)
        .getByText(textbookCardMessages.deleteModalTitle.defaultMessage
          .replace('{textbookTitle}', textbook.tabTitle));
      const modalDescription = within(deleteModal)
        .getByText(textbookCardMessages.deleteModalDescription.defaultMessage);

      expect(modalTitle).toBeInTheDocument();
      expect(modalDescription).toBeInTheDocument();
    });
  });

  it('calls onDeleteSubmit when the DeleteModal is open', async () => {
    const { getByTestId, getByRole } = renderComponent();

    const deleteButton = getByTestId('textbook-delete-button');
    userEvent.click(deleteButton);

    await waitFor(() => {
      const deleteModal = getByRole('dialog');

      const modalSubmitButton = within(deleteModal)
        .getByRole('button', { name: 'Delete' });

      userEvent.click(modalSubmitButton);

      const textbookId = textbooksMock.textbooks[1].id;

      expect(onDeleteSubmitMock).toHaveBeenCalledTimes(1);
      axiosMock
        .onDelete(getEditTextbooksApiUrl(courseId, textbookId))
        .reply(200);

      executeThunk(deleteTextbookQuery(courseId, textbookId), store.dispatch);
    });
  });
});
