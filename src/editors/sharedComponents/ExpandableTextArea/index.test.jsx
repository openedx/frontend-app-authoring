import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import ExpandableTextArea from '.';

// Per https://github.com/tinymce/tinymce-react/issues/91 React unit testing in JSDOM is not supported by tinymce.
// Consequently, mock the Editor out.
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'TiNYmCE EDitOR',
  };
});

jest.mock('../TinyMceWidget', () => 'TinyMceWidget');

describe('ExpandableTextArea', () => {
  const props = {
    value: 'text',
    setContent: jest.fn(),
    error: false,
    errorMessage: null,
  };
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<ExpandableTextArea {...props} />).snapshot).toMatchSnapshot();
    });
    test('renders error message', () => {
      const wrapper = shallow(<ExpandableTextArea {...props} error errorMessage="eRRormeSsaGE" />);
      expect(wrapper.snapshot).toMatchSnapshot();
    });
  });
});
