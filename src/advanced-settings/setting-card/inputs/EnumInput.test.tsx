import { render, fireEvent, initializeMocks } from '@src/testUtils';
import EnumInput from './EnumInput';
import { ENUM_OPTIONS } from '../../data/fieldTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderInput = (props: Record<string, any> = {}) =>
  render(
    // eslint-disable-next-line react/jsx-props-no-spreading
    <EnumInput name="showanswer" displayName="Show Answer" {...(props as any)} />,
  );

describe('<EnumInput />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the correct options for the given field name', () => {
    const { getAllByRole } = renderInput({ value: 'always', onChange: jest.fn() });
    const options = getAllByRole('option');
    const expectedValues = ENUM_OPTIONS.showanswer.map((o) => o.value);
    expect(options.map((o: HTMLOptionElement) => o.value)).toEqual(expectedValues);
  });

  it('shows the current value as selected', () => {
    const { getByRole } = renderInput({ value: 'never', onChange: jest.fn() });
    expect(getByRole('combobox')).toHaveValue('never');
  });

  it('calls onChange with the selected value when the selection changes', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    fireEvent.change(getByRole('combobox'), { target: { value: 'never' } });
    expect(onChange).toHaveBeenCalledWith('never');
  });

  it('calls onChange only once per change event', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    fireEvent.change(getByRole('combobox'), { target: { value: 'past_due' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
