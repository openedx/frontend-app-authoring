import React from 'react';
import {
  screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import ScoringCard from './ScoringCard';
import { selectors } from '../../../../../../data/redux';
import editorRender from '../../../../../../modifiedEditorTestRender';

const { app } = selectors;

const initialState = {
  app: {
    studioEndpointUrl: 'studioEndpointUrl',
    learningContextId: 'learningContextId',
    isLibrary: false,
  },
};

describe('ScoringCard', () => {
  const scoring = {
    weight: 1.5,
    attempts: {
      unlimited: false,
      number: 5,
    },
    updateSettings: jest.fn().mockName('args.updateSettings'),
  };

  const props = {
    scoring,
    defaultValue: 1,
    updateSettings: jest.fn(),
  };

  beforeEach(() => {
    initializeMocks({ initialState });
  });

  test('render the component', () => {
    editorRender(<ScoringCard {...props} />);
    expect(screen.getByText('Scoring')).toBeInTheDocument();
  });

  test('should not render advance settings link when isLibrary is true', () => {
    jest.spyOn(app, 'isLibrary').mockReturnValue(true);
    editorRender(<ScoringCard {...props} />);
    fireEvent.click(screen.getByText('Scoring'));
    expect(screen.queryByText('Set a default value in advanced settings')).not.toBeInTheDocument();
  });

  test('should render advance settings link when isLibrary is false', () => {
    jest.spyOn(app, 'isLibrary').mockReturnValue(false);
    editorRender(<ScoringCard {...props} />);
    fireEvent.click(screen.getByText('Scoring'));
    expect(screen.getByText('Set a default value in advanced settings')).toBeInTheDocument();
  });

  test('should call updateSettings when clicking points button', () => {
    editorRender(<ScoringCard {...props} scoring={{ ...scoring, weight: 0 }} />);
    fireEvent.click(screen.getByText('Scoring'));
    const pointsButton = screen.getByRole('spinbutton', { name: 'Points' });
    expect(pointsButton).toBeInTheDocument();
    expect(pointsButton.value).toBe('0');
    fireEvent.change(pointsButton, { target: { value: '0.1' } });
    expect(props.updateSettings).toHaveBeenCalled();
  });

  test('should call updateSettings when clicking attempts button', () => {
    const scoringUnlimited = { ...scoring, attempts: { unlimited: true, number: 0 } };
    editorRender(<ScoringCard {...props} scoring={scoringUnlimited} />);
    fireEvent.click(screen.getByText('Scoring'));
    fireEvent.click(screen.getByText('Attempts'));
    const attemptsButton = screen.getByRole('spinbutton', { name: 'Points' });
    expect(attemptsButton).toBeInTheDocument();
    expect(attemptsButton.value).toBe('1.5');
    fireEvent.change(attemptsButton, { target: { value: '2' } });
    expect(props.updateSettings).toHaveBeenCalled();
  });

  test('should display checked checkbox when unlimited is true', () => {
    const scoringUnlimited = { ...scoring, attempts: { unlimited: true, number: 0 } };
    editorRender(<ScoringCard {...props} scoring={scoringUnlimited} />);
    fireEvent.click(screen.getByText('Scoring'));
    const checkbox = screen.getByRole('checkbox', { name: 'Unlimited attempts' });
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(props.updateSettings).toHaveBeenCalled();
  });
});
