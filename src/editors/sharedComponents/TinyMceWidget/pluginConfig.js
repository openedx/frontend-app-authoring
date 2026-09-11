import { getConfig } from '@edx/frontend-platform';
import { StrictDict } from '../../utils';
import { buttons, plugins } from '../../data/constants/tinyMCE';

const mapToolbars = toolbars => toolbars.map(toolbar => toolbar.join(' ')).join(' | ');

/**
 * Operators who have licensed TinyMCE premium plugins (e.g. "a11ychecker" or "powerpaste") can load them by setting
 * `TINYMCE_EXTERNAL_PLUGINS` (plugin name -> plugin script URL) in `env.config.jsx`, along with `TINYMCE_LICENSE_KEY`.
 * Any options those plugins need can be passed via `TINYMCE_PLUGIN_OPTIONS`.
 */
export const getExternalPluginConfig = () => {
  const externalPlugins = getConfig().TINYMCE_EXTERNAL_PLUGINS || {};
  const hasPowerPaste = 'powerpaste' in externalPlugins;
  return {
    externalPlugins,
    hasA11yChecker: 'a11ychecker' in externalPlugins,
    pluginOptions: {
      ...(hasPowerPaste && {
        powerpaste_allow_local_images: true,
        powerpaste_word_import: 'prompt',
        powerpaste_html_import: 'prompt',
        powerpaste_googledoc_import: 'prompt',
      }),
      ...getConfig().TINYMCE_PLUGIN_OPTIONS,
    },
  };
};

const pluginConfig = ({ placeholder, editorType, enableImageUpload }) => {
  const image = enableImageUpload ? plugins.image : '';
  const imageUploadButton = enableImageUpload ? buttons.imageUploadButton : '';
  const editImageSettings = enableImageUpload ? buttons.editImageSettings : '';
  const codePlugin = editorType === 'text' ? plugins.code : '';
  const codeButton = editorType === 'text' ? buttons.code : '';
  const labelButton = editorType === 'question' ? buttons.customLabelButton : '';
  const quickToolbar = editorType === 'expandable' ? plugins.quickbars : '';
  const statusbar = editorType !== 'expandable';
  const toolbar = editorType !== 'expandable';
  const autoresizeBottomMargin = editorType === 'expandable' ? 10 : 50;
  const defaultFormat = (editorType === 'question' || editorType === 'expandable') ? 'div' : 'p';
  const hasStudioHeader = document.querySelector('.studio-header');
  const { externalPlugins, hasA11yChecker, pluginOptions } = getExternalPluginConfig();
  const a11yCheckButton = hasA11yChecker ? buttons.a11ycheck : '';

  return (
    StrictDict({
      plugins: [
        plugins.link,
        plugins.lists,
        plugins.codesample,
        plugins.emoticons,
        plugins.table,
        plugins.charmap,
        codePlugin,
        plugins.autoresize,
        image,
        quickToolbar,
        plugins.embediframe,
        ...Object.keys(externalPlugins),
      ].join(' '),
      menubar: false,
      toolbar: toolbar ?
        mapToolbars([
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
          [buttons.removeFormat, codeButton, a11yCheckButton, buttons.embediframe],
        ]) :
        false,
      imageToolbar: mapToolbars([
        // [buttons.rotate.left, buttons.rotate.right],
        // [buttons.flip.horiz, buttons.flip.vert],
        [editImageSettings],
      ]),
      quickbarsInsertToolbar: toolbar ? false : mapToolbars([
        // To keep from blocking the whole text input field when it's empty, this "insert" toolbar
        // used with ExpandableTextArea is kept as minimal as we can.
        [imageUploadButton, buttons.table],
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
        [buttons.table, buttons.emoticons, buttons.charmap, buttons.removeFormat, a11yCheckButton],
      ]),
      config: {
        branding: false,
        height: '100%',
        menubar: false,
        toolbar_mode: /** @type {'sliding'} */ ('sliding'),
        toolbar_sticky: true,
        toolbar_sticky_offset: hasStudioHeader ? 0 : 76,
        relative_urls: true,
        convert_urls: false,
        placeholder,
        statusbar,
        block_formats:
          'Header 1=h1;Header 2=h2;Header 3=h3;Header 4=h4;Header 5=h5;Header 6=h6;Div=div;Paragraph=p;Preformatted=pre',
        forced_root_block: defaultFormat,
        autoresize_bottom_margin: autoresizeBottomMargin,
        external_plugins: externalPlugins,
        ...pluginOptions,
      },
    })
  );
};

export default pluginConfig;
