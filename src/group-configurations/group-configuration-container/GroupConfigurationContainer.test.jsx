import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  contentGroupsMock,
  experimentGroupConfigurationsMock,
} from '../__mocks__';
import messages from './messages';
import GroupConfigurationContainer from '.';

const contentGroup = contentGroupsMock.groups[0];
const experimentGroup = experimentGroupConfigurationsMock[0];
const contentGroupWithUsages = contentGroupsMock.groups[1];
const contentGroupWithOnlyOneUsage = contentGroupsMock.groups[2];

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <GroupConfigurationContainer group={contentGroup} {...props} />
  </IntlProvider>,
);

describe('<GroupConfigurationContainer />', () => {
  it('renders component correctly', () => {
    const { getByText, getByTestId } = renderComponent();
    expect(getByText(contentGroup.name)).toBeInTheDocument();
    expect(
      getByText(
        messages.titleId.defaultMessage.replace('{id}', contentGroup.id),
      ),
    ).toBeInTheDocument();
    expect(getByText(messages.notInUse.defaultMessage)).toBeInTheDocument();
    expect(getByTestId('configuration-card-header-edit')).toBeInTheDocument();
    expect(getByTestId('configuration-card-header-delete')).toBeInTheDocument();
  });

  it('expands/collapses the container group content on title click', () => {
    const {
      getByText, queryByTestId, getByTestId, queryByText,
    } = renderComponent();
    const cardTitle = getByTestId('configuration-card-header__button');
    userEvent.click(cardTitle);
    expect(queryByTestId('configuration-card-content')).toBeInTheDocument();
    expect(
      queryByText(messages.notInUse.defaultMessage),
    ).not.toBeInTheDocument();

    userEvent.click(cardTitle);
    expect(queryByTestId('configuration-card-content')).not.toBeInTheDocument();
    expect(getByText(messages.notInUse.defaultMessage)).toBeInTheDocument();
  });

  it('renders content group badge with used only one location', () => {
    const { getByText } = renderComponent({
      group: contentGroupWithOnlyOneUsage,
    });
    expect(
      getByText(messages.usedInLocation.defaultMessage),
    ).toBeInTheDocument();
  });

  it('renders content group badge with used locations', () => {
    const { getByText } = renderComponent({
      group: contentGroupWithUsages,
    });
    expect(
      getByText(
        messages.usedInLocations.defaultMessage.replace(
          '{len}',
          contentGroupWithUsages.usage.length,
        ),
      ),
    ).toBeInTheDocument();
  });

  it('renders group controls without access to units', () => {
    const { queryByText, getByTestId } = renderComponent();
    expect(
      queryByText(messages.accessTo.defaultMessage),
    ).not.toBeInTheDocument();

    const cardTitle = getByTestId('configuration-card-header__button');
    userEvent.click(cardTitle);
    expect(getByTestId('configuration-card-usage-empty')).toBeInTheDocument();
  });

  it('renders experiment group correctly', () => {
    const { getByText } = renderComponent({
      group: experimentGroup,
      isExperiment: true,
    });
    expect(getByText(experimentGroup.name)).toBeInTheDocument();
    expect(getByText(messages.notInUse.defaultMessage)).toBeInTheDocument();
    expect(
      getByText(
        messages.containsGroups.defaultMessage.replace(
          '{len}',
          experimentGroup.groups.length,
        ),
      ),
    ).toBeInTheDocument();
  });

  it('expands/collapses the container experiment group on title click', () => {
    const {
      getByTestId,
      getByText,
      queryByTestId,
      queryByText,
      getAllByTestId,
    } = renderComponent({
      group: experimentGroup,
      isExperiment: true,
    });
    expect(queryByText(experimentGroup.description)).not.toBeInTheDocument();

    const cardTitle = getByTestId('configuration-card-header__button');
    userEvent.click(cardTitle);
    expect(queryByTestId('configuration-card-content')).toBeInTheDocument();
    expect(getByText(experimentGroup.description)).toBeInTheDocument();

    expect(
      getAllByTestId('configuration-card-content__experiment-stack'),
    ).toHaveLength(experimentGroup.groups.length);
  });
});
