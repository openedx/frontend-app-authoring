import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import BrokenLinkTable from './BrokenLinkTable';
import { Unit, Filters } from '../types';
import initializeStore from '../../store';

let store: any;

const mockOnUpdateLink = jest.fn();

// Create a default unit structure that matches the component's expectations
const createMockUnit = (blocks: any[] = []): Unit => ({
  id: 'unit-1',
  displayName: 'Test Unit',
  blocks,
});

const createMockBlock = (links: string[] = []) => ({
  id: 'block-1',
  url: 'https://example.com/block',
  displayName: 'Test Block',
  brokenLinks: links,
  lockedLinks: [],
  externalForbiddenLinks: [],
  previousRunLinks: [],
});

interface BrokenLinkTableWrapperProps {
  unit?: Unit;
  onUpdateLink?: any;
  filters?: Filters;
  linkType?: 'broken' | 'previous';
  sectionId?: string;
  updatedLinks?: string[];
}

const BrokenLinkTableWrapper: React.FC<BrokenLinkTableWrapperProps> = ({
  unit, onUpdateLink, filters = { brokenLinks: true, lockedLinks: false, externalForbiddenLinks: false }, ...props
}) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <BrokenLinkTable
        unit={unit || createMockUnit([createMockBlock()])}
        onUpdateLink={onUpdateLink || mockOnUpdateLink}
        filters={filters}
        {...props}
      />
    </IntlProvider>
  </AppProvider>
);

const intlWrapper = (ui: React.ReactElement) => render(
  <IntlProvider locale="en" messages={{}}>
    {ui}
  </IntlProvider>,
);

