import React from 'react';
import '@testing-library/jest-dom';
import { shallow } from 'enzyme';
import VideoUploadEditor, { VideoUploader } from '.';
import { formatMessage } from '../../../testUtils';

const defaultEditorProps = {
  onClose: jest.fn().mockName('props.onClose'),
  intl: { formatMessage },
  uploadVideo: jest.fn(),
};

const defaultUploaderProps = {
  onUpload: jest.fn(),
  errorMessage: null,
  intl: { formatMessage },
};

describe('VideoUploader', () => {
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<VideoUploader {...defaultUploaderProps} />)).toMatchSnapshot();
    });
    test('renders as expected with error message', () => {
      const defaultUploaderPropsWithError = { ...defaultUploaderProps, errorMessages: 'Some Error' };
      expect(shallow(<VideoUploader {...defaultUploaderPropsWithError} />)).toMatchSnapshot();
    });
  });
});

describe('VideoUploaderEdirtor', () => {
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<VideoUploadEditor {...defaultEditorProps} />)).toMatchSnapshot();
    });
  });
});
