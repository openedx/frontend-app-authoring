import { StrictDict } from '../../utils';

const listKeyStore = (list) => StrictDict(
  list.reduce((obj, val) => ({ ...obj, [val]: val }), {}),
);

export const commands = StrictDict({
  insertContent: 'mceInsertContent',
});

export const buttons = StrictDict({
  addImageButton: 'addimagebutton',
  align: StrictDict({
    center: 'aligncenter',
    justify: 'alignjustify',
    left: 'alignleft',
    right: 'alignright',
  }),
  foreColor: 'forecolor',
  backColor: 'backcolor',
  bold: 'bold',
  bullist: 'bullist',
  charmap: 'charmap',
  code: 'code',
  codesample: 'codesample',
  editImageSettings: 'editimagesettings',
  emoticons: 'emoticons',
  flip: StrictDict({
    vert: 'flipv',
    horiz: 'fliph',
  }),
  formatSelect: 'formatSelect',
  hr: 'hr',
  imageUploadButton: 'imageuploadbutton',
  indent: 'indent',
  italic: 'italic',
  link: 'link',
  unlink: 'unlink',
  numlist: 'numlist',
  outdent: 'outdent',
  redo: 'redo',
  removeFormat: 'removeformat',
  rotate: StrictDict({
    left: 'rotateleft',
    right: 'rotateright',
  }),
  table: 'table',
  undo: 'undo',
});

export const plugins = listKeyStore([
  'link',
  'lists',
  'codesample',
  'emoticons',
  'table',
  'hr',
  'charmap',
  'code',
  'autoresize',
  'image',
  'imagetools',
]);

export default StrictDict({
  buttons,
  commands,
  plugins,
});
