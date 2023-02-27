import { StrictDict } from '../../utils';
import { buttons, plugins } from './tinyMCE';
import tinyMCEStyles from './tinyMCEStyles';

const mapToolbars = toolbars => toolbars.map(toolbar => toolbar.join(' ')).join(' | ');

const tinyMCEConfig = (isLibrary) => {
  const image = isLibrary ? '' : plugins.image;
  const imageTools = isLibrary ? '' : plugins.imagetools;
  const imageUploadButton = isLibrary ? '' : buttons.imageUploadButton;
  const editImageSettings = isLibrary ? '' : buttons.editImageSettings;

  return (
    StrictDict({
      plugins: [
        plugins.link,
        plugins.lists,
        plugins.codesample,
        plugins.emoticons,
        plugins.table,
        plugins.hr,
        plugins.charmap,
        plugins.code,
        plugins.autoresize,
        image,
        imageTools,
      ].join(' '),
      menubar: false,
      toolbar: mapToolbars([
        [buttons.undo, buttons.redo],
        [buttons.formatSelect],
        [buttons.bold, buttons.italic, buttons.underline, buttons.foreColor, buttons.backColor],
        [
          buttons.align.left,
          buttons.align.center,
          buttons.align.right,
          buttons.align.justify,
        ],
        [
          buttons.bullist,
          buttons.numlist,
          buttons.outdent,
          buttons.indent,
        ],
        [imageUploadButton, buttons.link, buttons.unlink, buttons.blockQuote, buttons.codeBlock],
        [buttons.table, buttons.emoticons, buttons.charmap, buttons.hr],
        [buttons.removeFormat, buttons.code],
      ]),
      imageToolbar: mapToolbars([
        // [buttons.rotate.left, buttons.rotate.right],
        // [buttons.flip.horiz, buttons.flip.vert],
        [editImageSettings],
      ]),
      config: {
        shared: {
          branding: false,
          content_css: false,
          content_style: tinyMCEStyles,
          menubar: false,
          skin: false,
          valid_children: '+body[style]',
          valid_elements: '*[*]',
        },
        textEditor: {
          height: '100%',
          min_height: 500,
          toolbar_sticky: true,
          toolbar_sticky_offset: 76,
          relative_urls: true,
          convert_urls: false,
        },
        problemEditor: {
          min_height: 150,
          placeholder: 'Enter your question',
        },
      },
    })
  );
};

export default tinyMCEConfig;
