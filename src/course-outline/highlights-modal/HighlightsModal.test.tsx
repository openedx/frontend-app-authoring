import {
  initializeMocks, render, fireEvent, act, waitFor,
} from '@src/testUtils';

import HighlightsModal from './HighlightsModal';
import messages from './messages';

const mockPathname = '/foo-bar';

const currentItemMock = {
  highlights: ['Highlight 1', 'Highlight 2'],
  displayName: 'Test Section',
};

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    courseUsageKey: 'course-usage-key',
    courseDetails: { name: 'Test course' },
    currentSelection: { currentId: 1 },
  }),
}));

jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseItemData: () => ({
    data: currentItemMock,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

jest.mock('../../help-urls/hooks', () => ({
  useHelpUrls: () => ({
    contentHighlights: 'some',
  }),
}));

const onCloseMock = jest.fn();
const onSubmitMock = jest.fn();

const renderComponent = () => render(
  <HighlightsModal
    isOpen
    onClose={onCloseMock}
    onSubmit={onSubmitMock}
  />,
);

describe('<HighlightsModal />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders HighlightsModal component correctly', () => {
    const { getByText, getByRole, getByLabelText } = renderComponent();

    expect(getByText(`Highlights for ${currentItemMock.displayName}`)).toBeInTheDocument();
    expect(getByText(/Enter 3-5 highlights to include in the email message that learners receive for this section/i)).toBeInTheDocument();
    expect(getByText(/For more information and an example of the email template, read our/i)).toBeInTheDocument();
    expect(getByText(messages.documentationLink.defaultMessage)).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '1'))).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '2'))).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '3'))).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '4'))).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '5'))).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the onClose function when the cancel button is clicked', () => {
    const { getByRole } = renderComponent();

    const cancelButton = getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls the onSubmit function with correct values when the save button is clicked', async () => {
    const { getByRole, getByLabelText } = renderComponent();

    const field1 = getByLabelText(messages.highlight.defaultMessage.replace('{index}', '1'));
    const field2 = getByLabelText(messages.highlight.defaultMessage.replace('{index}', '2'));
    fireEvent.change(field1, { target: { value: 'New highlight 1' } });
    fireEvent.change(field2, { target: { value: 'New highlight 2' } });

    const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        {
          highlight_1: 'New highlight 1',
          highlight_2: 'New highlight 2',
          highlight_3: '',
          highlight_4: '',
          highlight_5: '',
        },
        expect.objectContaining({ submitForm: expect.any(Function) }),
      );
    });
  });
});
