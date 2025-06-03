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

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: () => mockNavigate,
}));

const containerHitSample: ContainerHit = {
  id: 'lctorg1democourse-unit-display-name-123',
  type: 'library_container',
  contextKey: 'lb:org1:Demo_Course',
  usageKey: 'lct:org1:Demo_Course:unit:unit-display-name-123',
  org: 'org1',
  blockId: 'unit-display-name-123',
  blockType: 'unit',
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: 'Unit Display Name',
  formatted: {
    displayName: 'Unit Display Formated Name',
    published: {
      displayName: 'Published Unit Display Name',
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
};

const libraryId = 'lib:Axim:TEST';

let axiosMock: MockAdapter;
let mockShowToast;

mockContentLibrary.applyMock();

const getContainerHit = (containerType: ContainerType) => {
  switch (containerType) {
    case ContainerType.Unit:
      return containerHitSample;
    case ContainerType.Subsection:
      return {
        ...containerHitSample,
        id: 'lctorg1democourse-subsection-test',
        usageKey: 'lct:org1:Demo_Course:subsection:subsection-test',
        blockId: 'subsection-test',
        blockType: 'subsection',
        breadcrumbs: [{ displayName: 'Demo Lib' }],
        displayName: 'Subsection Test',
        formatted: {
          displayName: 'Subsection Test Formated Name',
          published: {
            displayName: 'Published Subsection Test',
          },
        },
      } satisfies ContainerHit;
    case ContainerType.Section:
      return {
        ...containerHitSample,
        id: 'lctorg1democourse-section-test',
        usageKey: 'lct:org1:Demo_Course:section:section-test',
        blockId: 'section-test',
        blockType: 'section',
        breadcrumbs: [{ displayName: 'Demo Lib' }],
        displayName: 'Section Test',
        formatted: {
          displayName: 'Section Test Formated Name',
          published: {
            displayName: 'Published Section Test',
          },
        },
      } satisfies ContainerHit;
    default:
      return containerHitSample;
  }
};

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

  test.each([
    {
      label: 'should render the unit card with title',
      containerType: ContainerType.Unit,
      displayName: 'Unit Display Formated Name',
    },
    {
      label: 'should render the subsection card with title',
      containerType: ContainerType.Subsection,
      displayName: 'Subsection Test Formated Name',
    },
    {
      label: 'should render the section card with title',
      containerType: ContainerType.Section,
      displayName: 'Section Test Formated Name',
    },
  ])('$label', ({ containerType, displayName }) => {
    const container = getContainerHit(containerType);
    render(<ContainerCard hit={container} />);

    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByText('2')).toBeInTheDocument(); // Component count
  });

  test.each([
    {
      label: 'sould render published content of unit card',
      containerType: ContainerType.Unit,
      displayName: 'Published Unit Display Name',
    },
    {
      label: 'sould render published content of subsection card',
      containerType: ContainerType.Subsection,
      displayName: 'Published Subsection Test',
    },
    {
      label: 'sould render published content of section card',
      containerType: ContainerType.Section,
      displayName: 'Published Section Test',
    },
  ])('$label', ({ containerType, displayName }) => {
    const container = getContainerHit(containerType);
    render(<ContainerCard hit={container} />, true);

    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByText('1')).toBeInTheDocument(); // Published Component Count
  });

  it('should navigate to the container if the open menu clicked', async () => {
    render(<ContainerCard hit={containerHitSample} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('container-card-menu-toggle'));

    // Open menu item
    const openMenuItem = screen.getByRole('button', { name: 'Open' });
    expect(openMenuItem).toBeInTheDocument();

    fireEvent.click(openMenuItem);

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: `/library/${libraryId}/unit/${containerHitSample.usageKey}`,
      search: '',
    });
  });

  it('should navigate to the container if double clicked', async () => {
    render(<ContainerCard hit={containerHitSample} />);

    // Card title
    const cardTitle = screen.getByText('Unit Display Formated Name');
    expect(cardTitle).toBeInTheDocument();
    userEvent.dblClick(cardTitle);

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: `/library/${libraryId}/unit/${containerHitSample.usageKey}`,
      search: '',
    });
  });

  it('should delete the container from the menu & restore the container', async () => {
    axiosMock.onDelete(getLibraryContainerApiUrl(containerHitSample.usageKey)).reply(200);

    render(<ContainerCard hit={containerHitSample} />);

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

    const restoreUrl = getLibraryContainerRestoreApiUrl(containerHitSample.usageKey);
    axiosMock.onPost(restoreUrl).reply(200);
    // restore collection
    restoreFn();
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Undo successful');
  });

  it('should show error on delete the container from the menu', async () => {
    axiosMock.onDelete(getLibraryContainerApiUrl(containerHitSample.usageKey)).reply(400);

    render(<ContainerCard hit={containerHitSample} />);

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

  it('should render no child blocks in unit card preview', async () => {
    render(<ContainerCard hit={containerHitSample} />);

    expect(screen.queryByTitle('lb:org1:Demo_course:html:text-0')).not.toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('should render <=5 child blocks in unit card preview', async () => {
    const containerWith5Children = {
      ...containerHitSample,
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
      ...containerHitSample,
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
      ...containerHitSample,
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
      displayName: 'Published Subsection Test',
      expected: /contains unit 0, unit 1\./i,
    },
    {
      label: 'should render published child in section card preview',
      containerType: ContainerType.Section,
      childrenType: 'subsection',
      displayName: 'Published Section Test',
      expected: /contains subsection 0, subsection 1\./i,
    },
  ])('$label', ({
    containerType,
    childrenType,
    displayName,
    expected,
  }) => {
    const containerWithChildren = {
      ...getContainerHit(containerType),
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
      displayName: 'Subsection Test Formated Name',
      expected: /contains unit 0, unit 1\./i,
    },
    {
      label: 'should render section card preview with children',
      containerType: ContainerType.Section,
      childrenType: 'subsection',
      displayName: 'Section Test Formated Name',
      expected: /contains subsection 0, subsection 1\./i,
    },
  ])('$label', ({
    containerType,
    childrenType,
    displayName,
    expected,
  }) => {
    const containerWithChildren = {
      ...getContainerHit(containerType),
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
      displayName: 'Subsection Test Formated Name',
    },
    {
      label: 'should render section card preview without children',
      containerType: ContainerType.Section,
      displayName: 'Section Test Formated Name',
    },
  ])('$label', ({ containerType, displayName }) => {
    const container = getContainerHit(containerType);
    render(<ContainerCard hit={container} />);

    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByText(/contains/i)).not.toBeInTheDocument();
  });
});
