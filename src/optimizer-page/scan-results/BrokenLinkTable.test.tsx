import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import BrokenLinkTable from './BrokenLinkTable';
import { Unit, Filters } from '../types';

const intlWrapper = (ui: React.ReactElement) => render(
  <IntlProvider locale="en" messages={{}}>
    {ui}
  </IntlProvider>,
);

describe('BrokenLinkTable', () => {
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
        previousRunLinks: ['https://previous-run.com/link1', 'https://previous-run.com/link2'],
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
      expect(screen.getByText('https://previous-run.com/link2')).toBeInTheDocument();
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
            previousRunLinks: ['https://previous-run.com/link3'],
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
