import { render, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { getCourseId } from '../data/selectors';
import { COMPONENT_ICON_TYPES } from '../constants';
import { courseVerticalChildrenMock } from '../__mocks__';
import CourseXBlock from './CourseXBlock';

import deleteModalMessages from '../../generic/delete-modal/messages';
import messages from './messages';

let store;
const courseId = '1234';
const blockId = '567890';
const handleDeleteMock = jest.fn();
const handleDuplicateMock = jest.fn();
const handleConfigureSubmitMock = jest.fn();
const mockedUsedNavigate = jest.fn();
const {
  name,
  block_id: id,
  block_type: type,
  user_partition_info: userPartitionInfo,
} = courseVerticalChildrenMock.children[0];
const unitXBlockActionsMock = {
  handleDelete: handleDeleteMock,
  handleDuplicate: handleDuplicateMock,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseXBlock
        id={id}
        title={name}
        type={type}
        blockId={blockId}
        unitXBlockActions={unitXBlockActionsMock}
        userPartitionInfo={camelCaseObject(userPartitionInfo)}
        shouldScroll={false}
        handleConfigureSubmit={handleConfigureSubmitMock}
        {...props}
      />
    </IntlProvider>
  </AppProvider>,
);

useSelector.mockImplementation((selector) => {
  if (selector === getCourseId) {
    return courseId;
  }
  return null;
});

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
  });

  it('render CourseXBlock component correctly', async () => {
    const { getByText, getByLabelText } = renderComponent();

    await waitFor(() => {
      expect(getByText(name)).toBeInTheDocument();
      expect(getByLabelText(messages.blockAltButtonEdit.defaultMessage)).toBeInTheDocument();
      expect(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage)).toBeInTheDocument();
    });
  });

  it('render CourseXBlock component action dropdown correctly', async () => {
    const { getByRole, getByLabelText } = renderComponent();

    await waitFor(() => {
      userEvent.click(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage));
      expect(getByRole('button', { name: messages.blockLabelButtonCopy.defaultMessage })).toBeInTheDocument();
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
      expect(handleDuplicateMock).toHaveBeenCalledWith(id);
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
      expect(handleDeleteMock).toHaveBeenCalledWith(id);
    });
  });

  describe('edit', () => {
    it('navigates to editor page on edit HTML xblock', () => {
      const { getByText, getByRole } = renderComponent({
        type: COMPONENT_ICON_TYPES.html,
      });

      const editButton = getByRole('button', { name: messages.blockAltButtonEdit.defaultMessage });
      expect(getByText(name)).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();

      userEvent.click(editButton);
      expect(mockedUsedNavigate).toHaveBeenCalled();
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseId}/editor/html/${id}`);
    });

    it('navigates to editor page on edit Video xblock', () => {
      const { getByText, getByRole } = renderComponent({
        type: COMPONENT_ICON_TYPES.video,
      });

      const editButton = getByRole('button', { name: messages.blockAltButtonEdit.defaultMessage });
      expect(getByText(name)).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();

      userEvent.click(editButton);
      expect(mockedUsedNavigate).toHaveBeenCalled();
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseId}/editor/video/${id}`);
    });

    it('navigates to editor page on edit Problem xblock', () => {
      const { getByText, getByRole } = renderComponent({
        type: COMPONENT_ICON_TYPES.problem,
      });

      const editButton = getByRole('button', { name: messages.blockAltButtonEdit.defaultMessage });
      expect(getByText(name)).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();

      userEvent.click(editButton);
      expect(mockedUsedNavigate).toHaveBeenCalled();
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseId}/editor/problem/${id}`);
    });
  });
});
