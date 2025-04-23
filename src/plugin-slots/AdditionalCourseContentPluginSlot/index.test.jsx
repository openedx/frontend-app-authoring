import { shallow } from '@edx/react-unit-test-utils';
import { AdditionalCourseContentPluginSlot } from '.';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: 'PluginSlot',
}));

describe('AdditionalCourseContentPluginSlot', () => {
  beforeEach(() => jest.resetAllMocks());

  it('renders', () => {
    const wrapper = shallow(<AdditionalCourseContentPluginSlot />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
