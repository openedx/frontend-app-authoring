import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import deleteModalMessages from '../../generic/delete-modal/messages';
import initializeStore from '../../store';
import { getCourseSectionVerticalApiUrl } from '../data/api';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { executeThunk } from '../../utils';
import { courseSectionVerticalMock, courseVerticalChildrenMock } from '../__mocks__';
import CourseXBlock from './CourseXBlock';
import messages from './messages';

let axiosMock;
let store;
const blockId = '567890';
const handleDeleteMock = jest.fn();
const handleDuplicateMock = jest.fn();
const xblockData = courseVerticalChildrenMock.children[0];
const unitXBlockActionsMock = {
  handleDelete: handleDeleteMock,
  handleDuplicate: handleDuplicateMock,
};

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseXBlock
        id={xblockData.block_id}
        title={xblockData.block_id}
        unitXBlockActions={unitXBlockActionsMock}
        shouldScroll={false}
      />
    </IntlProvider>
  </AppProvider>,
);

describe('<CourseXBlock />', () => {
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

  it('render CourseXBlock component correctly', async () => {
    const { getByText, getByLabelText } = renderComponent();

    await waitFor(() => {
      expect(getByText(xblockData.block_id)).toBeInTheDocument();
      expect(getByLabelText(messages.blockAltButtonEdit.defaultMessage)).toBeInTheDocument();
      expect(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage)).toBeInTheDocument();
    });
  });

  it('render CourseXBlock component action dropdown correctly', async () => {
    const { getByRole, getByLabelText } = renderComponent();

    await waitFor(() => {
      userEvent.click(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage));
      expect(getByRole('button', { name: messages.blockLabelButtonDuplicate.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: messages.blockLabelButtonMove.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: messages.blockLabelButtonManageAccess.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: messages.blockLabelButtonDelete.defaultMessage })).toBeInTheDocument();
    });
  });

  it('calls handleDuplicate when item is clicked', async () => {
    const { getByText, getByLabelText } = renderComponent();

    await waitFor(() => {
      userEvent.click(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage));
      const duplicateBtn = getByText(messages.blockLabelButtonDuplicate.defaultMessage);

      userEvent.click(duplicateBtn);
      expect(handleDuplicateMock).toHaveBeenCalledTimes(1);
      expect(handleDuplicateMock).toHaveBeenCalledWith(xblockData.block_id);
    });
  });

  it('opens confirm delete modal and calls handleDelete when deleting was confirmed', async () => {
    const { getByText, getByLabelText, getByRole } = renderComponent();

    await waitFor(() => {
      userEvent.click(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage));
      const deleteBtn = getByText(messages.blockLabelButtonDelete.defaultMessage);

      userEvent.click(deleteBtn);
      expect(getByText(/Delete this component?/)).toBeInTheDocument();
      expect(getByText(/Deleting this component is permanent and cannot be undone./)).toBeInTheDocument();
      expect(getByRole('button', { name: deleteModalMessages.cancelButton.defaultMessage })).toBeInTheDocument();
      expect(getByRole('button', { name: deleteModalMessages.deleteButton.defaultMessage })).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: deleteModalMessages.cancelButton.defaultMessage }));
      expect(handleDeleteMock).not.toHaveBeenCalled();

      userEvent.click(getByText(messages.blockLabelButtonDelete.defaultMessage));
      expect(getByText(/Delete this component?/)).toBeInTheDocument();

      userEvent.click(deleteBtn);
      userEvent.click(getByRole('button', { name: deleteModalMessages.deleteButton.defaultMessage }));
      expect(handleDeleteMock).toHaveBeenCalled();
      expect(handleDeleteMock).toHaveBeenCalledWith(xblockData.block_id);
    });
  });
});
