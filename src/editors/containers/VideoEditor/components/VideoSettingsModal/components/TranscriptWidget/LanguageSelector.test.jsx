import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';
import LanguageSelector from './LanguageSelector';
import { selectors } from '../../../../../../data/redux';

const lang1 = 'kLinGon';
const lang1Code = 'kl';
const lang2 = 'eLvIsh';
const lang2Code = 'el';
const lang3 = 'sImLisH';
const lang3Code = 'sl';

jest.mock('../../../../../../data/constants/video', () => ({
  getLanguageName: jest.fn((code) => {
    const mockMap = {
      kl: lang1,
      el: lang2,
      sl: lang3,
    };
    return mockMap[code] || code;
  }),
}));

describe('LanguageSelector', () => {
  const props = {
    onSelect: jest.fn().mockName('props.OnSelect'),
    index: 1,
    language: lang1Code,
    openLanguages: [lang2Code, lang3Code, lang1Code],
  };
  beforeEach(() => {
    initializeMocks();
  });

  test('renders component with selected language', () => {
    const { video } = selectors;
    jest.spyOn(video, 'openLanguages').mockReturnValue(props.openLanguages);
    const { container } = render(<LanguageSelector {...props} />);
    expect(screen.getByRole('button', { name: 'Languages' })).toBeInTheDocument();
    expect(screen.getByText(lang1)).toBeInTheDocument();
    expect(container.querySelector('input.upload[type="file"]')).toBeInTheDocument();
  });

  test('renders component with no selection', () => {
    const { video } = selectors;
    jest.spyOn(video, 'openLanguages').mockReturnValue(props.openLanguages);
    render(<LanguageSelector {...props} language="" />);
    expect(screen.getByText('Select Language')).toBeInTheDocument();
  });
});
