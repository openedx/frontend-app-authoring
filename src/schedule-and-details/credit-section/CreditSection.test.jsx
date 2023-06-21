import React from 'react';
import { render } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import CreditSection from '.';

describe('<CreditSection />', () => {
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <CreditSection {...props} />
    </IntlProvider>
  );

  const props = {
    creditRequirements: {
      grade: [
        {
          name: 'grade',
          displayName: 'Minimum Grade',
          criteria: {
            minGrade: 0.8,
          },
        },
      ],
    },
  };

  it('renders credit section successfully', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText(/Course Credit Requirements/i)).toBeInTheDocument();
    expect(
      getByText(/Steps required to earn course credit/i),
    ).toBeInTheDocument();
    expect(
      getByText(
        /A requirement appears in this list when you publish the unit that contains the requirement./i,
      ),
    ).toBeInTheDocument();
  });

  it('renders empty requirements', () => {
    const initialProps = { ...props, creditRequirements: {} };
    const { getByText } = render(<RootWrapper {...initialProps} />);
    expect(getByText(/No credit requirements found./i)).toBeInTheDocument();
  });

  it('renders requirements successfully', () => {
    const { getByText, queryAllByText } = render(<RootWrapper {...props} />);
    expect(getByText(/Minimum Grade/)).toBeInTheDocument();
    expect(getByText(/80%/i)).toBeInTheDocument();
    expect(queryAllByText('Successful Proctored Exam').length).toBe(0);
    expect(queryAllByText('ID Verification').length).toBe(0);
  });
});
