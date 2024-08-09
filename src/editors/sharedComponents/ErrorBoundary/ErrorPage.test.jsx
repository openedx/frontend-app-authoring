import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { selectors } from '../../data/redux';
import { formatMessage } from '../../testUtils';
import { ErrorPageInternal as ErrorPage, mapStateToProps } from './ErrorPage';

jest.mock('../../data/redux', () => ({
  selectors: {
    app: {
      unitUrl: jest.fn(state => ({ unitUrl: state })),
    },
  },
}));

describe('Editor Page', () => {
  const emptyProps = {
    learningContextId: null,
    studioEndpointUrl: null,
    intl: { formatMessage },
  };
  const passedProps = {
    learningContextId: 'course-v1:edX+DemoX+Demo_Course',
    studioEndpointUrl: 'fakeurl.com',
    message: 'cUStomMEssagE',
    intl: { formatMessage },
  };
  const unitData = {
    data: {
      ancestors: [{ id: 'SomeID' }],
    },
  };

  describe('rendered with empty props', () => {
    it('should only have one button (try again)', () => {
      const wrapper = shallow(<ErrorPage {...emptyProps} />);
      const buttonText = wrapper.instance.findByType('Button')[0].children[0].el;
      expect(wrapper.snapshot).toMatchSnapshot();
      expect(buttonText).toEqual('Try again');
    });
  });

  describe('rendered with pass through props defined', () => {
    const wrapper = shallow(<ErrorPage {...passedProps} />);
    describe('shows two buttons', () => {
      it('the first button should correspond to returning to the course outline', () => {
        const firstButtonText = wrapper.instance.findByType('Button')[0].children[0].el;
        const secondButtonText = wrapper.instance.findByType('Button')[1].children[0].el;
        expect(wrapper.snapshot).toMatchSnapshot();
        expect(firstButtonText).toEqual('Return to course outline');
        expect(secondButtonText).toEqual('Try again');
      });
      it('the first button should correspond to returning to the unit page', () => {
        const returnToUnitPageWrapper = shallow(<ErrorPage {...passedProps} unitData={unitData} />);
        expect(returnToUnitPageWrapper.snapshot).toMatchSnapshot();
        const firstButtonText = returnToUnitPageWrapper.instance.findByType('Button')[0].children[0].el;
        const secondButtonText = returnToUnitPageWrapper.instance.findByType('Button')[1].children[0].el;
        expect(returnToUnitPageWrapper.snapshot).toMatchSnapshot();
        expect(firstButtonText).toEqual('Return to unit page');
        expect(secondButtonText).toEqual('Try again');
      });
    });
    it('should have custom message', () => {
      const customMessageText = wrapper.instance.findByType('div')[0].children[0].children[0].el;
      expect(wrapper.snapshot).toMatchSnapshot();
      expect(customMessageText).toEqual('cUStomMEssagE');
    });
  });
  describe('mapStateToProps() function', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('unitData should equal unitUrl from app.unitUrl', () => {
      expect(
        mapStateToProps(testState).unitData,
      ).toEqual(selectors.app.unitUrl(testState));
    });
  });
});
