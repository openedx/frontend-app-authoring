import { StrictDict } from '../../utils';
import { buttons, plugins } from '../../data/constants/tinyMCE';

const mapToolbars = toolbars => toolbars.map(toolbar => toolbar.join(' ')).join(' | ');

const pluginConfig = ({ placeholder, editorType, enableImageUpload }) => {
  const image = enableImageUpload ? plugins.image : '';
  const imageTools = enableImageUpload ? plugins.imagetools : '';
  const imageUploadButton = enableImageUpload ? buttons.imageUploadButton : '';
  const editImageSettings = enableImageUpload ? buttons.editImageSettings : '';
  const codePlugin = editorType === 'text' ? plugins.code : '';
  const codeButton = editorType === 'text' ? buttons.code : '';
  const labelButton = editorType === 'question' ? buttons.customLabelButton : '';
  const quickToolbar = editorType === 'expandable' ? plugins.quickbars : '';
  const inline = editorType === 'expandable';
  const toolbar = editorType !== 'expandable';
  const defaultFormat = (editorType === 'question' || editorType === 'expandable') ? 'div' : 'p';
  const hasStudioHeader = document.querySelector('.studio-header');

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
        plugins.a11ychecker,
        plugins.powerpaste,
        plugins.embediframe,
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
        [buttons.removeFormat, codeButton, buttons.a11ycheck, buttons.embediframe],
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
        [buttons.table, buttons.emoticons, buttons.charmap, buttons.removeFormat, buttons.a11ycheck],
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
        [buttons.table, buttons.emoticons, buttons.charmap, buttons.removeFormat, buttons.a11ycheck],
      ]),
      config: {
        branding: false,
        height: '100%',
        menubar: false,
        toolbar_mode: 'sliding',
        toolbar_sticky: true,
        toolbar_sticky_offset: hasStudioHeader ? 0 : 76,
        relative_urls: true,
        convert_urls: false,
        placeholder,
        inline,
        block_formats: 'Header 1=h1;Header 2=h2;Header 3=h3;Header 4=h4;Header 5=h5;Header 6=h6;Div=div;Paragraph=p;Preformatted=pre',
        forced_root_block: defaultFormat,
        powerpaste_allow_local_images: true,
        powerpaste_word_import: 'prompt',
        powerpaste_html_import: 'prompt',
        powerpaste_googledoc_import: 'prompt',
      },
    })
  );
};

export default pluginConfig;
