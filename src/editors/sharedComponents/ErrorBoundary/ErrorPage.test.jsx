import React from 'react';
import { shallow } from 'enzyme';
import { selectors } from '../../data/redux';
import { formatMessage } from '../../../testUtils';
import { ErrorPage, mapStateToProps } from './ErrorPage';

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
      const buttonText = wrapper.find('Button').text();
      expect(wrapper).toMatchSnapshot();
      expect(buttonText).toEqual('Try again');
    });
  });

  describe('rendered with pass through props defined', () => {
    const wrapper = shallow(<ErrorPage {...passedProps} />);
    describe('shows two buttons', () => {
      it('the first button should correspond to returning to the course outline', () => {
        const firstButtonText = wrapper.find('Button').at(0).text();
        const secondButtonText = wrapper.find('Button').at(1).text();
        expect(wrapper).toMatchSnapshot();
        expect(firstButtonText).toEqual('Return to course outline');
        expect(secondButtonText).toEqual('Try again');
      });
      it('the first button should correspond to returning to the unit page', () => {
        const returnToUnitPageWrapper = shallow(<ErrorPage {...passedProps} unitData={unitData} />);
        expect(returnToUnitPageWrapper).toMatchSnapshot();
        const firstButtonText = returnToUnitPageWrapper.find('Button').at(0).text();
        const secondButtonText = returnToUnitPageWrapper.find('Button').at(1).text();
        expect(returnToUnitPageWrapper).toMatchSnapshot();
        expect(firstButtonText).toEqual('Return to unit page');
        expect(secondButtonText).toEqual('Try again');
      });
    });
    it('should have custom message', () => {
      const customMessageText = wrapper.find('div').children().at(0).text();
      expect(wrapper).toMatchSnapshot();
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
