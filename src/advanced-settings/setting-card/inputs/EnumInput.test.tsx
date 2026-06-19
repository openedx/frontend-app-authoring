import userEvent from '@testing-library/user-event';
import { render, initializeMocks } from '@src/testUtils';
import EnumInput, { EnumInputProps } from './EnumInput';
import type { EnumOption } from '../../data/fieldTypes';

const SHOWANSWER_OPTIONS: EnumOption[] = [
  { value: 'always', displayName: 'Always' },
  { value: 'never', displayName: 'Never' },
  { value: 'past_due', displayName: 'Past Due' },
];

const renderInput = ({
  name = 'showanswer',
  displayName = 'Show Answer',
  value = 'always',
  options = SHOWANSWER_OPTIONS,
  onChange = jest.fn(),
}: Partial<EnumInputProps> = {}) =>
  render(<EnumInput name={name} displayName={displayName} value={value} options={options} onChange={onChange} />);

describe('<EnumInput />', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
  });

  it('renders the options provided by the backend', () => {
    const { getAllByRole } = renderInput({ value: 'always' });
    const options = getAllByRole('option');
    expect(options.map((o: HTMLOptionElement) => o.value)).toEqual(['always', 'never', 'past_due']);
  });

  it('shows the current value as selected', () => {
    const { getByRole } = renderInput({ value: 'never' });
    expect(getByRole('combobox')).toHaveValue('never');
  });

  it('calls onChange with the selected value when the selection changes', async () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    await user.selectOptions(getByRole('combobox'), 'never');
    expect(onChange).toHaveBeenCalledWith('never');
  });

  it('calls onChange only once per change event', async () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    await user.selectOptions(getByRole('combobox'), 'past_due');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when the field is blurred', async () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    await user.click(getByRole('combobox'));
    await user.tab();
    expect(onChange).toHaveBeenCalledWith('always');
  });

  it('uses name as aria-label when displayName is empty', () => {
    const { getByRole } = renderInput({ displayName: '' });
    expect(getByRole('combobox')).toHaveAttribute('aria-label', 'showanswer');
  });

  it('renders an empty select when no options are provided', () => {
    const { getByRole } = renderInput({ name: 'unknownField', value: '', options: [] });
    expect(getByRole('combobox')).toBeInTheDocument();
    expect(getByRole('combobox').children).toHaveLength(0);
  });

  it('surfaces the current value as an option when it is not in the backend list (no data loss)', () => {
    const { getByRole, getAllByRole } = renderInput({ value: 'legacy_value', options: SHOWANSWER_OPTIONS });
    const optionValues = getAllByRole('option').map((o: HTMLOptionElement) => o.value);
    expect(optionValues).toEqual(['legacy_value', 'always', 'never', 'past_due']);
    expect(getByRole('combobox')).toHaveValue('legacy_value');
  });

  it('renders without crashing when no value prop is provided', () => {
    // Covers the default value='' parameter branch.
    const { getByRole } = renderInput({ value: undefined });
    expect(getByRole('combobox')).toBeInTheDocument();
  });

  it('renders without crashing when value is null', () => {
    // Covers the `value ?? ""` null branch.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { getByRole } = renderInput({ value: null as any });
    expect(getByRole('combobox')).toBeInTheDocument();
  });

  it('renders without crashing when options prop is omitted', () => {
    // Covers the default options=[] parameter branch.
    const { getByRole } = render(
      <EnumInput name="showanswer" displayName="Show Answer" value="" onChange={jest.fn()} />,
    );
    expect(getByRole('combobox')).toBeInTheDocument();
  });
});
