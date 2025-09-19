import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { BrowserRouter } from 'react-router-dom';

import { ContainerType } from '@src/generic/key-utils';

import { type ContainerParents, ParentBreadcrumbs } from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderComponent = (containerType: ContainerType, parents: ContainerParents) => (
  render(
    <BrowserRouter>
      <IntlProvider locale="en">
        <ParentBreadcrumbs
          libraryData={{ id: 'library-id', title: 'Library Title' }}
          containerType={containerType}
          parents={parents}
        />
      </IntlProvider>
    </BrowserRouter>,
  )
);

describe('<ParentBreadcrumbs />', () => {
  it('show breadcrumb without parent', async () => {
    renderComponent(ContainerType.Unit, { displayName: [], key: [] });
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(2); // Library link + Empty link

    expect(links[0]).toHaveTextContent('Library Title');
    expect(links[0]).toHaveProperty('href', 'http://localhost/library/library-id');

    expect(links[1]).toHaveTextContent(''); // Empty link for no parent
    expect(links[1]).toHaveProperty('href', 'http://localhost/');
  });

  it('show breadcrumb to a unit without one parent', async () => {
    renderComponent(ContainerType.Unit, { displayName: ['Parent Subsection'], key: ['subsection-key'] });
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(2); // Library link + Parent Subsection link

    expect(links[0]).toHaveTextContent('Library Title');
    expect(links[0]).toHaveProperty('href', 'http://localhost/library/library-id');

    expect(links[1]).toHaveTextContent('Parent Subsection');
    expect(links[1]).toHaveProperty('href', 'http://localhost/library/library-id/subsection/subsection-key');
  });

  it('show breadcrumb to a subsection without one parent', async () => {
    renderComponent(ContainerType.Subsection, { displayName: ['Parent Section'], key: ['section-key'] });
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(2); // Library link + Parent Subsection link

    expect(links[0]).toHaveTextContent('Library Title');
    expect(links[0]).toHaveProperty('href', 'http://localhost/library/library-id');

    expect(links[1]).toHaveTextContent('Parent Section');
    expect(links[1]).toHaveProperty('href', 'http://localhost/library/library-id/section/section-key');
  });

  it('should throw an error if displayName and key arrays are not the same length', async () => {
    expect(() => renderComponent(ContainerType.Unit, {
      displayName: ['Parent 1'],
      key: ['key1', 'key2'],
    })).toThrow('Parents key and displayName arrays must have the same length.');
  });

  it('show breadcrumb with multiple parents', async () => {
    renderComponent(ContainerType.Unit, {
      displayName: ['Parent Subsection 1', 'Parent Subsection 2'],
      key: ['subsection-key-1', 'subsection-key-2'],
    });
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(1); // Library link only. Parents are displayed in a dropdown.

    expect(links[0]).toHaveTextContent('Library Title');
    expect(links[0]).toHaveProperty('href', 'http://localhost/library/library-id');

    const dropdown = screen.getByRole('button', { name: '2 Subsections' });
    expect(dropdown).toBeInTheDocument();

    fireEvent.click(dropdown);

    const subsectionLinks = screen.queryAllByRole('link');
    expect(subsectionLinks).toHaveLength(2); // Library link only. Parents are displayed in a dropdown.

    expect(subsectionLinks[0]).toHaveTextContent('Parent Subsection 1');
    expect(subsectionLinks[0]).toHaveProperty('href', 'http://localhost/library/library-id/subsection/subsection-key-1');

    expect(subsectionLinks[1]).toHaveTextContent('Parent Subsection 2');
    expect(subsectionLinks[1]).toHaveProperty('href', 'http://localhost/library/library-id/subsection/subsection-key-2');
  });
});
