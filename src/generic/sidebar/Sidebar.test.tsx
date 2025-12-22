import { useState } from 'react';
import {
  initializeMocks, render, screen, within,
} from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';

import { useToggle } from '@openedx/paragon';

import { Sidebar } from '.';

const Component1 = () => <div>Component 1</div>;
const Component2 = () => <div>Component 2</div>;
const Icon1 = () => <div>Icon 1</div>;
const Icon2 = () => <div>Icon 2</div>;
const pages = {
  page1: {
    title: 'Page 1',
    component: Component1,
    icon: Icon1,
  },
  page2: {
    title: 'Page 2',
    component: Component2,
    icon: Icon2,
  },
};

const TestSidebar = () => {
  const [isOpen, , , toggle] = useToggle(true);
  const [pageKey, setPageKey] = useState<keyof typeof pages>('page1');

  return (
    <Sidebar
      pages={pages}
      currentPageKey={pageKey}
      setCurrentPageKey={setPageKey}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
};

describe('<Sidebar>', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the sidebar', () => {
    render(<TestSidebar />);

    // Check the Page 1 content
    expect(screen.getByText('Component 1')).toBeInTheDocument();

    // Check the IconButtonToggle
    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    expect(sidebarToggle).toBeInTheDocument();

    const page1Button = within(sidebarToggle).getByRole('button', { name: 'Page 1' });
    expect(page1Button).toBeInTheDocument();
    expect(page1Button).toHaveAttribute('aria-selected', 'true');

    const page2Button = within(sidebarToggle).getByRole('button', { name: 'Page 2' });
    expect(page2Button).toBeInTheDocument();
    expect(page2Button).toHaveAttribute('aria-selected', 'false');
  });

  it('should change pages using the icon button', async () => {
    render(<TestSidebar />);

    // Check the Page 1 content
    expect(screen.getByText('Component 1')).toBeInTheDocument();

    const page2Button = screen.getByRole('button', { name: 'Page 2' });
    await userEvent.click(page2Button);

    expect(page2Button).toHaveAttribute('aria-selected', 'true');

    // Check the Page 2 content
    expect(screen.getByText('Component 2')).toBeInTheDocument();

    const page1Button = screen.getByRole('button', { name: 'Page 1' });
    expect(page1Button).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(page1Button);

    // Check the Page 1 content
    expect(screen.getByText('Component 1')).toBeInTheDocument();
  });

  it('should change pages using the dropdown button', async () => {
    render(<TestSidebar />);

    const sidebarDropdown = screen.getByTestId('sidebar-dropdown');
    expect(sidebarDropdown).toBeInTheDocument();

    // Check the Page 1 content
    expect(screen.getByText('Component 1')).toBeInTheDocument();

    // Click on the dropdown button
    await userEvent.click(within(sidebarDropdown).getByRole('button', { name: 'Page 1 Icon 1' }));

    // Select the Page 2 option
    const page2Button = within(sidebarDropdown).getByRole('button', { name: 'Icon 2 Page 2' });
    await userEvent.click(page2Button);

    // Check the Page 2 content
    expect(screen.getByText('Component 2')).toBeInTheDocument();

    // Click on the dropdown button again
    await userEvent.click(within(sidebarDropdown).getByRole('button', { name: 'Page 2 Icon 2' }));

    // Select the Page 1 option
    const page1Button = within(sidebarDropdown).getByRole('button', { name: 'Icon 1 Page 1' });
    await userEvent.click(page1Button);

    // Check the Page 1 content
    expect(screen.getByText('Component 1')).toBeInTheDocument();
  });

  it('should toggle the sidebar', async () => {
    render(<TestSidebar />);

    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    expect(sidebarToggle).toBeInTheDocument();

    // Check the Page 1 content
    expect(screen.getByText('Component 1')).toBeInTheDocument();

    // Hide the sidebar
    const toggleButton = within(sidebarToggle).getByRole('button', { name: 'Toggle' });
    expect(toggleButton).toBeInTheDocument();
    await userEvent.click(toggleButton);

    // Check the Page 1 content is hidden
    expect(screen.queryByText('Component 1')).not.toBeInTheDocument();

    // Show the sidebar
    await userEvent.click(toggleButton);

    // Check the Page 1 content
    expect(screen.getByText('Component 1')).toBeInTheDocument();
  });
});
