import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor,
  fireEvent,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { mockContentLibrary, mockGetContainerMetadata } from '../data/api.mocks';
import { type ContainerHit, PublishStatus } from '../../search-manager';
import ContainerCard from './ContainerCard';
import { getLibraryContainerApiUrl, getLibraryContainerRestoreApiUrl, getLibraryContainerChildrenApiUrl } from '../data/api';
import { ContainerType } from '../../generic/key-utils';

let axiosMock: MockAdapter;
let mockShowToast;
const mockNavigate = jest.fn();
const libraryId = 'lib:Axim:TEST';

const getContainerHitSample = (containerType: ContainerType = ContainerType.Unit) => ({
  id: `lctorg1democourse-${containerType}-display-name-123`,
  type: 'library_container',
  contextKey: libraryId,
  usageKey: `lct:org1:Demo_Course:${containerType}:${containerType}-display-name-123`,
  org: 'org1',
  blockId: `${containerType}-display-name-123`,
  blockType: containerType,
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: `${containerType} Display Name`,
  formatted: {
    displayName: `${containerType} Display Formated Name`,
    published: {
      displayName: `Published ${containerType} Display Name`,
    },
  },
  created: 1722434322294,
  modified: 1722434322294,
  numChildren: 2,
  published: {
    numChildren: 1,
  },
  tags: {},
  publishStatus: PublishStatus.Published,
} as ContainerHit);

mockContentLibrary.applyMock();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const render = (
  ui: React.ReactElement,
  showOnlyPublished: boolean = false,
  containerContext?: { type: ContainerType, id: string },
) => {
  const path = containerContext
    ? `/library/:libraryId/${containerContext.type}/:containerId`
    : '/library/:libraryId';
  const params: Record<string, string> = containerContext
    ? { libraryId, containerId: containerContext.id }
    : { libraryId };

  return baseRender(ui, {
    path,
    params,
    extraWrapper: ({ children }) => (
      <LibraryProvider
        libraryId={libraryId}
        showOnlyPublished={showOnlyPublished}
      >
        {children}
      </LibraryProvider>
    ),
  });
};

