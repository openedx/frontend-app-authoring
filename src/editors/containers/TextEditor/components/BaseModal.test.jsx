import React from 'react';
import { shallow } from 'enzyme';

import { BaseModal } from './BaseModal';

describe('BaseModal ImageUploadModal template component', () => {
  test('snapshot', () => {
    const props = {
      isOpen: true,
      close: jest.fn().mockName('props.close'),
      title: 'props.title node',
      children: 'props.children node',
      confirmAction: 'props.confirmAction node',
      footerAction: 'props.footerAction node',
    };
    expect(shallow(<BaseModal {...props} />)).toMatchSnapshot();
  });
});
