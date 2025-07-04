import { render, initializeMocks } from '@src/testUtils';
import CourseOutlineHeaderActionsSlot from '.';

jest.mock('CourseAuthoring/course-outline/header-navigations/HeaderNavigations', () => 'HeaderNavigations');

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: 'PluginSlot',
}));

// Slot properties that are required only for the default <HeaderNavigation> component
const headerNavProps = {
  isReIndexShow: false,
  isSectionsExpanded: false,
  isDisabledReindexButton: false,
  headerNavigationsActions: {
    handleNewSection: jest.fn(),
    handleReIndex: jest.fn(),
    handleExpandAll: jest.fn(),
    lmsLink: '',
  },
  courseActions: {
    deletable: true,
    draggable: true,
    childAddable: true,
    duplicable: true,
  },
  errors: {},
};

describe('CourseOutlineHeaderActionsSlot', () => {
  beforeEach(() => initializeMocks());

  test('pluginProps are set correctly', () => {
    const { container } = render(<CourseOutlineHeaderActionsSlot
      sections={[]}
      hasSections={false}
      {...headerNavProps}
    />);
    expect(container.querySelector('pluginslot')).toBeInTheDocument();
    expect(container.querySelector('pluginslot')?.getAttribute('idaliases')).toBe('course_outline_header_actions_slot');
    expect(container.querySelector('pluginslot')?.getAttribute('id')).toBe('org.openedx.frontend.authoring.course_outline_header_actions.v1');
    expect(container.querySelector('HeaderNavigations')).toBeInTheDocument();
  });
});
