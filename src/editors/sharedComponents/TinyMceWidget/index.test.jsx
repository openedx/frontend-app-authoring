import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import SourceCodeModal from '../SourceCodeModal';
import ImageUploadModal from '../ImageUploadModal';
import { imgModalToggle, sourceCodeModalToggle } from './hooks';
import { TinyMceWidgetInternal as TinyMceWidget } from '.';

const staticUrl = '/assets/sOmEaSsET';

// Per https://github.com/tinymce/tinymce-react/issues/91 React unit testing in JSDOM is not supported by tinymce.
// Consequently, mock the Editor out.
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'TiNYmCE EDitOR',
  };
});

jest.mock('../ImageUploadModal', () => 'ImageUploadModal');
jest.mock('../SourceCodeModal', () => 'SourceCodeModal');

jest.mock('./hooks', () => ({
  editorConfig: jest.fn(args => ({ editorConfig: args })),
  imgModalToggle: jest.fn(() => ({
    isImgOpen: true,
    openImgModal: jest.fn().mockName('openModal'),
    closeImgModal: jest.fn().mockName('closeModal'),
  })),
  sourceCodeModalToggle: jest.fn(() => ({
    isSourceCodeOpen: true,
    openSourceCodeModal: jest.fn().mockName('openModal'),
    closeSourceCodeModal: jest.fn().mockName('closeModal'),
  })),
  selectedImage: jest.fn(() => ({
    selection: 'hooks.selectedImage.selection',
    setSelection: jest.fn().mockName('hooks.selectedImage.setSelection'),
    clearSelection: jest.fn().mockName('hooks.selectedImage.clearSelection'),
  })),
  useImages: jest.fn(() => ({ imagesRef: { current: [{ externalUrl: staticUrl }] } })),
}));

describe('TinyMceWidget', () => {
  const props = {
    editorType: 'text',
    editorRef: { current: { value: 'something' } },
    isLibrary: false,
    images: { sOmEaSsET: { staTICUrl: staticUrl } },
    lmsEndpointUrl: 'sOmEvaLue.cOm',
    studioEndpointUrl: 'sOmEoThERvaLue.cOm',
    disabled: false,
    id: 'sOMeiD',
    updateContent: () => ({}),
    learningContextId: 'course+org+run',
  };
  describe('snapshots', () => {
    imgModalToggle.mockReturnValue({
      isImgOpen: false,
      openImgModal: jest.fn().mockName('modal.openModal'),
      closeImgModal: jest.fn().mockName('modal.closeModal'),
    });
    sourceCodeModalToggle.mockReturnValue({
      isSourceCodeOpen: false,
      openSourceCodeModal: jest.fn().mockName('modal.openModal'),
      closeSourceCodeModal: jest.fn().mockName('modal.closeModal'),
    });
    test('renders as expected with default behavior', () => {
      expect(shallow(<TinyMceWidget {...props} />).snapshot).toMatchSnapshot();
    });
    test('SourcecodeModal is not rendered', () => {
      const wrapper = shallow(<TinyMceWidget {...props} editorType="problem" />);
      expect(wrapper.snapshot).toMatchSnapshot();
      expect(wrapper.instance.findByType(SourceCodeModal).length).toBe(0);
    });
    test('ImageUploadModal is not rendered', () => {
      const wrapper = shallow(<TinyMceWidget {...props} enableImageUpload={false} />);
      expect(wrapper.snapshot).toMatchSnapshot();
      expect(wrapper.instance.findByType(ImageUploadModal).length).toBe(0);
    });
  });
});
