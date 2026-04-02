import {
  act, fireEvent, initializeMocks, render, screen, waitFor,
} from '@src/testUtils';

import AddComponentWidget from './AddComponentWidget';
import type { ComponentTemplate } from './data/api';
import messages from './messages';

// Mock the useCreateXBlockInUnit hook
const mockCreateXBlock = jest.fn();
jest.mock('./data/hooks', () => ({
  useUnitHandler: jest.fn(() => ({
    data: undefined, isLoading: false, isError: false, error: null,
  })),
  useCreateXBlockInUnit: () => ({
    mutateAsync: mockCreateXBlock,
    isPending: false,
  }),
}));

// Sample component templates matching the API shape
const htmlTemplate: ComponentTemplate = {
  type: 'html',
  displayName: 'Text',
  templates: [
    { displayName: 'Text', category: 'html', boilerplateName: undefined },
  ],
  supportLegend: {},
};

const problemTemplate: ComponentTemplate = {
  type: 'problem',
  displayName: 'Problem',
  templates: [
    { displayName: 'Blank Problem', category: 'problem', boilerplateName: undefined },
    { displayName: 'Multiple Choice', category: 'problem', boilerplateName: 'multiple_choice' },
    { displayName: 'Checkboxes', category: 'problem', boilerplateName: 'checkboxes' },
  ],
  supportLegend: {},
};

const advancedTemplate: ComponentTemplate = {
  type: 'advanced',
  displayName: 'Advanced',
  templates: [
    { displayName: 'LTI Consumer', category: 'lti_consumer', supportLevel: 'fs' },
    { displayName: 'Poll', category: 'poll', supportLevel: 'ps' },
    { displayName: 'Custom XBlock', category: 'custom_xblock', supportLevel: 'us' },
  ],
  supportLegend: {},
};

const unitId = 'block-v1:edX+Demo+2025+type@vertical+block@unit1';

const renderWidget = (props?: Partial<React.ComponentProps<typeof AddComponentWidget>>) => render(
  <AddComponentWidget
    unitId={unitId}
    componentTemplates={[htmlTemplate, problemTemplate, advancedTemplate]}
    {...props}
  />,
);

