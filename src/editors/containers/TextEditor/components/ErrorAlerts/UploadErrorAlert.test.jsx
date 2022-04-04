import React from 'react';
import { shallow } from 'enzyme';
import { UploadErrorAlert, mapStateToProps } from './UploadErrorAlert';
import { selectors } from '../../../../data/redux';
import { RequestKeys } from '../../../../data/constants/requests';

jest.mock('../../../../data/redux', () => ({
  selectors: {
    requests: {
      isFailed: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
  },
}));

describe('UploadErrorAlert', () => {
  describe('Snapshots', () => {
    test('snapshot:  is ErrorAlert with Message error (ErrorAlert)', () => {
      expect(shallow(<UploadErrorAlert isUploadError />)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('isUploadError from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).isUploadError,
      ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.uploadImage }));
    });
  });
});
