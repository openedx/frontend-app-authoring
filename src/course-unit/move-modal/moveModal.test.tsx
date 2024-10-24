import {render, screen, within} from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../../store';
import { getOutlineInfo } from '../data/api';
import { courseOutlineInfoMock } from '../__mocks__';
import { executeThunk } from '../../utils';
import { getCourseOutlineInfoQuery } from '../data/thunk';
import MoveModal from './index';
import { IframeProvider } from '../context/iFrameContext';

let store;
let axiosMock;
const courseId = '1234567890';
const closeModalMockFn = jest.fn();
const openModalMockFn = jest.fn();
const sections = courseOutlineInfoMock.child_info.children;

const renderComponent = (props?: any) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <IframeProvider>
        <MoveModal
          isOpenModal
          closeModal={closeModalMockFn}
          openModal={openModalMockFn}
          courseId={courseId}
          {...props}
        />
      </IframeProvider>
    </IntlProvider>
  </AppProvider>,
);

describe('<MoveModal />', () => {
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
      .onGet(getOutlineInfo(courseId))
      .reply(200, courseOutlineInfoMock);
    await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);
  });

  it('render MoveModal component correctly', () => {
    const {
      getByText,
      getByRole,
      getByTestId,
    } = renderComponent();
    const breadcrumbs = getByTestId('move-xblock-modal-breadcrumbs');
    const categoryIndicator = getByTestId('move-xblock-modal-category');

    expect(getByText('Move:')).toBeInTheDocument();
    expect(within(breadcrumbs).getByText('Course Outline')).toBeInTheDocument();
    expect(within(categoryIndicator).getByText('Sections')).toBeInTheDocument();
    sections.map((section) => (
      expect(getByText(section.display_name)).toBeInTheDocument()
    ));
    expect(getByRole('button', { name: 'Move' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});
