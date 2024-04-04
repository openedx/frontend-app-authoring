import MockAdapter from 'axios-mock-adapter';
import {
  render, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { getCourseSectionVerticalApiUrl } from '../data/api';
import { courseSectionVerticalMock } from '../__mocks__';
import { COMPONENT_ICON_TYPES } from '../constants';
import AddComponent from './AddComponent';
import messages from './messages';

let store;
let axiosMock;
const blockId = '123';
const handleCreateNewCourseXBlockMock = jest.fn();

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <AddComponent
        blockId={blockId}
        handleCreateNewCourseXBlock={handleCreateNewCourseXBlockMock}
        {...props}
      />
    </IntlProvider>
  </AppProvider>,
);

describe('<AddComponent />', () => {
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
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
  });

  it('render AddComponent component correctly', () => {
    const { getByRole } = renderComponent();
    const componentTemplates = courseSectionVerticalMock.component_templates;

    expect(getByRole('heading', { name: messages.title.defaultMessage })).toBeInTheDocument();
    Object.keys(componentTemplates).map((component) => (
      expect(getByRole('button', {
        name: new RegExp(`${messages.buttonText.defaultMessage} ${componentTemplates[component].display_name}`, 'i'),
      })).toBeInTheDocument()
    ));
  });

  it('doesn\'t render AddComponent component when there aren\'t componentTemplates', async () => {
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

  it('does\'t call handleCreateNewCourseXblock with custom component create button is clicked', async () => {
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        component_templates: [
          {
            type: 'custom',
            templates: [],
            display_name: 'Custom',
            support_legend: {},
          },
        ],
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    const { getByRole } = renderComponent();

    const customComponentButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Custom`, 'i'),
    });

    userEvent.click(customComponentButton);
    expect(handleCreateNewCourseXBlockMock).not.toHaveBeenCalled();
  });

  it('calls handleCreateNewCourseXblock with correct parameters when Discussion xblock create button is clicked', () => {
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Discussion`, 'i'),
    });

    userEvent.click(discussionButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'discussion',
    });
  });

  it('calls handleCreateNewCourseXblock with correct parameters when Drag-and-Drop xblock create button is clicked', () => {
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Drag and Drop`, 'i'),
    });

    userEvent.click(discussionButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'drag-and-drop-v2',
    });
  });

  it('calls handleCreateNewCourseXBlock with correct parameters when Problem xblock create button is clicked', () => {
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Problem`, 'i'),
    });

    userEvent.click(discussionButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'problem',
    }, expect.any(Function));
  });

  it('calls handleCreateNewCourseXBlock with correct parameters when Video xblock create button is clicked', () => {
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Video`, 'i'),
    });

    userEvent.click(discussionButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'video',
    }, expect.any(Function));
  });

  it('creates new "Library" xblock on click', () => {
    const { getByRole } = renderComponent();

    const libraryButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Library Content`, 'i'),
    });

    userEvent.click(libraryButton);
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      category: 'library_content',
      type: 'library',
    });
  });

  it('verifies modal behavior on button click', async () => {
    const { getByRole, queryByRole } = renderComponent();
    const advancedBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Advanced`, 'i'),
    });

    userEvent.click(advancedBtn);
    const modalContainer = getByRole('dialog');

    expect(within(modalContainer).getByRole('button', { name: messages.modalContainerCancelBtnText.defaultMessage })).toBeInTheDocument();
    expect(within(modalContainer).getByRole('button', { name: messages.modalBtnText.defaultMessage })).toBeInTheDocument();

    userEvent.click(within(modalContainer).getByRole('button', { name: messages.modalContainerCancelBtnText.defaultMessage }));

    expect(queryByRole('button', { name: messages.modalContainerCancelBtnText.defaultMessage })).toBeNull();
    expect(queryByRole('button', { name: messages.modalBtnText.defaultMessage })).toBeNull();
  });

  it('verifies "Advanced" component selection in modal', async () => {
    const { getByRole, getByText } = renderComponent();
    const advancedBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Advanced`, 'i'),
    });
    const componentTemplates = courseSectionVerticalMock.component_templates;

    userEvent.click(advancedBtn);
    const modalContainer = getByRole('dialog');

    await waitFor(() => {
      expect(getByText(/Add advanced component/i)).toBeInTheDocument();
      componentTemplates.forEach((componentTemplate) => {
        if (componentTemplate.type === COMPONENT_ICON_TYPES.advanced) {
          componentTemplate.templates.forEach((template) => {
            expect(within(modalContainer).getByRole('radio', { name: template.display_name })).toBeInTheDocument();
          });
        }
      });
    });
  });

  it('verifies "Text" component selection in modal', async () => {
    const { getByRole, getByText } = renderComponent();
    const textBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Text`, 'i'),
    });
    const componentTemplates = courseSectionVerticalMock.component_templates;
    userEvent.click(textBtn);
    const modalContainer = getByRole('dialog');

    await waitFor(() => {
      expect(getByText(/Add text component/i)).toBeInTheDocument();
      componentTemplates.forEach((componentTemplate) => {
        if (componentTemplate.type === COMPONENT_ICON_TYPES.html) {
          componentTemplate.templates.forEach((template) => {
            expect(within(modalContainer).getByRole('radio', { name: template.display_name })).toBeInTheDocument();
          });
        }
      });
    });
  });

  it('verifies "Open Response" component selection in modal', async () => {
    const { getByRole, getByText } = renderComponent();
    const openResponseBtn = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Open Response`, 'i'),
    });
    const componentTemplates = courseSectionVerticalMock.component_templates;

    userEvent.click(openResponseBtn);
    const modalContainer = getByRole('dialog');

    await waitFor(() => {
      expect(getByText(/Add open response component/i)).toBeInTheDocument();
      componentTemplates.forEach((componentTemplate) => {
        if (componentTemplate.type === COMPONENT_ICON_TYPES.openassessment) {
          componentTemplate.templates.forEach((template) => {
            expect(within(modalContainer).getByRole('radio', { name: template.display_name })).toBeInTheDocument();
          });
        }
      });
    });
  });

  it('verifies "Advanced" component creation and submission in modal', () => {
    const { getByRole } = renderComponent();
    const advancedButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Advanced`, 'i'),
    });

    userEvent.click(advancedButton);
    const modalContainer = getByRole('dialog');

    const radioInput = within(modalContainer).getByRole('radio', { name: 'Annotation' });
    const sendBtn = within(modalContainer).getByRole('button', { name: messages.modalBtnText.defaultMessage });

    expect(sendBtn).toBeDisabled();
    userEvent.click(radioInput);
    expect(sendBtn).not.toBeDisabled();

    userEvent.click(sendBtn);

    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'annotatable',
      category: 'annotatable',
    });
  });

  it('verifies "Text" component creation and submission in modal', () => {
    const { getByRole } = renderComponent();
    const textButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Text`, 'i'),
    });

    userEvent.click(textButton);
    const modalContainer = getByRole('dialog');

    const radioInput = within(modalContainer).getByRole('radio', { name: 'Text' });
    const sendBtn = within(modalContainer).getByRole('button', { name: messages.modalBtnText.defaultMessage });

    expect(sendBtn).toBeDisabled();
    userEvent.click(radioInput);
    expect(sendBtn).not.toBeDisabled();

    userEvent.click(sendBtn);

    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'html',
      boilerplate: 'html',
    }, expect.any(Function));
  });

  it('verifies "Open Response" component creation and submission in modal', () => {
    const { getByRole } = renderComponent();
    const openResponseButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Open Response`, 'i'),
    });

    userEvent.click(openResponseButton);
    const modalContainer = getByRole('dialog');

    const radioInput = within(modalContainer).getByRole('radio', { name: 'Peer Assessment Only' });
    const sendBtn = within(modalContainer).getByRole('button', { name: messages.modalBtnText.defaultMessage });

    expect(sendBtn).toBeDisabled();
    userEvent.click(radioInput);
    expect(sendBtn).not.toBeDisabled();

    userEvent.click(sendBtn);

    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXBlockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      category: 'openassessment',
      boilerplate: 'peer-assessment',
    });
  });
});
