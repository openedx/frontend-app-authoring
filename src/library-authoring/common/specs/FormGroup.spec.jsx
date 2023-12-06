import React from 'react';
import { mount } from 'enzyme';
import FormGroup from '../FormGroup';

describe('common/FormGroup.jsx', () => {
  let props;
  let mockHandleChange;
  let mockHandleFocus;
  let mockHandleClick;
  let mockHandleBlur;

  beforeEach(() => {
    mockHandleChange = jest.fn();
    mockHandleFocus = jest.fn();
    mockHandleClick = jest.fn();
    mockHandleBlur = jest.fn();
    props = {
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
  });

  it('renders component without error', () => {
    const container = mount(<FormGroup {...props} />);
    const labelText = container.find('label').at(0).text();
    const helpText = container.find('.pgn__form-text').at(0).text();

    expect(labelText).toEqual(props.floatingLabel);
    expect(helpText).toEqual(props.helpText);
  });

  it('handles element focus', () => {
    const container = mount(<FormGroup {...props} />);
    container.find('input').at(0).simulate('focus');

    expect(mockHandleFocus).toHaveBeenCalled();
  });

  it('handles element blur', () => {
    const container = mount(<FormGroup {...props} />);
    container.find('input').at(0).simulate('focus');
    container.find('input').at(0).simulate('blur');

    expect(mockHandleBlur).toHaveBeenCalled();
  });

  it('handles element click', () => {
    const container = mount(<FormGroup {...props} />);
    container.find('input').at(0).simulate('click');

    expect(mockHandleClick).toHaveBeenCalled();
  });
});
