import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { a11ycheckerCss } from 'frontend-components-tinymce-advanced-plugins';
import tinyMCEStyles from '../../data/constants/tinyMCEStyles';
import { StrictDict } from '../../utils';
import pluginConfig from './pluginConfig';
import * as module from './hooks';
import tinyMCE from '../../data/constants/tinyMCE';

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

export const addImagesAndDimensionsToRef = ({ imagesRef, assets, editorContentHtml }) => {
  const imagesWithDimensions = module.filterAssets({ assets }).map((image) => {
    const imageFragment = module.getImageFromHtmlString(editorContentHtml, image.url);
    return { ...image, width: imageFragment?.width, height: imageFragment?.height };
  });

  imagesRef.current = imagesWithDimensions;
};

export const useImages = ({ assets, editorContentHtml }) => {
  const imagesRef = useRef([]);

  useEffect(() => {
    module.addImagesAndDimensionsToRef({ imagesRef, assets, editorContentHtml });
  }, []);

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

export const replaceStaticwithAsset = ({
  editor,
  imageUrls,
  editorType,
  lmsEndpointUrl,
  updateContent,
}) => {
  let content = editor.getContent();
  const imageSrcs = content.split('src="');
  imageSrcs.forEach(src => {
    const currentContent = content;
    let staticFullUrl;
    const isStatic = src.startsWith('/static/');
    const isExpandableAsset = src.startsWith('/assets/') && editorType === 'expandable';
    if ((isStatic || isExpandableAsset) && imageUrls.length > 0) {
      const assetSrc = src.substring(0, src.indexOf('"'));
      const assetName = assetSrc.replace(/\/assets\/.+[^/]\//g, '');
      const staticName = assetSrc.substring(8);
      imageUrls.forEach((url) => {
        if (isExpandableAsset && assetName === url.displayName) {
          staticFullUrl = `${lmsEndpointUrl}${url.staticFullUrl}`;
        } else if (staticName === url.displayName) {
          staticFullUrl = url.staticFullUrl;
          if (isExpandableAsset) {
            staticFullUrl = `${lmsEndpointUrl}${url.staticFullUrl}`;
          }
        }
      });
      if (staticFullUrl) {
        const currentSrc = src.substring(0, src.indexOf('"'));
        content = currentContent.replace(currentSrc, staticFullUrl);
        if (editorType === 'expandable') {
          updateContent(content);
        } else {
          editor.setContent(content);
        }
      }
    }
  });
};

export const getImageResizeHandler = ({ editor, imagesRef, setImage }) => () => {
  const {
    src, alt, width, height,
  } = editor.selection.getNode();

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
  imageUrls,
  images,
  setImage,
  lmsEndpointUrl,
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
      module.replaceStaticwithAsset({
        editor,
        imageUrls,
        editorType,
        lmsEndpointUrl,
        updateContent,
      });
    });
  }
  editor.on('ExecCommand', (e) => {
    if (editorType === 'text' && e.command === 'mceFocus') {
      module.replaceStaticwithAsset({ editor, imageUrls });
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
  lmsEndpointUrl,
  studioEndpointUrl,
  isLibrary,
  placeholder,
  initializeEditor,
  openImgModal,
  openSourceCodeModal,
  setSelection,
  updateContent,
  content,
  minHeight,
}) => {
  const {
    toolbar,
    config,
    plugins,
    imageToolbar,
    quickbarsInsertToolbar,
    quickbarsSelectionToolbar,
  } = pluginConfig({ isLibrary, placeholder, editorType });

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
      document_base_url: lmsEndpointUrl,
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
        imageUrls: module.fetchImageUrls(images),
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

export const filterAssets = ({ assets }) => {
  let images = [];
  const assetsList = Object.values(assets);
  if (assetsList.length > 0) {
    images = assetsList.filter(asset => asset?.contentType?.startsWith('image/'));
  }
  return images;
};

export const setAssetToStaticUrl = ({ editorValue, assets, lmsEndpointUrl }) => {
  /* For assets to remain usable across course instances, we convert their url to be course-agnostic.
   * For example, /assets/course/<asset hash>/filename gets converted to /static/filename. This is
   * important for rerunning courses and importing/exporting course as the /static/ part of the url
   * allows the asset to be mapped to the new course run.
  */

  // TODO: should probably move this to when the assets are being looped through in the off chance that
  // some of the text in the editor contains the lmsEndpointUrl
  const regExLmsEndpointUrl = RegExp(lmsEndpointUrl, 'g');
  let content = editorValue.replace(regExLmsEndpointUrl, '');

  const assetUrls = [];
  const assetsList = Object.values(assets);
  assetsList.forEach(asset => {
    assetUrls.push({ portableUrl: asset.portableUrl, displayName: asset.displayName });
  });
  const assetSrcs = typeof content === 'string' ? content.split(/(src="|src=&quot;|href="|href=&quot)/g) : [];
  assetSrcs.forEach(src => {
    if (src.startsWith('/asset') && assetUrls.length > 0) {
      const assetBlockName = src.substring(src.indexOf('@') + 1, src.search(/("|&quot;)/));
      const nameFromEditorSrc = assetBlockName.substring(assetBlockName.indexOf('@') + 1);
      const nameFromStudioSrc = assetBlockName.substring(assetBlockName.indexOf('/') + 1);
      let portableUrl;
      assetUrls.forEach((url) => {
        const displayName = url.displayName.replace(/\s/g, '_');
        if (displayName === nameFromEditorSrc || displayName === nameFromStudioSrc) {
          portableUrl = url.portableUrl;
        }
      });
      if (portableUrl) {
        const currentSrc = src.substring(0, src.search(/("|&quot;)/));
        const updatedContent = content.replace(currentSrc, portableUrl);
        content = updatedContent;
      }
    }
  });
  return content;
};

export const fetchImageUrls = (images) => {
  const imageUrls = [];
  images.current.forEach(image => {
    imageUrls.push({ staticFullUrl: image.staticFullUrl, displayName: image.displayName });
  });
  return imageUrls;
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
