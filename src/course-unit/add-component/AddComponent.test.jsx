/* eslint-disable react/prop-types */
import userEvent from '@testing-library/user-event';

import {
  act,
  render,
  screen,
  waitFor,
  within,
  initializeMocks,
} from '../../testUtils';
import { executeThunk } from '../../utils';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { getCourseSectionVerticalApiUrl } from '../data/api';
import { courseSectionVerticalMock } from '../__mocks__';
import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';
import AddComponent from './AddComponent';
import messages from './messages';
import { IframeProvider } from '../../generic/hooks/context/iFrameContext';
import { messageTypes } from '../constants';

let store;
let axiosMock;
const blockId = '123';
const handleCreateNewCourseXBlockMock = jest.fn();
const usageKey = 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fddest-usage-key';

// Mock ComponentPicker to call onComponentSelected on click
jest.mock('../../library-authoring/component-picker', () => ({
  ComponentPicker: (props) => {
    const onClick = () => {
      if (props.componentPickerMode === 'single') {
        props.onComponentSelected({
          usageKey,
          blockType: 'html',
        });
      } else {
        props.onChangeComponentSelection([{
          usageKey,
          blockType: 'html',
        }]);
      }
    };
    return (
      <button type="submit" onClick={onClick}>
        Dummy button
      </button>
    );
  },
}));

const mockSendMessageToIframe = jest.fn();
jest.mock('../../generic/hooks/context/hooks', () => ({
  useIframe: () => ({
    sendMessageToIframe: mockSendMessageToIframe,
  }),
}));

const renderComponent = (props) => render(
  <IframeProvider>
    <AddComponent
      blockId={blockId}
      isUnitVerticalType
      parentLocator={blockId}
      addComponentTemplateData={{}}
      handleCreateNewCourseXBlock={handleCreateNewCourseXBlockMock}
      {...props}
    />
  </IframeProvider>,
);

