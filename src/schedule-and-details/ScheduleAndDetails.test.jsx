import React from 'react';
import { shallow, mount } from 'enzyme';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';

import { courseDetails, courseSettings } from './__mocks__';
import {
  fetchCourseDetailsQuery,
  fetchCourseSettingsQuery,
} from './data/thunks';
import ScheduleAndDetails from '.';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('./data/thunks', () => ({
  fetchCourseDetailsQuery: jest.fn(),
  fetchCourseSettingsQuery: jest.fn(),
  updateCourseDetailsQuery: jest.fn(),
}));

jest.mock('./data/selectors', () => ({
  getCourseSettings: jest.fn(),
  getSavingStatus: jest.fn(),
  getCourseDetails: jest.fn(),
  getLoadingDetailsStatus: jest.fn(),
  getLoadingSettingsStatus: jest.fn(),
}));

const mockPathname = '/foo-bar';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

describe('<ScheduleAndDetails />', () => {
  const courseId = '123';
  const mockDispatch = jest.fn();
  let wrapper;
  useDispatch.mockReturnValue(mockDispatch);

  beforeEach(() => {
    useSelector
      .mockReturnValueOnce(courseSettings)
      .mockReturnValueOnce(courseDetails);
    wrapper = mount(
      <IntlProvider locale="en">
        <ScheduleAndDetails intl={injectIntl} courseId={courseId} />
      </IntlProvider>,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should render without errors', () => {
    shallow(<ScheduleAndDetails intl={injectIntl} courseId={courseId} />);
  });

  it('should fetch course setting and details on mount', () => {
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(fetchCourseDetailsQuery).toHaveBeenCalledWith(courseId);
    expect(fetchCourseSettingsQuery).toHaveBeenCalledWith(courseId);
  });

  it('should render available sections', () => {
    const basicSection = wrapper.find('BasicSection');
    const creditSection = wrapper.find('CreditSection');
    const pacingSection = wrapper.find('PacingSection');
    expect(basicSection.exists()).toBe(true);
    expect(creditSection.exists()).toBe(true);
    expect(pacingSection.exists()).toBe(true);
  });
});
