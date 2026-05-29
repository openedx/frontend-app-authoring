import {
  act, fireEvent, initializeMocks, render, screen, waitFor,
} from '@src/testUtils';

import cardHeaderMessages from '@src/course-outline/card-header/messages';
import ComponentMenu from './ComponentMenu';

const mockCopyToClipboard = jest.fn();
const mockDeleteComponent = jest.fn();
const mockDuplicateComponent = jest.fn();
const mockOnActionComplete = jest.fn();

jest.mock('@src/generic/clipboard', () => ({
  useClipboard: () => ({
    copyToClipboard: mockCopyToClipboard,
  }),
}));

jest.mock('./data/hooks', () => ({
  useDeleteUnitComponent: () => ({
    mutateAsync: mockDeleteComponent,
  }),
  useDuplicateUnitComponent: () => ({
    mutateAsync: mockDuplicateComponent,
  }),
}));

const renderComponentMenu = (props?: Partial<React.ComponentProps<typeof ComponentMenu>>) => render(
  <ComponentMenu
    unitId="block-v1:test+type@vertical+block@unit1"
    blockId="block-v1:test+type@html+block@1"
    displayName="Test Component"
    blockType="html"
    actions={{
      canCopy: true,
      canDuplicate: true,
      canDelete: true,
      canMove: false,
      canManageAccess: false,
    }}
    onActionComplete={mockOnActionComplete}
    {...props}
  />,
);

describe('<ComponentMenu />', () => {
  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
    mockDeleteComponent.mockResolvedValue(undefined);
    mockDuplicateComponent.mockResolvedValue(undefined);
  });

  const openMenu = async () => {
    const toggle = screen.getByTestId('component-menu-toggle');
    await act(async () => fireEvent.click(toggle));
  };

  it('renders copy, duplicate, and delete menu items', async () => {
    renderComponentMenu();
    await openMenu();

    expect(screen.getByTestId('component-menu-copy')).toHaveTextContent(
      cardHeaderMessages.menuCopy.defaultMessage,
    );
    expect(screen.getByTestId('component-menu-duplicate')).toHaveTextContent(
      cardHeaderMessages.menuDuplicate.defaultMessage,
    );
    expect(screen.getByTestId('component-menu-delete')).toHaveTextContent(
      cardHeaderMessages.menuDelete.defaultMessage,
    );
  });

  it('copies the component to the clipboard', async () => {
    renderComponentMenu();
    await openMenu();

    await act(async () => fireEvent.click(screen.getByTestId('component-menu-copy')));

    expect(mockCopyToClipboard).toHaveBeenCalledWith('block-v1:test+type@html+block@1');
  });

  it('duplicates the component and refreshes the unit', async () => {
    renderComponentMenu();
    await openMenu();

    await act(async () => fireEvent.click(screen.getByTestId('component-menu-duplicate')));

    await waitFor(() => {
      expect(mockDuplicateComponent).toHaveBeenCalledWith('block-v1:test+type@html+block@1');
      expect(mockOnActionComplete).toHaveBeenCalled();
    });
  });

  it('deletes the component after confirmation', async () => {
    renderComponentMenu();
    await openMenu();

    await act(async () => fireEvent.click(screen.getByTestId('component-menu-delete')));

    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await act(async () => fireEvent.click(deleteButton));

    await waitFor(() => {
      expect(mockDeleteComponent).toHaveBeenCalledWith('block-v1:test+type@html+block@1');
      expect(mockOnActionComplete).toHaveBeenCalled();
    });
  });

  it('does not render when no actions are available', () => {
    renderComponentMenu({
      actions: {
        canCopy: false,
        canDuplicate: false,
        canDelete: false,
        canMove: false,
        canManageAccess: false,
      },
    });

    expect(screen.queryByTestId('component-menu')).not.toBeInTheDocument();
  });
});
