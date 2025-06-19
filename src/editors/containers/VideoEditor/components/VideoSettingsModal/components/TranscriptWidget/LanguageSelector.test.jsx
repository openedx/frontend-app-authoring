import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
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
  videoTranscriptLanguages: {
    [lang1Code]: lang1,
    [lang2Code]: lang2,
    [lang3Code]: lang3,
  },
}));

describe('LanguageSelector', () => {
  const props = {
    onSelect: jest.fn().mockName('props.OnSelect'),
    index: 1,
    language: lang1Code,
    openLanguages: [[lang2Code, lang2], [lang3Code, lang3]],
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

  test('transcripts no Open Languages, all dropdown items should be disabled', () => {
    const { video } = selectors;
    jest.spyOn(video, 'openLanguages').mockReturnValue([]);
    const { container } = render(<LanguageSelector {...props} language="" />);
    fireEvent.click(screen.getByRole('button', { name: 'Languages' }));
    const disabledItems = container.querySelectorAll('.disabled.dropdown-item');
    expect(disabledItems.length).toBe(3);
  });
});
