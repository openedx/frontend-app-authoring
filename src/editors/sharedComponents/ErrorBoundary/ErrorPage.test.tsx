import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import ErrorPage from './ErrorPage';
import editorRender from '../../editorTestRender';
import { initializeStore } from '../../data/redux';

describe('Editor Page', () => {
  const emptyProps = {
    learningContextId: 'course-v1:edX+DemoX+Demo_Course',
    studioEndpointUrl: 'fakeurl.com',
  };
  const passedProps = {
    learningContextId: 'course-v1:edX+DemoX+Demo_Course',
    studioEndpointUrl: 'fakeurl.com',
    message: 'cUStomMEssagE',
  };
  const initialState = {
    app: {
      unitUrl: {
        data: {
          ancestors: [{ id: 'SomeID' }],
        },
      },
    },
  };

  beforeEach(() => {
    initializeMocks({ initialState, initializeStore });
  });

  describe('rendered with empty props', () => {
    it('should only have one button (try again)', () => {
      render(<ErrorPage {...emptyProps} />);
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });
  });

  describe('rendered with pass through props defined', () => {
    describe('shows two buttons', () => {
      it('the first button should correspond to returning to the course outline', () => {
        const modifiedInitialState = {
          ...initialState,
          app: {
            unitUrl: {

            },
          },
        };
        editorRender(<ErrorPage {...passedProps} />, { initialState: modifiedInitialState });
        const firstButton = screen.getByRole('button', { name: 'Return to course outline' });
        const secondButton = screen.getByRole('button', { name: 'Try again' });
        expect(firstButton).toBeInTheDocument();
        expect(secondButton).toBeInTheDocument();
      });
      it('the first button should correspond to returning to the unit page', () => {
        editorRender(<ErrorPage {...passedProps} />, { initialState });
        const firstButton = screen.getByRole('button', { name: 'Return to unit page' });
        const secondButton = screen.getByRole('button', { name: 'Try again' });
        expect(firstButton).toBeInTheDocument();
        expect(secondButton).toBeInTheDocument();
      });
    });
    it('should have custom message', () => {
      render(<ErrorPage {...passedProps} />);
      expect(screen.getByText('cUStomMEssagE')).toBeInTheDocument();
    });
  });
});
