import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import SectionCollapsible from './SectionCollapsible';

const intlWrapper = (ui: React.ReactElement) => render(
  <IntlProvider locale="en" messages={{}}>
    {ui}
  </IntlProvider>,
);

describe('SectionCollapsible', () => {
  const defaultProps = {
    index: 1,
    handleToggle: jest.fn(),
    isOpen: false,
    hasPrevAndIsOpen: false,
    hasNextAndIsOpen: false,
    title: 'Section Title',
    children: <div>Section Content</div>,
    className: 'test-class',
  };

  describe('Regular mode (broken/manual/locked links)', () => {
    const regularProps = {
      ...defaultProps,
      brokenNumber: 3,
      manualNumber: 2,
      lockedNumber: 1,
      isPreviousRunLinks: false,
    };

    it('renders with open state and shows children', () => {
      intlWrapper(<SectionCollapsible {...regularProps} isOpen />);
      expect(screen.getByText('Section Content')).toBeInTheDocument();
    });

    it('calls handleToggle with index when header is clicked', () => {
      const handleToggle = jest.fn();
      intlWrapper(<SectionCollapsible {...regularProps} handleToggle={handleToggle} />);

      const header = screen.getByText('Section Title').closest('.section-collapsible-header-item');
      if (header) {
        fireEvent.click(header);
      } else {
        fireEvent.click(screen.getByText('Section Title'));
      }
      expect(handleToggle).toHaveBeenCalledWith(1);
    });
  });

  describe('Previous run links mode', () => {
    const prevRunProps = {
      ...defaultProps,
      previousRunLinksCount: 5,
      isPreviousRunLinks: true,
    };

    it('renders with previous run links count', () => {
      intlWrapper(<SectionCollapsible {...prevRunProps} />);
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      // Should not show broken/manual/locked icons in previous run mode
      expect(screen.queryByText('3')).not.toBeInTheDocument();
    });

    it('shows dash when previousRunLinksCount is 0', () => {
      intlWrapper(<SectionCollapsible {...prevRunProps} previousRunLinksCount={0} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders with open state and shows children', () => {
      intlWrapper(<SectionCollapsible {...prevRunProps} isOpen />);
      expect(screen.getByText('Section Content')).toBeInTheDocument();
    });

    it('calls handleToggle with index when header is clicked', () => {
      const handleToggle = jest.fn();
      intlWrapper(<SectionCollapsible {...prevRunProps} handleToggle={handleToggle} />);

      const header = screen.getByText('Section Title').closest('.section-collapsible-header-item');
      if (header) {
        fireEvent.click(header);
      } else {
        fireEvent.click(screen.getByText('Section Title'));
      }
      expect(handleToggle).toHaveBeenCalledWith(1);
    });
  });
});
