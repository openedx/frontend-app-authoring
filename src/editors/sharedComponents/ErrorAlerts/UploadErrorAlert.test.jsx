import React from 'react';
import { shallow } from 'enzyme';
import { UploadErrorAlert } from './UploadErrorAlert';

jest.mock('../../data/redux', () => ({
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
});
