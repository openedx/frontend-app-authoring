import { initializeMocks, render, screen } from '@src/testUtils';

import SidebarBlock from './SidebarBlock';

const testProps = {
  title: 'Test Title',
  paragraphs: ['Test Paragraph'],
};

const renderComponent = (props) =>
  render(
    <SidebarBlock {...props} />,
  );

describe('SidebarBlock', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders without crashing', () => {
    renderComponent(testProps);

    expect(screen.getByText(testProps.title)).toBeInTheDocument();
    expect(screen.getByText(testProps.paragraphs[0])).toBeInTheDocument();
  });

  it('renders <hr> if isLast is false', () => {
    renderComponent(testProps);

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('does not render <hr> if isLast is true', () => {
    renderComponent({ ...testProps, isLast: true });

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
});
