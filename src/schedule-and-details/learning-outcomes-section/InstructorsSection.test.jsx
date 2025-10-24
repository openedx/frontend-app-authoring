import { fireEvent, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../__mocks__';
import messages from './messages';
import LearningOutcomesSection from '.';

const onChangeMock = jest.fn();
const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <LearningOutcomesSection {...props} />
  </IntlProvider>
);

const props = {
  learningInfo: courseDetailsMock.learningInfo,
  onChange: onChangeMock,
};

describe('<LearningOutcomesSection />', () => {
  it('renders section successfully', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    expect(getByText(messages.outcomesTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.outcomesDescription.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.outcomesAdd.defaultMessage })).toBeInTheDocument();
  });

  it('should create another learning outcome form on click Add learning outcome', async () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const addButton = getByRole('button', { name: messages.outcomesAdd.defaultMessage });
    expect(onChangeMock).not.toHaveBeenCalled();
    fireEvent.click(addButton);
    expect(onChangeMock).toHaveBeenCalledWith([
      props.learningInfo[0],
      '', // <-- new
    ], 'learningInfo');

    // FIXME: the following doesn't happen, because this is a controlled component and only changes
    // when the props change (in response to 'onChange'). This needs to be tested at a higher level,
    // e.g. testing the whole page together, not just this component.
    // await waitFor(() => {
    //   const deleteButtons = getAllByRole('button', { name: messages.outcomesDelete.defaultMessage });
    //   expect(deleteButtons.length).toBe(2);
    // });
  });

  it('should delete learning outcome form on click Delete', async () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const deleteButton = getByRole('button', { name: messages.outcomesDelete.defaultMessage });
    fireEvent.click(deleteButton);

    expect(onChangeMock).toHaveBeenCalledWith([], 'learningInfo');
    // FIXME: the following doesn't happen, because this is a controlled component and only changes
    // when the props change (in response to 'onChange'). This needs to be tested at a higher level,
    // e.g. testing the whole page together, not just this component.
    // await waitFor(() => {
    //   const deleteButtons = getAllByRole('button', { name: messages.outcomesDelete.defaultMessage });
    //   expect(deleteButtons.length).toBe(0);
    // });
  });

  it('should call onChange if input value changed', () => {
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    const input = getByPlaceholderText(messages.outcomesInputPlaceholder.defaultMessage);
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(onChangeMock).toHaveBeenCalledWith(['abc'], 'learningInfo');
  });
});
