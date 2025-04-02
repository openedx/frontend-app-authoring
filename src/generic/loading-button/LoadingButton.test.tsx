import {
  act,
  fireEvent,
  render,
} from '@testing-library/react';

import LoadingButton from '.';

const buttonTitle = 'Button Title';

const RootWrapper = (onClick?: () => (Promise<void> | void)) => (
  <LoadingButton label={buttonTitle} onClick={onClick} />
);

describe('<LoadingButton />', () => {
  it('renders the title and doesnt handle the spinner initially', () => {
    const { container, getByText } = render(RootWrapper(() => { }));
    expect(getByText(buttonTitle)).toBeInTheDocument();

    expect(container.getElementsByClassName('icon-spin').length).toBe(0);
  });

  it('doesnt render the spinner without onClick function', () => {
    const { container, getByRole, getByText } = render(RootWrapper());
    const titleElement = getByText(buttonTitle);
    expect(titleElement).toBeInTheDocument();
    expect(container.getElementsByClassName('icon-spin').length).toBe(0);
    fireEvent.click(getByRole('button'));
    expect(container.getElementsByClassName('icon-spin').length).toBe(0);
  });

  it('renders the spinner correctly', async () => {
    let resolver: () => void;
    const longFunction = () => new Promise<void>((resolve) => {
      resolver = resolve;
    });
    const { container, getByRole, getByText } = render(RootWrapper(longFunction));
    const buttonElement = getByRole('button');
    fireEvent.click(buttonElement);
    expect(container.getElementsByClassName('icon-spin').length).toBe(1);
    expect(getByText(buttonTitle)).toBeInTheDocument();
    // StatefulButton only sets aria-disabled (not disabled) when the state is pending
    // expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveAttribute('aria-disabled', 'true');

    await act(async () => { resolver(); });

    expect(buttonElement).not.toHaveAttribute('aria-disabled', 'true');
    expect(container.getElementsByClassName('icon-spin').length).toBe(0);
  });

  it('renders the spinner correctly even with error', async () => {
    let rejecter: (err: Error) => void;
    const longFunction = () => new Promise<void>((_resolve, reject) => {
      rejecter = reject;
    });
    const { container, getByRole, getByText } = render(RootWrapper(longFunction));
    const buttonElement = getByRole('button');

    fireEvent.click(buttonElement);

    expect(container.getElementsByClassName('icon-spin').length).toBe(1);
    expect(getByText(buttonTitle)).toBeInTheDocument();
    // StatefulButton only sets aria-disabled (not disabled) when the state is pending
    // expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveAttribute('aria-disabled', 'true');

    await act(async () => { rejecter(new Error('error')); });

    // StatefulButton only sets aria-disabled (not disabled) when the state is pending
    // expect(buttonElement).toBeEnabled();
    expect(buttonElement).not.toHaveAttribute('aria-disabled', 'true');
    expect(container.getElementsByClassName('icon-spin').length).toBe(0);
  });

  it('doesnt run the onClick function if the button is loading (disabled)', async () => {
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });
    const longFunction = jest.fn().mockReturnValue(promise);
    const { getByRole } = render(RootWrapper(longFunction));
    const buttonElement = getByRole('button');
    fireEvent.click(buttonElement);
    // First click should call the function
    expect(longFunction).toHaveBeenCalledTimes(1);
    fireEvent.click(buttonElement);
    // Second click should not call the function, because the button is disabled
    expect(longFunction).toHaveBeenCalledTimes(1);
    await act(async () => { resolver(); });
    // After the promise is resolved, the button should be enabled
    fireEvent.click(buttonElement);
    expect(longFunction).toHaveBeenCalledTimes(2);
  });
});
