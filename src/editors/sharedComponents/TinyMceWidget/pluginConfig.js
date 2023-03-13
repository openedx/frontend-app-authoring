import { StrictDict } from '../../utils';
import { buttons, plugins } from '../../data/constants/tinyMCE';

const mapToolbars = toolbars => toolbars.map(toolbar => toolbar.join(' ')).join(' | ');

const pluginConfig = ({ isLibrary, placeholder, editorType }) => {
  const image = isLibrary ? '' : plugins.image;
  const imageTools = isLibrary ? '' : plugins.imagetools;
  const imageUploadButton = isLibrary ? '' : buttons.imageUploadButton;
  const editImageSettings = isLibrary ? '' : buttons.editImageSettings;
  const codePlugin = editorType === 'text' ? plugins.code : '';
  const codeButton = editorType === 'text' ? buttons.code : '';
  const labelButton = editorType === 'question' ? buttons.customLabelButton : '';
  const quickToolbar = editorType === 'expandable' ? plugins.quickbars : '';
  const inline = editorType === 'expandable';
  const toolbar = editorType !== 'expandable';

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
        quickToolbar,
      ].join(' '),
      menubar: false,
      toolbar: toolbar ? mapToolbars([
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
      ]) : false,
      imageToolbar: mapToolbars([
        // [buttons.rotate.left, buttons.rotate.right],
        // [buttons.flip.horiz, buttons.flip.vert],
        [editImageSettings],
      ]),
      quickbarsInsertToolbar: toolbar ? false : mapToolbars([
        [buttons.undo, buttons.redo],
        [buttons.formatSelect],
        [buttons.bold, buttons.italic, buttons.underline, buttons.foreColor],
        [
          buttons.align.justify,
          buttons.bullist,
          buttons.numlist,
        ],
        [imageUploadButton, buttons.blockQuote, buttons.codeBlock],
        [buttons.table, buttons.emoticons, buttons.charmap, buttons.removeFormat],
      ]),
      quickbarsSelectionToolbar: toolbar ? false : mapToolbars([
        [buttons.undo, buttons.redo],
        [buttons.formatSelect],
        [buttons.bold, buttons.italic, buttons.underline, buttons.foreColor],
        [
          buttons.align.justify,
          buttons.bullist,
          buttons.numlist,
        ],
        [imageUploadButton, buttons.blockQuote, buttons.codeBlock],
        [buttons.table, buttons.emoticons, buttons.charmap, buttons.removeFormat],
      ]),
      config: {
        branding: false,
        height: '100%',
        menubar: false,
        toolbar_mode: 'sliding',
        toolbar_sticky: true,
        toolbar_sticky_offset: 76,
        relative_urls: true,
        convert_urls: false,
        placeholder,
        inline,
      },
    })
  );
};

export default pluginConfig;
