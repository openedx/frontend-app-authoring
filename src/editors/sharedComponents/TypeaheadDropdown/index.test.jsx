import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import TypeaheadDropdown from '.';

jest.unmock('@openedx/paragon');
jest.unmock('@openedx/paragon/icons');

const defaultProps = {
  as: 'input',
  name: 'OrganizationDropdown',
  floatingLabel: 'floatingLabel text',
  options: null,
  handleFocus: null,
  handleChange: null,
  handleBlur: null,
  value: null,
  errorMessage: null,
  errorCode: null,
  readOnly: false,
  noOptionsMessage: 'No options',
};
const renderComponent = (props) => render(<TypeaheadDropdown {...props} />);

describe('common/OrganizationDropdown.jsx', () => {
  it('renders component without error', () => {
    renderComponent(defaultProps);
    expect(screen.getByText(defaultProps.floatingLabel)).toBeVisible();
  });
  it('handles element focus', () => {
    const mockHandleFocus = jest.fn();
    const newProps = { ...defaultProps, handleFocus: mockHandleFocus };
    renderComponent(newProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.focus(formInput);
    expect(mockHandleFocus).toHaveBeenCalled();
  });
  it('handles element blur', () => {
    const mockHandleBlur = jest.fn();
    const newProps = { ...defaultProps, handleBlur: mockHandleBlur };
    renderComponent(newProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.focus(formInput);
    fireEvent.focusOut(formInput);
    expect(mockHandleBlur).toHaveBeenCalled();
  });
  it('renders component with options', async () => {
    const newProps = { ...defaultProps, options: ['opt2', 'opt1'] };
    renderComponent(newProps);
    const formInput = screen.getByTestId('formControl');
    await waitFor(() => fireEvent.click(formInput));
    const optionsList = within(screen.getByTestId('dropdown-container')).getAllByRole('button');
    expect(optionsList.length).toEqual(newProps.options.length);
  });
  it('selects option', () => {
    const newProps = { ...defaultProps, options: ['opt1', 'opt2'] };
    renderComponent(newProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.click(formInput);
    const optionsList = within(screen.getByTestId('dropdown-container')).getAllByRole('button');
    fireEvent.click(optionsList.at([0]));
    expect(formInput.value).toEqual(newProps.options[0]);
  });
  it('toggles options list', async () => {
    const newProps = { ...defaultProps, options: ['opt1', 'opt2'] };
    renderComponent(newProps);
    const optionsList = within(screen.getByTestId('dropdown-container')).queryAllByRole('button');
    expect(optionsList.length).toEqual(0);
    await act(async () => {
      fireEvent.click(screen.getByTestId('expand-more-button'));
    });
    expect(within(screen.getByTestId('dropdown-container'))
      .queryAllByRole('button').length).toEqual(newProps.options.length);
    await act(async () => {
      fireEvent.click(screen.getByTestId('expand-less-button'));
    });
    expect(within(screen.getByTestId('dropdown-container'))
      .queryAllByRole('button').length).toEqual(0);
  });
  it('shows options list depends on field value', () => {
    const newProps = { ...defaultProps, options: ['opt1', 'opt2'] };
    renderComponent(newProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.focus(formInput);
    userEvent.type(formInput, 'opt1');
    expect(within(screen.getByTestId('dropdown-container'))
      .queryAllByRole('button').length).toEqual(1);
  });
  it('closes options list on click outside', async () => {
    const newProps = { ...defaultProps, options: ['opt1', 'opt2'] };
    renderComponent(newProps);
    const formInput = screen.getByTestId('formControl');
    fireEvent.click(formInput);
    expect(within(screen.getByTestId('dropdown-container'))
      .queryAllByRole('button').length).toEqual(2);
    userEvent.click(document.body);
    expect(within(screen.getByTestId('dropdown-container'))
      .queryAllByRole('button').length).toEqual(0);
  });
  describe('empty options list', () => {
    it('shows empty options list depends on field value', () => {
      const newProps = { ...defaultProps, options: ['opt1', 'opt2'] };
      renderComponent(newProps);
      const formInput = screen.getByTestId('formControl');
      fireEvent.focus(formInput);
      userEvent.type(formInput, '3');
      const noOptionsList = within(screen.getByTestId('dropdown-container')).getByText('No options');
      const addButton = within(screen.getByTestId('dropdown-container')).queryByTestId('add-option-button');
      expect(noOptionsList).toBeVisible();
      expect(addButton).toBeNull();
    });
    it('shows empty options list with add option button', () => {
      const newProps = {
        ...defaultProps,
        options: ['opt1', 'opt2'],
        allowNewOption: true,
        newOptionButtonLabel: 'Add new option',
        addNewOption: jest.fn(),
      };
      renderComponent(newProps);
      const formInput = screen.getByTestId('formControl');
      fireEvent.focus(formInput);
      userEvent.type(formInput, '3');
      const noOptionsList = within(screen.getByTestId('dropdown-container')).getByText('No options');
      expect(noOptionsList).toBeVisible();
      const addButton = within(screen.getByTestId('dropdown-container')).getByTestId('add-option-button');
      expect(addButton).toHaveTextContent(newProps.newOptionButtonLabel);
    });
  });
});
