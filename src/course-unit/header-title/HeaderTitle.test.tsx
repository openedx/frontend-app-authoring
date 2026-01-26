import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { executeThunk } from '@src/utils';

import { getCourseSectionVerticalApiUrl } from '../data/api';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { courseSectionVerticalMock } from '../__mocks__';
import HeaderTitle from './HeaderTitle';
import messages from './messages';

const blockId = '123';
const unitTitle = 'Getting Started';
const isTitleEditFormOpen = false;
const handleTitleEdit = jest.fn();
const handleTitleEditSubmit = jest.fn();
const handleConfigureSubmit = jest.fn();
let store;
let axiosMock;

const renderComponent = (props?: any) => render(
  <HeaderTitle
    unitTitle={unitTitle}
    isTitleEditFormOpen={isTitleEditFormOpen}
    handleTitleEdit={handleTitleEdit}
    handleTitleEditSubmit={handleTitleEditSubmit}
    handleConfigureSubmit={handleConfigureSubmit}
    {...props}
  />,
);

describe('<HeaderTitle />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();

    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, courseSectionVerticalMock);
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);
  });

  it('render HeaderTitle component correctly', () => {
    renderComponent();

    expect(screen.getByText(unitTitle)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeInTheDocument();
  });

  it('render HeaderTitle with open edit form', () => {
    renderComponent({
      isTitleEditFormOpen: true,
    });

    expect(screen.getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toHaveValue(unitTitle);
    expect(screen.getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeEnabled();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeEnabled();
  });

  it('Units sourced from upstream show a enabled edit button', async () => {
    // Override mock unit with one sourced from an upstream library
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseSectionVerticalApiUrl(blockId))
      .reply(200, {
        ...courseSectionVerticalMock,
        xblock_info: {
          ...courseSectionVerticalMock.xblock_info,
          upstreamInfo: {
            ...courseSectionVerticalMock.xblock_info.upstreamInfo,
            upstreamRef: 'lct:org:lib:unit:unit-1',
          },
        },
      });
    await executeThunk(fetchCourseSectionVerticalData(blockId), store.dispatch);

    renderComponent();

    expect(screen.getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeEnabled();
    expect(screen.getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeEnabled();
  });

  it('calls toggle edit title form by clicking on Edit button', async () => {
    const user = userEvent.setup();
    renderComponent();

    const editTitleButton = screen.getByRole('button', { name: messages.altButtonEdit.defaultMessage });
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
});