describe('<AddComponent />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    store = mocks.reduxStore;
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
  });

  it('render AddComponent component correctly', () => {
    const { getByRole } = renderComponent();
    const componentTemplates = courseSectionVerticalMock.component_templates;

    expect(getByRole('heading', { name: messages.title.defaultMessage })).toBeInTheDocument();
    Object.keys(componentTemplates).forEach((component) => {
      const btn = getByRole('button', {
        name: new RegExp(
          `${componentTemplates[component].type
          } ${messages.buttonText.defaultMessage} ${componentTemplates[component].display_name}`,
          'i',
        ),
      });
      expect(btn).toBeInTheDocument();
      if (component.beta) {
        expect(within(btn).queryByText('Beta')).toBeInTheDocument();
      }
    });
  });

  it('AddComponent component doesn\'t render when there aren\'t componentTemplates', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        component_templates: [],
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    const { queryByRole } = renderComponent();

    expect(queryByRole('heading', { name: messages.title.defaultMessage })).not.toBeInTheDocument();
  });

  it('AddComponent component item doesn\'t render when there aren\'t templates', async () => {
    const componentTemplates = courseSectionVerticalMock.component_templates;
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        component_templates: [
          ...courseSectionVerticalMock.component_templates.map((component) => {
            if (component.type === COMPONENT_TYPES.discussion) {
              return {
                ...component,
                templates: [],
              };
            }

            return component;
          }),
        ],
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    const { queryByRole, getByRole } = renderComponent();

    Object.keys(componentTemplates).map((component) => {
      if (componentTemplates[component].type === COMPONENT_TYPES.discussion) {
        return expect(queryByRole('button', {
          name: new RegExp(`${messages.buttonText.defaultMessage} ${componentTemplates[component].display_name}`, 'i'),
        })).not.toBeInTheDocument();
      }

      return expect(getByRole('button', {
        name: new RegExp(
          `${componentTemplates[component].type
          } ${messages.buttonText.defaultMessage} ${componentTemplates[component].display_name}`,
          'i',
        ),
      })).toBeInTheDocument();
    });
  });

  it('handleCreateNewCourseXblock does\'t call with custom component create button is clicked', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        component_templates: [
          {
            type: 'custom',
            templates: [{ display_name: 'Custom' }],
            display_name: 'Custom',
            support_legend: {},
          },
        ],
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
    const user = userEvent.setup();
    const { getByRole } = renderComponent();

    const customComponentButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Custom`, 'i'),
    });

    await user.click(customComponentButton);
    expect(handleCreateNewCourseXBlockMock).not.toHaveBeenCalled();
  });

  it('calls handleCreateNewCourseXblock with correct parameters when Discussion xblock create button is clicked', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Discussion`, 'i'),
    });

    await user.click(discussionButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: COMPONENT_TYPES.discussion,
    });
  });

  it('calls handleCreateNewCourseXblock with correct parameters when Drag-and-Drop xblock create button is clicked', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Drag and Drop`, 'i'),
    });

    await user.click(discussionButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: COMPONENT_TYPES.dragAndDrop,
    });
  });

  it('calls handleCreateNewCourseXBlock with correct parameters when Problem xblock create button is clicked', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`problem ${messages.buttonText.defaultMessage} Problem`, 'i'),
    });

    await user.click(discussionButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: COMPONENT_TYPES.problem,
    }, expect.any(Function));
  });

  it('calls handleCreateNewCourseXBlock with correct parameters when Problem bank xblock create button is clicked', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();

    const problemBankBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Problem Bank`, 'i'),
    });

    await user.click(problemBankBtn);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: COMPONENT_TYPES.itembank,
      category: 'itembank',
    });
  });

  it('calls handleCreateNewCourseXBlock with correct parameters when Video xblock create button is clicked', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Video`, 'i'),
    });

    await user.click(discussionButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: COMPONENT_TYPES.video,
    }, expect.any(Function));
  });

  it('creates new "Library" xblock on click', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();

    const libraryButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Legacy Library Content`, 'i'),
    });

    await user.click(libraryButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      category: 'library_content',
      type: COMPONENT_TYPES.library,
    });
  });

  it('verifies modal behavior on button click', async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = renderComponent();
    const advancedBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Advanced`, 'i'),
    });

    await user.click(advancedBtn);
    const modalContainer = getByRole('dialog');

    expect(within(modalContainer).getByRole('button', { name: messages.modalContainerCancelBtnText.defaultMessage })).toBeInTheDocument();
    expect(within(modalContainer).getByRole('button', { name: messages.modalBtnText.defaultMessage })).toBeInTheDocument();

    await user.click(within(modalContainer).getByRole('button', { name: messages.modalContainerCancelBtnText.defaultMessage }));

    expect(queryByRole('button', { name: messages.modalContainerCancelBtnText.defaultMessage })).toBeNull();
    expect(queryByRole('button', { name: messages.modalBtnText.defaultMessage })).toBeNull();
  });

  it('verifies "Advanced" component selection in modal', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderComponent();
    const advancedBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Advanced`, 'i'),
    });
    const componentTemplates = courseSectionVerticalMock.component_templates;

    await user.click(advancedBtn);
    const modalContainer = getByRole('dialog');

    await waitFor(() => {
      expect(getByText(/Add advanced component/i)).toBeInTheDocument();
      componentTemplates.forEach((componentTemplate) => {
        if (componentTemplate.type === COMPONENT_TYPES.advanced) {
          componentTemplate.templates.forEach((template) => {
            expect(within(modalContainer).getByRole('radio', { name: template.display_name })).toBeInTheDocument();
          });
        }
      });
    });
  });

  it('verifies "Text" component selection in modal', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderComponent();
    const textBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Text`, 'i'),
    });
    const componentTemplates = courseSectionVerticalMock.component_templates;
    await user.click(textBtn);
    const modalContainer = getByRole('dialog');

    await waitFor(() => {
      expect(getByText(/Add text component/i)).toBeInTheDocument();
      componentTemplates.forEach((componentTemplate) => {
        if (componentTemplate.type === COMPONENT_TYPES.html) {
          componentTemplate.templates.forEach((template) => {
            expect(within(modalContainer).getByRole('radio', { name: template.display_name })).toBeInTheDocument();
          });
        }
      });
    });
  });

  it('verifies "Open Response" component selection in modal', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderComponent();
    const openResponseBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Open Response`, 'i'),
    });
    const componentTemplates = courseSectionVerticalMock.component_templates;

    await user.click(openResponseBtn);
    const modalContainer = getByRole('dialog');

    await waitFor(() => {
      expect(getByText(/Add open response component/i)).toBeInTheDocument();
      componentTemplates.forEach((componentTemplate) => {
        if (componentTemplate.type === COMPONENT_TYPES.openassessment) {
          componentTemplate.templates.forEach((template) => {
            expect(within(modalContainer).getByRole('radio', { name: template.display_name })).toBeInTheDocument();
          });
        }
      });
    });
  });

  it('verifies "Advanced" component creation and submission in modal', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();
    const advancedButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Advanced`, 'i'),
    });

    await user.click(advancedButton);
    const modalContainer = getByRole('dialog');

    const radioInput = within(modalContainer).getByRole('radio', { name: 'Annotation' });
    const sendBtn = within(modalContainer).getByRole('button', { name: messages.modalBtnText.defaultMessage });

    expect(sendBtn).toBeDisabled();
    await user.click(radioInput);
    expect(sendBtn).not.toBeDisabled();

    await user.click(sendBtn);

    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'annotatable',
      category: 'annotatable',
    });
  });

  it('verifies "Text" component creation and submission in modal', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();
    const textButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Text`, 'i'),
    });

    await user.click(textButton);
    const modalContainer = getByRole('dialog');

    const radioInput = within(modalContainer).getByRole('radio', { name: 'Text' });
    const sendBtn = within(modalContainer).getByRole('button', { name: messages.modalBtnText.defaultMessage });

    expect(sendBtn).toBeDisabled();
    await user.click(radioInput);
    expect(sendBtn).not.toBeDisabled();

    await user.click(sendBtn);

    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: COMPONENT_TYPES.html,
      boilerplate: COMPONENT_TYPES.html,
    }, expect.any(Function));
  });

  it('verifies "Open Response" component creation and submission in modal', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderComponent();
    const openResponseButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Open Response`, 'i'),
    });

    await user.click(openResponseButton);
    const modalContainer = getByRole('dialog');

    const radioInput = within(modalContainer).getByRole('radio', { name: 'Peer Assessment Only' });
    const sendBtn = within(modalContainer).getByRole('button', { name: messages.modalBtnText.defaultMessage });

    expect(sendBtn).toBeDisabled();
    await user.click(radioInput);
    expect(sendBtn).not.toBeDisabled();

    await user.click(sendBtn);

    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      category: COMPONENT_TYPES.openassessment,
      boilerplate: 'peer-assessment',
    });
  });

  it('shows library picker on clicking v2 library content btn', async () => {
    const user = userEvent.setup();
    renderComponent();
    const libBtn = await screen.findByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Library content`, 'i'),
    });
    await user.click(libBtn);

    // click dummy button to execute onComponentSelected prop.
    const dummyBtn = await screen.findByRole('button', { name: 'Dummy button' });
    await user.click(dummyBtn);

    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      type: COMPONENT_TYPES.libraryV2,
      parentLocator: '123',
      category: 'html',
      libraryContentKey: usageKey,
    });
  });

  it('closes library component picker on close', async () => {
    const user = userEvent.setup();
    renderComponent();
    const libBtn = await screen.findByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Library content`, 'i'),
    });
    await user.click(libBtn);

    expect(screen.queryByRole('button', { name: 'Dummy button' })).toBeInTheDocument();
    // click dummy button to execute onComponentSelected prop.
    const closeBtn = await screen.findByRole('button', { name: 'Close' });
    await user.click(closeBtn);

    expect(screen.queryByRole('button', { name: 'Dummy button' })).not.toBeInTheDocument();
  });

  it('shows component picker on window message', async () => {
    const user = userEvent.setup();
    renderComponent();
    const message = {
      data: {
        type: messageTypes.showMultipleComponentPicker,
      },
    };
    // Dispatch showMultipleComponentPicker message event to open the picker modal.
    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    // click dummy button to execute onChangeComponentSelection prop.
    const dummyBtn = await screen.findByRole('button', { name: 'Dummy button' });
    await user.click(dummyBtn);

    const submitBtn = await screen.findByRole('button', { name: 'Add selected components' });
    await user.click(submitBtn);

    expect(mockSendMessageToIframe).toHaveBeenCalledWith(messageTypes.addSelectedComponentsToBank, {
      selectedComponents: [{
        blockType: 'html',
        usageKey,
      }],
    });
  });

  describe('component support label', () => {
    it('component support label is hidden if component support legend is disabled', async () => {
      const supportLevels = ['fs', 'ps'];
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          component_templates: [
            ...courseSectionVerticalMock.component_templates.map((component) => {
              if (component.type === COMPONENT_TYPES.advanced) {
                return {
                  ...component,
                  support_legend: { show_legend: false },
                  templates: [
                    ...component.templates.map((template, i) => ({
                      ...template,
                      support_level: supportLevels[i] || true,
                    })),
                  ],
                };
              }

              return component;
            }),
          ],
        });
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      const user = userEvent.setup();
      const { getByRole } = renderComponent();
      const advancedButton = getByRole('button', {
        name: new RegExp(`${messages.buttonText.defaultMessage} Advanced`, 'i'),
      });

      await user.click(advancedButton);
      const modalContainer = getByRole('dialog');
      const fullySupportLabel = within(modalContainer)
        .queryByText(messages.modalComponentSupportLabelFullySupported.defaultMessage);
      const provisionallySupportLabel = within(modalContainer)
        .queryByText(messages.modalComponentSupportLabelProvisionallySupported.defaultMessage);

      expect(fullySupportLabel).not.toBeInTheDocument();
      expect(provisionallySupportLabel).not.toBeInTheDocument();
    });

    it('displays component support label and tooltip in component modal', async () => {
      const supportLevels = ['fs', 'ps'];
      axiosMock
        .onGet(getCourseSectionVerticalApiUrl(blockId))
        .reply(200, {
          ...courseSectionVerticalMock,
          component_templates: [
            ...courseSectionVerticalMock.component_templates.map((component) => {
              if (component.type === COMPONENT_TYPES.advanced) {
                return {
                  ...component,
                  support_legend: { show_legend: true },
                  templates: [
                    ...component.templates.map((template, i) => ({
                      ...template,
                      support_level: supportLevels[i] || true,
                    })),
                  ],
                };
              }

              return component;
            }),
          ],
        });
      await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
      const user = userEvent.setup();
      const { getByRole, getByText } = renderComponent();
      const advancedButton = getByRole('button', {
        name: new RegExp(`${messages.buttonText.defaultMessage} Advanced`, 'i'),
      });

      await user.click(advancedButton);
      const modalContainer = getByRole('dialog');
      const fullySupportLabel = within(modalContainer)
        .getByText(messages.modalComponentSupportLabelFullySupported.defaultMessage);
      const provisionallySupportLabel = within(modalContainer)
        .getByText(messages.modalComponentSupportLabelProvisionallySupported.defaultMessage);

      expect(fullySupportLabel).toBeInTheDocument();
      expect(provisionallySupportLabel).toBeInTheDocument();

      await user.hover(fullySupportLabel);
      expect(getByText(messages.modalComponentSupportTooltipFullySupported.defaultMessage)).toBeInTheDocument();

      await user.hover(provisionallySupportLabel);
      expect(getByText(messages.modalComponentSupportTooltipProvisionallySupported.defaultMessage)).toBeInTheDocument();
    });
  });
});
