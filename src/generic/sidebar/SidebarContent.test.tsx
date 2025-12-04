import { render, screen } from '@testing-library/react';
import { SidebarContent, SidebarSection } from '.';

const Icon1 = () => <div>Icon 1</div>;

describe('<SidebarContent>', () => {
  it('should render the sidebar content', () => {
    render(
      <SidebarContent>
        <SidebarSection title="Section 1" icon={Icon1}>
          <div>Content 1</div>
        </SidebarSection>
        <SidebarSection title="Section 2">
          <div>Content 2</div>
        </SidebarSection>
      </SidebarContent>,
    );

    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Icon 1')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();

    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });
});
