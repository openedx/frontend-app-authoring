import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getLocale, isRtl } from '@edx/frontend-platform/i18n';
import { a11ycheckerCss } from 'frontend-components-tinymce-advanced-plugins';
import { isEmpty } from 'lodash';
import tinyMCEStyles from '../../data/constants/tinyMCEStyles';
import { StrictDict } from '../../utils';
import pluginConfig from './pluginConfig';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import * as tinyMCE from '../../data/constants/tinyMCE';
import { getRelativeUrl, getStaticUrl, parseAssetName } from './utils';
import { isLibraryKey } from '../../../generic/key-utils';

export const state = StrictDict({
  // eslint-disable-next-line react-hooks/rules-of-hooks
  isImageModalOpen: (val) => useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  isSourceCodeModalOpen: (val) => useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  imageSelection: (val) => useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  refReady: (val) => useState(val),
});

export const addImagesAndDimensionsToRef = ({ imagesRef, images, editorContentHtml }) => {
  const imagesWithDimensions = Object.values(images).map((image) => {
    const imageFragment = module.getImageFromHtmlString(editorContentHtml, image.url);
    return { ...image, width: imageFragment?.width, height: imageFragment?.height };
  });
  // eslint-disable-next-line no-param-reassign
  imagesRef.current = imagesWithDimensions;
};

export const useImages = ({ images, editorContentHtml }) => {
  const imagesRef = useRef([]);

  useEffect(() => {
    module.addImagesAndDimensionsToRef({ imagesRef, images, editorContentHtml });
  }, [images]);

  return { imagesRef };
};

export const parseContentForLabels = ({ editor, updateContent }) => {
  let content = editor.getContent();
  if (content && content?.length > 0) {
    const parsedLabels = content.split(/<label>|<\/label>/gm);
    let updatedContent;
    parsedLabels.forEach((label, i) => {
      if (!label.startsWith('<') && !label.endsWith('>')) {
        let previousLabel = parsedLabels[i - 1];
        let nextLabel = parsedLabels[i + 1];
        if (!previousLabel.endsWith('<p>')) {
          previousLabel = `${previousLabel}</p><p>`;
          updatedContent = content.replace(parsedLabels[i - 1], previousLabel);
          content = updatedContent;
          updateContent(content);
        }
        if (!nextLabel.startsWith('</p>')) {
          nextLabel = `</p><p>${nextLabel}`;
          updatedContent = content.replace(parsedLabels[i + 1], nextLabel);
          content = updatedContent;
          updateContent(content);
        }
      }
    });
  } else {
    updateContent(content);
  }
};

export const replaceStaticWithAsset = ({
  initialContent,
  learningContextId,
  editorType,
  lmsEndpointUrl,
}) => {
  let content = initialContent;
  let hasChanges = false;
  const srcs = content.split(/(src="|src=&quot;|href="|href=&quot)/g).filter(
    src => src.startsWith('/static') || src.startsWith('/asset'),
  );
  if (!isEmpty(srcs)) {
    srcs.forEach(src => {
      const currentContent = content;
      let staticFullUrl;
      const isStatic = src.startsWith('/static/');
      const assetSrc = src.substring(0, src.indexOf('"'));
      const staticName = assetSrc.substring(8);
      const assetName = parseAssetName(src);
      const displayName = isStatic ? staticName : assetName;
      const isCorrectAssetFormat = assetSrc.startsWith('/asset') && assetSrc.match(/\/asset-v1:\S+[+]\S+[@]\S+[+]\S+[@]/g)?.length >= 1;

      // assets in expandable text areas do not support relative urls so all assets must have the lms
      // endpoint prepended to the relative url
      if (isLibraryKey(learningContextId)) {
        // We are removing the initial "/" in a "/static/foo.png" link, and then
        // set the base URL to an endpoint serving the draft version of an asset by
        // its path.
        /* istanbul ignore next */
        if (isStatic) {
          staticFullUrl = assetSrc.substring(1);
        }
      } else if (editorType === 'expandable') {
        if (isCorrectAssetFormat) {
          staticFullUrl = `${lmsEndpointUrl}${assetSrc}`;
        } else {
          staticFullUrl = `${lmsEndpointUrl}${getRelativeUrl({ courseId: learningContextId, displayName })}`;
        }
      } else if (!isCorrectAssetFormat) {
        staticFullUrl = getRelativeUrl({ courseId: learningContextId, displayName });
      }
      if (staticFullUrl) {
        const currentSrc = src.substring(0, src.indexOf('"'));
        content = currentContent.replace(currentSrc, staticFullUrl);
        hasChanges = true;
      }
    });
    if (hasChanges) { return content; }
  }
  return false;
};

