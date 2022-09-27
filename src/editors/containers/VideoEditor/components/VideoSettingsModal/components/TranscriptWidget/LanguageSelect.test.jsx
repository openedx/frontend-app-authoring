import React from 'react';
import { shallow } from 'enzyme';
import { LanguageSelect } from './LanguageSelect';
import { formatMessage } from '../../../../../../../testUtils';

const lang1 = 'kLinGon';
const lang1Code = 'kl';
const lang2 = 'eLvIsh';
const lang2Code = 'el';
const lang3 = 'sImLisH';
const lang3Code = 'sl';

jest.mock('../../../../../../data/constants/video', () => ({
  videoTranscriptLanguages: {
    [lang1Code]: lang1,
    [lang2Code]: lang2,
    [lang3Code]: lang3,
  },
}));

describe('LanguageSelect', () => {
  const props = {
    intl: { formatMessage },
    onSelect: jest.fn().mockName('props.OnSelect'),
    title: 'tITle',
    language: lang1Code,
    openLanguages: [[lang2Code, lang2], [lang3Code, lang3]],

  };
  describe('snapshot', () => {
    test('transcript option', () => {
      expect(
        shallow(<LanguageSelect {...props} />),
      ).toMatchSnapshot();
    });
  });
  describe('snapshots -- no', () => {
    test('transcripts no Open Languages, all should be disabled', () => {
      expect(
        shallow(<LanguageSelect {...props} openLanguages={[]} />),
      ).toMatchSnapshot();
    });
  });
});
