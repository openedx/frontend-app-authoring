import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { LanguageSelectorInternal as LanguageSelector } from './LanguageSelector';
import { formatMessage } from '../../../../../../testUtils';

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

describe('LanguageSelector', () => {
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
        shallow(<LanguageSelector {...props} />).snapshot,
      ).toMatchSnapshot();
    });
  });
  describe('snapshots -- no', () => {
    test('transcripts no Open Languages, all should be disabled', () => {
      expect(
        shallow(<LanguageSelector {...props} openLanguages={[]} />).snapshot,
      ).toMatchSnapshot();
    });
  });
});
