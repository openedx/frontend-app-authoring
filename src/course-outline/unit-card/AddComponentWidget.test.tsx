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

const openAssessmentTemplate: ComponentTemplate = {
  type: 'openassessment',
  displayName: 'Open Response',
  templates: [
    { displayName: 'Peer Assessment Only', category: 'openassessment', boilerplateName: 'peer-assessment' },
    { displayName: 'Self Assessment Only', category: 'openassessment', boilerplateName: 'self-assessment' },
    { displayName: 'Staff Assessment Only', category: 'openassessment', boilerplateName: 'staff-assessment' },
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
    componentTemplates={[htmlTemplate, problemTemplate, openAssessmentTemplate, advancedTemplate]}
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

  it('creates problem component directly without modal (skips template selection)', async () => {
    const onCreated = jest.fn();
    renderWidget({ onComponentCreated: onCreated });

    // Open dropdown and click Problem – should create directly, no modal
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-problem')));

    // Should call createXBlock with the first/default template
    await waitFor(() => {
      expect(mockCreateXBlock).toHaveBeenCalledWith({
        parentLocator: unitId,
        type: 'problem',
        category: 'problem',
        boilerplate: undefined,
      });
    });

    // Modal should NOT appear
    expect(screen.queryByText('Add problem component')).not.toBeInTheDocument();
  });

  it('creates open response component directly with Peer Assessment Only default (skips modal)', async () => {
    const onCreated = jest.fn();
    renderWidget({ onComponentCreated: onCreated });

    // Open dropdown and click Open Response – should create directly, no modal
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-openassessment')));

    // Should call createXBlock with 'peer-assessment' boilerplate
    await waitFor(() => {
      expect(mockCreateXBlock).toHaveBeenCalledWith({
        parentLocator: unitId,
        type: 'openassessment',
        category: 'openassessment',
        boilerplate: 'peer-assessment',
      });
    });

    // Modal should NOT appear
    expect(screen.queryByText('Add open response component')).not.toBeInTheDocument();
  });

  it('creates html/text component directly with default Text template (skips modal)', async () => {
    const onCreated = jest.fn();
    // Use multi-template html to prove modal is skipped even with multiple templates
    const htmlMultiTemplate: ComponentTemplate = {
      type: 'html',
      displayName: 'Text',
      templates: [
        { displayName: 'Text', category: 'html', boilerplateName: undefined },
        { displayName: 'Raw HTML', category: 'html', boilerplateName: 'raw.yaml' },
        { displayName: 'Zooming Image Tool', category: 'html', boilerplateName: 'zooming_image.yaml' },
      ],
      supportLegend: {},
    };
    renderWidget({
      componentTemplates: [htmlMultiTemplate, problemTemplate, openAssessmentTemplate, advancedTemplate],
      onComponentCreated: onCreated,
    });

    // Open dropdown and click Text – should create directly, no modal
    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-html')));

    // Should call createXBlock with default Text (no boilerplate)
    await waitFor(() => {
      expect(mockCreateXBlock).toHaveBeenCalledWith({
        parentLocator: unitId,
        type: 'html',
        category: 'html',
        boilerplate: undefined,
      });
    });

    // Modal should NOT appear
    expect(screen.queryByText('Add text component')).not.toBeInTheDocument();
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

  it('still opens modal for types not in directCreateDefaults (e.g. custom multi-template)', async () => {
    // Create a custom type with multiple templates that is NOT in directCreateDefaults
    const customTemplate: ComponentTemplate = {
      type: 'custom_type',
      displayName: 'Custom',
      templates: [
        { displayName: 'Option A', category: 'custom_type', boilerplateName: 'option_a' },
        { displayName: 'Option B', category: 'custom_type', boilerplateName: 'option_b' },
      ],
      supportLegend: {},
    };
    renderWidget({
      componentTemplates: [customTemplate],
    });

    const toggle = screen.getByText(messages.addComponentButton.defaultMessage);
    await act(async () => fireEvent.click(toggle));
    await act(async () => fireEvent.click(screen.getByTestId('add-component-item-custom_type')));

    // Modal should appear
    expect(screen.getByText('Add custom component')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });
});
