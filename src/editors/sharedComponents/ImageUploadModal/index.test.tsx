/* eslint-disable no-import-assign */
import React from 'react';
import { render, initializeMocks } from '@src/testUtils';
import { keyStore } from '../../utils';
import * as tinyMCEKeys from '../../data/constants/tinyMCE';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import { ImageUploadModalInternal as ImageUploadModal, hooks, propsString } from '.';
import * as tinyMceHooks from '../TinyMceWidget/hooks';

jest.mock('./ImageSettingsModal', () => 'ImageSettingsModal');
jest.mock('./SelectImageModal', () => 'SelectImageModal');

const hookKeys = keyStore(hooks);

const settings = {
  altText: 'aLt tExt',
  isDecorative: false,
  dimensions: {
    width: 2022,
    height: 1619,
  },
};

const mockImage = {
  displayName: 'DALL·E 2023-03-10.png',
  contentType: 'image/png',
  dateAdded: 1682009100000,
  url: '/asset-v1:TestX+Test01+Test0101+type@asset+block@DALL_E_2023-03-10.png',
  externalUrl: 'http://localhost:18000/asset-v1:TestX+Test01+Test0101+type@asset+block@DALL_E_2023-03-10.png',
  portableUrl: '/static/DALL_E_2023-03-10.png',
  thumbnail: '/asset-v1:TestX+Test01+Test0101+type@thumbnail+block@DALL_E_2023-03-10.jpg',
  locked: false,
  staticFullUrl: '/assets/courseware/v1/af2bf9ac70804e54c534107160a8e51e/asset-v1:TestX+Test01+Test0101+type@asset+block@DALL_E_2023-03-10.png',
  id: 'asset-v1:TestX+Test01+Test0101+type@asset+block@DALL_E_2023-03-10.png',
  width: 100,
  height: 150,
};

let mockImagesRef = { current: [mockImage] };

describe('ImageUploadModal', () => {
  beforeEach(() => {
    mockImagesRef = { current: [mockImage] };
  });

  describe('hooks', () => {
    describe('imgTag', () => {
      const selection = { externalUrl: 'sOmEuRl.cOm' };
      const url = 'uRl.cOm';
      const expected = {
        src: url,
        alt: settings.altText,
        width: settings.dimensions.width,
        height: settings.dimensions.height,
      };
      const testImgTag = (args) => {
        const output = hooks.imgTag({
          settings: args.settings,
          selection,
          lmsEndpointUrl: 'sOmE',
          editorType: 'tinyMCE',
          isLibrary: true,
        });
        expect(output).toEqual(`<img ${propsString(args.expected)} />`);
      };
      test('It returns a html string which matches an image tag', () => {
        testImgTag({ settings, expected });
      });
      test('If isDecorative is true, alt text is an empty string', () => {
        testImgTag({
          settings: { ...settings, isDecorative: true },
          expected: { ...expected, alt: '' },
        });
      });
    });
    describe('createSaveCallback', () => {
      const updateImageDimensionsSpy = jest.spyOn(tinyMceHooks, 'updateImageDimensions');
      const close = jest.fn();
      const execCommandMock = jest.fn();
      const editorRef = { current: { some: 'dATa', execCommand: execCommandMock } };
      const setSelection = jest.fn();
      const selection = { externalUrl: 'sOmEuRl.cOm' };
      const lmsEndpointUrl = 'sOmE';
      const images = mockImagesRef;
      let output;
      const newImage = {
        altText: settings.altText,
        externalUrl: selection.externalUrl,
        width: settings.dimensions.width,
        height: settings.dimensions.height,
      };

      beforeEach(() => {
        output = hooks.createSaveCallback({
          close, settings, images, editorRef, setSelection, selection, lmsEndpointUrl,
        });
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      test(
        `It creates a callback, that when called, inserts to the editor, sets the selection to the current element,
        adds new image to the images ref, and calls close`,
        () => {
          const imgTagResult = '<img src="sOmEuRl.cOm" alt="aLt tExt" />';
          jest.spyOn(hooks, hookKeys.imgTag)
            .mockImplementationOnce((props) => {
              if (!props) { return ''; }
              // Return a string as the real imgTag would
              return `<img src="${props.selection?.externalUrl ?? ''}" alt="${props.settings?.altText ?? ''}" />`;
            });

          expect(execCommandMock).not.toBeCalled();
          expect(setSelection).not.toBeCalled();
          expect(close).not.toBeCalled();
          expect(images.current).toEqual([mockImage]);

          output(settings);

          expect(execCommandMock).toBeCalledWith(
            tinyMCEKeys.commands.insertContent,
            false,
            imgTagResult,
          );
          expect(setSelection).toBeCalledWith(newImage);
          expect(updateImageDimensionsSpy.mock.calls.length).toBe(1);
          expect(updateImageDimensionsSpy).toBeCalledWith({
            images: [mockImage],
            url: selection.externalUrl,
            width: settings.dimensions.width,
            height: settings.dimensions.height,
          });
          expect(updateImageDimensionsSpy.mock.results[0].value.foundMatch).toBe(false);
          expect(images.current).toEqual([mockImage, newImage]);
          expect(close).toBeCalled();
          expect(setSelection).toBeCalledWith(null);
        },
      );
    });
    describe('onClose', () => {
      it('takes and calls clearSelection and close callbacks', () => {
        const clearSelection = jest.fn();
        const close = jest.fn();
        hooks.onClose({ clearSelection, close })();
        expect(clearSelection).toHaveBeenCalled();
        expect(close).toHaveBeenCalled();
      });
    });
  });

  describe('component', () => {
    const props = {
      editorRef: { current: null },
      isOpen: false,
      close: jest.fn().mockName('props.close'),
      clearSelection: jest.fn().mockName('props.clearSelection'),
      selection: { some: 'images', externalUrl: 'sOmEuRl.cOm' },
      setSelection: jest.fn().mockName('props.setSelection'),
      lmsEndpointUrl: 'sOmE',
      images: {
        current: [mockImage],
      },
    };
    beforeEach(() => {
      initializeMocks();
    });
    beforeAll(() => {
      jest.spyOn(hooks, 'createSaveCallback').mockImplementation(jest.fn().mockName('hooks.createSaveCallback'));
      jest.spyOn(hooks, 'onClose').mockImplementation(jest.fn().mockName('hooks.onClose'));
    });
    test('snapshot: with selection content (ImageSettingsUpload)', () => {
      const { container } = render(<ImageUploadModal {...props} selection={{ externalUrl: 'url.url' }} />);
      expect(container.querySelector('ImageSettingsModal')).toBeInTheDocument();
    });
    test('snapshot: selection has no externalUrl (Select Image Modal)', () => {
      const { container } = render(<ImageUploadModal {...props} selection={{ }} />);
      expect(container.querySelector('SelectImageModal')).toBeInTheDocument();
    });
    test('snapshot: no selection (Select Image Modal)', () => {
      const { container } = render(<ImageUploadModal {...props} selection={null} />);
      expect(container.querySelector('SelectImageModal')).toBeInTheDocument();
    });
  });
});
