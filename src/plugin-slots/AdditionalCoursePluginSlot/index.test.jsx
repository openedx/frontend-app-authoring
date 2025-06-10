import { AdditionalCoursePluginSlot } from '.';
import { render, initializeMocks } from '../../testUtils';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: 'PluginSlot',
}));

describe('AdditionalCoursePluginSlot', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders', () => {
    const { container } = render(<AdditionalCoursePluginSlot />);
    const pluginSlot = container.querySelector('pluginslot');
    expect(pluginSlot).toBeInTheDocument();
    expect(pluginSlot).toHaveAttribute('idaliases', 'additional_course_plugin');
  });
});