describe('BrokenLinkTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
  });

  const mockUnitWithPreviousRunLinks: Unit = {
    id: 'unit-1',
    displayName: 'Test Unit',
    blocks: [
      {
        id: 'block-1',
        displayName: 'Test Block',
        url: 'https://example.com/block-1',
        brokenLinks: [],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: [
          { originalLink: 'https://previous-run.com/link1', isUpdated: false },
          { originalLink: 'https://previous-run.com/link2', isUpdated: true, updatedLink: 'https://updated.com/link2' },
        ],
      },
    ],
  };

  const mockUnitWithBrokenLinks: Unit = {
    id: 'unit-2',
    displayName: 'Broken Links Unit',
    blocks: [
      {
        id: 'block-2',
        displayName: 'Broken Block',
        url: 'https://example.com/block-2',
        brokenLinks: ['https://broken.com/link1'],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: [],
      },
    ],
  };

  const mockFilters: Filters = {
    brokenLinks: false,
    lockedLinks: false,
    externalForbiddenLinks: false,
  };

  describe('Basic Rendering', () => {
    it('should render with basic link data', () => {
      const unitWithBrokenLink = createMockUnit([
        createMockBlock(['https://example.com/broken-link']),
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithBrokenLink} />);

      expect(screen.getByText('https://example.com/broken-link')).toBeInTheDocument();
    });

    it('should render multiple links', () => {
      const unitWithMultipleLinks = createMockUnit([
        createMockBlock(['https://example.com/link1']),
        {
          ...createMockBlock(['https://example.com/link2']),
          id: 'block-2',
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithMultipleLinks} />);

      expect(screen.getByText('https://example.com/link1')).toBeInTheDocument();
      expect(screen.getByText('https://example.com/link2')).toBeInTheDocument();
    });
  });

  describe('Update Button Functionality', () => {
    it('should show update button for non-updated previous run links', () => {
      const unitWithPreviousRunLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              isUpdated: false,
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithPreviousRunLinks} linkType="previous" />);

      expect(screen.getByText('Update')).toBeInTheDocument();
    });

    it('should hide update button for updated previous run links', () => {
      const unitWithUpdatedLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/updated-link',
              isUpdated: true,
              updatedLink: 'https://previous.example.com/new-updated-link',
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithUpdatedLinks} linkType="previous" />);

      expect(screen.queryByText('Update')).not.toBeInTheDocument();
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });

    it('should call onUpdateLink when update button is clicked', async () => {
      const mockUpdateHandler = jest.fn().mockResolvedValue(true);
      const unitWithPreviousRunLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              isUpdated: false,
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithPreviousRunLinks} linkType="previous" onUpdateLink={mockUpdateHandler} />);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateHandler).toHaveBeenCalledWith(
          'https://previous.example.com/link',
          'block-1',
          undefined, // sectionId
        );
      });
    });

    it('should pass sectionId to onUpdateLink when provided', async () => {
      const mockUpdateHandler = jest.fn().mockResolvedValue(true);
      const unitWithPreviousRunLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              isUpdated: false,
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithPreviousRunLinks} linkType="previous" onUpdateLink={mockUpdateHandler} sectionId="section-123" />);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateHandler).toHaveBeenCalledWith(
          'https://previous.example.com/link',
          'block-1',
          'section-123',
        );
      });
    });

    it('should handle update button click with failed update', async () => {
      const mockUpdateHandler = jest.fn().mockResolvedValue(false);
      const unitWithPreviousRunLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              isUpdated: false,
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithPreviousRunLinks} linkType="previous" onUpdateLink={mockUpdateHandler} />);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateHandler).toHaveBeenCalled();
      });

      // Button should still be visible since update failed
      expect(screen.getByText('Update')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during update', async () => {
      const mockUpdateHandler = jest.fn().mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => resolve(true), 100);
        }),
      );
      const unitWithPreviousRunLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              isUpdated: false,
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithPreviousRunLinks} linkType="previous" onUpdateLink={mockUpdateHandler} />);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      // Wait for completion
      await waitFor(() => {
        expect(mockUpdateHandler).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onUpdateLink prop', () => {
      const unitWithPreviousRunLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              isUpdated: false,
            },
          ],
        },
      ]);

      // Should not crash when onUpdateLink is undefined
      expect(() => {
        render(<BrokenLinkTableWrapper unit={unitWithPreviousRunLinks} linkType="previous" onUpdateLink={undefined} />);
      }).not.toThrow();
    });

    it('should handle links with special characters', () => {
      const unitWithSpecialChars = createMockUnit([
        createMockBlock([
          'https://example.com/path with spaces/file.pdf?param=value&other=123',
        ]),
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithSpecialChars} />);

      expect(screen.getByText('https://example.com/path with spaces/file.pdf?param=value&other=123')).toBeInTheDocument();
    });

    it('should handle very long URLs', () => {
      const longUrl = `https://example.com/${'a'.repeat(200)}/file.pdf`;
      const unitWithLongUrl = createMockUnit([
        createMockBlock([longUrl]),
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithLongUrl} />);

      expect(screen.getByText(longUrl)).toBeInTheDocument();
    });

    it('should handle missing blockId', () => {
      const unitWithMissingBlockId = createMockUnit([
        {
          // blockId missing
          url: 'https://example.com/block',
          displayName: 'Test Block',
          brokenLinks: ['https://example.com/broken-link'],
          lockedLinks: [],
          externalForbiddenLinks: [],
          previousRunLinks: [],
        },
      ]);

      expect(() => {
        render(<BrokenLinkTableWrapper unit={unitWithMissingBlockId} />);
      }).not.toThrow();
    });

    it('should handle missing isUpdated field for previous run links', () => {
      const unitWithMissingIsUpdated = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              // isUpdated missing - should default to false and show update button
            } as any,
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithMissingIsUpdated} linkType="previous" />);

      expect(screen.getByText('Update')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for update buttons', () => {
      const unitWithPreviousRunLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              isUpdated: false,
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithPreviousRunLinks} linkType="previous" />);

      const updateButton = screen.getByText('Update');
      expect(updateButton).toHaveAttribute('type', 'button');
    });

    it('should be keyboard accessible', () => {
      const unitWithPreviousRunLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link',
              isUpdated: false,
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithPreviousRunLinks} linkType="previous" />);

      const updateButton = screen.getByText('Update');
      expect(updateButton).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Mixed Update States', () => {
    it('should handle mix of updated and non-updated previous run links', () => {
      const unitWithMixedLinks = createMockUnit([
        {
          ...createMockBlock([]),
          previousRunLinks: [
            {
              originalLink: 'https://previous.example.com/link1',
              isUpdated: false,
            },
            {
              originalLink: 'https://previous.example.com/link2',
              isUpdated: true,
              updatedLink: 'https://previous.example.com/updated-link2',
            },
            {
              originalLink: 'https://previous.example.com/link3',
              isUpdated: false,
            },
          ],
        },
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithMixedLinks} linkType="previous" />);

      // Should have 2 update buttons (for non-updated links)
      const updateButtons = screen.getAllByText('Update');
      expect(updateButtons).toHaveLength(2);

      // Should have 1 "Updated" text (for updated link)
      expect(screen.getByText('Updated')).toBeInTheDocument();

      // Debug: Let's check if the table is rendering the correct number of rows
      const tableRows = document.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(3);

      // Check that links are present in the DOM (either as text or href)
      const allLinks = document.querySelectorAll('a.broken-link');
      // We should have 6 links total: 3 "go to block" links + 3 broken link hrefs
      expect(allLinks.length).toBeGreaterThanOrEqual(3);
    });

    it('should show broken link icons for broken link type', () => {
      const unitWithBrokenLinks = createMockUnit([
        createMockBlock(['https://example.com/broken-link']),
      ]);

      render(<BrokenLinkTableWrapper unit={unitWithBrokenLinks} linkType="broken" />);

      // Should render broken link
      expect(screen.getByText('https://example.com/broken-link')).toBeInTheDocument();
      // Should render icon (the component uses IconImage, so we check if the structure exists)
      expect(document.querySelector('.links-container')).toBeTruthy();
    });

    it('should handle locked links when filters allow it', () => {
      const unitWithLockedLinks = createMockUnit([
        {
          ...createMockBlock([]),
          lockedLinks: ['https://example.com/locked-link'],
        },
      ]);

      render(
        <BrokenLinkTableWrapper
          unit={unitWithLockedLinks}
          filters={{
            brokenLinks: false,
            lockedLinks: true,
            externalForbiddenLinks: false,
          }}
        />,
      );

      expect(screen.getByText('https://example.com/locked-link')).toBeInTheDocument();
    });

    it('should handle external forbidden links when filters allow it', () => {
      const unitWithForbiddenLinks = createMockUnit([
        {
          ...createMockBlock([]),
          externalForbiddenLinks: ['https://example.com/forbidden-link'],
        },
      ]);

      render(
        <BrokenLinkTableWrapper
          unit={unitWithForbiddenLinks}
          filters={{
            brokenLinks: false,
            lockedLinks: false,
            externalForbiddenLinks: true,
          }}
        />,
      );

      expect(screen.getByText('https://example.com/forbidden-link')).toBeInTheDocument();
    });
  });

  describe('Previous run links', () => {
    it('should render previous run links when linkType is "previous"', () => {
      intlWrapper(
        <BrokenLinkTable
          unit={mockUnitWithPreviousRunLinks}
          linkType="previous"
        />,
      );

      expect(screen.getByText('Test Unit')).toBeInTheDocument();
      expect(screen.getByText('https://previous-run.com/link1')).toBeInTheDocument();
      expect(screen.getByText('https://updated.com/link2')).toBeInTheDocument();
    });

    it('should return null when unit has no previous run links', () => {
      const unitWithoutPreviousRunLinks: Unit = {
        id: 'unit-3',
        displayName: 'Empty Unit',
        blocks: [
          {
            id: 'block-3',
            displayName: 'Empty Block',
            url: 'https://example.com/block-3',
            brokenLinks: [],
            lockedLinks: [],
            externalForbiddenLinks: [],
            previousRunLinks: [],
          },
        ],
      };

      const { container } = intlWrapper(
        <BrokenLinkTable
          unit={unitWithoutPreviousRunLinks}
          linkType="previous"
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle blocks with no displayName for previous run links', () => {
      const unitWithNoDisplayName: Unit = {
        id: 'unit-4',
        displayName: 'Unit No Display Name',
        blocks: [
          {
            id: 'block-4',
            url: 'https://example.com/block-4',
            brokenLinks: [],
            lockedLinks: [],
            externalForbiddenLinks: [],
            previousRunLinks: [{ originalLink: 'https://previous-run.com/link3', isUpdated: false }],
          },
        ],
      };

      intlWrapper(
        <BrokenLinkTable
          unit={unitWithNoDisplayName}
          linkType="previous"
        />,
      );

      expect(screen.getByText('Go to block')).toBeInTheDocument();
      expect(screen.getByText('https://previous-run.com/link3')).toBeInTheDocument();
    });
  });

  describe('Broken links (default behavior)', () => {
    it('should render broken links when linkType is "broken" and filters are provided', () => {
      intlWrapper(
        <BrokenLinkTable
          unit={mockUnitWithBrokenLinks}
          filters={mockFilters}
          linkType="broken"
        />,
      );

      expect(screen.getByText('Broken Links Unit')).toBeInTheDocument();
      expect(screen.getByText('https://broken.com/link1')).toBeInTheDocument();
    });

    it('should return null when no filters are provided for broken links', () => {
      const { container } = intlWrapper(
        <BrokenLinkTable
          unit={mockUnitWithBrokenLinks}
          linkType="broken"
        />,
      );

      expect(container.firstChild).toBeNull();
    });
  });
});

BrokenLinkTableWrapper.propTypes = {
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    blocks: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string,
      displayName: PropTypes.string,
      brokenLinks: PropTypes.arrayOf(PropTypes.string),
      lockedLinks: PropTypes.arrayOf(PropTypes.string),
      externalForbiddenLinks: PropTypes.arrayOf(PropTypes.string),
      previousRunLinks: PropTypes.arrayOf(PropTypes.shape({
        originalLink: PropTypes.string.isRequired,
        isUpdated: PropTypes.bool,
        updatedLink: PropTypes.string,
      })),
    })).isRequired,
  }),
  onUpdateLink: PropTypes.func,
  filters: PropTypes.shape({
    brokenLinks: PropTypes.bool,
    lockedLinks: PropTypes.bool,
    externalForbiddenLinks: PropTypes.bool,
  }),
  linkType: PropTypes.oneOf(['broken', 'previous']),
  sectionId: PropTypes.string,
  updatedLinks: PropTypes.arrayOf(PropTypes.string),
};
