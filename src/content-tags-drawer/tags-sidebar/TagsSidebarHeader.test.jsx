import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TagsSidebarHeader from './TagsSidebarHeader';
import { useContentTaxonomyTagsCount } from '../data/apiHooks';

jest.mock('../data/apiHooks', () => ({
  useContentTaxonomyTagsCount: jest.fn(() => ({
    isSuccess: false,
    data: 17,
  })),
}));

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <TagsSidebarHeader />
  </IntlProvider>
);

describe('<TagsSidebarHeader>', () => {
  it('should not render count on loading', () => {
    render(<RootWrapper />);
    expect(screen.getByRole('heading', { name: /unit tags/i })).toBeInTheDocument();
    expect(screen.queryByText('17')).not.toBeInTheDocument();
  });

  it('should render count after query is complete', () => {
    useContentTaxonomyTagsCount.mockReturnValue({
      isSuccess: true,
      data: 17,
    });
    render(<RootWrapper />);
    expect(screen.getByRole('heading', { name: /unit tags/i })).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('should not render count if is cero', () => {
    useContentTaxonomyTagsCount.mockReturnValue({
      isSuccess: true,
      data: 0,
    });
    render(<RootWrapper />);
    expect(screen.getByRole('heading', { name: /unit tags/i })).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
