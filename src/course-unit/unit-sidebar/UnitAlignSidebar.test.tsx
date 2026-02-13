import { render, screen, initializeMocks } from '@src/testUtils';
import { UnitAlignSidebar } from './UnitAlignSidebar';
import { UnitSidebarProvider } from './UnitSidebarContext';

jest.mock('@src/content-tags-drawer', () => ({
  ContentTagsDrawer: jest.fn(({ id, variant }) => (
    <div data-testid="content-tags-drawer">
      drawer-mock-{id}-{variant}
    </div>
  )),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ blockId: 'unit-id-1' }),
}));

const renderComponent = () => render(
  <UnitSidebarProvider readOnly={false}>
    <UnitAlignSidebar />
  </UnitSidebarProvider>,
);

describe('OutlineAlignSidebar', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders ContentTagsDrawer with the correct id and variant', () => {
    renderComponent();

    const drawer = screen.getByTestId('content-tags-drawer');

    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveTextContent(
      'drawer-mock-unit-id-1-component',
    );
  });
});
