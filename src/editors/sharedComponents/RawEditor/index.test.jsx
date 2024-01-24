import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { RawEditor } from '.';

describe('RawEditor', () => {
  const defaultProps = {
    editorRef: {
      current: {
        value: 'Ref Value',
      },
    },
    content: { data: { data: 'eDiTablE Text' } },
    lang: 'html',
  };
  const xmlProps = {
    editorRef: {
      current: {
        value: 'Ref Value',
      },
    },
    content: { data: { data: 'eDiTablE Text' } },
    lang: 'xml',
  };
  const noContentProps = {
    editorRef: {
      current: {
        value: 'Ref Value',
      },
    },
    content: null,
    lang: 'html',
    width: { width: '80%' },
  };

  test('renders as expected with default behavior', () => {
    expect(shallow(<RawEditor {...defaultProps} />).snapshot).toMatchSnapshot();
  });
  test('renders as expected with lang equal to xml', () => {
    expect(shallow(<RawEditor {...xmlProps} />).snapshot).toMatchSnapshot();
  });
  test('renders as expected with content equal to null', () => {
    expect(shallow(<RawEditor {...noContentProps} />).snapshot).toMatchSnapshot();
  });
});