export const getImageResizeHandler = ({ editor, imagesRef, setImage }) => () => {
  const {
    src, alt, width, height,
  } = editor.selection.getNode();

  // eslint-disable-next-line no-param-reassign
  imagesRef.current = module.updateImageDimensions({
    images: imagesRef.current, url: src, width, height,
  }).result;

  setImage({
    externalUrl: src,
    altText: alt,
    width,
    height,
  });
};

export const setupCustomBehavior = ({
  updateContent,
  openImgModal,
  openSourceCodeModal,
  editorType,
  images,
  setImage,
  lmsEndpointUrl,
  learningContextId,
}) => (editor) => {
  // image upload button
  editor.ui.registry.addButton(tinyMCE.buttons.imageUploadButton, {
    icon: 'image',
    tooltip: 'Add Image',
    onAction: openImgModal,
  });
  // editing an existing image
  editor.ui.registry.addButton(tinyMCE.buttons.editImageSettings, {
    icon: 'image',
    tooltip: 'Edit Image Settings',
    onAction: module.openModalWithSelectedImage({
      editor, images, setImage, openImgModal,
    }),
  });
  // overriding the code plugin's icon with 'HTML' text
  editor.ui.registry.addButton(tinyMCE.buttons.code, {
    text: 'HTML',
    tooltip: 'Source code',
    onAction: openSourceCodeModal,
  });
  // add a custom simple inline code block formatter.
  const setupCodeFormatting = (api) => {
    editor.formatter.formatChanged(
      'code',
      (active) => api.setActive(active),
    );
  };
  const toggleCodeFormatting = () => {
    editor.formatter.toggle('code');
    editor.undoManager.add();
    editor.focus();
  };
  editor.ui.registry.addToggleButton(tinyMCE.buttons.codeBlock, {
    icon: 'sourcecode',
    tooltip: 'Code Block',
    onAction: toggleCodeFormatting,
    onSetup: setupCodeFormatting,
  });
  // add a custom simple inline label formatter.
  const toggleLabelFormatting = () => {
    editor.execCommand('mceToggleFormat', false, 'label');
  };
  editor.ui.registry.addIcon('textToSpeech', tinyMCE.textToSpeechIcon);
  editor.ui.registry.addButton('customLabelButton', {
    icon: 'textToSpeech',
    text: 'Label',
    tooltip: 'Apply a "Question" label to specific text, recognized by screen readers. Recommended to improve accessibility.',
    onAction: toggleLabelFormatting,
  });
  if (editorType === 'expandable') {
    editor.on('init', () => {
      const initialContent = editor.getContent();
      const newContent = module.replaceStaticWithAsset({
        initialContent,
        editorType,
        lmsEndpointUrl,
        learningContextId,
      });
      if (newContent) { updateContent(newContent); }
    });
  }

  editor.on('init', /* istanbul ignore next */ () => {
    // Moving TinyMce aux modal inside the Editor modal
    // if the editor is on modal mode.
    // This is to avoid issues using the aux modal:
    // * Avoid close aux modal when clicking the content inside.
    // * When the user opens the `Edit Source Code` modal, this adds `data-focus-on-hidden`
    //   to the TinyMce aux modal, making it unusable.
    const modalLayer = document.querySelector('.pgn__modal-layer');
    const tinymceAux = document.querySelector('.tox.tox-tinymce-aux');

    if (modalLayer && tinymceAux) {
      modalLayer.appendChild(tinymceAux);
    }
  });

  editor.on('ExecCommand', /* istanbul ignore next */ (e) => {
    // Remove `data-focus-on-hidden` and `aria-hidden` on TinyMce aux modal used on emoticons, formulas, etc.
    // When using the Editor in modal mode, it may happen that the editor modal is rendered
    // before the TinyMce aux modal, which adds these attributes, making the TinyMce aux modal unusable.
    const modalElement = document.querySelector('.tox.tox-silver-sink.tox-tinymce-aux');
    if (modalElement) {
      modalElement.removeAttribute('data-focus-on-hidden');
      modalElement.removeAttribute('aria-hidden');
    }

    if (editorType === 'text' && e.command === 'mceFocus') {
      const initialContent = editor.getContent();
      const newContent = module.replaceStaticWithAsset({
        initialContent,
        learningContextId,
      });
      if (newContent) { editor.setContent(newContent); }
    }
    if (e.command === 'RemoveFormat') {
      editor.formatter.remove('blockquote');
      editor.formatter.remove('label');
    }
  });
  // after resizing an image in the editor, synchronize React state and ref
  editor.on('ObjectResized', getImageResizeHandler({ editor, imagesRef: images, setImage }));
};

