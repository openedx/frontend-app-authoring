import React from 'react';
import { shallow, mount } from 'enzyme';
import { Button } from '@edx/paragon';
import renderer from 'react-test-renderer';
import { CheckCircle } from '@edx/paragon/icons';
import SettingAlert from './SettingAlert';

describe('SettingAlert', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test Description',
    icon: CheckCircle,
  };
  it('successfully renders', () => {
    const tree = renderer.create(<SettingAlert {...defaultProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('renders the title correctly in alert-heading', () => {
    const wrapper = mount(<SettingAlert {...defaultProps} />);
    const alertHeading = wrapper.find('div.alert-heading').at(0);
    expect(alertHeading.children().text()).toEqual('Test Title');
  });
  it('handles button onClick', () => {
    const mockOnClick = jest.fn();
    const wrapper = mount(
      <SettingAlert
        actions={[
          <Button onClick={mockOnClick}>Hello</Button>,
        ]}
        {...defaultProps}
      >
        Alert
      </SettingAlert>,
    );
    wrapper.find('.btn').simulate('click');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  it('renders the description correctly', () => {
    const wrapper = shallow(<SettingAlert {...defaultProps} />);
    expect(wrapper.find('p').text()).toEqual('Test Description');
  });
  it('passes the additional props correctly', () => {
    const wrapper = shallow(<SettingAlert {...defaultProps} variant="success" />);
    expect(wrapper.props().variant).toEqual('success');
  });
});
