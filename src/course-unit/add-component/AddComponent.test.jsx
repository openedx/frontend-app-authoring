import MockAdapter from 'axios-mock-adapter';
import { render } from '@testing-library/react';
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
import AddComponent from './AddComponent';
import messages from './messages';

let store;
let axiosMock;
const blockId = '123';
const handleCreateNewCourseXblockMock = jest.fn();

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <AddComponent
        blockId={blockId}
        handleCreateNewCourseXblock={handleCreateNewCourseXblockMock}
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
    expect(handleCreateNewCourseXblockMock).not.toHaveBeenCalled();
  });

  it('calls handleCreateNewCourseXblock with correct parameters when Discussion xblock create button is clicked', () => {
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Discussion`, 'i'),
    });

    userEvent.click(discussionButton);
    expect(handleCreateNewCourseXblockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXblockMock).toHaveBeenCalledWith({
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
    expect(handleCreateNewCourseXblockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXblockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'drag-and-drop-v2',
    });
  });

  it('calls handleCreateNewCourseXblock with correct parameters when Problem xblock create button is clicked', () => {
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Problem`, 'i'),
    });

    userEvent.click(discussionButton);
    expect(handleCreateNewCourseXblockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXblockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'problem',
    }, expect.any(Function));
  });

  it('calls handleCreateNewCourseXblock with correct parameters when Video xblock create button is clicked', () => {
    const { getByRole } = renderComponent();

    const discussionButton = getByRole('button', {
      name: new RegExp(`${messages.buttonText.defaultMessage} Video`, 'i'),
    });

    userEvent.click(discussionButton);
    expect(handleCreateNewCourseXblockMock).toHaveBeenCalled();
    expect(handleCreateNewCourseXblockMock).toHaveBeenCalledWith({
      parentLocator: '123',
      type: 'video',
    }, expect.any(Function));
  });
});
