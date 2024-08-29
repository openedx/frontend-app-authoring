import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { Form } from '@openedx/paragon';
import { EditableHeaderInternal as EditableHeader } from './EditableHeader';
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
    el = shallow(<EditableHeader {...props} />);
  });

  describe('snapshot', () => {
    test('snapshot', () => {
      expect(el.snapshot).toMatchSnapshot();
    });
    test('displays Edit Icon', () => {
      const formControl = el.instance.findByType(Form.Control)[0];
      expect(formControl.props.trailingElement).toMatchObject(
        <EditConfirmationButtons updateTitle={props.updateTitle} cancelEdit={props.cancelEdit} />,
      );
    });
  });
});
