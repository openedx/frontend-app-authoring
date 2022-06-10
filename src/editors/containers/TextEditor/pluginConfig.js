import { StrictDict } from '../../utils';
import { buttons, plugins } from '../../data/constants/tinyMCE';

const mapToolbars = toolbars => toolbars.map(toolbar => toolbar.join(' ')).join(' | ');

export default StrictDict({
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
    plugins.image,
    plugins.imagetools,
  ].join(' '),
  menubar: false,
  toolbar: mapToolbars([
    [buttons.undo, buttons.redo],
    [buttons.formatSelect],
    [buttons.bold, buttons.italic, buttons.foreColor, buttons.backColor],
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
    [buttons.imageUploadButton, buttons.link, buttons.unlink, buttons.blockQuote, buttons.codeBlock],
    [buttons.table, buttons.emoticons, buttons.charmap, buttons.hr],
    [buttons.removeFormat, buttons.code],
  ]),
  imageToolbar: mapToolbars([
    // [buttons.rotate.left, buttons.rotate.right],
    // [buttons.flip.horiz, buttons.flip.vert],
    [buttons.editImageSettings],
  ]),
  config: {
    branding: false,
    height: '100%',
    menubar: false,
    min_height: 500,
    toolbar_sticky: true,
    relative_urls: false,
  },
});
