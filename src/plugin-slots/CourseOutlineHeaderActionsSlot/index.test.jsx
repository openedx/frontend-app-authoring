import { shallow } from '@edx/react-unit-test-utils';

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
  beforeEach(() => jest.resetAllMocks());

  test('pluginProps are set correctly', () => {
    const wrapper = shallow(<CourseOutlineHeaderActionsSlot
      sections={[]}
      hasSections={false}
      {...headerNavProps}
    />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
