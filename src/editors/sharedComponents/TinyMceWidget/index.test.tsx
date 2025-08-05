import React from 'react';
import {
  screen, initializeMocks,
} from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import * as hooks from './hooks';
import TinyMceWidget from '.';

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
  beforeEach(() => initializeMocks());

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
    editorContentHtml: undefined,
    enableImageUpload: undefined,
    onChange: undefined,
    staticRootUrl: undefined,
  };

  describe('render', () => {
    jest.spyOn(hooks, 'imgModalToggle').mockReturnValue({
      isImgOpen: false,
      openImgModal: jest.fn().mockName('modal.openModal'),
      closeImgModal: jest.fn().mockName('modal.closeModal'),
    });
    jest.spyOn(hooks, 'sourceCodeModalToggle').mockReturnValue({
      isSourceCodeOpen: false,
      openSourceCodeModal: jest.fn().mockName('modal.openModal'),
      closeSourceCodeModal: jest.fn().mockName('modal.closeModal'),
    });

    test('renders as expected with default behavior', () => {
      const { container } = editorRender(<TinyMceWidget {...props} />);
      expect(screen.getByText('TiNYmCE EDitOR')).toBeInTheDocument();
      expect(container.querySelector('sourcecodemodal')).toBeInTheDocument();
      expect(container.querySelector('imageuploadmodal')).toBeInTheDocument();
    });

    test('SourcecodeModal is not rendered', () => {
      const { container } = editorRender(<TinyMceWidget {...props} editorType="problem" />);
      expect(container.querySelector('imageuploadmodal')).toBeInTheDocument();
      expect(container.querySelector('sourcecodemodal')).not.toBeInTheDocument();
    });

    test('ImageUploadModal is not rendered', () => {
      const { container } = editorRender(<TinyMceWidget {...props} enableImageUpload={false} />);
      expect(container.querySelector('imageuploadmodal')).not.toBeInTheDocument();
      expect(container.querySelector('sourcecodemodal')).toBeInTheDocument();
    });
  });
});
