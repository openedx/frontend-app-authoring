import { messages as footerMessages } from '@edx/frontend-component-footer';
import { messages as paragonMessages } from '@edx/paragon';
import arMessages from './messages/ar.json';
import caMessages from './messages/ca.json';
import deMessages from './messages/de.json';
import deDEMessages from './messages/de_DE.json';
import es419Messages from './messages/es_419.json';
import faIRMessages from './messages/fa_IR.json';
import frMessages from './messages/fr.json';
import frCAMessages from './messages/fr_CA.json';
import heMessages from './messages/he.json';
import hiMessages from './messages/hi.json';
import idMessages from './messages/id.json';
import itMessages from './messages/it.json';
import itITMessages from './messages/it_IT.json';
import kokrMessages from './messages/ko_kr.json';
import plMessages from './messages/pl.json';
import ptMessages from './messages/pt.json';
import ptbrMessages from './messages/pt_br.json';
import ptPTMessages from './messages/pt_PT.json';
import ruMessages from './messages/ru.json';
import thMessages from './messages/th.json';
import ukMessages from './messages/uk.json';
import zhCNMessages from './messages/zh_CN.json';
// no need to import en messages-- they are in the defaultMessage field

const appMessages = {
  ar: arMessages,
  ca: caMessages,
  de: deMessages,
  'de-de': deDEMessages,
  'es-419': es419Messages,
  'fa-ir': faIRMessages,
  fr: frMessages,
  'fr-ca': frCAMessages,
  he: heMessages,
  hi: hiMessages,
  id: idMessages,
  it: itMessages,
  'it-it': itITMessages,
  'ko-kr': kokrMessages,
  pl: plMessages,
  pt: ptMessages,
  'pt-br': ptbrMessages,
  'pt-pt': ptPTMessages,
  ru: ruMessages,
  th: thMessages,
  uk: ukMessages,
  'zh-cn': zhCNMessages,
};

export default [
  footerMessages,
  paragonMessages,
  appMessages,
];
