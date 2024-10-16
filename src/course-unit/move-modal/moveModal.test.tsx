import MockAdapter from 'axios-mock-adapter';
import { render, waitFor, within } from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import userEvent from '@testing-library/user-event';

import initializeStore from '../../store';
import { getCourseOutlineInfoUrl } from '../data/api';
import { courseOutlineInfoMock } from '../__mocks__';
import { executeThunk } from '../../utils';
import { getCourseOutlineInfoQuery } from '../data/thunk';
import { IframeProvider } from '../context/iFrameContext';
import { IXBlock } from './interfaces';
import MoveModal from './index';
import messages from './messages';

let store;
let axiosMock: MockAdapter;
const courseId = '1234567890';
const closeModalMockFn = jest.fn() as jest.MockedFunction<() => void>;
const openModalMockFn = jest.fn() as jest.MockedFunction<() => void>;
const scrollToMockFn = jest.fn() as jest.MockedFunction<() => void>;
const sections: IXBlock[] | any = camelCaseObject(courseOutlineInfoMock)?.childInfo.children || [];
const subsections: IXBlock[] = sections[1]?.childInfo?.children || [];
const units: IXBlock[] = subsections[1]?.childInfo?.children || [];
const components: IXBlock[] = units[0]?.childInfo?.children || [];

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
      .onGet(getCourseOutlineInfoUrl(courseId))
      .reply(200, courseOutlineInfoMock);
    await executeThunk(getCourseOutlineInfoQuery(courseId), store.dispatch);
  });

  it('renders loading indicator correctly', async () => {
    axiosMock
      .onGet(getCourseOutlineInfoUrl(courseId))
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
    expect(
      within(categoryIndicator).getByText(messages.moveModalBreadcrumbsSections.defaultMessage),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: messages.moveModalSubmitButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.moveModalCancelButton.defaultMessage })).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: messages.moveModalCancelButton.defaultMessage }));
    expect(closeModalMockFn).toHaveBeenCalledTimes(1);
  });

  it('correctly navigates through the structure list', async () => {
    const { getByText, getByRole, getByTestId } = renderComponent();
    const breadcrumbs: HTMLElement = getByTestId('move-xblock-modal-breadcrumbs');
    const categoryIndicator: HTMLElement = getByTestId('move-xblock-modal-category');

    expect(within(breadcrumbs).getByText(messages.moveModalBreadcrumbsBaseCategory.defaultMessage)).toBeInTheDocument();
    expect(
      within(categoryIndicator).getByText(messages.moveModalBreadcrumbsSections.defaultMessage),
    ).toBeInTheDocument();
    sections.forEach((section) => {
      expect(getByText(section.displayName)).toBeInTheDocument();
    });
    userEvent.click(getByRole('button', { name: new RegExp(sections[1].displayName, 'i') }));
    await waitFor(() => {
      expect(
        within(categoryIndicator).getByText(messages.moveModalBreadcrumbsSubsections.defaultMessage),
      ).toBeInTheDocument();
      expect(within(breadcrumbs).getByText(sections[1].displayName)).toBeInTheDocument();
      subsections.forEach((subsection) => {
        expect(getByRole('button', { name: new RegExp(subsection.displayName, 'i') })).toBeInTheDocument();
      });
    });
    userEvent.click(getByRole('button', { name: new RegExp(subsections[1].displayName, 'i') }));
    await waitFor(() => {
      expect(
        within(categoryIndicator).getByText(messages.moveModalBreadcrumbsUnits.defaultMessage),
      ).toBeInTheDocument();
      expect(within(breadcrumbs).getByText(subsections[1].displayName)).toBeInTheDocument();
      units.forEach((unit) => {
        expect(getByRole('button', { name: new RegExp(unit.displayName, 'i') })).toBeInTheDocument();
      });
    });
    userEvent.click(getByRole('button', { name: new RegExp(units[0].displayName, 'i') }));
    await waitFor(() => {
      expect(
        within(categoryIndicator).getByText(messages.moveModalBreadcrumbsComponents.defaultMessage),
      ).toBeInTheDocument();
      expect(within(breadcrumbs).getByText(units[0].displayName)).toBeInTheDocument();
      components.forEach((component) => {
        if (component.displayName) {
          expect(getByText(component.displayName)).toBeInTheDocument();
        }
      });
    });
  });

  it('correctly navigates using breadcrumbs', async () => {
    const { getByRole, getByTestId } = renderComponent();
    const breadcrumbs: HTMLElement = getByTestId('move-xblock-modal-breadcrumbs');
    const categoryIndicator: HTMLElement = getByTestId('move-xblock-modal-category');

    await waitFor(() => {
      userEvent.click(getByRole('button', { name: new RegExp(sections[1].displayName, 'i') }));
      userEvent.click(getByRole('button', { name: new RegExp(subsections[1].displayName, 'i') }));
      userEvent.click(within(breadcrumbs).getByText(sections[1].displayName));
    });

    await waitFor(() => {
      expect(
        within(categoryIndicator).getByText(messages.moveModalBreadcrumbsSubsections.defaultMessage),
      ).toBeInTheDocument();
      expect(within(breadcrumbs).getByText(sections[1].displayName)).toBeInTheDocument();
      subsections.forEach((subsection) => (
        expect(getByRole('button', { name: new RegExp(subsection.displayName, 'i') })).toBeInTheDocument()
      ));
    });
  });

  it('renders empty message when no components are provided', async () => {
    const { getByText, getByRole } = renderComponent();

    await waitFor(() => {
      userEvent.click(getByRole('button', { name: new RegExp(sections[1].displayName, 'i') }));
      userEvent.click(getByRole('button', { name: new RegExp(subsections[1].displayName, 'i') }));
    });

    await waitFor(() => {
      const unitBtn = getByRole('button', { name: new RegExp(units[7].displayName, 'i') });
      userEvent.click(unitBtn);
    });

    await waitFor(() => {
      expect(getByText(
        messages.moveModalEmptyCategoryText.defaultMessage
          .replace('{category}', 'unit')
          .replace('{categoryText}', 'components'),
      )).toBeInTheDocument();
    });
  });
});
