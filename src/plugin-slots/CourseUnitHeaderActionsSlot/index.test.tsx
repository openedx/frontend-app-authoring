import { render, initializeMocks } from '@src/testUtils';
import renderer from 'react-test-renderer';

import { COURSE_BLOCK_NAMES } from '@src/constants';
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
  isUnitVerticalType: false,
  verticalBlocks: [],
};

describe('CourseUnitHeaderActionsSlot', () => {
  beforeEach(() => initializeMocks());

  test('pluginProps are set correctly', () => {
    const { container } = render(<CourseUnitHeaderActionsSlot {...headerNavProps} />);
    expect(container.querySelector('pluginslot')).toBeInTheDocument();
    expect(container.querySelector('headernavigations')).toBeInTheDocument();
    expect(container.querySelector('headernavigations')?.getAttribute('category')).toBe('vertical');
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