describe('<ContainerCard />', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
  });

  test.each([
    {
      label: 'should render the unit card with title',
      containerType: ContainerType.Unit,
      displayName: 'unit Display Formated Name',
    },
    {
      label: 'should render the subsection card with title',
      containerType: ContainerType.Subsection,
      displayName: 'subsection Display Formated Name',
    },
    {
      label: 'should render the section card with title',
      containerType: ContainerType.Section,
      displayName: 'section Display Formated Name',
    },
  ])('$label', ({ containerType, displayName }) => {
    const container = getContainerHitSample(containerType);
    render(<ContainerCard hit={container} />);

    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByText('2')).toBeInTheDocument(); // Component count
  });

  test.each([
    {
      label: 'sould render published content of unit card',
      containerType: ContainerType.Unit,
      displayName: 'Published unit Display Name',
    },
    {
      label: 'sould render published content of subsection card',
      containerType: ContainerType.Subsection,
      displayName: 'Published subsection Display Name',
    },
    {
      label: 'sould render published content of section card',
      containerType: ContainerType.Section,
      displayName: 'Published section Display Name',
    },
  ])('$label', ({ containerType, displayName }) => {
    const container = getContainerHitSample(containerType);
    render(<ContainerCard hit={container} />, true);

    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByText('1')).toBeInTheDocument(); // Published Component Count
  });

  test.each([
    {
      label: 'should navigate to the unit if the open menu clicked',
      containerType: ContainerType.Unit,
    },
    {
      label: 'should navigate to the section if the open menu clicked',
      containerType: ContainerType.Section,
    },
    {
      label: 'should navigate to the subsection if the open menu clicked',
      containerType: ContainerType.Subsection,
    },
  ])('$label', async ({ containerType }) => {
    const user = userEvent.setup();
    render(<ContainerCard hit={getContainerHitSample(containerType)} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    await user.click(screen.getByTestId('container-card-menu-toggle'));

    // Open menu item
    const openMenuItem = await screen.findByRole('button', { name: 'Open' });
    expect(openMenuItem).toBeInTheDocument();
    await user.click(openMenuItem);
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: `/library/${libraryId}/${containerType}/${getContainerHitSample(containerType).usageKey}`,
      search: '',
    });
  });

  test.each([
    {
      label: 'should navigate to the unit if the card is double clicked',
      containerType: ContainerType.Unit,
    },
    {
      label: 'should navigate to the section if the card is double clicked',
      containerType: ContainerType.Section,
    },
    {
      label: 'should navigate to the subsection if the card is double clicked',
      containerType: ContainerType.Subsection,
    },
  ])('$label', async ({ containerType }) => {
    const user = userEvent.setup();
    render(<ContainerCard hit={getContainerHitSample(containerType)} />);

    // Open menu item
    const cardItem = await screen.findByText(`${containerType} Display Formated Name`);
    expect(cardItem).toBeInTheDocument();
    await user.dblClick(cardItem);
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: `/library/${libraryId}/${containerType}/${getContainerHitSample(containerType).usageKey}`,
      search: '',
    });
  });

  it('should delete the container from the menu & restore the container', async () => {
    const user = userEvent.setup();
    axiosMock.onDelete(getLibraryContainerApiUrl(getContainerHitSample().usageKey)).reply(200);

    render(<ContainerCard hit={getContainerHitSample()} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    await user.click(screen.getByTestId('container-card-menu-toggle'));

    // Click on Delete Item
    const deleteMenuItem = screen.getByRole('button', { name: 'Delete' });
    expect(deleteMenuItem).toBeInTheDocument();
    fireEvent.click(deleteMenuItem);

    // Confirm delete Modal is open
    expect(await screen.findByText('Delete Unit')).toBeInTheDocument();
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(mockShowToast).toHaveBeenCalled();

    // Get restore / undo func from the toast
    const restoreFn = mockShowToast.mock.calls[0][1].onClick;

    const restoreUrl = getLibraryContainerRestoreApiUrl(getContainerHitSample().usageKey);
    axiosMock.onPost(restoreUrl).reply(200);
    // restore collection
    restoreFn();
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Undo successful');
  });

  it('should show error on delete the container from the menu', async () => {
    const user = userEvent.setup();
    axiosMock.onDelete(getLibraryContainerApiUrl(getContainerHitSample().usageKey)).reply(400);

    render(<ContainerCard hit={getContainerHitSample()} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    await user.click(screen.getByTestId('container-card-menu-toggle'));

    // Click on Delete Item
    const deleteMenuItem = screen.getByRole('button', { name: 'Delete' });
    expect(deleteMenuItem).toBeInTheDocument();
    fireEvent.click(deleteMenuItem);

    // Confirm delete Modal is open
    expect(screen.getByText('Delete Unit'));
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Failed to delete unit');
  });

  it('should render no child blocks in unit card preview', async () => {
    render(<ContainerCard hit={getContainerHitSample()} />);

    expect(screen.queryByTitle('lb:org1:Demo_course:html:text-0')).not.toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('should render <=5 child blocks in unit card preview', async () => {
    const containerWith5Children = {
      ...getContainerHitSample(),
      content: {
        childUsageKeys: Array(5).fill('').map((_child, idx) => `lb:org1:Demo_course:html:text-${idx}`),
      },
    } satisfies ContainerHit;
    render(<ContainerCard hit={containerWith5Children} />);

    expect((await screen.findAllByTitle(/lb:org1:Demo_course:html:text-*/)).length).toBe(5);
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('should render >5 child blocks with +N in unit card preview', async () => {
    const containerWith6Children = {
      ...getContainerHitSample(),
      content: {
        childUsageKeys: Array(6).fill('').map((_child, idx) => `lb:org1:Demo_course:html:text-${idx}`),
      },
    } satisfies ContainerHit;
    render(<ContainerCard hit={containerWith6Children} />);

    expect((await screen.findAllByTitle(/lb:org1:Demo_course:html:text-*/)).length).toBe(4);
    expect(screen.queryByText('+2')).toBeInTheDocument();
  });

  it('should render published child blocks when rendering a published unit card preview', async () => {
    const containerWithPublishedChildren = {
      ...getContainerHitSample(),
      content: {
        childUsageKeys: Array(6).fill('').map((_child, idx) => `lb:org1:Demo_course:html:text-${idx}`),
      },
      published: {
        content: {
          childUsageKeys: Array(2).fill('').map((_child, idx) => `lb:org1:Demo_course:html:text-${idx}`),
        },
      },
    } satisfies ContainerHit;
    render(
      <ContainerCard hit={containerWithPublishedChildren} />,
      true,
    );

    expect((await screen.findAllByTitle(/lb:org1:Demo_course:html:text-*/)).length).toBe(2);
    expect(screen.queryByText('+2')).not.toBeInTheDocument();
  });

  test.each([
    {
      label: 'should render published child in subsection card preview',
      containerType: ContainerType.Subsection,
      childrenType: 'unit',
      displayName: 'Published subsection Display Name',
      expected: /contains unit 0, unit 1\./i,
    },
    {
      label: 'should render published child in section card preview',
      containerType: ContainerType.Section,
      childrenType: 'subsection',
      displayName: 'Published section Display Name',
      expected: /contains subsection 0, subsection 1\./i,
    },
  ])('$label', ({
    containerType,
    childrenType,
    displayName,
    expected,
  }) => {
    const containerWithChildren = {
      ...getContainerHitSample(containerType),
      content: {
        childUsageKeys: Array(6).fill('').map(
          (_child, idx) => `lct:org1:Demo_Course:${childrenType}:${childrenType}-${idx}`,
        ),
        childDisplayNames: Array(6).fill('').map((_child, idx) => `${childrenType} ${idx}`),
      },
      published: {
        content: {
          childUsageKeys: Array(2).fill('').map(
            (_child, idx) => `lct:org1:Demo_Course:${childrenType}:${childrenType}-${idx}`,
          ),
          childDisplayNames: Array(2).fill('').map((_child, idx) => `${childrenType} ${idx}`),
        },
      },
    } satisfies ContainerHit;

    render(<ContainerCard hit={containerWithChildren} />, true);

    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test.each([
    {
      label: 'should render subsection card preview with children',
      containerType: ContainerType.Subsection,
      childrenType: 'unit',
      displayName: 'subsection Display Formated Name',
      expected: /contains unit 0, unit 1\./i,
    },
    {
      label: 'should render section card preview with children',
      containerType: ContainerType.Section,
      childrenType: 'subsection',
      displayName: 'section Display Formated Name',
      expected: /contains subsection 0, subsection 1\./i,
    },
  ])('$label', ({
    containerType,
    childrenType,
    displayName,
    expected,
  }) => {
    const containerWithChildren = {
      ...getContainerHitSample(containerType),
      content: {
        childUsageKeys: Array(2).fill('').map(
          (_child, idx) => `lct:org1:Demo_Course:${childrenType}:${childrenType}-${idx}`,
        ),
        childDisplayNames: Array(2).fill('').map((_child, idx) => `${childrenType} ${idx}`),
      },
    } satisfies ContainerHit;
    render(<ContainerCard hit={containerWithChildren} />);

    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test.each([
    {
      label: 'should render subsection card preview without children',
      containerType: ContainerType.Subsection,
      displayName: 'subsection Display Formated Name',
    },
    {
      label: 'should render section card preview without children',
      containerType: ContainerType.Section,
      displayName: 'section Display Formated Name',
    },
  ])('$label', ({ containerType, displayName }) => {
    const container = getContainerHitSample(containerType);
    render(<ContainerCard hit={container} />);

    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByText(/contains/i)).not.toBeInTheDocument();
  });

  test.each([
    {
      label: 'should be able to remove unit from subsection menu item',
      containerType: ContainerType.Unit,
      parentType: ContainerType.Subsection,
      parentId: mockGetContainerMetadata.subsectionId,
      expectedRemoveText: 'Remove from subsection',
    },
    {
      label: 'should be able to remove subsection from section menu item',
      containerType: ContainerType.Subsection,
      parentType: ContainerType.Section,
      parentId: mockGetContainerMetadata.sectionId,
      expectedRemoveText: 'Remove from section',
    },
  ])('$label', async ({
    containerType, parentType, parentId, expectedRemoveText,
  }) => {
    const containerHit = getContainerHitSample(containerType);
    axiosMock.onDelete(getLibraryContainerChildrenApiUrl(parentId)).reply(200);
    axiosMock.onGet(getLibraryContainerApiUrl(parentId)).reply(200, {
      containerType: parentType,
      displayName: 'Parent Container Display Name',
    });
    const user = userEvent.setup();
    render(
      <ContainerCard hit={containerHit} />,
      false,
      { type: parentType, id: parentId },
    );

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    await user.click(screen.getByTestId('container-card-menu-toggle'));

    // Click on Remove Item
    const removeMenuItem = await screen.findByRole('button', { name: expectedRemoveText });
    expect(removeMenuItem).toBeInTheDocument();
    fireEvent.click(removeMenuItem);

    // Confirm remove Modal is open
    expect(await screen.findByText(/will not delete it from the library/i)).toBeInTheDocument();
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(mockShowToast).toHaveBeenCalled();
  });
});
