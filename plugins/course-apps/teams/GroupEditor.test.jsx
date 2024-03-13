import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useFormikContext } from 'formik';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import GroupEditor from './GroupEditor';

import messages from './messages';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));

describe('GroupEditor', () => {
  const mockIntl = { formatMessage: jest.fn() };

  const mockGroup = {
    id: '1',
    name: 'Test Group',
    description: 'Test Group Description',
    type: 'open',
    maxTeamSize: 5,
  };

  const mockProps = {
    intl: mockIntl,
    fieldNameCommonBase: 'test',
    group: mockGroup,
    onDelete: jest.fn(),
    onChange: jest.fn(),
    onBlur: jest.fn(),
    errors: {},
  };

  const renderComponent = (overrideProps = {}) => render(
    <IntlProvider locale="en" messages={{}}>
      <GroupEditor {...mockProps} {...overrideProps} />
    </IntlProvider>,
  );

  beforeEach(() => {
    useFormikContext.mockReturnValue({
      touched: {},
      errors: {},
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      setFieldError: jest.fn(),
    });

    jest.clearAllMocks();
  });

  test('renders without errors', () => {
    renderComponent();
  });

  test('renders the group name and description', () => {
    const { getByText } = renderComponent();
    expect(getByText('Test Group')).toBeInTheDocument();
    expect(getByText('Test Group Description')).toBeInTheDocument();
  });

  describe('group types messages', () => {
    test('group type open message', () => {
      const { getByLabelText, getByText } = renderComponent();
      const expandButton = getByLabelText('Expand group editor');
      expect(expandButton).toBeInTheDocument();
      fireEvent.click(expandButton);
      expect(getByText(messages.groupTypeOpenDescription.defaultMessage)).toBeInTheDocument();
    });

    test('group type public_managed message', () => {
      const publicManagedGroupMock = {
        id: '2',
        name: 'Test Group',
        description: 'Test Group Description',
        type: 'public_managed',
        maxTeamSize: 5,
      };
      const { getByLabelText, getByText } = renderComponent({ group: publicManagedGroupMock });
      const expandButton = getByLabelText('Expand group editor');
      expect(expandButton).toBeInTheDocument();
      fireEvent.click(expandButton);
      expect(getByText(messages.groupTypePublicManagedDescription.defaultMessage)).toBeInTheDocument();
    });

    test('group type private_managed message', () => {
      const privateManagedGroupMock = {
        id: '3',
        name: 'Test Group',
        description: 'Test Group Description',
        type: 'private_managed',
        maxTeamSize: 5,
      };
      const { getByLabelText, getByText } = renderComponent({ group: privateManagedGroupMock });
      const expandButton = getByLabelText('Expand group editor');
      expect(expandButton).toBeInTheDocument();
      fireEvent.click(expandButton);
      expect(getByText(messages.groupTypePrivateManagedDescription.defaultMessage)).toBeInTheDocument();
    });
  });
});
