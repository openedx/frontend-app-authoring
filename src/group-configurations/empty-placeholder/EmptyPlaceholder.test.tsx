import { initializeMocks, render, screen } from '@src/testUtils';

import messages from './messages';
import EmptyPlaceholder from '.';

const onCreateNewGroup = jest.fn();

const renderComponent = (props = {}) => render(<EmptyPlaceholder onCreateNewGroup={onCreateNewGroup} {...props} />);

describe('<EmptyPlaceholder />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders EmptyPlaceholder component correctly', () => {
    renderComponent();

    expect(screen.getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.button.defaultMessage })).toBeInTheDocument();
  });

  it('renders the read-only message without the create button when readOnly', () => {
    renderComponent({ readOnly: true });

    expect(screen.getByText(messages.readOnlyTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.button.defaultMessage })).not.toBeInTheDocument();
  });

  it('renders the read-only message without the create button when readOnly and isExperiment', () => {
    renderComponent({ readOnly: true, isExperiment: true });

    expect(screen.getByText(messages.readOnlyTitle.defaultMessage)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: messages.experimentalButton.defaultMessage }),
    ).not.toBeInTheDocument();
  });
});
