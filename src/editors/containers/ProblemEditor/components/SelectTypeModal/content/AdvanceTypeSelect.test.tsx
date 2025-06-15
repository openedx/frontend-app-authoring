import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../../../../testUtils';
import AdvanceTypeSelect from './AdvanceTypeSelect';
import { ProblemTypeKeys, AdvanceProblems } from '../../../../../data/constants/problem';

describe('AdvanceTypeSelect', () => {
  const setSelected = jest.fn();

  beforeEach(() => {
    initializeMocks();
    setSelected.mockClear();
  });

  it('component shows on screen', () => {
    const selected = 'blankadvanced';
    render(<AdvanceTypeSelect selected={selected} setSelected={setSelected} />);
    const container = screen.getByRole('radiogroup');
    expect(container).toBeInTheDocument();
  });

  it('calls setSelected with the correct value when a radio is selected', () => {
    const selected = 'blankadvanced';
    render(<AdvanceTypeSelect selected={selected} setSelected={setSelected} />);
    const nextType = 'circuitschematic';
    const radio = screen.getByLabelText(AdvanceProblems[nextType].title);
    fireEvent.click(radio);
    expect(setSelected).toHaveBeenCalledWith(nextType);
  });

  it('calls setSelected with SINGLESELECT when back button is clicked', () => {
    const selected = 'blankadvanced';
    render(<AdvanceTypeSelect selected={selected} setSelected={setSelected} />);
    const backButton = screen.getByRole('button', { name: /Go Back/i });
    fireEvent.click(backButton);
    expect(setSelected).toHaveBeenCalledWith(ProblemTypeKeys.SINGLESELECT);
  });

  it('checks the correct radio is selected', () => {
    const selected = 'circuitschematic';
    render(<AdvanceTypeSelect selected={selected} setSelected={setSelected} />);
    const radio = screen.getByLabelText(AdvanceProblems[selected].title);
    expect(radio).toBeChecked();
  });
});
