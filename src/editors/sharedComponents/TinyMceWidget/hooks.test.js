import 'CourseAuthoring/editors/setupEditorTest';
import { getConfig } from '@edx/frontend-platform';
import { MockUseState } from '../../testUtils';

import * as tinyMCE from '../../data/constants/tinyMCE';
import { keyStore } from '../../utils';
import pluginConfig from './pluginConfig';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createRef: jest.fn(val => ({ ref: val })),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

const state = new MockUseState(module);
const moduleKeys = keyStore(module);

let hook;
let output;

const editorImageWidth = 2022;
const editorImageHeight = 1619;

const mockNode = {
  src: 'http://localhost:18000/asset-v1:TestX+Test01+Test0101+type@asset+block/DALL_E_2023-03-10.png',
  alt: 'aLt tExt',
  width: editorImageWidth,
  height: editorImageHeight,
};

const initialContentHeight = 150;
const initialContentWidth = 100;
const mockNodeWithInitialContentDimensions = { ...mockNode, width: initialContentWidth, height: initialContentHeight };
const mockEditorWithSelection = { selection: { getNode: () => mockNode } };

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
  width: initialContentWidth,
  height: initialContentHeight,
};

const mockImages = {
  [mockImage.id]: mockImage,
};

const mockEditorContentHtml = `
  <p>
    <img
      src="/assets/courseware/v1/7b41573468a356ca8dc975158e388386/asset-v1:TestX+Test01+Test0101+type@asset+block/DALL_E_2023-03-10.png"
      alt=""
      width="${initialContentWidth}"
      height="${initialContentHeight}">
    </img>
  </p>
`;
const baseAssetUrl = 'asset-v1:org+test+run+type@asset+block';

const mockImagesRef = { current: [mockImage] };

