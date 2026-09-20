import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, setConfig } from '@edx/frontend-platform';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { executeThunk } from '@src/utils';

import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { getCourseSectionVerticalApiUrl } from '../data/api';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { courseSectionVerticalMock } from '../__mocks__';
import HeaderTitle from './HeaderTitle';
import messages from './messages';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';

const blockId = '123';
const unitTitle = 'Getting Started';
const isTitleEditFormOpen = false;
const handleTitleEdit = jest.fn();
const handleTitleEditSubmit = jest.fn();
const handleConfigureSubmit = jest.fn();
let store;
let axiosMock;

const renderComponent = (props?: any) => {
  const WrapperProvider = ({ children }) => (
    <CourseAuthoringProvider courseId={'courseId'}>{children}</CourseAuthoringProvider>
  );

  return render(
    <IframeProvider>
      <HeaderTitle
        unitTitle={unitTitle}
        isTitleEditFormOpen={isTitleEditFormOpen}
        handleTitleEdit={handleTitleEdit}
        handleTitleEditSubmit={handleTitleEditSubmit}
        handleConfigureSubmit={handleConfigureSubmit}
        {...props}
      />,
    </IframeProvider>,
    {
      extraWrapper: WrapperProvider,
    },
  );
};
describe('<HeaderTitle />', () => {
  let validateUserPermissionsMock;
  beforeEach(async () => {
    const mocks = initializeMocks();
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: true,
    });
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
  });

  it('render HeaderTitle component correctly', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: false,
    });
    renderComponent();

    expect(screen.getByText(unitTitle)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeInTheDocument();
  });

  it('render HeaderTitle with open edit form', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: false,
    });
    renderComponent({
      isTitleEditFormOpen: true,
    });

    expect(screen.getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toHaveValue(unitTitle);
    expect(await screen.findByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeEnabled();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeEnabled();
  });

  it('Units sourced from upstream show a enabled edit button', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: false,
    });
    // Override mock unit with one sourced from an upstream library
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          upstreamInfo: {
            // ...courseSectionVerticalMock.xblock_info.upstream_info, // seems to be missing in the mock
            upstreamRef: 'lct:org:lib:unit:unit-1',
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    renderComponent();

    expect(await screen.findByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeEnabled();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeEnabled();
  });

  it('calls toggle edit title form by clicking on Edit button', async () => {
    const user = userEvent.setup();
    renderComponent();

    const editTitleButton = await screen.findByRole('button', { name: messages.altButtonEdit.defaultMessage });
    await user.click(editTitleButton);
    expect(handleTitleEdit).toHaveBeenCalledTimes(1);
  });

  it('calls saving title by clicking outside or press Enter key', async () => {
    const user = userEvent.setup();
    renderComponent({
      isTitleEditFormOpen: true,
    });

    const titleField = screen.getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage });
    await user.type(titleField, ' 1');
    expect(titleField).toHaveValue(`${unitTitle} 1`);
    await user.click(document.body);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(1);

    await user.click(titleField);
    await user.type(titleField, ' 2[Enter]');
    expect(titleField).toHaveValue(`${unitTitle} 1 2`);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(2);
  });

  it('hides the Edit button when the user cannot edit course content (legacy design)', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: false,
    });
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: false,
    });
    renderComponent();
    expect(
      await screen.findByRole('button', { name: messages.altButtonSettings.defaultMessage }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.altButtonEdit.defaultMessage })).not.toBeInTheDocument();
  });

  it('hides the Edit button when the user cannot edit course content (new design)', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
    });
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: false,
    });
    renderComponent();
    expect(screen.getByText(unitTitle)).toBeInTheDocument();
    await waitFor(() => expect(validateUserPermissionsMock).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: messages.altButtonEdit.defaultMessage })).not.toBeInTheDocument();
  });
});
