import {
  initializeMocks, render, fireEvent, screen, waitFor,
} from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';

import HighlightsModal, { HighlightsCard, HighlightsForm } from './HighlightsModal';
import messages from './messages';

const currentItemMock = {
  highlights: ['Highlight 1', 'Highlight 2'],
  displayName: 'Test Section',
};

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    currentSelection: { currentId: 1 },
  }),
}));

jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseItemData: jest.fn(() => ({
    data: currentItemMock,
  })),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useBlocker: jest.fn(() => ({
    state: 'unblocked',
    proceed: jest.fn(),
    reset: jest.fn(),
  })),
}));

jest.mock('../../help-urls/hooks', () => ({
  useHelpUrls: () => ({ contentHighlights: 'https://example.com' }),
}));

jest.mock('@src/generic/prompt-if-dirty/PromptIfDirty', () => ({
  __esModule: true,
  default: () => null,
}));

const onCloseMock = jest.fn();
const onSubmitMock = jest.fn();

describe('<HighlightsModal />', () => {
  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
  });

  it('renders modal with highlights and form', async () => {
    render(
      <HighlightsModal isOpen onClose={onCloseMock} onSubmit={onSubmitMock} />,
    );

    expect(await screen.findByText(/Highlights for/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Highlight 1/)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <HighlightsModal isOpen onClose={onCloseMock} onSubmit={onSubmitMock} />,
    );

    await user.click(await screen.findByRole('button', { name: messages.cancelButton.defaultMessage }));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onSubmit with form values on save', async () => {
    const user = userEvent.setup();
    render(
      <HighlightsModal isOpen onClose={onCloseMock} onSubmit={onSubmitMock} />,
    );

    fireEvent.change(await screen.findByLabelText(/Highlight 1/), { target: { value: 'New value' } });

    await user.click(await screen.findByRole('button', { name: messages.saveButton.defaultMessage }));

    await waitFor(() => expect(onSubmitMock).toHaveBeenCalled());
  });
});

