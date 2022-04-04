import React from 'react';
import { shallow } from 'enzyme';
import { FetchErrorAlert, mapStateToProps } from './FetchErrorAlert';
import { selectors } from '../../../../data/redux';
import { RequestKeys } from '../../../../data/constants/requests';

jest.mock('../../../../data/redux', () => ({
  selectors: {
    requests: {
      isFailed: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
  },
}));

describe('FetchErrorAlert', () => {
  describe('Snapshots', () => {
    test('snapshot:  is ErrorAlert with Message error (ErrorAlert)', () => {
      expect(shallow(<FetchErrorAlert isFetchError />)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('isFetchError from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).isFetchError,
      ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.fetchImages }));
    });
  });
});
