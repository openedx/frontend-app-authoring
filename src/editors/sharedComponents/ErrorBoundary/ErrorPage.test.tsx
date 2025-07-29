import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import { ErrorPageInternal as ErrorPage } from './ErrorPage';

jest.mock('../../data/redux', () => ({
  selectors: {
    app: {
      unitUrl: jest.fn(state => ({ unitUrl: state })),
    },
  },
}));

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
  const unitData = {
    data: {
      ancestors: [{ id: 'SomeID' }],
    },
  };

  beforeEach(() => {
    initializeMocks();
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
        render(<ErrorPage {...passedProps} />);
        const firstButton = screen.getByRole('button', { name: 'Return to course outline' });
        const secondButton = screen.getByRole('button', { name: 'Try again' });
        expect(firstButton).toBeInTheDocument();
        expect(secondButton).toBeInTheDocument();
      });
      it('the first button should correspond to returning to the unit page', () => {
        render(<ErrorPage {...passedProps} unitData={unitData} />);
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