describe('TinyMceEditor hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImagesRef.current = [mockImage];
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.isImageModalOpen);
    state.testGetter(state.keys.isSourceCodeModalOpen);
    state.testGetter(state.keys.imageSelection);
  });

  describe('non-state hooks', () => {
    beforeEach(() => { state.mock(); });
    afterEach(() => { state.restore(); });

    describe('detectImageMatchingError', () => {
      it('should detect an error if the matchingImages array is empty', () => {
        const matchingImages = [];
        const tinyMceHTML = mockNode;
        expect(module.detectImageMatchingError({ matchingImages, tinyMceHTML })).toBe(true);
      });
      it('should detect an error if the matchingImages array has more than one element', () => {
        const matchingImages = [mockImage, mockImage];
        const tinyMceHTML = mockNode;
        expect(module.detectImageMatchingError({ matchingImages, tinyMceHTML })).toBe(true);
      });
      it('should detect an error if the image id does not match the tinyMceHTML src', () => {
        const matchingImages = [{ ...mockImage, id: 'some-other-id' }];
        const tinyMceHTML = mockNode;
        expect(module.detectImageMatchingError({ matchingImages, tinyMceHTML })).toBe(true);
      });
      it('should detect an error if the image id matches the tinyMceHTML src, but width and height do not match', () => {
        const matchingImages = [{ ...mockImage, width: 100, height: 100 }];
        const tinyMceHTML = mockNode;
        expect(module.detectImageMatchingError({ matchingImages, tinyMceHTML })).toBe(true);
      });
      it('should not detect any errors if id matches src, and width and height match', () => {
        const matchingImages = [{ ...mockImage, width: mockNode.width, height: mockNode.height }];
        const tinyMceHTML = mockNode;
        expect(module.detectImageMatchingError({ matchingImages, tinyMceHTML })).toBe(false);
      });
    });

    describe('setupCustomBehavior', () => {
      test('It calls addButton and addToggleButton in the editor, but openModal is not called', () => {
        const addButton = jest.fn();
        const addIcon = jest.fn();
        const addToggleButton = jest.fn();
        const openImgModal = jest.fn();
        const openSourceCodeModal = jest.fn();
        const setImage = jest.fn();
        const updateContent = jest.fn();
        const editorType = 'expandable';
        const lmsEndpointUrl = getConfig().LMS_BASE_URL;
        const editor = {
          ui: { registry: { addButton, addToggleButton, addIcon } },
          on: jest.fn(),
        };
        const mockOpenModalWithImage = args => ({ openModalWithSelectedImage: args });
        const expectedSettingsAction = mockOpenModalWithImage({ editor, setImage, openImgModal });
        const toggleCodeFormatting = expect.any(Function);
        const toggleLabelFormatting = expect.any(Function);
        const setupCodeFormatting = expect.any(Function);
        jest.spyOn(module, moduleKeys.openModalWithSelectedImage)
          .mockImplementationOnce(mockOpenModalWithImage);

        output = module.setupCustomBehavior({
          editorType,
          updateContent,
          openImgModal,
          openSourceCodeModal,
          setImage,
          lmsEndpointUrl,
        })(editor);
        expect(addIcon.mock.calls).toEqual([['textToSpeech', tinyMCE.textToSpeechIcon]]);
        expect(addButton.mock.calls).toEqual([
          [tinyMCE.buttons.imageUploadButton, { icon: 'image', tooltip: 'Add Image', onAction: openImgModal }],
          [tinyMCE.buttons.editImageSettings, { icon: 'image', tooltip: 'Edit Image Settings', onAction: expectedSettingsAction }],
          [tinyMCE.buttons.code, { text: 'HTML', tooltip: 'Source code', onAction: openSourceCodeModal }],
          ['customLabelButton', {
            icon: 'textToSpeech',
            text: 'Label',
            tooltip: 'Apply a "Question" label to specific text, recognized by screen readers. Recommended to improve accessibility.',
            onAction: toggleLabelFormatting,
          }],
        ]);
        expect(addToggleButton.mock.calls).toEqual([
          [tinyMCE.buttons.codeBlock, {
            icon: 'sourcecode', tooltip: 'Code Block', onAction: toggleCodeFormatting, onSetup: setupCodeFormatting,
          }],
        ]);
        expect(openImgModal).not.toHaveBeenCalled();
        expect(editor.on).toHaveBeenCalled();
      });
    });

    describe('parseContentForLabels', () => {
      test('it calls getContent and updateQuestion for some content', () => {
        const editor = { getContent: jest.fn(() => '<p><label>Some question label</label></p><p>some content <label>around a label</label> followed by more text</p><img src="/static/soMEImagEURl1.jpeg"/>') };
        const updateContent = jest.fn();
        const content = '<p><label>Some question label</label></p><p>some content </p><p><label>around a label</label></p><p> followed by more text</p><img src="/static/soMEImagEURl1.jpeg"/>';
        module.parseContentForLabels({ editor, updateContent });
        expect(editor.getContent).toHaveBeenCalled();
        expect(updateContent).toHaveBeenCalledWith(content);
      });
      test('it calls getContent and updateQuestion for empty content', () => {
        const editor = { getContent: jest.fn(() => '') };
        const updateContent = jest.fn();
        const content = '';
        module.parseContentForLabels({ editor, updateContent });
        expect(editor.getContent).toHaveBeenCalled();
        expect(updateContent).toHaveBeenCalledWith(content);
      });
    });

    describe('replaceStaticWithAsset', () => {
      const initialContent = `<img src="/static/soMEImagEURl1.jpeg"/><a href="/assets/v1/${baseAssetUrl}/test.pdf">test</a><img src="/${baseAssetUrl}@correct.png" /><img src="/${baseAssetUrl}/correct.png" />`;
      const learningContextId = 'course-v1:org+test+run';
      const lmsEndpointUrl = getConfig().LMS_BASE_URL;
      it('returns updated src for text editor to update content', () => {
        const expected = `<img src="/${baseAssetUrl}@soMEImagEURl1.jpeg"/><a href="/${baseAssetUrl}@test.pdf">test</a><img src="/${baseAssetUrl}@correct.png" /><img src="/${baseAssetUrl}@correct.png" />`;
        const actual = module.replaceStaticWithAsset({ initialContent, learningContextId });
        expect(actual).toEqual(expected);
      });
      it('returns updated src with absolute url for expandable editor to update content', () => {
        const editorType = 'expandable';
        const expected = `<img src="${lmsEndpointUrl}/${baseAssetUrl}@soMEImagEURl1.jpeg"/><a href="${lmsEndpointUrl}/${baseAssetUrl}@test.pdf">test</a><img src="${lmsEndpointUrl}/${baseAssetUrl}@correct.png" /><img src="${lmsEndpointUrl}/${baseAssetUrl}@correct.png" />`;
        const actual = module.replaceStaticWithAsset({
          initialContent,
          editorType,
          lmsEndpointUrl,
          learningContextId,
        });
        expect(actual).toEqual(expected);
      });
      it('returns false when there are no srcs to update', () => {
        const content = '<div>Hello world!</div>';
        const actual = module.replaceStaticWithAsset({ initialContent: content, learningContextId });
        expect(actual).toBeFalsy();
      });
    });
    describe('setAssetToStaticUrl', () => {
      it('returns content with updated img links', () => {
        const editorValue = `<img src="/${baseAssetUrl}/soME_ImagE_URl1"/> <a href="/${baseAssetUrl}@soMEImagEURl">testing link</a>`;
        const lmsEndpointUrl = getConfig().LMS_BASE_URL;
        const content = module.setAssetToStaticUrl({ editorValue, lmsEndpointUrl });
        expect(content).toEqual('<img src="/static/soME_ImagE_URl1"/> <a href="/static/soMEImagEURl">testing link</a>');
      });
    });

    describe('editorConfig', () => {
      const props = {
        editorContentHtml: null,
        editorType: 'text',
        lmsEndpointUrl: getConfig().LMS_BASE_URL,
        studioEndpointUrl: getConfig().STUDIO_BASE_URL,
        images: mockImagesRef,
        isLibrary: false,
        learningContextId: 'course+org+run',
      };
      const evt = 'fakeEvent';
      const editor = 'myEditor';
      const setupCustomBehavior = args => ({ setupCustomBehavior: args });

      beforeEach(() => {
        props.setEditorRef = jest.fn();
        props.openImgModal = jest.fn();
        props.openSourceCodeModal = jest.fn();
        props.initializeEditor = jest.fn();
        props.updateContent = jest.fn();
        jest.spyOn(module, moduleKeys.setupCustomBehavior)
          .mockImplementationOnce(setupCustomBehavior);
        output = module.editorConfig(props);
      });

      describe('text editor plugins and toolbar', () => {
        test('It configures plugins and toolbars correctly', () => {
          const pluginProps = {
            isLibrary: props.isLibrary,
            editorType: props.editorType,
          };
          expect(output.init.plugins).toEqual(pluginConfig(pluginProps).plugins);
          expect(output.init.imagetools_toolbar).toEqual(pluginConfig(pluginProps).imageToolbar);
          expect(output.init.toolbar).toEqual(pluginConfig(pluginProps).toolbar);
          Object.keys(pluginConfig(pluginProps).config).forEach(key => {
            expect(output.init[key]).toEqual(pluginConfig(pluginProps).config[key]);
          });
          // Commented out as we investigate whether this is only needed for image proxy
          // expect(output.init.imagetools_cors_hosts).toMatchObject([props.lmsEndpointUrl]);
        });
      });
      describe('text editor plugins and toolbar for content library', () => {
        test('It configures plugins and toolbars correctly', () => {
          const pluginProps = {
            isLibrary: true,
            editorType: props.editorType,
          };
          output = module.editorConfig({ ...props, isLibrary: true });
          expect(output.init.plugins).toEqual(pluginConfig(pluginProps).plugins);
          expect(output.init.imagetools_toolbar).toEqual(pluginConfig(pluginProps).imageToolbar);
          expect(output.init.toolbar).toEqual(pluginConfig(pluginProps).toolbar);
          expect(output.init.quickbars_insert_toolbar).toEqual(pluginConfig(pluginProps).quickbarsInsertToolbar);
          expect(output.init.quickbars_selection_toolbar).toEqual(pluginConfig(pluginProps).quickbarsSelectionToolbar);
          Object.keys(pluginConfig(pluginProps).config).forEach(key => {
            expect(output.init[key]).toEqual(pluginConfig(pluginProps).config[key]);
          });
        });
      });
      describe('problem editor question plugins and toolbar', () => {
        test('It configures plugins and toolbars correctly', () => {
          const pluginProps = {
            isLibrary: props.isLibrary,
            editorType: 'question',
            placeholder: 'soMEtExT',
          };
          output = module.editorConfig({
            ...props,
            editorType: 'question',
            placeholder: 'soMEtExT',
          });
          expect(output.init.plugins).toEqual(pluginConfig(pluginProps).plugins);
          expect(output.init.imagetools_toolbar).toEqual(pluginConfig(pluginProps).imageToolbar);
          expect(output.init.toolbar).toEqual(pluginConfig(pluginProps).toolbar);
          expect(output.init.quickbars_insert_toolbar).toEqual(pluginConfig(pluginProps).quickbarsInsertToolbar);
          expect(output.init.quickbars_selection_toolbar).toEqual(pluginConfig(pluginProps).quickbarsSelectionToolbar);
          Object.keys(pluginConfig(pluginProps).config).forEach(key => {
            expect(output.init[key]).toEqual(pluginConfig(pluginProps).config[key]);
          });
        });
      });

      describe('expandable text area plugins and toolbar', () => {
        test('It configures plugins, toolbars, and quick toolbars correctly', () => {
          const pluginProps = {
            isLibrary: props.isLibrary,
            editorType: 'expandable',
            placeholder: 'soMEtExT',
          };
          output = module.editorConfig({
            ...props,
            editorType: 'expandable',
            placeholder: 'soMEtExT',
          });
          expect(output.init.plugins).toEqual(pluginConfig(pluginProps).plugins);
          expect(output.init.imagetools_toolbar).toEqual(pluginConfig(pluginProps).imageToolbar);
          expect(output.init.toolbar).toEqual(pluginConfig(pluginProps).toolbar);
          expect(output.init.quickbars_insert_toolbar).toEqual(pluginConfig(pluginProps).quickbarsInsertToolbar);
          expect(output.init.quickbars_selection_toolbar).toEqual(pluginConfig(pluginProps).quickbarsSelectionToolbar);
          Object.keys(pluginConfig(pluginProps).config).forEach(key => {
            expect(output.init[key]).toEqual(pluginConfig(pluginProps).config[key]);
          });
        });
      });
      test('It creates an onInit which calls initializeEditor and setEditorRef', () => {
        output.onInit(evt, editor);
        expect(props.setEditorRef).toHaveBeenCalledWith(editor);
        expect(props.initializeEditor).toHaveBeenCalled();
      });
      test('It sets the blockvalue to be empty string by default', () => {
        expect(output.initialValue).toBe('');
      });
      test('It sets the blockvalue to be the blockvalue if nonempty', () => {
        const editorContentHtml = 'SomE hTML content';
        output = module.editorConfig({ ...props, editorContentHtml });
        expect(output.initialValue).toBe(editorContentHtml);
      });

      it('calls setupCustomBehavior on setup', () => {
        expect(output.init.setup).toEqual(
          setupCustomBehavior({
            editorType: props.editorType,
            updateContent: props.updateContent,
            openImgModal: props.openImgModal,
            openSourceCodeModal: props.openSourceCodeModal,
            setImage: props.setSelection,
            images: mockImagesRef,
            lmsEndpointUrl: props.lmsEndpointUrl,
            learningContextId: props.learningContextId,
          }),
        );
      });
    });

    describe('imgModalToggle', () => {
      const hookKey = state.keys.isImageModalOpen;
      beforeEach(() => {
        hook = module.imgModalToggle();
      });
      test('isOpen: state value', () => {
        expect(hook.isImgOpen).toEqual(state.stateVals[hookKey]);
      });
      test('openModal: calls setter with true', () => {
        hook.openImgModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(true);
      });
      test('closeModal: calls setter with false', () => {
        hook.closeImgModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(false);
      });
    });

    describe('sourceCodeModalToggle', () => {
      const editorRef = { current: { focus: jest.fn() } };
      const hookKey = state.keys.isSourceCodeModalOpen;
      beforeEach(() => {
        hook = module.sourceCodeModalToggle(editorRef);
      });
      test('isOpen: state value', () => {
        expect(hook.isSourceCodeOpen).toEqual(state.stateVals[hookKey]);
      });
      test('openModal: calls setter with true', () => {
        hook.openSourceCodeModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(true);
      });
      test('closeModal: calls setter with false', () => {
        hook.closeSourceCodeModal();
        expect(state.setState[hookKey]).toHaveBeenCalledWith(false);
      });
    });

    describe('openModalWithSelectedImage', () => {
      const setImage = jest.fn();
      const openImgModal = jest.fn();
      let editor;

      beforeEach(() => {
        editor = { selection: { getNode: () => mockNodeWithInitialContentDimensions } };
        module.openModalWithSelectedImage({
          editor, images: mockImagesRef, openImgModal, setImage,
        })();
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      test('updates React state for selected image to be value stored in editor, adding dimensions from images ref', () => {
        expect(setImage).toHaveBeenCalledWith({
          externalUrl: mockNode.src,
          altText: mockNode.alt,
          width: mockImage.width,
          height: mockImage.height,
        });
      });

      test('opens image setting modal', () => {
        expect(openImgModal).toHaveBeenCalled();
      });

      describe('when images cannot be successfully matched', () => {
        beforeEach(() => {
          editor = { selection: { getNode: () => mockNode } };
          module.openModalWithSelectedImage({
            editor, images: mockImagesRef, openImgModal, setImage,
          })();
        });

        afterEach(() => {
          jest.clearAllMocks();
        });

        test('updates React state for selected image to be value stored in editor, setting dimensions to null', () => {
          expect(setImage).toHaveBeenCalledWith({
            externalUrl: mockNode.src,
            altText: mockNode.alt,
            width: null,
            height: null,
          });
        });
      });
    });

    describe('selectedImage hooks', () => {
      const val = { a: 'VaLUe' };
      beforeEach(() => {
        hook = module.selectedImage(val);
      });
      test('selection: state value', () => {
        expect(hook.selection).toEqual(state.stateVals[state.keys.imageSelection]);
      });
      test('setSelection: setter for value', () => {
        expect(hook.setSelection).toEqual(state.setState[state.keys.imageSelection]);
      });
      test('clearSelection: calls setter with null', () => {
        expect(hook.setSelection).not.toHaveBeenCalled();
        hook.clearSelection();
        expect(hook.setSelection).toHaveBeenCalledWith(null);
      });
    });
    describe('imageMatchRegex', () => {
      it('should match a valid image url using "@" separators', () => {
        expect(
          'http://localhost:18000/asset-v1:TestX+Test01+Test0101+type@asset+block@image-name.png',
        ).toMatch(module.imageMatchRegex);
      });
      it('should match a url including the keywords "asset-v1", "type", "block" in that order', () => {
        expect(
          'https://some.completely/made.up///url-with.?!keywords/asset-v1:Some-asset-key?type=some.type.key!block@image-name.png',
        ).toMatch(module.imageMatchRegex);
      });
      it('should not match a url excluding the keyword "asset-v1"', () => {
        expect(
          'https://some.completely/made.up///url-with.?!keywords/Some-asset-key?type=some.type.key!block@image-name.png',
        ).not.toMatch(module.imageMatchRegex);
      });
      it('should match an identifier including the keywords "asset-v1", "type", "block" using "/" separators', () => {
        expect(
          'asset-v1:TestX+Test01+Test0101+type/asset+block/image-name.png',
        ).toMatch(module.imageMatchRegex);
      });
      it('should capture values for the keys "asset-v1", "type", "block"', () => {
        const match = 'asset-v1:TestX+Test01+Test0101+type/asset+block/image-name.png'.match(module.imageMatchRegex);
        expect(match[1]).toBe('TestX+Test01+Test0101');
        expect(match[2]).toBe('asset');
        expect(match[3]).toBe('image-name.png');
      });
    });

    describe('matchImageStringsByIdentifiers', () => {
      it('should be true for an image url and identifier that have the same values for asset-v1, type, and block', () => {
        const url = 'http://localhost:18000/asset-v1:TestX+Test01+Test0101+type@asset+block@image-name.png';
        const id = 'asset-v1:TestX+Test01+Test0101+type/asset+block/image-name.png';
        expect(module.matchImageStringsByIdentifiers(url, id)).toBe(true);
      });
      it('should be false for an image url and identifier that have different values for block', () => {
        const url = 'http://localhost:18000/asset-v1:TestX+Test01+Test0101+type@asset+block@image-name.png';
        const id = 'asset-v1:TestX+Test01+Test0101+type/asset+block/different-image-name.png';
        expect(module.matchImageStringsByIdentifiers(url, id)).toBe(false);
      });
      it('should return null if it doesnt receive two strings as input', () => {
        expect(module.matchImageStringsByIdentifiers(['a'], { b: 'c ' })).toBe(null);
      });
      it('should return undefined if the strings dont match the regex at all', () => {
        expect(module.matchImageStringsByIdentifiers('wrong-url', 'blub')).toBe(undefined);
      });
    });

    describe('addImagesAndDimensionsToRef', () => {
      it('should add images to ref', () => {
        const imagesRef = { current: null };
        module.addImagesAndDimensionsToRef(
          {
            imagesRef,
            images: mockImages,
            editorContentHtml: mockEditorContentHtml,
          },
        );
        expect(imagesRef.current).toEqual([mockImage]);
        expect(imagesRef.current[0].width).toBe(initialContentWidth);
        expect(imagesRef.current[0].height).toBe(initialContentHeight);
      });
    });

    describe('getImageResizeHandler', () => {
      const setImage = jest.fn();

      it('sets image ref and state to new width', () => {
        expect(mockImagesRef.current[0].width).toBe(initialContentWidth);
        module.getImageResizeHandler({ editor: mockEditorWithSelection, imagesRef: mockImagesRef, setImage })();

        expect(setImage).toHaveBeenCalledTimes(1);
        expect(setImage).toHaveBeenCalledWith(expect.objectContaining({ width: editorImageWidth }));
        expect(mockImagesRef.current[0].width).not.toBe(initialContentWidth);
        expect(mockImagesRef.current[0].width).toBe(editorImageWidth);
      });
    });

    describe('updateImageDimensions', () => {
      const unchangedImg = {
        id: 'asset-v1:TestX+Test01+Test0101+type@asset+block@unchanged-image.png',
        width: 3,
        height: 5,
      };
      const images = [
        mockImage,
        unchangedImg,
      ];

      it('updates dimensions of correct image in images array', () => {
        const { result, foundMatch } = module.updateImageDimensions({
          images, url: mockNode.src, width: 123, height: 321,
        });
        const imageToHaveBeenUpdated = result.find(img => img.id === mockImage.id);
        const imageToHaveBeenUnchanged = result.find(img => img.id === unchangedImg.id);

        expect(imageToHaveBeenUpdated.width).toBe(123);
        expect(imageToHaveBeenUpdated.height).toBe(321);
        expect(imageToHaveBeenUnchanged.width).toBe(3);
        expect(imageToHaveBeenUnchanged.height).toBe(5);

        expect(foundMatch).toBe(true);
      });

      it('does not update images if id is not found', () => {
        const { result, foundMatch } = module.updateImageDimensions({
          images, url: 'not_found', width: 123, height: 321,
        });
        expect(result.find(img => img.width === 123 || img.height === 321)).toBeFalsy();
        expect(foundMatch).toBe(false);
      });
    });
  });
});
