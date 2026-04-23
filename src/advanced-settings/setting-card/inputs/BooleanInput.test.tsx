import { render, fireEvent, initializeMocks } from '@src/testUtils';
import BooleanInput from './BooleanInput';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderInput = (props: Record<string, any> = {}) =>
  render(
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BooleanInput name="selfPaced" displayName="Self Paced" {...(props as any)} />,
  );

describe('<BooleanInput />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders as checked when value is true', () => {
    const { getByRole } = renderInput({ value: true, onChange: jest.fn() });
    expect(getByRole('switch')).toBeChecked();
  });

  it('renders as unchecked when value is false', () => {
    const { getByRole } = renderInput({ value: false, onChange: jest.fn() });
    expect(getByRole('switch')).not.toBeChecked();
  });

  it('calls onChange with true when toggled from false', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: false, onChange });
    fireEvent.click(getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when toggled from true', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: true, onChange });
    fireEvent.click(getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
