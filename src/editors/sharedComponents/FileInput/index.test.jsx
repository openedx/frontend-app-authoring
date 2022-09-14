import React from 'react';
import { mount } from 'enzyme';

import { FileInput } from '.';

describe('FileInput component', () => {
  let el;
  let container;
  let props;
  beforeEach(() => {
    container = {};
    props = {
      acceptedFiles: '.srt',
      fileInput: {
        addFile: jest.fn().mockName('props.fileInput.addFile'),
        ref: (input) => { container.ref = input; },
      },
    };
    el = mount(<FileInput {...props} />);
  });
  test('snapshot', () => {
    expect(el).toMatchSnapshot();
  });
  test('only accepts allowed file types', () => {
    expect(el.find('input').props().accept).toEqual('.srt');
  });
  test('calls fileInput.addFile onChange', () => {
    expect(el.find('input').props().onChange).toEqual(props.fileInput.addFile);
  });
  test('loads ref from fileInput.ref', () => {
    expect(container.ref).toEqual(el.find('input').getDOMNode());
  });
});
