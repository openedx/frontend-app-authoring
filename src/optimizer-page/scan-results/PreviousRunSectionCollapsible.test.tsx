import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PreviousRunSectionCollapsible from './PreviousRunSectionCollapsible';

describe('PreviousRunSectionCollapsible', () => {
  const defaultProps = {
    index: 1,
    handleToggle: jest.fn(),
    isOpen: false,
    hasPrevAndIsOpen: false,
    hasNextAndIsOpen: false,
    title: 'Section Title',
    children: <div>Section Content</div>,
    previousRunLinksCount: 3,
    className: 'test-class',
  };

  it('renders with closed state and correct title/count', () => {
    render(<PreviousRunSectionCollapsible {...defaultProps} />);
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders with open state and shows children', () => {
    render(<PreviousRunSectionCollapsible {...defaultProps} isOpen />);
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });

  it('shows dash when previousRunLinksCount is 0', () => {
    render(<PreviousRunSectionCollapsible {...defaultProps} previousRunLinksCount={0} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('calls handleToggle with index when header is clicked', () => {
    const handleToggle = jest.fn();
    render(<PreviousRunSectionCollapsible {...defaultProps} handleToggle={handleToggle} />);
    // Click the header icon (which is inside the header div)
    const header = screen.getByText('Section Title').closest('.section-collapsible-header-item');
    if (header) {
      fireEvent.click(header);
    } else {
      // fallback: click the whole header area
      fireEvent.click(screen.getByText('Section Title'));
    }
    expect(handleToggle).toHaveBeenCalledWith(1);
  });

  it('applies custom className', () => {
    render(<PreviousRunSectionCollapsible {...defaultProps} className="my-custom-class" />);
    expect(screen.getByText('Section Title').parentElement?.parentElement).toHaveClass('my-custom-class');
  });
});
