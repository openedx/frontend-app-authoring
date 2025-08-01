import React from 'react';

import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../../../../testUtils';
import ProblemTypeSelect from './ProblemTypeSelect';

describe('ProblemTypeSelect', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the component with the selected element checked', () => {
    render(<ProblemTypeSelect setSelected={jest.fn()} selected={ProblemTypeKeys.SINGLESELECT} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const radioSingle = screen.getByDisplayValue('multiplechoiceresponse');
    expect(radioSingle).toBeChecked();
  });

  it('does not render advanced element', () => {
    render(<ProblemTypeSelect setSelected={jest.fn()} selected={ProblemTypeKeys.MULTISELECT} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.queryByText('advanced')).not.toBeInTheDocument();
  });

  it('should call setSelected with correct value when clicking one option', () => {
    const mockSetSelected = jest.fn();
    render(<ProblemTypeSelect setSelected={mockSetSelected} selected={ProblemTypeKeys.NUMERIC} />);
    const multiSelectOption = screen.getByRole('button', { name: 'Multi-select' });
    fireEvent.click(multiSelectOption);
    expect(mockSetSelected).toHaveBeenCalledWith('choiceresponse');
  });

  it('should call setSelected with blankadvanced when clicking the advanced button', () => {
    const mockSetSelected = jest.fn();
    render(<ProblemTypeSelect setSelected={mockSetSelected} selected={ProblemTypeKeys.MULTISELECT} />);
    const button = screen.getByRole('button', { name: 'Advanced problem types' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockSetSelected).toHaveBeenCalledWith('blankadvanced');
  });
});
