import {
  render, screen, fireEvent,
} from '@testing-library/react';
import React from 'react';
import messages from './messages';
import { ToleranceTypes } from './constants';
import { ToleranceCardInternal as ToleranceCard } from './index';
import { formatMessage } from '../../../../../../../testUtils';

jest.mock('@edx/frontend-platform/i18n', () => ({
  __esmodule: true,
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  FormattedMessage: jest.fn(({ defaultMessage }) => (
    <div>{ defaultMessage }</div>
  )),
}));

// eslint-disable-next-line react/prop-types
jest.mock('../../SettingsOption', () => function mockSettingsOption({ children, summary }) {
  return <div className="SettingsOption" data-testid="Settings-Option">{summary}{children}</div>;
});

jest.mock('@openedx/paragon', () => ({
  Alert: jest.fn(({ children }) => (
    <div className="PGN-Alert">{children}</div>)),
  Form: {
    Control: jest.fn(({
      children, onChange, as, value, disabled,
    }) => {
      if (as === 'select') {
        return (<select className="PGN-Form-Control" data-testid="select" onChange={onChange} disabled={disabled}>{children}</select>);
      }
      return (<input type="number" data-testid="input" onChange={onChange} value={value} />);
    }),
    Group: jest.fn(({ children }) => (<div className="PGN-Form-Group">{children}</div>)),
  },
}));

describe('ToleranceCard', () => {
  const mockToleranceNull = {
    type: ToleranceTypes.none.type,
    value: null,
  };
  const mockTolerancePercent = {
    type: ToleranceTypes.percent.type,
    value: 0,
  };
  const mockToleranceNumber = {
    type: ToleranceTypes.number.type,
    value: 0,
  };

  const props = {
    answers: [{
      id: 'A',
      correct: true,
      selectedFeedback: '',
      title: 'An Answer',
      isAnswerRange: false,
      unselectedFeedback: '',
    },
    ],
    updateSettings: jest.fn(),
    intl: {
      formatMessage,
    },
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('summary', () => {
    it('Renders None', async () => {
      render(<ToleranceCard tolerance={mockToleranceNull} {...props} />);
      const NoneText = screen.getAllByText(ToleranceTypes.none.type);
      expect(NoneText).toBeDefined();
    });
    it('Render Percent Value', () => {
      render(<ToleranceCard tolerance={mockTolerancePercent} {...props} />);
      const PercentText = screen.getByText(`± ${mockTolerancePercent.value}%`);
      expect(PercentText).toBeDefined();
    });
    it('Renders Number Value', () => {
      render(<ToleranceCard tolerance={mockToleranceNumber} {...props} />);
      const NumberText = screen.getByText(`± ${mockToleranceNumber.value}`);
      expect(NumberText).toBeDefined();
    });

    it('If there is an answer range, show message and disable dropdown.', () => {
      const rangeprops = {
        answers: [{
          id: 'A',
          correct: true,
          selectedFeedback: '',
          title: 'An Answer',
          isAnswerRange: true,
          unselectedFeedback: '',
        },
        ],
        updateSettings: jest.fn(),
        intl: {
          formatMessage,
        },
      };

      render(<ToleranceCard
        tolerance={mockToleranceNumber}
        {...rangeprops}
      />);
      const NumberText = screen.getByText(messages.toleranceAnswerRangeWarning.defaultMessage);
      expect(NumberText).toBeDefined();
      expect(screen.getByTestId('select').getAttributeNames().includes('disabled')).toBeTruthy();
    });
  });
  describe('Type Select', () => {
    it('Renders the types for selection', async () => {
      const { container } = render(<ToleranceCard tolerance={mockToleranceNull} {...props} />);
      const options = container.querySelectorAll('option');
      expect(options.length).toBe(3);
      Object.keys(ToleranceTypes).forEach(type => {
        expect(screen.getAllByText(ToleranceTypes[type].message.defaultMessage)).toBeDefined();
      });
    });
    it('Calls updateSettings on selection of an option', async () => {
      const { container, getByTestId } = render(<ToleranceCard tolerance={mockToleranceNull} {...props} />);
      const select = getByTestId('select');
      fireEvent.change(select, { target: { value: ToleranceTypes.number.type } });
      const options = container.querySelectorAll('option');
      expect(options[0].selected).toBeFalsy();
      expect(options[1].selected).toBeTruthy();
      expect(options[2].selected).toBeFalsy();
      expect(props.updateSettings).toHaveBeenCalledWith({ tolerance: { type: ToleranceTypes.number.type, value: 0 } });
      fireEvent.change(select, { target: { value: ToleranceTypes.none.type } });
      expect(props.updateSettings).toHaveBeenCalledWith({ tolerance: { type: ToleranceTypes.none.type, value: null } });
    });
  });
  describe('Value Select', () => {
    it('Doesnt render if type is null', async () => {
      const { queryByTestId } = render(<ToleranceCard tolerance={mockToleranceNull} {...props} />);
      expect(queryByTestId('input')).toBeFalsy();
    });
    it('Renders with initial value of tolerance', async () => {
      const { queryByTestId } = render(<ToleranceCard tolerance={mockToleranceNumber} {...props} />);
      expect(queryByTestId('input')).toBeTruthy();
      expect(screen.getByDisplayValue('0')).toBeTruthy();
    });
    it('Calls change function on change.', () => {
      const { queryByTestId } = render(<ToleranceCard tolerance={mockToleranceNumber} {...props} />);
      fireEvent.change(queryByTestId('input'), { target: { value: 52 } });
      expect(props.updateSettings).toHaveBeenCalledWith({ tolerance: { type: ToleranceTypes.number.type, value: 52 } });
    });
    it('Resets negative value on change.', () => {
      const { queryByTestId } = render(<ToleranceCard tolerance={mockToleranceNumber} {...props} />);
      fireEvent.change(queryByTestId('input'), { target: { value: -52 } });
      expect(props.updateSettings).toHaveBeenCalledWith({ tolerance: { type: ToleranceTypes.number.type, value: 0 } });
    });
  });
});
