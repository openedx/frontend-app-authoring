import React from 'react';
import { render, screen, initializeMocks } from '../../../testUtils';
import { ProblemEditorInternal } from './index';
import messages from './messages';

// Mock child components for easy selection
jest.mock('./components/SelectTypeModal', () => function mockSelectTypeModal(props: any) {
  return <div>SelectTypeModal {props.onClose && 'withOnClose'}</div>;
});
jest.mock('./components/EditProblemView', () => function mockEditProblemView(props: any) {
  return <div>EditProblemView {props.onClose && 'withOnClose'} {props.returnFunction && 'withReturnFunction'}</div>;
});

const baseProps = {
  onClose: jest.fn(),
  returnFunction: jest.fn(),
  initializeProblemEditor: jest.fn(),
  blockValue: { foo: 'bar' },
};

describe('ProblemEditor', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders Spinner when blockFinished is false', () => {
    const { container } = render(<ProblemEditorInternal
      {...baseProps}
      blockFinished={false}
      advancedSettingsFinished
      blockFailed={false}
      problemType={null}
    />);
    const spinner = container.querySelector('.pgn__spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('screenreadertext', 'Loading Problem Editor');
  });

  it('renders Spinner when advancedSettingsFinished is false', () => {
    const { container } = render(<ProblemEditorInternal
      {...baseProps}
      blockFinished
      advancedSettingsFinished={false}
      blockFailed={false}
      problemType={null}
    />);
    const spinner = container.querySelector('.pgn__spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('screenreadertext', 'Loading Problem Editor');
  });

  it('renders block failed message when blockFailed is true', () => {
    render(<ProblemEditorInternal
      {...baseProps}
      blockFinished
      advancedSettingsFinished
      blockFailed
      problemType={null}
    />);
    expect(screen.getByText(messages.blockFailed.defaultMessage)).toBeInTheDocument();
  });

  it('renders SelectTypeModal when problemType is null', () => {
    render(<ProblemEditorInternal
      {...baseProps}
      blockFinished
      advancedSettingsFinished
      blockFailed={false}
      problemType={null}
    />);
    expect(screen.getByText(/SelectTypeModal/)).toBeInTheDocument();
  });

  it('renders EditProblemView when problemType is not null', () => {
    render(<ProblemEditorInternal
      {...baseProps}
      blockFinished
      advancedSettingsFinished
      blockFailed={false}
      problemType="advanced"
    />);
    expect(screen.getByText(/EditProblemView/)).toBeInTheDocument();
  });

  it('calls initializeProblemEditor when blockFinished and not blockFailed', () => {
    const initializeProblemEditor = jest.fn();
    render(<ProblemEditorInternal
      {...baseProps}
      blockFinished
      advancedSettingsFinished
      blockFailed={false}
      problemType={null}
      initializeProblemEditor={initializeProblemEditor}
    />);
    expect(initializeProblemEditor).toHaveBeenCalledWith(baseProps.blockValue);
  });

  it('does not call initializeProblemEditor if blockFinished is false', () => {
    const initializeProblemEditor = jest.fn();
    render(<ProblemEditorInternal
      {...baseProps}
      blockFinished={false}
      advancedSettingsFinished
      blockFailed={false}
      problemType={null}
      initializeProblemEditor={initializeProblemEditor}
    />);
    expect(initializeProblemEditor).not.toHaveBeenCalled();
  });

  it('does not call initializeProblemEditor if blockFailed is true', () => {
    const initializeProblemEditor = jest.fn();
    render(<ProblemEditorInternal
      {...baseProps}
      blockFinished
      advancedSettingsFinished
      blockFailed
      problemType={null}
      initializeProblemEditor={initializeProblemEditor}
    />);
    expect(initializeProblemEditor).not.toHaveBeenCalled();
  });
});
