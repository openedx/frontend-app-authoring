import React from 'react';
import { shallow } from 'enzyme';
import { Form } from '@edx/paragon';
import * as module from './EditableHeader';
import EditConfirmationButtons from './EditConfirmationButtons';

describe('EditableHeader', () => {
  const props = {
    handleChange: jest.fn().mockName('args.handleChange'),
    updateTitle: jest.fn().mockName('args.updateTitle'),
    handleKeyDown: jest.fn().mockName('args.handleKeyDown'),
    inputRef: jest.fn().mockName('args.inputRef'),
    localTitle: 'test-title-text',
    cancelEdit: jest.fn().mockName('args.cancelEdit'),
  };
  let el;
  beforeEach(() => {
    el = shallow(<module.EditableHeader {...props} />);
  });

  describe('snapshot', () => {
    test('snapshot', () => {
      expect(el).toMatchSnapshot();
    });
    test('displays Edit Icon', () => {
      const formControl = el.find(Form.Control);
      expect(formControl.props().trailingElement).toMatchObject(
        <EditConfirmationButtons updateTitle={props.updateTitle} cancelEdit={props.cancelEdit} />,
      );
    });
  });
});
