import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import messages from './messages';
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
    expect(getByText(messages.creditTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.creditDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.creditHelp.defaultMessage)).toBeInTheDocument();
  });

  it('renders empty requirements', () => {
    const initialProps = { ...props, creditRequirements: {} };
    const { getByText } = render(<RootWrapper {...initialProps} />);
    expect(getByText(messages.creditNotFound.defaultMessage)).toBeInTheDocument();
  });

  it('renders requirements successfully', () => {
    const { getByText, queryAllByText } = render(<RootWrapper {...props} />);
    expect(getByText(messages.creditMinimumGrade.defaultMessage)).toBeInTheDocument();
    expect(getByText('80%')).toBeInTheDocument();
    expect(queryAllByText(messages.creditProctoredExam.defaultMessage).length).toBe(0);
    expect(queryAllByText(messages.creditVerification.defaultMessage).length).toBe(0);
  });
});
