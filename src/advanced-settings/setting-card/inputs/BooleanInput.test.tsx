import userEvent from '@testing-library/user-event';
import { render, initializeMocks } from '@src/testUtils';
import BooleanInput, { BooleanInputProps } from './BooleanInput';

const renderInput = ({
  name = 'selfPaced',
  displayName = 'Self Paced',
  value = false,
  onChange = jest.fn(),
}: Partial<BooleanInputProps> = {}) =>
  render(<BooleanInput name={name} displayName={displayName} value={value} onChange={onChange} />);

describe('<BooleanInput />', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
  });

  it('renders as checked when value is true', () => {
    const { getByRole } = renderInput({ value: true, onChange: jest.fn() });
    expect(getByRole('switch')).toBeChecked();
  });

  it('renders as unchecked when value is false', () => {
    const { getByRole } = renderInput({ value: false, onChange: jest.fn() });
    expect(getByRole('switch')).not.toBeChecked();
  });

  it('calls onChange with true when toggled from false', async () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: false, onChange });
    await user.click(getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when toggled from true', async () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: true, onChange });
    await user.click(getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('uses name as aria-label when displayName is empty', () => {
    const { getByRole } = renderInput({ value: true, onChange: jest.fn(), displayName: '' });
    expect(getByRole('switch')).toHaveAttribute('aria-label', 'selfPaced');
  });
});
