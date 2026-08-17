import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import {
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import userEvent from '@testing-library/user-event';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';

import initializeStore from '../../../../store';
import { executeThunk } from '../../../../utils';
import { clipboardUnit } from '../../../../__mocks__';
import { getCourseSectionVerticalApiUrl } from '../../../data/api';
import { getClipboardUrl } from '../../../../generic/data/api';
import { fetchCourseSectionVerticalData } from '../../../data/thunk';
import { courseSectionVerticalMock } from '../../../__mocks__';
import messages from '../../messages';
import ActionButtons from './ActionButtons';

let store;
let axiosMock;
let queryClient;
const courseId = '123';

const renderComponent = (props = {}) => {
  const WrapperProvider = ({ children }) => (
    <CourseAuthoringProvider courseId={'courseId'}>{children}</CourseAuthoringProvider>
  );
  return render(
    <AppProvider store={store} wrapWithRouter={false}>
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient}>
          <ActionButtons {...props} />
        </QueryClientProvider>
      </IntlProvider>
    </AppProvider>,
    {
      extraWrapper: WrapperProvider,
    },
  );
};

describe('<ActionButtons />', () => {
  let validateUserPermissionsMock;
  beforeEach(async () => {
    const mocks = initializeMocks();
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: true,
      canPublishCourseContent: true,
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(courseId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          enable_copy_paste_units: true,
        },
      });
    axiosMock
      .onPost(getClipboardUrl())
      .reply(200, clipboardUnit);
    axiosMock
      .onGet(getClipboardUrl())
      .reply(200, clipboardUnit);

    queryClient = new QueryClient();

    await executeThunk(fetchCourseSectionVerticalData(courseId), store.dispatch);
  });

  it('render ActionButtons component with Copy to clipboard', async () => {
    renderComponent();

    const copyXBlockBtn = await screen.findByRole('button', {
      name: messages.actionButtonCopyUnitTitle.defaultMessage,
    });
    expect(copyXBlockBtn).toBeInTheDocument();
  });

  it('click on the Copy to clipboard button updates clipboardData', async () => {
    const user = userEvent.setup();
    renderComponent();

    const copyXBlockBtn = await screen.findByRole('button', {
      name: messages.actionButtonCopyUnitTitle.defaultMessage,
    });

    await user.click(copyXBlockBtn);
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(
      JSON.stringify({ usage_key: courseSectionVerticalMock.xblock_info.id }),
    );
  });

  it('hides the Publish button when the user cannot publish course content', async () => {
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: true,
      canPublishCourseContent: false,
    });
    renderComponent();
    expect(
      await screen.findByRole('button', { name: messages.actionButtonCopyUnitTitle.defaultMessage }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: messages.actionButtonPublishTitle.defaultMessage }),
    ).not.toBeInTheDocument();
  });

  it('hides the Discard changes and Copy buttons when the user cannot edit course content', async () => {
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: false,
      canPublishCourseContent: true,
    });
    renderComponent();
    expect(
      await screen.findByRole('button', { name: messages.actionButtonPublishTitle.defaultMessage }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: messages.actionButtonDiscardChangesTitle.defaultMessage }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: messages.actionButtonCopyUnitTitle.defaultMessage }),
    ).not.toBeInTheDocument();
  });
});
