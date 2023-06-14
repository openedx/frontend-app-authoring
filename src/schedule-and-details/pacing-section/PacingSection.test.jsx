import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import renderer from 'react-test-renderer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import PacingSection from '.';

jest.useFakeTimers('modern').setSystemTime(new Date('2023-09-14'));

describe('<PacingSection />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <PacingSection {...props} />
    </IntlProvider>
  );

  const props = {
    intl: {},
    selfPaced: false,
    startDate: '2023-06-12',
    onChange: onChangeMock,
  };

  it('matches the snapshots', () => {
    const tree = renderer.create(<RootWrapper {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders pacing section successfully', () => {
    const { getByText, getAllByText } = render(<RootWrapper {...props} />);
    expect(getByText(/Set the pacing for this course/i)).toBeInTheDocument();

    const coursePacingLabels = getAllByText(/Course Pacing/i);
    expect(coursePacingLabels.length).toBe(2);
    expect(coursePacingLabels[0]).toHaveTextContent('Course Pacing');
    expect(coursePacingLabels[1]).toHaveTextContent(
      'Course pacing cannot be changed once a course has started',
    );

    const instructorPacedLabels = getAllByText(/Instructor-Paced/i);
    expect(instructorPacedLabels.length).toBe(2);
    expect(instructorPacedLabels[0]).toHaveTextContent('Instructor-Paced');
    expect(instructorPacedLabels[1]).toHaveTextContent(
      'Instructor-paced courses progress at the pace that the course author sets. You can configure release dates for course content and due dates for assignments.',
    );

    const selfPacedLabels = getAllByText(/Self-Paced/i);
    expect(selfPacedLabels.length).toBe(2);
    expect(selfPacedLabels[0]).toHaveTextContent('Self-Paced');
    expect(selfPacedLabels[1]).toHaveTextContent(
      'Self-paced courses offer suggested due dates for assignments or exams based on the learner’s enrollment date and the expected course duration. These courses offer learners flexibility to modify the assignment dates as needed.',
    );
  });

  it('shows radio inputs correctly', () => {
    const { getAllByRole } = render(<RootWrapper {...props} />);
    const radioList = getAllByRole('radio');
    expect(radioList[0].checked).toBeTruthy();
    expect(radioList[0].disabled).toBeTruthy();
    expect(radioList[1].checked).toBeFalsy();
    expect(radioList[1].disabled).toBeTruthy();
  });

  it('shows disabled radio inputs correctly', () => {
    const pastDate = '2023-12-31';
    const initialProps = { ...props, startDate: pastDate };
    const { getAllByRole, queryAllByText } = render(
      <RootWrapper {...initialProps} />,
    );
    const radioList = getAllByRole('radio');
    expect(radioList[0].checked).toBeTruthy();
    expect(radioList[0].disabled).toBeFalsy();
    expect(radioList[1].checked).toBeFalsy();
    expect(radioList[1].disabled).toBeFalsy();
    expect(
      queryAllByText(
        /Course pacing cannot be changed once a course has started/i,
      ).length,
    ).toBe(0);
  });

  it('should call onChange radio input', () => {
    const pastDate = '2023-12-31';
    const initialProps = { ...props, startDate: pastDate };
    const { getAllByRole } = render(<RootWrapper {...initialProps} />);
    const radioList = getAllByRole('radio');
    expect(radioList[1].checked).toBeFalsy();
    fireEvent.click(radioList[1]);
    expect(onChangeMock).toHaveBeenCalled();
  });
});
