import { shallow } from '@edx/react-unit-test-utils';
import renderer from 'react-test-renderer';

import { COURSE_BLOCK_NAMES } from 'CourseAuthoring/constants';
import CourseUnitHeaderActionsSlot from '.';

jest.mock('CourseAuthoring/course-unit/header-navigations/HeaderNavigations', () => 'HeaderNavigations');

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: 'PluginSlot',
}));

// Slot properties that are required for the default HeaderNavigation component
const headerNavProps = {
  headerNavigationsActions: {
    handleViewLive: jest.fn(),
    handlePreview: jest.fn(),
    handleEdit: jest.fn(),
  },
  category: 'vertical',
  unitTitle: 'Mock Unit',
  verticalBlocks: [],
};

describe('CourseUnitHeaderActionsSlot', () => {
  beforeEach(() => jest.resetAllMocks());

  test('pluginProps are set correctly', () => {
    const wrapper = shallow(<CourseUnitHeaderActionsSlot unitTitle="Mock Title" verticalBlocks={[]} {...headerNavProps} />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });

  test('isUnitVerticalType is set correctly', () => {
    let component = renderer.create(
      <CourseUnitHeaderActionsSlot
        unitTitle="Mock Title"
        verticalBlocks={[]}
        category="library"
        headerNavigationsActions={headerNavProps.headerNavigationsActions}
      />,
    );
    expect(component.toJSON().props.pluginProps.isUnitVerticalType).toEqual(false);

    component = renderer.create(
      <CourseUnitHeaderActionsSlot
        unitTitle="Mock Title"
        verticalBlocks={[]}
        category={COURSE_BLOCK_NAMES.vertical.id}
        headerNavigationsActions={headerNavProps.headerNavigationsActions}
      />,
    );
    expect(component.toJSON().props.pluginProps.isUnitVerticalType).toEqual(true);
  });
});
