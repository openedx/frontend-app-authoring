import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor,
  fireEvent,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { mockContentLibrary } from '../data/api.mocks';
import { type ContainerHit, PublishStatus } from '../../search-manager';
import ContainerCard from './ContainerCard';
import { getLibraryContainerApiUrl, getLibraryContainerRestoreApiUrl } from '../data/api';
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

const render = (ui: React.ReactElement, showOnlyPublished: boolean = false) => baseRender(ui, {
  path: '/library/:libraryId',
  params: { libraryId },
  extraWrapper: ({ children }) => (
    <LibraryProvider
      libraryId={libraryId}
      showOnlyPublished={showOnlyPublished}
    >
      {children}
    </LibraryProvider>
  ),
});

describe('<ContainerCard />', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
  });

  it('should render the card with title', () => {
    render(<ContainerCard hit={getContainerHitSample()} />);

    expect(screen.getByText('unit Display Formated Name')).toBeInTheDocument();
    expect(screen.queryByText('2')).toBeInTheDocument(); // Component count
  });

  it('should render published content', () => {
    render(<ContainerCard hit={getContainerHitSample()} />, true);

    expect(screen.getByText('Published unit Display Name')).toBeInTheDocument();
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
    render(<ContainerCard hit={getContainerHitSample(containerType)} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('container-card-menu-toggle'));

    // Open menu item
    const openMenuItem = await screen.findByRole('button', { name: 'Open' });
    expect(openMenuItem).toBeInTheDocument();
    userEvent.click(openMenuItem);
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
    render(<ContainerCard hit={getContainerHitSample(containerType)} />);

    // Open menu item
    const cardItem = await screen.findByText(`${containerType} Display Formated Name`);
    expect(cardItem).toBeInTheDocument();
    userEvent.click(cardItem, undefined, { clickCount: 2 });
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: `/library/${libraryId}/${containerType}/${getContainerHitSample(containerType).usageKey}`,
      search: '',
    });
  });

  it('should delete the container from the menu & restore the container', async () => {
    axiosMock.onDelete(getLibraryContainerApiUrl(getContainerHitSample().usageKey)).reply(200);

    render(<ContainerCard hit={getContainerHitSample()} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('container-card-menu-toggle'));

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
    axiosMock.onDelete(getLibraryContainerApiUrl(getContainerHitSample().usageKey)).reply(400);

    render(<ContainerCard hit={getContainerHitSample()} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('container-card-menu-toggle'));

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

  it('should render no child blocks in card preview', async () => {
    render(<ContainerCard hit={getContainerHitSample()} />);

    expect(screen.queryByTitle('lb:org1:Demo_course:html:text-0')).not.toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('should render <=5 child blocks in card preview', async () => {
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

  it('should render >5 child blocks with +N in card preview', async () => {
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

  it('should render published child blocks when rendering a published card preview', async () => {
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
});
