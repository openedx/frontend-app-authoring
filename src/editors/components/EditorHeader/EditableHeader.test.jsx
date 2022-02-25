import React from 'react';
import { shallow } from 'enzyme';
import { Icon, Form } from '@edx/paragon';
import { Edit } from '@edx/paragon/icons';
import * as module from './EditableHeader';

describe('EditableHeader', () => {
  const props = {
    handleChange: jest.fn().mockName('args.handleChange'),
    updateTitle: jest.fn().mockName('args.updateTitle'),
    handleKeyDown: jest.fn().mockName('args.handleKeyDown'),
    inputRef: jest.fn().mockName('args.inputRef'),
    localTitle: 'test-title-text',
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
      expect(formControl.props().trailingInputElement).toMatchObject(<Icon src={Edit} />);
    });
  });
});
