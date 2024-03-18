import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { contentGroupsMock } from '../__mocks__';
import { formatUrlToUnitPage } from '../utils';
import UsageList from './UsageList';
import messages from './messages';

const usages = contentGroupsMock.groups[1]?.usage;

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <UsageList itemList={usages} {...props} />
  </IntlProvider>,
);

describe('<UsageList />', () => {
  it('renders component correctly', () => {
    const { getByText, getAllByRole } = renderComponent();
    expect(getByText(messages.accessTo.defaultMessage)).toBeInTheDocument();
    expect(getAllByRole('link')).toHaveLength(2);
    getAllByRole('link').forEach((el, idx) => {
      expect(el.href).toMatch(formatUrlToUnitPage(usages[idx].url));
      expect(getByText(usages[idx].label)).toBeVisible();
    });
  });

  it('renders experiment component correctly', () => {
    const { getByText } = renderComponent({ isExperiment: true });
    expect(
      getByText(messages.experimentAccessTo.defaultMessage),
    ).toBeInTheDocument();
  });
});
