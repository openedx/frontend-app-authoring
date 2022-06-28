import React from 'react';
import { shallow } from 'enzyme';

import { RawEditor } from '.';

describe('ImageSettingsModal', () => {
  const props = {
    editorRef: {
      current: {
        value: 'Ref Value',
      },
    },
    text: 'sOmErAwHtml',
  };
  test('renders as expected with default behavior', () => {
    expect(shallow(<RawEditor {...props} />)).toMatchSnapshot();
  });
});