describe('<AddComponentWidget />', () => {
  let mockShowToast: ReturnType<typeof initializeMocks>['mockShowToast'];

  beforeEach(() => {
    const mocks = initializeMocks();
    mockShowToast = mocks.mockShowToast;
    mockCreateXBlock.mockReset();
    // Default: creation succeeds
    mockCreateXBlock.mockResolvedValue({ locator: 'block-v1:new', courseKey: 'course-v1:test' });
  });

  it('renders the Add Component dropdown button', () => {
    renderWidget();
    // The toggle button should be visible with the correct label
    expect(screen.getByText(messages.addComponentButton.defaultMessage)).toBeInTheDocument();
  });

  it('returns null when there are no templates and no paste option', () => {
    renderWidget({ componentTemplates: [], showPasteXBlock: false });
    // Widget should render nothing – no dropdown visible
    expect(screen.queryByTestId('add-component-dropdown')).not.toBeInTheDocument();
  });

  it('renders normal and advanced template items in the dropdown', async () => {
    renderWidget();
    // Open the dropdown menu
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));

    // Normal templates
    expect(screen.getByTestId('add-component-item-html')).toBeInTheDocument();
    expect(screen.getByTestId('add-component-item-problem')).toBeInTheDocument();

    // Advanced section header + items
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByTestId('add-component-item-advanced-lti_consumer')).toBeInTheDocument();
    expect(screen.getByTestId('add-component-item-advanced-poll')).toBeInTheDocument();
    expect(screen.getByTestId('add-component-item-advanced-custom_xblock')).toBeInTheDocument();
  });

  it('shows support level labels for partially and not supported advanced xblocks', async () => {
    renderWidget();
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));

    // LTI Consumer (fs) - no support label
    const ltiItem = screen.getByTestId('add-component-item-advanced-lti_consumer');
    expect(ltiItem).not.toHaveTextContent(messages.supportPartiallySupported.defaultMessage);
    expect(ltiItem).not.toHaveTextContent(messages.supportNotSupported.defaultMessage);

    // Poll (ps) - partially supported label
    const pollItem = screen.getByTestId('add-component-item-advanced-poll');
    expect(pollItem).toHaveTextContent(messages.supportPartiallySupported.defaultMessage);

    // Custom XBlock (us) - not supported label
    const customItem = screen.getByTestId('add-component-item-advanced-custom_xblock');
    expect(customItem).toHaveTextContent(messages.supportNotSupported.defaultMessage);
  });

  it('creates a single-template component directly on click', async () => {
    const onCreated = jest.fn();
    renderWidget({ onComponentCreated: onCreated });

    // Open dropdown and click HTML (single template)
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-html')));

    // Should call createXBlock with correct params
    await waitFor(() => {
      expect(mockCreateXBlock).toHaveBeenCalledWith({
        parentLocator: unitId,
        type: 'html',
        category: 'html',
        boilerplate: undefined,
      });
    });

    // Should call onComponentCreated with the result
    expect(onCreated).toHaveBeenCalledWith({
      locator: 'block-v1:new',
      courseKey: 'course-v1:test',
      type: 'html',
      category: 'html',
    });
  });

  it('opens template selection modal for multi-template types', async () => {
    renderWidget();
    // Open dropdown and click Problem (multiple templates)
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-problem')));

    // Modal should appear with radio options
    expect(screen.getByText('Add problem component')).toBeInTheDocument();
    expect(screen.getByText('Blank Problem')).toBeInTheDocument();
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
    expect(screen.getByText('Checkboxes')).toBeInTheDocument();
  });

  it('creates component from modal after selecting a template', async () => {
    const onCreated = jest.fn();
    renderWidget({ onComponentCreated: onCreated });

    // Open dropdown → click Problem → modal opens
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-problem')));

    // Select "Multiple Choice" radio button
    const multipleChoiceRadio = screen.getByLabelText('Multiple Choice');
    await act(async () => fireEvent.click(multipleChoiceRadio));

    // Click "Select" button to submit
    const selectButton = screen.getByText(messages.templateModalSelect.defaultMessage);
    await act(async () => fireEvent.click(selectButton));

    // Should create with the selected boilerplate
    await waitFor(() => {
      expect(mockCreateXBlock).toHaveBeenCalledWith({
        parentLocator: unitId,
        type: 'problem',
        category: 'problem',
        boilerplate: 'multiple_choice',
      });
    });
  });

  it('closes modal without creating when cancel is clicked', async () => {
    renderWidget();
    // Open dropdown → click Problem → modal opens
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-problem')));

    // Click "Cancel" button
    const cancelButton = screen.getByText(messages.templateModalCancel.defaultMessage);
    await act(async () => fireEvent.click(cancelButton));

    // Modal should close, createXBlock should not be called
    expect(screen.queryByText('Add problem component')).not.toBeInTheDocument();
    expect(mockCreateXBlock).not.toHaveBeenCalled();
  });

  it('creates advanced component directly on click', async () => {
    const onCreated = jest.fn();
    renderWidget({ onComponentCreated: onCreated });

    // Open dropdown and click an advanced item
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-advanced-poll')));

    // Should create with type 'advanced' and the correct category
    await waitFor(() => {
      expect(mockCreateXBlock).toHaveBeenCalledWith({
        parentLocator: unitId,
        type: 'advanced',
        category: 'poll',
        boilerplate: undefined,
      });
    });
  });

  it('shows error toast when creation fails', async () => {
    // Make createXBlock reject
    mockCreateXBlock.mockRejectedValueOnce(new Error('Network error'));

    renderWidget();

    // Open dropdown and click HTML
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-html')));

    // Should show error toast
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(messages.addComponentError.defaultMessage);
    });
  });

  it('renders paste component option when showPasteXBlock is true', async () => {
    const onPaste = jest.fn();
    renderWidget({ showPasteXBlock: true, onPasteComponent: onPaste });

    // Open the dropdown
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));

    // Paste item should be visible
    const pasteItem = screen.getByTestId('add-component-item-paste');
    expect(pasteItem).toBeInTheDocument();
    expect(pasteItem).toHaveTextContent(messages.pasteComponent.defaultMessage);

    // Click paste
    await act(async () => fireEvent.click(pasteItem));
    expect(onPaste).toHaveBeenCalled();
  });

  it('does not render paste option when showPasteXBlock is false', async () => {
    renderWidget({ showPasteXBlock: false });

    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));

    expect(screen.queryByTestId('add-component-item-paste')).not.toBeInTheDocument();
  });

  it('disables the Select button in modal when no template is selected', async () => {
    renderWidget();
    // Open dropdown → click Problem → modal opens
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-problem')));

    // Select button should be disabled initially (no radio selected)
    const selectButton = screen.getByText(messages.templateModalSelect.defaultMessage);
    expect(selectButton).toBeDisabled();
  });
});
