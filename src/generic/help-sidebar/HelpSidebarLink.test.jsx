import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';

import HelpSidebarLink from './HelpSidebarLink';

describe('HelpSidebarLink Component', () => {
  const defaultProps = {
    isNewPage: true,
    pathToPage: '/test-page',
    title: 'Test Title',
    as: 'li',
  };

  it('renders a React Router Link when isNewPage is true', () => {
    const { getByText } = render(
      <Router>
        <HelpSidebarLink {...defaultProps} />
      </Router>,
    );

    const linkElement = getByText('Test Title');
    expect(linkElement.closest('a')).toHaveAttribute('href', '/test-page');
  });

  it('renders a Hyperlink when isNewPage is false', () => {
    const props = { ...defaultProps, isNewPage: false, pathToPage: 'https://example.com' };
    const { getByText } = render(<HelpSidebarLink {...props} />);

    const hyperlinkElement = getByText('Test Title');
    expect(hyperlinkElement.closest('a')).toHaveAttribute('href', 'https://example.com');
    expect(hyperlinkElement.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('renders the correct tag element specified by "as" prop', () => {
    const props = { ...defaultProps, as: 'div' };
    const { container } = render(
      <Router>
        <HelpSidebarLink {...props} />
      </Router>,
    );

    const tagElement = container.querySelector('div.sidebar-link');
    expect(tagElement).toBeInTheDocument();
  });
});
