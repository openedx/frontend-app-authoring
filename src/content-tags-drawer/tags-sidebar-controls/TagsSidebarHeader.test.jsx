import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TagsSidebarHeader from './TagsSidebarHeader';

const mockGetTagsCount = jest.fn();

jest.mock('../../generic/data/api', () => ({
  ...jest.requireActual('../../generic/data/api'),
  getTagsCount: () => mockGetTagsCount(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ blockId: '123' }),
}));

const queryClient = new QueryClient();

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <QueryClientProvider client={queryClient}>
      <TagsSidebarHeader />
    </QueryClientProvider>
  </IntlProvider>
);

describe('<TagsSidebarHeader>', () => {
  it('should render count only after query is complete', async () => {
    let resolvePromise;
    mockGetTagsCount.mockReturnValueOnce(new Promise((resolve) => { resolvePromise = resolve; }));
    render(<RootWrapper />);
    expect(screen.getByRole('heading', { name: /unit tags/i })).toBeInTheDocument();
    expect(screen.queryByText('17')).not.toBeInTheDocument();
    resolvePromise({ 123: 17 });
    expect(await screen.findByText('17')).toBeInTheDocument();
  });
});
