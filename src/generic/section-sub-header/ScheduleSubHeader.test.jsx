import React from 'react';
import { render } from '@testing-library/react';
import SectionSubHeader from '.';

const props = {
  title: 'foo-title',
  description: 'bar-description',
};

describe('<SectionSubHeader />', () => {
  it('renders successfully', () => {
    const { getByText } = render(<SectionSubHeader {...props} />);
    expect(getByText(props.title)).toBeInTheDocument();
    expect(getByText(props.description)).toBeInTheDocument();
  });
});
