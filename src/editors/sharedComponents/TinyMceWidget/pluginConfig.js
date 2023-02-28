import { StrictDict } from '../../utils';
import { buttons, plugins } from '../../data/constants/tinyMCE';

const mapToolbars = toolbars => toolbars.map(toolbar => toolbar.join(' ')).join(' | ');

const pluginConfig = ({ isLibrary, placeholder, editorType }) => {
  const image = isLibrary ? '' : plugins.image;
  const imageTools = isLibrary ? '' : plugins.imagetools;
  const imageUploadButton = isLibrary ? '' : buttons.imageUploadButton;
  const editImageSettings = isLibrary ? '' : buttons.editImageSettings;
  const codePlugin = editorType === 'problem' ? '' : plugins.code;
  const codeButton = editorType === 'problem' ? '' : buttons.code;
  const labelButton = editorType === 'problem' ? buttons.customLabelButton : '';

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
        codePlugin,
        plugins.autoresize,
        image,
        imageTools,
      ].join(' '),
      menubar: false,
      toolbar: mapToolbars([
        [buttons.undo, buttons.redo],
        [buttons.formatSelect],
        [labelButton],
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
        [buttons.removeFormat, codeButton],
      ]),
      imageToolbar: mapToolbars([
        // [buttons.rotate.left, buttons.rotate.right],
        // [buttons.flip.horiz, buttons.flip.vert],
        [editImageSettings],
      ]),
      config: {
        branding: false,
        height: '100%',
        menubar: false,
        toolbar_sticky: true,
        toolbar_sticky_offset: 76,
        relative_urls: true,
        convert_urls: false,
        placeholder,
      },
    })
  );
};

export default pluginConfig;
