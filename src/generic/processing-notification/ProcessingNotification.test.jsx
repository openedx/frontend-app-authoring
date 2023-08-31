import React from 'react';
import { render } from '@testing-library/react';
import { capitalize } from 'lodash';
import { NOTIFICATION_MESSAGES } from '../../constants';
import ProcessingNotification from '.';

const props = {
  title: NOTIFICATION_MESSAGES.saving,
  isShow: true,
};

describe('<ProcessingNotification />', () => {
  it('renders successfully', () => {
    const { getByText } = render(<ProcessingNotification {...props} />);
    expect(getByText(capitalize(props.title))).toBeInTheDocument();
  });
});
