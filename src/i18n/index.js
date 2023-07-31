import { messages as footerMessages } from '@edx/frontend-component-footer';
import { messages as paragonMessages } from '@edx/paragon';
import arMessages from './messages/ar.json';
import frMessages from './messages/fr.json';
import es419Messages from './messages/es_419.json';
import zhcnMessages from './messages/zh_CN.json';
import ptMessages from './messages/pt.json';
import itMessages from './messages/it.json';
import ukMessages from './messages/uk.json';
import deMessages from './messages/de.json';
import ruMessages from './messages/ru.json';
import hiMessages from './messages/hi.json';
import frCAMessages from './messages/fr_CA.json';
import dedeMessages from './messages/de_DE.json';
import ititMessages from './messages/it_IT.json';
import ptptMessages from './messages/pt_PT.json';
// no need to import en messages-- they are in the defaultMessage field

const appMessages = {
  ar: arMessages,
  'es-419': es419Messages,
  fr: frMessages,
  'zh-cn': zhcnMessages,
  pt: ptMessages,
  it: itMessages,
  de: deMessages,
  hi: hiMessages,
  'fr-ca': frCAMessages,
  ru: ruMessages,
  uk: ukMessages,
  'de-de': dedeMessages,
  'it-it': ititMessages,
  'pt-pt': ptptMessages,
};

export default [
  footerMessages,
  paragonMessages,
  appMessages,
];
