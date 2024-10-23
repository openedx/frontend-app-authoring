import MockAdapter from 'axios-mock-adapter';
import { render, waitFor, within } from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { Store } from 'redux';

import initializeStore from '../../store';
import { getOutlineInfo } from '../data/api';
import { courseOutlineInfoMock } from '../__mocks__';
import { executeThunk } from '../../utils';
import { getCourseOutlineInfoQuery } from '../data/thunk';
import { IframeProvider } from '../context/iFrameContext';
import MoveModal from './index';
import messages from './messages';
import userEvent from '@testing-library/user-event';

interface CourseOutlineChildInfo {
  category: string;
  display_name: string;
  children?: ICourseOutlineChild[];
}

interface ICourseOutlineChild {
  id: string;
  display_name: string;
  category: string;
  has_children: boolean;
  video_sharing_enabled: boolean;
  video_sharing_options: string;
  video_sharing_doc_url: string;
  child_info?: CourseOutlineChildInfo;
}

let store: Store;
let axiosMock: MockAdapter;
const courseId = '1234567890';
const closeModalMockFn = jest.fn() as jest.MockedFunction<() => void>;
const openModalMockFn = jest.fn() as jest.MockedFunction<() => void>;
const scrollToMockFn = jest.fn() as jest.MockedFunction<() => void>;
const sections: ICourseOutlineChild[] | any = courseOutlineInfoMock?.child_info?.children || [];
const subsections: ICourseOutlineChild[] = sections[1]?.child_info?.children || [];
const units: ICourseOutlineChild[] = subsections[1]?.child_info?.children || [];
const components: ICourseOutlineChild[] = units[0]?.child_info?.children || [];

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

    window.scrollTo = scrollToMockFn;
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getOutlineInfo(courseId))
      .reply(200, courseOutlineInfoMock);
    await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);
  });

  it('renders loading indicator correctly', async () => {
    axiosMock
      .onGet(getOutlineInfo(courseId))
      .reply(200, null);
    await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);

    const { getByText } = renderComponent();
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('renders component properly', () => {
    const { getByText, getByRole, getByTestId } = renderComponent();
    const breadcrumbs: HTMLElement = getByTestId('move-xblock-modal-breadcrumbs');
    const categoryIndicator: HTMLElement = getByTestId('move-xblock-modal-category');

    expect(getByText(messages.moveModalTitle.defaultMessage.replace(' {displayName}', ''))).toBeInTheDocument();
    expect(within(breadcrumbs).getByText(messages.moveModalBreadcrumbsBaseCategory.defaultMessage)).toBeInTheDocument();
    expect(within(categoryIndicator).getByText(messages.moveModalBreadcrumbsSections.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.moveModalSubmitButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.moveModalCancelButton.defaultMessage })).toBeInTheDocument();
  });

  it('correctly navigates through the structure list', async () => {
    const { getByText, getByRole, getByTestId } = renderComponent();
    const breadcrumbs: HTMLElement = getByTestId('move-xblock-modal-breadcrumbs');
    const categoryIndicator: HTMLElement = getByTestId('move-xblock-modal-category');

    expect(within(breadcrumbs).getByText(messages.moveModalBreadcrumbsBaseCategory.defaultMessage)).toBeInTheDocument();
    expect(within(categoryIndicator).getByText(messages.moveModalBreadcrumbsSections.defaultMessage)).toBeInTheDocument();
    sections.map((section) => (
      expect(getByText(section.display_name)).toBeInTheDocument()
    ));

    await waitFor(() => userEvent.click(getByRole('button', { name: new RegExp(sections[1].display_name, 'i') })));
    await waitFor(() => {
      expect(within(categoryIndicator).getByText(messages.moveModalBreadcrumbsSubsections.defaultMessage)).toBeInTheDocument();
      expect(within(breadcrumbs).getByText(sections[1].display_name)).toBeInTheDocument();
      subsections.map((subsection) => (
          expect(getByRole('button', { name: new RegExp(subsection.display_name, 'i') })).toBeInTheDocument()
      ));
    });

    await waitFor(() => userEvent.click(getByRole('button', { name: new RegExp(subsections[1].display_name, 'i') })));
    await waitFor(() => {
      expect(within(categoryIndicator).getByText(messages.moveModalBreadcrumbsUnits.defaultMessage)).toBeInTheDocument();
      expect(within(breadcrumbs).getByText(subsections[1].display_name)).toBeInTheDocument();
      units.map((unit) => (
          expect(getByRole('button', { name: new RegExp(unit.display_name, 'i') })).toBeInTheDocument()
      ));
    });

    await waitFor(() => userEvent.click(getByRole('button', { name: new RegExp(units[0].display_name, 'i') })));
    await waitFor(() => {
      expect(within(categoryIndicator).getByText(messages.moveModalBreadcrumbsComponents.defaultMessage)).toBeInTheDocument();
      expect(within(breadcrumbs).getByText(units[0].display_name)).toBeInTheDocument();
      components.map((component) => {
        if (component.display_name) {
          expect(getByText(component.display_name)).toBeInTheDocument();
        }
      });
    });
  });

  it('correctly navigates using breadcrumbs', async () => {
    const { getByRole, getByTestId } = renderComponent();
    const breadcrumbs: HTMLElement = getByTestId('move-xblock-modal-breadcrumbs');
    const categoryIndicator: HTMLElement = getByTestId('move-xblock-modal-category');

    await waitFor(() =>  userEvent.click(getByRole('button', { name: new RegExp(sections[1].display_name, 'i') })));
    await waitFor(() =>  userEvent.click(getByRole('button', { name: new RegExp(subsections[1].display_name, 'i') })));
    await waitFor(() =>  userEvent.click(within(breadcrumbs).getByText(sections[1].display_name)));

    await waitFor(() => {
      expect(within(categoryIndicator).getByText(messages.moveModalBreadcrumbsSubsections.defaultMessage)).toBeInTheDocument();
      expect(within(breadcrumbs).getByText(sections[1].display_name)).toBeInTheDocument();
      subsections.map((subsection) => (
          expect(getByRole('button', { name: new RegExp(subsection.display_name, 'i') })).toBeInTheDocument()
      ));
    });
  });

  it('renders empty message when no components are provided', async () => {
    const { getByText, getByRole } = renderComponent();

     await waitFor(() => userEvent.click(getByRole('button', { name: new RegExp(sections[1].display_name, 'i') } )));
     await waitFor(() => userEvent.click(getByRole('button', { name: new RegExp(subsections[1].display_name, 'i') } )));
     await waitFor(() => userEvent.click(getByRole('button', { name: new RegExp(units[7].display_name, 'i') } )));

    await waitFor(() => {
      expect(getByText(
          messages.moveModalEmptyCategoryText.defaultMessage
              .replace('{category}', 'unit')
              .replace('{categoryText}', 'components')
      )).toBeInTheDocument();
    });
  });
});
