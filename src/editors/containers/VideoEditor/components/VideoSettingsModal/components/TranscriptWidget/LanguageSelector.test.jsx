import React from 'react';
import {
  screen,
  fireEvent,
  initializeMocks,
} from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import LanguageSelector from './LanguageSelector';

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
  const baseProps = {
    index: 1,
    language: lang1Code,
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders component with selected language', () => {
    const initialState = {
      video: {
        transcripts: [],
        openLanguages: [[lang2Code, lang2], [lang3Code, lang3]],
      },
    };

    const { container } = editorRender(<LanguageSelector {...baseProps} />, { initialState });
    expect(screen.getByRole('button', { name: 'Languages' })).toBeInTheDocument();
    expect(screen.getByText(lang1)).toBeInTheDocument();
    expect(container.querySelector('input.upload[type="file"]')).toBeInTheDocument();
  });

  test('renders component with no selection', () => {
    const initialState = {
      video: {
        transcripts: [],
        openLanguages: [[lang2Code, lang2], [lang3Code, lang3]],
      },
    };

    editorRender(<LanguageSelector {...baseProps} language="" />, { initialState });
    expect(screen.getByText('Select Language')).toBeInTheDocument();
  });

  test('transcripts no Open Languages, all dropdown items should be disabled', () => {
    const initialState = {
      video: {
        transcripts: ['kl', 'el', 'sl'],
        openLanguages: [],
      },
    };

    const { container } = editorRender(<LanguageSelector {...baseProps} language="" />, { initialState });
    fireEvent.click(screen.getByRole('button', { name: 'Languages' }));
    const disabledItems = container.querySelectorAll('.disabled.dropdown-item');
    expect(disabledItems.length).toBe(3);
  });
});
