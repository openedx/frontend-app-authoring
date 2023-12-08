import React from 'react';
import { render } from '@testing-library/react';

import LoadingButton from '.';

const buttonTitle = 'Button Title';

const RootWrapper = (onClick) => (
  <LoadingButton onClick={onClick}>
    {buttonTitle}
  </LoadingButton>
);

describe('<LoadingButton />', () => {
  it('renders the title and doesnt handle the spinner initially', () => {
    const { getByText, getByTestId } = render(RootWrapper(() => { }));
    const titleElement = getByText(buttonTitle);
    expect(titleElement).toBeInTheDocument();
    expect(() => getByTestId('button-loading-spinner')).toThrow('Unable to find an element');
  });

  it('doesnt render the spinner initially without onClick function', () => {
    const { getByRole, getByText, getByTestId } = render(RootWrapper());
    const titleElement = getByText(buttonTitle);
    expect(titleElement).toBeInTheDocument();
    expect(() => getByTestId('button-loading-spinner')).toThrow('Unable to find an element');

    const buttonElement = getByRole('button');
    expect(buttonElement.click()).not.toThrow();
  });

  it('renders the spinner correctly', () => {
    const longFunction = () => new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    const { getByRole, getByText, getByTestId } = render(RootWrapper(longFunction));
    const buttonElement = getByRole('button');
    buttonElement.click();
    const spinnerElement = getByTestId('button-loading-spinner');
    expect(spinnerElement).toBeInTheDocument();
    const titleElement = getByText(buttonTitle);
    expect(titleElement).toBeInTheDocument();
    expect(buttonElement).toBeDisabled();
    setTimeout(() => {
      expect(buttonElement).toBeEnabled();
      expect(spinnerElement).not.toBeInTheDocument();
    }, 2000);
  });

  it('renders the spinner correctly even with error', () => {
    const longFunction = () => new Promise((resolve, reject) => {
      setTimeout(reject, 1000);
    });
    const { getByRole, getByText, getByTestId } = render(RootWrapper(longFunction));
    const buttonElement = getByRole('button');
    buttonElement.click();
    const spinnerElement = getByTestId('button-loading-spinner');
    expect(spinnerElement).toBeInTheDocument();
    const titleElement = getByText(buttonTitle);
    expect(titleElement).toBeInTheDocument();
    expect(buttonElement).toBeDisabled();
    setTimeout(() => {
      expect(buttonElement).toBeEnabled();
      expect(spinnerElement).not.toBeInTheDocument();
    }, 2000);
  });
});
