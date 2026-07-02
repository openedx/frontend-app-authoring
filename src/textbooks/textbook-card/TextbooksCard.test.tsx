import {
  render,
  waitFor,
  within,
  initializeMocks,
  screen,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { textbooksMock } from '../__mocks__';
import TextbookCard from './TextbooksCard';
import messages from '../textbook-form/messages';
import textbookCardMessages from './messages';

const courseId = 'course-v1:org+101+101';
const textbook = textbooksMock.textbooks[1];
const onEditSubmitMock = jest.fn();
const onDeleteSubmitMock = jest.fn();

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <TextbookCard
        textbook={textbook}
        onEditSubmit={onEditSubmitMock}
        onDeleteSubmit={onDeleteSubmitMock}
        textbookIndex={1}
      />,
    </CourseAuthoringProvider>,
  );

describe('<TextbookCard />', () => {
  let user;
  beforeEach(async () => {
    user = userEvent.setup();
    initializeMocks();
  });

  it('render TextbookCard component correctly', async () => {
    renderComponent();

    expect(screen.getByText(textbook.tabTitle)).toBeInTheDocument();
    expect(screen.getByTestId('textbook-view-button')).toBeInTheDocument();
    expect(screen.getByTestId('textbook-edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('textbook-delete-button')).toBeInTheDocument();
    expect(screen.getByText('1 PDF chapters')).toBeInTheDocument();

    const collapseButton = document.querySelector('.collapsible-trigger');
    await user.click(collapseButton);

    textbook.chapters.forEach(({ title, url }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(url)).toBeInTheDocument();
    });
  });

  it('renders edit TextbookForm after clicking on edit button', async () => {
    renderComponent();

    const editButton = screen.getByTestId('textbook-edit-button');
    await user.click(editButton);

    expect(screen.getByTestId('textbook-form')).toBeInTheDocument();
    expect(screen.queryByTestId('textbook-card')).not.toBeInTheDocument();
  });

  it('closes edit TextbookForm after clicking on cancel button', async () => {
    renderComponent();

    const editButton = screen.getByTestId('textbook-edit-button');
    await user.click(editButton);

    expect(screen.getByTestId('textbook-form')).toBeInTheDocument();
    expect(screen.queryByTestId('textbook-card')).not.toBeInTheDocument();

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(screen.queryByTestId('textbook-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('textbook-card')).toBeInTheDocument();
  });

  it('calls onEditSubmit when the "Save" button is clicked with a valid form', async () => {
    renderComponent();

    const editButton = screen.getByTestId('textbook-edit-button');
    await user.click(editButton);

    const tabTitleInput = screen.getByPlaceholderText(messages.tabTitlePlaceholder.defaultMessage);
    const chapterInput = screen.getByPlaceholderText(
      messages.chapterTitlePlaceholder.defaultMessage.replace(
        '{value}',
        textbooksMock.textbooks[1].chapters.length.toString(),
      ),
    );
    const urlInput = screen.getByPlaceholderText(messages.chapterUrlPlaceholder.defaultMessage);

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

    await user.clear(tabTitleInput);
    await user.type(tabTitleInput, newFormValues.tab_title);
    await user.clear(chapterInput);
    await user.type(chapterInput, newFormValues.chapters[0].title);
    await user.clear(urlInput);
    await user.type(urlInput, newFormValues.chapters[0].url);

    await user.click(screen.getByRole('button', { name: messages.saveButton.defaultMessage }));

    await waitFor(() => {
      expect(onEditSubmitMock).toHaveBeenCalledTimes(1);
    });
    expect(onEditSubmitMock).toHaveBeenCalledWith(
      newFormValues,
      expect.any(Function),
    );
  });

  it('DeleteModal is open when delete button is clicked', async () => {
    renderComponent();

    const deleteButton = screen.getByTestId('textbook-delete-button');
    await user.click(deleteButton);

    const deleteModal = screen.getByRole('dialog');

    const modalTitle = within(deleteModal)
      .getByText(textbookCardMessages.deleteModalTitle.defaultMessage
        .replace('{textbookTitle}', textbook.tabTitle));
    const modalDescription = within(deleteModal)
      .getByText(textbookCardMessages.deleteModalDescription.defaultMessage);

    expect(modalTitle).toBeInTheDocument();
    expect(modalDescription).toBeInTheDocument();
  });

  it('calls onDeleteSubmit when the DeleteModal is open', async () => {
    renderComponent();

    const deleteButton = screen.getByTestId('textbook-delete-button');
    await user.click(deleteButton);

    const deleteModal = screen.getByRole('dialog');

    const modalSubmitButton = within(deleteModal)
      .getByRole('button', { name: 'Delete' });

    await user.click(modalSubmitButton);

    expect(onDeleteSubmitMock).toHaveBeenCalledTimes(1);
  });
});
