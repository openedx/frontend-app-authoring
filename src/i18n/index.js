import { messages as footerMessages } from '@edx/frontend-component-footer';
import { messages as paragonMessages } from '@openedx/paragon';
import arMessages from './messages/ar.json';
import deMessages from './messages/de.json';
import deDEMessages from './messages/de_DE.json';
import es419Messages from './messages/es_419.json';
import faIRMessages from './messages/fa_IR.json';
import frMessages from './messages/fr.json';
import frCAMessages from './messages/fr_CA.json';
import hiMessages from './messages/hi.json';
import itMessages from './messages/it.json';
import itITMessages from './messages/it_IT.json';
import ptMessages from './messages/pt.json';
import ptPTMessages from './messages/pt_PT.json';
import ruMessages from './messages/ru.json';
import ukMessages from './messages/uk.json';
import zhCNMessages from './messages/zh_CN.json';
// no need to import en messages-- they are in the defaultMessage field

const appMessages = {
  ar: arMessages,
  de: deMessages,
  'de-de': deDEMessages,
  'es-419': es419Messages,
  'fa-ir': faIRMessages,
  fr: frMessages,
  'fr-ca': frCAMessages,
  hi: hiMessages,
  it: itMessages,
  'it-it': itITMessages,
  ru: ruMessages,
  pt: ptMessages,
  'pt-pt': ptPTMessages,
  uk: ukMessages,
  'zh-cn': zhCNMessages,
};

export default [
  footerMessages,
  paragonMessages,
  appMessages,
];
