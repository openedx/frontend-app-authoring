import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SectionCard from './SectionCard';

const section = {
  displayName: 'Section Name',
  published: true,
  releasedToStudents: true,
  visibleToStaffOnly: false,
  visibilityState: 'visible',
  staffOnlyMessage: false,
};

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <SectionCard section={section} {...props} />
  </IntlProvider>,
);

describe('<SectionCard />', () => {
  it('render SectionCard component correctly', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('section-card-header')).toBeInTheDocument();
    expect(getByTestId('section-card__content')).toBeInTheDocument();
  });

  it('expands/collapses the card when the expand button is clicked', () => {
    const { queryByTestId, getByTestId } = renderComponent();

    const expandButton = getByTestId('section-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(queryByTestId('section-card__content')).not.toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(queryByTestId('section-card__content')).toBeInTheDocument();
  });
});
