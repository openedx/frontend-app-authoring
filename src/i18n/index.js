import arMessages from './messages/ar.json';
// no need to import en messages-- they are in the defaultMessage field
import es419Messages from './messages/es_419.json';
import frMessages from './messages/fr.json';
import kokrMessages from './messages/ko_KR.json';
import ptbrMessages from './messages/pt_BR.json';
import zhcnMessages from './messages/zh_CN.json';

const messages = {
  ar: arMessages,
  'es-419': es419Messages,
  fr: frMessages,
  'zh-cn': zhcnMessages,
  'ko-kr': kokrMessages,
  'pt-br': ptbrMessages,
};

export default messages;