// imagetools_cors_hosts needs a protocol-sanatized url
export const removeProtocolFromUrl = (url) => url.replace(/^https?:\/\//, '');

export const editorConfig = ({
  editorType,
  setEditorRef,
  editorContentHtml,
  images,
  placeholder,
  initializeEditor,
  openImgModal,
  openSourceCodeModal,
  setSelection,
  updateContent,
  content,
  minHeight,
  learningContextId,
  staticRootUrl,
  enableImageUpload,
}) => {
  const lmsEndpointUrl = getConfig().LMS_BASE_URL;
  const studioEndpointUrl = getConfig().STUDIO_BASE_URL;

  const baseURL = staticRootUrl || lmsEndpointUrl;
  const {
    toolbar,
    config,
    plugins,
    imageToolbar,
    quickbarsInsertToolbar,
    quickbarsSelectionToolbar,
  } = pluginConfig({ placeholder, editorType, enableImageUpload });
  const isLocaleRtl = isRtl(getLocale());
  return {
    onInit: (evt, editor) => {
      setEditorRef(editor);
      if (editorType === 'text') {
        initializeEditor();
      }
    },
    initialValue: editorContentHtml || '',
    init: {
      ...config,
      skin: false,
      content_css: false,
      content_style: tinyMCEStyles + a11ycheckerCss,
      min_height: minHeight,
      contextmenu: 'link table',
      directionality: isLocaleRtl ? 'rtl' : 'ltr',
      document_base_url: baseURL,
      imagetools_cors_hosts: [removeProtocolFromUrl(lmsEndpointUrl), removeProtocolFromUrl(studioEndpointUrl)],
      imagetools_toolbar: imageToolbar,
      formats: { label: { inline: 'label' } },
      setup: module.setupCustomBehavior({
        editorType,
        updateContent,
        openImgModal,
        openSourceCodeModal,
        lmsEndpointUrl,
        setImage: setSelection,
        content,
        images,
        learningContextId,
      }),
      quickbars_insert_toolbar: quickbarsInsertToolbar,
      quickbars_selection_toolbar: quickbarsSelectionToolbar,
      quickbars_image_toolbar: false,
      toolbar,
      plugins,
      valid_children: '+body[style]',
      valid_elements: '*[*]',
      entity_encoding: 'utf-8',
    },
  };
};

export const prepareEditorRef = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const editorRef = useRef(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setEditorRef = useCallback((ref) => {
    editorRef.current = ref;
  }, []);
  const [refReady, setRefReady] = module.state.refReady(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => setRefReady(true), []);
  return { editorRef, refReady, setEditorRef };
};

export const imgModalToggle = () => {
  const [isImgOpen, setIsOpen] = module.state.isImageModalOpen(false);
  return {
    isImgOpen,
    openImgModal: () => setIsOpen(true),
    closeImgModal: () => setIsOpen(false),
  };
};

export const sourceCodeModalToggle = (editorRef) => {
  const [isSourceCodeOpen, setIsOpen] = module.state.isSourceCodeModalOpen(false);
  return {
    isSourceCodeOpen,
    openSourceCodeModal: () => setIsOpen(true),
    closeSourceCodeModal: () => {
      setIsOpen(false);
      editorRef.current.focus();
    },
  };
};

/**
 * const imageMatchRegex
 *
 * Image urls and ids used in the TinyMceEditor vary wildly, with different base urls,
 * different lengths and constituent parts, and replacement of some "/" with "@".
 * Common are the keys "asset-v1", "type", and "block", each holding a value after some separator.
 * This regex captures only the values for these keys using capture groups, which can be used for matching.
 */
export const imageMatchRegex = /asset-v1.(.*).type.(.*).block.(.*)/;

/**
 * function matchImageStringsByIdentifiers
 *
 * matches two strings by comparing their regex capture groups using the `imageMatchRegex`
 */
export const matchImageStringsByIdentifiers = (a, b) => {
  if (!a || !b || !(typeof a === 'string') || !(typeof b === 'string')) { return null; }
  const matchA = JSON.stringify(a.match(imageMatchRegex)?.slice?.(1));
  const matchB = JSON.stringify(b.match(imageMatchRegex)?.slice?.(1));
  return matchA && matchA === matchB;
};

export const stringToFragment = (htmlString) => document.createRange().createContextualFragment(htmlString);

export const getImageFromHtmlString = (htmlString, imageSrc) => {
  const images = stringToFragment(htmlString)?.querySelectorAll('img') || [];

  return Array.from(images).find((img) => matchImageStringsByIdentifiers(img.src || '', imageSrc));
};

export const detectImageMatchingError = ({ matchingImages, tinyMceHTML }) => {
  if (!matchingImages.length) { return true; }
  if (matchingImages.length > 1) { return true; }

  if (!matchImageStringsByIdentifiers(matchingImages[0].id, tinyMceHTML.src)) { return true; }
  if (!matchingImages[0].width || !matchingImages[0].height) { return true; }
  if (matchingImages[0].width !== tinyMceHTML.width) { return true; }
  if (matchingImages[0].height !== tinyMceHTML.height) { return true; }

  return false;
};

export const openModalWithSelectedImage = ({
  editor, images, setImage, openImgModal,
}) => () => {
  const tinyMceHTML = editor.selection.getNode();
  const { src: mceSrc } = tinyMceHTML;

  const matchingImages = images.current.filter(image => matchImageStringsByIdentifiers(image.id, mceSrc));

  const imageMatchingErrorDetected = detectImageMatchingError({ tinyMceHTML, matchingImages });

  const width = imageMatchingErrorDetected ? null : matchingImages[0]?.width;
  const height = imageMatchingErrorDetected ? null : matchingImages[0]?.height;

  setImage({
    externalUrl: tinyMceHTML.src,
    altText: tinyMceHTML.alt,
    width,
    height,
  });

  openImgModal();
};

export const setAssetToStaticUrl = ({ editorValue, lmsEndpointUrl }) => {
  /* For assets to remain usable across course instances, we convert their url to be course-agnostic.
   * For example, /assets/course/<asset hash>/filename gets converted to /static/filename. This is
   * important for rerunning courses and importing/exporting course as the /static/ part of the url
   * allows the asset to be mapped to the new course run.
  */

  // TODO: should probably move this to when the assets are being looped through in the off chance that
  // some of the text in the editor contains the lmsEndpointUrl
  const regExLmsEndpointUrl = RegExp(lmsEndpointUrl, 'g');
  let content = editorValue.replace(regExLmsEndpointUrl, '');

  const assetSrcs = typeof content === 'string' ? content.split(/(src="|src=&quot;|href="|href=&quot)/g) : [];
  assetSrcs.filter(src => src.startsWith('/asset')).forEach(src => {
    const nameFromEditorSrc = parseAssetName(src);
    const portableUrl = getStaticUrl({ displayName: nameFromEditorSrc });
    const currentSrc = src.substring(0, src.search(/("|&quot;)/));
    const updatedContent = content.replace(currentSrc, portableUrl);
    content = updatedContent;
  });

  /* istanbul ignore next */
  assetSrcs.filter(src => src.startsWith('static/')).forEach(src => {
    // Before storing assets we make sure that library static assets points again to
    // `/static/dummy.jpg` instead of using the relative url `static/dummy.jpg`
    const nameFromEditorSrc = parseAssetName(src);
    const portableUrl = `/${ nameFromEditorSrc}`;
    const currentSrc = src.substring(0, src.search(/("|&quot;)/));
    const updatedContent = content.replace(currentSrc, portableUrl);
    content = updatedContent;
  });
  return content;
};

export const selectedImage = (val) => {
  const [selection, setSelection] = module.state.imageSelection(val);
  return {
    clearSelection: () => setSelection(null),
    selection,
    setSelection,
  };
};

/**
 * function updateImageDimensions
 *
 * Updates one images' dimensions in an array by identifying one image via a url string match
 * that includes asset-v1, type, and block. Returns a new array.
 *
 * @param {Object[]} images - [{ id, ...other }]
 * @param {string} url
 * @param {number} width
 * @param {number} height
 *
 * @returns {Object} { result, foundMatch }
 */
export const updateImageDimensions = ({
  images, url, width, height,
}) => {
  let foundMatch = false;

  const result = images.map((image) => {
    const imageIdentifier = image.id || image.url || image.src || image.externalUrl;
    const isMatch = matchImageStringsByIdentifiers(imageIdentifier, url);
    if (isMatch) {
      foundMatch = true;
      return { ...image, width, height };
    }
    return image;
  });

  return { result, foundMatch };
};
