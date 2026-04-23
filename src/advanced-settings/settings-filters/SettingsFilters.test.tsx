import { render, fireEvent, initializeMocks } from '@src/testUtils';
import SettingsFilters from './SettingsFilters';
import messages from './messages';

const renderFilters = (props = {}) =>
  render(
    <SettingsFilters
      filterText=""
      onFilterChange={jest.fn()}
      showDeprecated={false}
      onDeprecatedChange={jest.fn()}
      expandAll
      onExpandAllChange={jest.fn()}
      {...props}
    />,
  );

describe('<SettingsFilters />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the search field', () => {
    const { getByRole } = renderFilters({});
    expect(getByRole('searchbox')).toBeInTheDocument();
  });

  it('calls onFilterChange when the search value changes', () => {
    const onFilterChange = jest.fn();
    const { getByRole } = renderFilters({ onFilterChange });
    fireEvent.change(getByRole('searchbox'), { target: { value: 'proctoring' } });
    expect(onFilterChange).toHaveBeenCalledWith('proctoring');
  });

  it('shows "Collapse all" when expandAll is true', () => {
    const { getByText } = renderFilters({ expandAll: true });
    expect(getByText(messages.collapseAll.defaultMessage)).toBeInTheDocument();
  });

  it('shows "Expand all" when expandAll is false', () => {
    const { getByText } = renderFilters({ expandAll: false });
    expect(getByText(messages.expandAll.defaultMessage)).toBeInTheDocument();
  });

  it('calls onExpandAllChange with false when "Collapse all" is clicked', () => {
    const onExpandAllChange = jest.fn();
    const { getByText } = renderFilters({ expandAll: true, onExpandAllChange });
    fireEvent.click(getByText(messages.collapseAll.defaultMessage));
    expect(onExpandAllChange).toHaveBeenCalledWith(false);
  });

  it('calls onExpandAllChange with true when "Expand all" is clicked', () => {
    const onExpandAllChange = jest.fn();
    const { getByText } = renderFilters({ expandAll: false, onExpandAllChange });
    fireEvent.click(getByText(messages.expandAll.defaultMessage));
    expect(onExpandAllChange).toHaveBeenCalledWith(true);
  });

  it('shows "Show deprecated" when showDeprecated is false', () => {
    const { getByText } = renderFilters({ showDeprecated: false });
    expect(getByText(messages.showDeprecated.defaultMessage)).toBeInTheDocument();
  });

  it('shows "Hide deprecated" when showDeprecated is true', () => {
    const { getByText } = renderFilters({ showDeprecated: true });
    expect(getByText(messages.hideDeprecated.defaultMessage)).toBeInTheDocument();
  });

  it('calls onDeprecatedChange with true when "Show deprecated" is clicked', () => {
    const onDeprecatedChange = jest.fn();
    const { getByText } = renderFilters({ showDeprecated: false, onDeprecatedChange });
    fireEvent.click(getByText(messages.showDeprecated.defaultMessage));
    expect(onDeprecatedChange).toHaveBeenCalledWith(true);
  });

  it('calls onDeprecatedChange with false when "Hide deprecated" is clicked', () => {
    const onDeprecatedChange = jest.fn();
    const { getByText } = renderFilters({ showDeprecated: true, onDeprecatedChange });
    fireEvent.click(getByText(messages.hideDeprecated.defaultMessage));
    expect(onDeprecatedChange).toHaveBeenCalledWith(false);
  });
});
