import ISO6391 from 'iso-639-1';
import { StrictDict } from '../../utils';

export const getLanguageName = (langCode, locales = ['en']) => {
  const code = langCode?.toLowerCase();
  if (!code) { return ''; }

  for (const locale of locales) {
    try {
      const dn = new Intl.DisplayNames([locale], { type: 'language' });
      const name = dn.of(code);
      if (name && name !== code) {
        return name;
      }
    } catch {
      // Fallback to ISO6391 if Intl.DisplayNames fails
    }
  }
  const isoName = ISO6391.getName(code);
  if (isoName) { return isoName; }

  return code;
};

// Zero-maintenance: generate an object mapping code → name from iso-639-1 package
export const openLanguagesDataSet = ISO6391.getAllCodes().reduce((acc, code) => {
  acc[code] = ISO6391.getName(code);
  return acc;
}, {});

export const in8lTranscriptLanguages = (intl) => {
  const messageLookup = {};

  // For tests and non-internationalized setups, return raw dataset
  if (!intl?.formatMessage) {
    return openLanguagesDataSet;
  }

  Object.keys(openLanguagesDataSet).forEach((code) => {
    messageLookup[code] = intl.formatMessage({
      id: `authoring.videoeditor.transcripts.language.${code}`,
      defaultMessage: openLanguagesDataSet[code],
      description: `Name of Language called in English ${openLanguagesDataSet[code]}`,
    });
  });

  return messageLookup;
};

export const timeKeys = StrictDict({
  startTime: 'startTime',
  stopTime: 'stopTime',
});

export default {
  timeKeys,
};
