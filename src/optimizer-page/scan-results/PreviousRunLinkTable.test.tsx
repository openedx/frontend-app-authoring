import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import PreviousRunLinkTable from './PreviousRunLinkTable';

const intlWrapper = (ui: React.ReactElement) => render(
  <IntlProvider locale="en" messages={{}}>
    {ui}
  </IntlProvider>,
);

describe('PreviousRunLinkTable', () => {
  const mockUnitWithLinks = {
    id: 'unit-2',
    displayName: 'Unit with previous run links',
    blocks: [
      {
        id: 'block-1',
        displayName: 'Block with links',
        url: 'http://example.com',
        brokenLinks: [],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: ['https://prev-link.com/1'],
      },
    ],
  };

  const mockUnitNoLinks = {
    id: 'unit-1',
    displayName: 'Unit without links',
    blocks: [
      {
        id: 'block-1',
        displayName: 'Block without links',
        url: 'http://example.com',
        brokenLinks: [],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: [],
      },
    ],
  };

  it('renders table with previous run links', () => {
    intlWrapper(<PreviousRunLinkTable unit={mockUnitWithLinks} />);
    expect(screen.getByText('Unit with previous run links')).toBeInTheDocument();

    mockUnitWithLinks.blocks[0].previousRunLinks.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it('renders nothing if no previous run links', () => {
    const { container } = intlWrapper(<PreviousRunLinkTable unit={mockUnitNoLinks} />);
    expect(container.firstChild).toBeNull();
  });

  it('opens previous run link in new tab on click', () => {
    const originalOpen = window.open;
    window.open = jest.fn();
    intlWrapper(<PreviousRunLinkTable unit={mockUnitWithLinks} />);
    fireEvent.click(screen.getByText('https://prev-link.com/1'));
    expect(window.open).toHaveBeenCalledWith('https://prev-link.com/1', '_blank');
    window.open = originalOpen;
  });

  it('handles missing displayName gracefully', () => {
    const unit = {
      id: 'unit-3',
      displayName: 'Unit with test links',
      blocks: [
        {
          id: 'block-3',
          displayName: '',
          url: 'http://example.com/block3',
          brokenLinks: [],
          lockedLinks: [],
          externalForbiddenLinks: [],
          previousRunLinks: ['https://prev-link.com/1'],
        },
      ],
    };
    intlWrapper(<PreviousRunLinkTable unit={unit} />);
    expect(screen.getByText('Go to block')).toBeInTheDocument();
    expect(screen.getByText('https://prev-link.com/1')).toBeInTheDocument();
  });
});
