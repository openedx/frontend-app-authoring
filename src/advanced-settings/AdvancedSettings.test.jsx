import React from 'react';
import { shallow, mount } from 'enzyme';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import renderer from 'react-test-renderer';

import AdvancedSettings from './AdvancedSettings';
import { fetchCourseAppSettings, fetchProctoringExamErrors, updateCourseAppSetting } from './data/thunks';

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => {}}
    onBlur={() => {}}
  />
)));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('./data/thunks', () => ({
  fetchCourseAppSettings: jest.fn(),
  fetchProctoringExamErrors: jest.fn(),
  updateCourseAppSetting: jest.fn(),
}));

jest.mock('./data/selectors', () => ({
  getCourseAppSettings: jest.fn(),
  getSavingStatus: jest.fn(),
  getProctoringExamErrors: jest.fn(),
}));

const mockPathname = '/foo-bar';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

describe('AdvancedSettings', () => {
  const courseId = '123';
  const mockDispatch = jest.fn();
  let wrapper;
  useDispatch.mockReturnValue(mockDispatch);

  beforeEach(() => {
    const mockAdvancedSettingsData = {
      setting1: { value: 'value1' },
      setting2: { value: 'value2' },
    };
    useSelector.mockReturnValueOnce(mockAdvancedSettingsData);
    useSelector.mockReturnValue(mockAdvancedSettingsData);
    wrapper = mount(
      <IntlProvider locale="en">
        <AdvancedSettings intl={injectIntl} courseId={courseId} />
      </IntlProvider>,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should match the snapshot', () => {
    const tree = renderer.create(wrapper).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should render without errors', () => {
    shallow(<AdvancedSettings intl={injectIntl} courseId={courseId} />);
  });
  it('should fetch course app settings and proctoring exam errors on mount', () => {
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(fetchCourseAppSettings).toHaveBeenCalledWith(courseId);
    expect(fetchProctoringExamErrors).toHaveBeenCalledWith(courseId);
  });
  it('should render setting card with correct value', () => {
    const settingCard = wrapper.find('SettingCard').at(0);
    expect(settingCard.props().value).toBe('"value1"');
  });
  it('updating textarea value and show warning alert', () => {
    const settingCard = wrapper.find('SettingCard').at(0);
    const textarea = settingCard.find('textarea');
    textarea.simulate('change', { target: { value: 'new value' } });
    expect(textarea.text()).toBe('new value');
    const settingAlert = wrapper.find('AlertMessage');
    expect(settingAlert.find('AlertHeading').at(0).text()).toBe('You`ve made some changes');
  });
  it('show warning alert and after click on Cancel button reset textarea value', () => {
    const settingCard = wrapper.find('SettingCard').at(0);
    const textarea = settingCard.find('textarea');
    textarea.simulate('change', { target: { value: 'new value' } });
    const settingAlert = wrapper.find('AlertMessage');
    const resetBtn = settingAlert.find('Button').at(1);
    resetBtn.simulate('click');
    expect(textarea.text()).toBe('"value1"');
  });
  it('should handle setting change', () => {
    const dispatch = useDispatch();
    wrapper.find('textarea').at(0).simulate('change', { target: { value: 'new value' } });
    wrapper.find('Button').at(0).simulate('click');
    expect(dispatch).toHaveBeenCalledWith(updateCourseAppSetting(courseId, 'new value'));
  });
  it('should reset textarea value and display success alert on button click', () => {
    const settingCard = wrapper.find('SettingCard').at(0);
    const textarea = settingCard.find('textarea');
    textarea.simulate('change', { target: { value: 'new value' } });
    const settingAlert = wrapper.find('SettingAlert');
    const resetBtn = settingAlert.find('Button').at(0);
    resetBtn.simulate('click');
    expect(textarea.text()).toBe('"new value"');
    const successAlert = wrapper.find('SettingAlert').filterWhere(alert => alert.prop('variant') === 'success');
    expect(successAlert).toHaveLength(1);
  });
});
