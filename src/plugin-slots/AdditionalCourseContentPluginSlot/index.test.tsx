import { render, initializeMocks } from '@src/testUtils';
import { AdditionalCourseContentPluginSlot } from '.';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: 'PluginSlot',
}));

describe('AdditionalCourseContentPluginSlot', () => {
  beforeEach(() => initializeMocks());

  it('renders', () => {
    const expectedId = 'org.openedx.frontend.authoring.additional_course_content_plugin.v1';
    const { container } = render(<AdditionalCourseContentPluginSlot />);
    expect(container.querySelector('pluginslot')).toBeInTheDocument();
    expect(container.querySelector('pluginslot')).toHaveProperty('id', expectedId);
  });
});
