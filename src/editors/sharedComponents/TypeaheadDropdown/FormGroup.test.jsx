import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import FormGroup from './FormGroup';

jest.unmock('@openedx/paragon');
jest.unmock('@openedx/paragon/icons');

const mockHandleChange = jest.fn();
const mockHandleFocus = jest.fn();
const mockHandleClick = jest.fn();
const mockHandleBlur = jest.fn();
const defaultProps = {
  as: 'input',
  errorMessage: '',
  borderClass: '',
  autoComplete: null,
  readOnly: false,
  handleBlur: mockHandleBlur,
  handleChange: mockHandleChange,
  handleFocus: mockHandleFocus,
  handleClick: mockHandleClick,
  helpText: 'helpText text',
  options: null,
  trailingElement: null,
  type: 'text',
  children: null,
  className: '',
  floatingLabel: 'floatingLabel text',
  name: 'title',
  value: '',
};

const renderComponent = (props) => render(<FormGroup {...props} />);

describe('FormGroup', () => {
  it('renders component without error', () => {
    renderComponent(defaultProps);
    expect(screen.getByText(defaultProps.floatingLabel)).toBeVisible();
    expect(screen.getByText(defaultProps.helpText)).toBeVisible();
    expect(screen.queryByTestId('errorMessage')).toBeNull();
  });
  it('renders component with error', () => {
    const newProps = {
      ...defaultProps,
      errorMessage: 'error message',
    };
    renderComponent(newProps);
    expect(screen.getByText(defaultProps.floatingLabel)).toBeVisible();
    expect(screen.getByText(newProps.errorMessage)).toBeVisible();
    expect(screen.queryByText(defaultProps.helpText)).toBeNull();
  });
  it('handles element focus', async () => {
    renderComponent(defaultProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.focus(formInput);
    expect(mockHandleFocus).toHaveBeenCalled();
  });
  it('handles element blur', () => {
    renderComponent(defaultProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.focus(formInput);
    fireEvent.focusOut(formInput);
    expect(mockHandleBlur).toHaveBeenCalled();
  });
  it('handles element click', () => {
    renderComponent(defaultProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.click(formInput);
    expect(mockHandleClick).toHaveBeenCalled();
  });
  it('handles element change', () => {
    renderComponent(defaultProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.focus(formInput);
    userEvent.type(formInput, 'opt1');
    expect(mockHandleChange).toHaveBeenCalled();
  });
});
