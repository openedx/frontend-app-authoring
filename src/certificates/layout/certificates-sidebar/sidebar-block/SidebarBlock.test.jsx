import { render } from '@testing-library/react';

import SidebarBlock from './SidebarBlock';

const testProps = {
  title: 'Test Title',
  paragraphs: ['Test Paragraph'],
};

const renderComponent = (props) => render(
  <SidebarBlock {...props} />,
);

describe('SidebarBlock', () => {
  it('renders without crashing', () => {
    const { getByText } = renderComponent(testProps);

    expect(getByText(testProps.title)).toBeInTheDocument();
    expect(getByText(testProps.paragraphs[0])).toBeInTheDocument();
  });

  it('renders <hr> if isLast is false', () => {
    const { getByRole } = renderComponent(testProps);

    expect(getByRole('separator')).toBeInTheDocument();
  });

  it('does not render <hr> if isLast is true', () => {
    const { queryByRole } = renderComponent({ ...testProps, isLast: true });

    expect(queryByRole('separator')).not.toBeInTheDocument();
  });
});
