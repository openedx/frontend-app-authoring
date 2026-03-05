import {
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { getTextbookFormInitialValues } from '../utils';
import TextbookForm from './TextbookForm';
import messages from './messages';

const courseId = 'course-v1:org+101+101';

const closeTextbookFormMock = jest.fn();
const initialFormValuesMock = getTextbookFormInitialValues();
const onSubmitMock = jest.fn();

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <TextbookForm
        closeTextbookForm={closeTextbookFormMock}
        initialFormValues={initialFormValuesMock}
        onSubmit={onSubmitMock}
      />
    </CourseAuthoringProvider>,
  );

describe('<TextbookForm />', () => {
  beforeEach(async () => {
    initializeMocks();
  });

  it('renders TextbooksForm component correctly', async () => {
    renderComponent();

    expect(await screen.findByText(`${messages.tabTitleLabel.defaultMessage} *`)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(messages.tabTitlePlaceholder.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.tabTitleHelperText.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(`${messages.chapterTitleLabel.defaultMessage} *`)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(
      messages.chapterTitlePlaceholder.defaultMessage.replace(
        '{value}',
        initialFormValuesMock.chapters.length.toString(),
      ),
    )).toBeInTheDocument();
    expect(screen.getByText(messages.chapterTitleHelperText.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(`${messages.chapterUrlLabel.defaultMessage} *`)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(messages.chapterUrlPlaceholder.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.chapterUrlHelperText.defaultMessage)).toBeInTheDocument();

    expect(screen.getByTestId('chapter-upload-button')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-delete-button')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: messages.addChapterButton.defaultMessage }));
    expect(screen.getByRole('button', { name: messages.cancelButton.defaultMessage }));
    expect(screen.getByRole('button', { name: messages.saveButton.defaultMessage }));
  });

  it('calls onSubmit when the "Save" button is clicked with a valid form', async () => {
    const user = userEvent.setup();
    renderComponent();

    const tabTitleInput = screen.getByPlaceholderText(messages.tabTitlePlaceholder.defaultMessage);
    const chapterInput = screen.getByPlaceholderText(
      messages.chapterTitlePlaceholder.defaultMessage.replace(
        '{value}',
        initialFormValuesMock.chapters.length.toString(),
      ),
    );
    const urlInput = screen.getByPlaceholderText(messages.chapterUrlPlaceholder.defaultMessage);

    const formValues = {
      tab_title: 'Tab title',
      chapters: [
        {
          title: 'Chapter',
          url: 'Url',
        },
      ],
    };

    await user.type(tabTitleInput, formValues.tab_title);
    await user.type(chapterInput, formValues.chapters[0].title);
    await user.type(urlInput, formValues.chapters[0].url);

    await user.click(screen.getByRole('button', { name: messages.saveButton.defaultMessage }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitMock).toHaveBeenCalledWith(
      formValues,
      expect.objectContaining({ submitForm: expect.any(Function) }),
    );
  });

  it('"Save" button is disabled when the form is empty', async () => {
    renderComponent();

    const saveButton = await screen.findByRole('button', { name: messages.saveButton.defaultMessage });
    expect(saveButton).toBeDisabled();
  });

  it('"Save" button is disabled when the chapters length less than 1', async () => {
    const user = userEvent.setup();
    renderComponent();

    const deleteChapterButton = screen.getByTestId('chapter-delete-button');
    const saveButton = screen.getByRole('button', { name: messages.saveButton.defaultMessage });

    await user.click(deleteChapterButton);
    expect(saveButton).toBeDisabled();
  });

  it('"Cancel" button is disabled when the form is empty', async () => {
    renderComponent();

    const saveButton = await screen.findByRole('button', { name: messages.saveButton.defaultMessage });
    expect(saveButton).toBeDisabled();
  });

  it('"Add a chapter" button add new chapters field', async () => {
    const user = userEvent.setup();
    renderComponent();

    const addChapterButton = screen.getByRole('button', { name: messages.addChapterButton.defaultMessage });

    await user.click(addChapterButton);
    expect(screen.getAllByTestId('form-chapters-fields')).toHaveLength(2);
  });

  it('open modal dropzone when "Upload" button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const button = await screen.findByTestId('chapter-upload-button');
    await user.click(button);
    const modalBackdrop = await screen.findByTestId('modal-backdrop');

    const cancelButton = await within(await screen.findByRole('dialog')).findByText('Cancel');
    await user.click(cancelButton);
    expect(modalBackdrop).not.toBeInTheDocument();
  });
});
