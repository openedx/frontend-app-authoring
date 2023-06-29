import React from 'react';
import { render } from '@testing-library/react';
import ScheduleSubHeader from '.';

const props = {
  title: 'foo-title',
  description: 'bar-description',
};

describe('<ScheduleSubHeader />', () => {
  it('renders successfully', () => {
    const { getByText } = render(<ScheduleSubHeader {...props} />);
    expect(getByText(props.title)).toBeInTheDocument();
    expect(getByText(props.description)).toBeInTheDocument();
  });
});
