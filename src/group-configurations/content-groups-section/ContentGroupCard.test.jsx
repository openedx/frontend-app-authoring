import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { contentGroupsMock } from '../__mocks__';
import commonMessages from '../common/messages';
import rootMessages from '../messages';
import ContentGroupCard from './ContentGroupCard';

const handleCreateMock = jest.fn();
const handleDeleteMock = jest.fn();
const handleEditMock = jest.fn();
const contentGroupActions = {
  handleCreate: handleCreateMock,
  handleDelete: handleDeleteMock,
  handleEdit: handleEditMock,
};

const handleEditGroupMock = jest.fn();
const contentGroup = contentGroupsMock.groups[0];
const contentGroupWithUsages = contentGroupsMock.groups[1];
const contentGroupWithOnlyOneUsage = contentGroupsMock.groups[2];

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <ContentGroupCard
      group={contentGroup}
      groupNames={contentGroupsMock.groups?.map((group) => group.name)}
      parentGroupId={contentGroupsMock.id}
      contentGroupActions={contentGroupActions}
      handleEditGroup={handleEditGroupMock}
      {...props}
    />
  </IntlProvider>,
);

describe('<ContentGroupCard />', () => {
  it('renders component correctly', () => {
    const { getByText, getByTestId } = renderComponent();
    expect(getByText(contentGroup.name)).toBeInTheDocument();
    expect(
      getByText(
        commonMessages.titleId.defaultMessage.replace('{id}', contentGroup.id),
      ),
    ).toBeInTheDocument();
    expect(getByText(rootMessages.notInUse.defaultMessage)).toBeInTheDocument();
    expect(getByTestId('content-group-card-header-edit')).toBeInTheDocument();
    expect(getByTestId('content-group-card-header-delete')).toBeInTheDocument();
  });

  it('expands/collapses the container group content on title click', () => {
    const {
      getByText, queryByTestId, getByTestId, queryByText,
    } = renderComponent();
    const cardTitle = getByTestId('configuration-card-header-button');
    userEvent.click(cardTitle);
    expect(queryByTestId('content-group-card-content')).toBeInTheDocument();
    expect(
      queryByText(rootMessages.notInUse.defaultMessage),
    ).not.toBeInTheDocument();

    userEvent.click(cardTitle);
    expect(queryByTestId('content-group-card-content')).not.toBeInTheDocument();
    expect(getByText(rootMessages.notInUse.defaultMessage)).toBeInTheDocument();
  });

  it('renders content group badge with used only one location', () => {
    const { queryByTestId } = renderComponent({
      group: contentGroupWithOnlyOneUsage,
    });
    const usageBlock = queryByTestId('configuration-card-header-button-usage');
    expect(usageBlock).toBeInTheDocument();
  });

  it('renders content group badge with used locations', () => {
    const { queryByTestId } = renderComponent({
      group: contentGroupWithUsages,
    });
    const usageBlock = queryByTestId('configuration-card-header-button-usage');
    expect(usageBlock).toBeInTheDocument();
  });

  it('renders group controls without access to units', () => {
    const { queryByText, getByTestId } = renderComponent();
    expect(
      queryByText(commonMessages.accessTo.defaultMessage),
    ).not.toBeInTheDocument();

    const cardTitle = getByTestId('configuration-card-header-button');
    userEvent.click(cardTitle);
    expect(getByTestId('configuration-card-usage-empty')).toBeInTheDocument();
  });
});
