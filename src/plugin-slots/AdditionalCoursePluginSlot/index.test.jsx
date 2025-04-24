import { shallow } from '@edx/react-unit-test-utils';
import { AdditionalCoursePluginSlot } from '.';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: 'PluginSlot',
}));

describe('AdditionalCoursePluginSlot', () => {
  beforeEach(() => jest.resetAllMocks());

  it('renders', () => {
    const wrapper = shallow(<AdditionalCoursePluginSlot />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
