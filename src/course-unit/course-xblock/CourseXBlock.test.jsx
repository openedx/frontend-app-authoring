import {
  render, waitFor, within,
} from '@testing-library/react';
import { useSelector } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import configureModalMessages from '../../generic/configure-modal/messages';
import deleteModalMessages from '../../generic/delete-modal/messages';
import initializeStore from '../../store';
import { getCourseSectionVerticalApiUrl, getXBlockBaseApiUrl } from '../data/api';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { executeThunk } from '../../utils';
import { getCourseId } from '../data/selectors';
import { PUBLISH_TYPES } from '../constants';
import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';
import { courseSectionVerticalMock, courseVerticalChildrenMock } from '../__mocks__';
import CourseXBlock from './CourseXBlock';
import messages from './messages';

let axiosMock;
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
const userPartitionInfoFormatted = camelCaseObject(userPartitionInfo);
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
        userPartitionInfo={userPartitionInfoFormatted}
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
      expect(getByText(name)).toBeInTheDocument();
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
        type: COMPONENT_TYPES.html,
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
        type: COMPONENT_TYPES.video,
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
        type: COMPONENT_TYPES.problem,
      });

      const editButton = getByRole('button', { name: messages.blockAltButtonEdit.defaultMessage });
      expect(getByText(name)).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();

      userEvent.click(editButton);
      expect(mockedUsedNavigate).toHaveBeenCalled();
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/course/${courseId}/editor/problem/${id}`);
      expect(handleDeleteMock).toHaveBeenCalledWith(id);
    });
  });

  describe('restrict access', () => {
    it('opens restrict access modal successfully', async () => {
      const {
        getByText,
        getByLabelText,
        findByTestId,
      } = renderComponent();

      const modalSubtitleText = configureModalMessages.restrictAccessTo.defaultMessage;
      const modalCancelBtnText = configureModalMessages.cancelButton.defaultMessage;
      const modalSaveBtnText = configureModalMessages.saveButton.defaultMessage;

      userEvent.click(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage));
      const accessBtn = getByText(messages.blockLabelButtonManageAccess.defaultMessage);

      userEvent.click(accessBtn);
      const configureModal = await findByTestId('configure-modal');

      expect(within(configureModal).getByText(modalSubtitleText)).toBeInTheDocument();
      expect(within(configureModal).getByRole('button', { name: modalCancelBtnText })).toBeInTheDocument();
      expect(within(configureModal).getByRole('button', { name: modalSaveBtnText })).toBeInTheDocument();
    });

    it('closes restrict access modal when cancel button is clicked', async () => {
      const {
        getByText,
        getByLabelText,
        findByTestId,
      } = renderComponent();

      userEvent.click(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage));
      const accessBtn = getByText(messages.blockLabelButtonManageAccess.defaultMessage);

      userEvent.click(accessBtn);
      const configureModal = await findByTestId('configure-modal');
      expect(configureModal).toBeInTheDocument();

      userEvent.click(within(configureModal).getByRole('button', { name: configureModalMessages.saveButton.defaultMessage }));
      expect(handleConfigureSubmitMock).not.toHaveBeenCalled();
    });

    it('handles submit restrict access data when save button is clicked', async () => {
      axiosMock
        .onPost(getXBlockBaseApiUrl(id), {
          publish: PUBLISH_TYPES.republish,
          metadata: { visible_to_staff_only: false, group_access: { 970807507: [1959537066] } },
        })
        .reply(200, { dummy: 'value' });

      const {
        getByText,
        getByLabelText,
        findByTestId,
        getByRole,
      } = renderComponent();
      const accessGroupName1 = userPartitionInfoFormatted.selectablePartitions[0].groups[0].name;
      const accessGroupName2 = userPartitionInfoFormatted.selectablePartitions[0].groups[1].name;

      userEvent.click(getByLabelText(messages.blockActionsDropdownAlt.defaultMessage));
      const accessBtn = getByText(messages.blockLabelButtonManageAccess.defaultMessage);

      userEvent.click(accessBtn);
      const configureModal = await findByTestId('configure-modal');
      expect(configureModal).toBeInTheDocument();
      expect(within(configureModal).queryByText(accessGroupName1)).not.toBeInTheDocument();
      expect(within(configureModal).queryByText(accessGroupName2)).not.toBeInTheDocument();

      const restrictAccessSelect = getByRole('combobox', {
        name: configureModalMessages.restrictAccessTo.defaultMessage,
      });
      userEvent.selectOptions(restrictAccessSelect, '0');

      // eslint-disable-next-line array-callback-return
      userPartitionInfoFormatted.selectablePartitions[0].groups.map((group) => {
        expect(within(configureModal).getByRole('checkbox', { name: group.name })).not.toBeChecked();
        expect(within(configureModal).queryByText(group.name)).toBeInTheDocument();
      });

      const group1Checkbox = within(configureModal).getByRole('checkbox', { name: accessGroupName1 });
      userEvent.click(group1Checkbox);
      expect(group1Checkbox).toBeChecked();

      const saveModalBtnText = within(configureModal).getByRole('button', {
        name: configureModalMessages.saveButton.defaultMessage,
      });
      expect(saveModalBtnText).toBeInTheDocument();
      userEvent.click(saveModalBtnText);
      await waitFor(() => {
        expect(handleConfigureSubmitMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('displays a visibility message if item has accessible restrictions', async () => {
    const { getByText } = renderComponent(
      {
        userPartitionInfo: {
          ...userPartitionInfoFormatted,
          selectedGroupsLabel: 'Visibility group 1',
        },
      },
    );

    await waitFor(() => {
      const visibilityMessage = messages.visibilityMessage.defaultMessage
        .replace('{selectedGroupsLabel}', 'Visibility group 1');
      expect(getByText(visibilityMessage)).toBeInTheDocument();
    });
  });
});