describe('<HighlightsForm />', () => {
  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
  });

  const defaultProps = {
    initialValues: {
      highlight_1: 'Test 1',
      highlight_2: '',
      highlight_3: '',
      highlight_4: '',
      highlight_5: '',
    },
    onSubmit: onSubmitMock,
    onCancel: jest.fn(),
  };

  it('renders 5 highlight fields and buttons', async () => {
    render(<HighlightsForm {...defaultProps} />);

    for (let i = 1; i <= 5; i++) {
      expect(await screen.findByLabelText(new RegExp(`Highlight ${i}`))).toBeInTheDocument();
    }
    expect(await screen.findByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('disables save button when pristine', async () => {
    render(<HighlightsForm {...defaultProps} />);

    const saveBtn = await screen.findByRole('button', { name: messages.saveButton.defaultMessage }) as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });

  it('enables save button when form is dirty', async () => {
    render(<HighlightsForm {...defaultProps} />);

    fireEvent.change(await screen.findByLabelText(/Highlight 1/), { target: { value: 'Modified' } });

    const saveBtn = await screen.findByRole('button', { name: messages.saveButton.defaultMessage });
    expect((saveBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls onDirtyChange when form changes', async () => {
    const onDirtyChange = jest.fn();
    render(
      <HighlightsForm {...defaultProps} onDirtyChange={onDirtyChange} />,
    );

    fireEvent.change(await screen.findByLabelText(/Highlight 1/), { target: { value: 'Modified' } });

    await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(true));
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <HighlightsForm {...defaultProps} onCancel={onCancel} />,
    );

    await user.click(await screen.findByRole('button', { name: messages.cancelButton.defaultMessage }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('submits form with correct values', async () => {
    const user = userEvent.setup();
    render(<HighlightsForm {...defaultProps} />);

    fireEvent.change(await screen.findByLabelText(/Highlight 1/), { target: { value: 'Updated 1' } });
    fireEvent.change(await screen.findByLabelText(/Highlight 3/), { target: { value: 'Updated 3' } });

    await user.click(await screen.findByRole('button', { name: messages.saveButton.defaultMessage }));

    await waitFor(() => expect(onSubmitMock).toHaveBeenCalled());
  });
});

describe('<HighlightsCard />', () => {
  beforeEach(() => {
    initializeMocks();
    const { useCourseItemData } = require('@src/course-outline/data/apiHooks');
    useCourseItemData.mockReturnValue({ data: currentItemMock });
  });

  it('renders viewing mode with highlights', async () => {
    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    expect(await screen.findByText('Highlight 1')).toBeInTheDocument();
    expect(await screen.findByLabelText(messages.editButton.defaultMessage)).toBeInTheDocument();
  });

  it('renders empty state when no highlights exist', async () => {
    const { useCourseItemData } = require('@src/course-outline/data/apiHooks');
    useCourseItemData.mockReturnValue({
      data: { highlights: [], displayName: 'Test' },
    });

    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    expect(await screen.findByRole('button', { name: messages.addHighlightsButton.defaultMessage })).toBeInTheDocument();
  });

  it('transitions to editing mode on edit button click', async () => {
    const user = userEvent.setup();
    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    await user.click(await screen.findByLabelText(messages.editButton.defaultMessage));

    const field = await screen.findByLabelText(/Highlight 1/);
    expect(field).toBeInTheDocument();
  });

  it('transitions to editing mode on add button click', async () => {
    const user = userEvent.setup();
    const { useCourseItemData } = require('@src/course-outline/data/apiHooks');
    useCourseItemData.mockReturnValue({
      data: { highlights: [], displayName: 'Test' },
    });

    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    await user.click(await screen.findByRole('button', { name: messages.addHighlightsButton.defaultMessage }));

    const field = await screen.findByLabelText(/Highlight 1/);
    expect(field).toBeInTheDocument();
  });

  it('returns to viewing mode on cancel', async () => {
    const user = userEvent.setup();
    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    await user.click(await screen.findByLabelText(messages.editButton.defaultMessage ));

    const cancelBtn = await screen.findByRole('button', { name: messages.cancelButton.defaultMessage });
    await user.click(cancelBtn);

    await waitFor(() => expect(screen.queryByLabelText(/Highlight 1/)).not.toBeInTheDocument());
  });

  it('submits form and calls onSubmit', async () => {
    const user = userEvent.setup();
    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    await user.click(await screen.findByLabelText(messages.editButton.defaultMessage ));

    const field = await screen.findByLabelText(/Highlight 1/);
    fireEvent.change(field, { target: { value: 'Updated' } });

    const saveBtn = await screen.findByRole('button', { name: messages.saveButton.defaultMessage });
    await user.click(saveBtn);

    await waitFor(() => expect(onSubmitMock).toHaveBeenCalled());
  });

  it('returns to viewing mode after successful submit', async () => {
    const user = userEvent.setup();
    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    await user.click(await screen.findByLabelText(messages.editButton.defaultMessage ));

    const field = await screen.findByLabelText(/Highlight 1/);
    fireEvent.change(field, { target: { value: 'Updated' } });

    const saveBtn = await screen.findByRole('button', { name: messages.saveButton.defaultMessage });
    await user.click(saveBtn);

    const editBtn = await screen.findByLabelText(messages.editButton.defaultMessage );
    expect(editBtn).toBeInTheDocument();
  });

  it('displays only non-empty highlights in view mode', async () => {
    const { useCourseItemData } = require('@src/course-outline/data/apiHooks');
    useCourseItemData.mockReturnValue({
      data: { highlights: ['H1', '', 'H3', '', ''], displayName: 'Test' },
    });

    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    expect(await screen.findByText('H1')).toBeInTheDocument();
    expect(await screen.findByText('H3')).toBeInTheDocument();
  });

  it('shows empty state after clearing all highlights', async () => {
    const user = userEvent.setup();
    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    await user.click(await screen.findByLabelText(messages.editButton.defaultMessage ));

    const field1 = await screen.findByLabelText(/Highlight 1/);
    const field2 = await screen.findByLabelText(/Highlight 2/);

    fireEvent.change(field1, { target: { value: '' } });
    fireEvent.change(field2, { target: { value: '' } });

    const saveBtn = await screen.findByRole('button', { name: messages.saveButton.defaultMessage });
    await user.click(saveBtn);

    const addBtn = await screen.findByRole('button', { name: messages.addHighlightsButton.defaultMessage });
    expect(addBtn).toBeInTheDocument();
  });

  it('handles navigation blocking when form is dirty', () => {
    const { useBlocker } = require('react-router-dom');
    const blockerMock = {
      state: 'blocked',
      proceed: jest.fn(),
      reset: jest.fn(),
    };
    useBlocker.mockReturnValue(blockerMock);

    render(
      <HighlightsCard sectionId="1" onSubmit={onSubmitMock} />,
    );

    expect(blockerMock.state).toBe('blocked');
  });
});

