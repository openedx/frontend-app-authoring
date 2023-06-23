import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { courseDetailsMock } from '../../__mocks__';
import CourseCodeEditor from '.';

describe('<CourseCodeEditor />', () => {
  const onChangeMock = jest.fn();
  const props = {
    code: courseDetailsMock.overview,
    field: 'foo-field',
    label: 'foo-label',
    helpText: 'bar-help-text',
    onChange: onChangeMock,
  };

  it('renders successfully', () => {
    const { getByText } = render(<CourseCodeEditor {...props} />);
    expect(getByText(props.label)).toBeInTheDocument();
    expect(getByText(props.helpText)).toBeInTheDocument();
  });

  it('should change code', async () => {
    const { findByRole, queryByText } = render(<CourseCodeEditor {...props} />);
    const expectedString = 'Hello World!';
    const input = await findByRole('textbox');
    fireEvent.change(input, { target: { textContent: expectedString } });
    const element = queryByText(expectedString);
    expect(element.cmView.dom.innerHTML).toEqual(expectedString);
  });
});
