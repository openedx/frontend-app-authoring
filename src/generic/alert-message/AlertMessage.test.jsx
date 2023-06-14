import React from 'react';
import { shallow, mount } from 'enzyme';
import { Button } from '@edx/paragon';
import renderer from 'react-test-renderer';
import { CheckCircle } from '@edx/paragon/icons';
import AlertMessage from '.';

describe('AlertMessage', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test Description',
    icon: CheckCircle,
  };
  it('successfully renders', () => {
    const tree = renderer.create(<AlertMessage {...defaultProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('renders the title correctly in alert-heading', () => {
    const wrapper = mount(<AlertMessage {...defaultProps} />);
    const alertHeading = wrapper.find('div.alert-heading').at(0);
    expect(alertHeading.children().text()).toEqual('Test Title');
  });
  it('handles button onClick', () => {
    const mockOnClick = jest.fn();
    const wrapper = mount(
      <AlertMessage
        actions={[
          <Button onClick={mockOnClick}>Hello</Button>,
        ]}
        {...defaultProps}
      >
        Alert
      </AlertMessage>,
    );
    wrapper.find('.btn').simulate('click');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  it('renders the description correctly', () => {
    const wrapper = shallow(<AlertMessage {...defaultProps} />);
    expect(wrapper.find('p').text()).toEqual('Test Description');
  });
  it('passes the additional props correctly', () => {
    const wrapper = shallow(<AlertMessage {...defaultProps} variant="success" />);
    expect(wrapper.props().variant).toEqual('success');
  });
});
