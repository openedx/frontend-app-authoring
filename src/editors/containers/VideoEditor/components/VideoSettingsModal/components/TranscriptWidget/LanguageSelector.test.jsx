import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import { useDispatch } from 'react-redux';
import LanguageSelector from './LanguageSelector';
import { thunkActions, selectors } from '../../../../../../data/redux';

const lang1 = 'kLinGon';
const lang1Code = 'kl';
const lang2 = 'eLvIsh';
const lang2Code = 'el';
const lang3 = 'sImLisH';
const lang3Code = 'sl';

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn().mockName('mockDispatch');
  return {
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../../../../../../data/constants/video', () => ({
  videoTranscriptLanguages: {
    [lang1Code]: lang1,
    [lang2Code]: lang2,
    [lang3Code]: lang3,
  },
}));

jest.mock('../../../../../../data/redux', () => ({
  thunkActions: {
    video: {
      updateTranscriptLanguage: jest.fn((args) => ({ updateTranscriptLanguage: args })).mockName('thunkActions.video.updateTranscriptLanguage'),
      uploadTranscript: jest.fn().mockName('thunkActions.video.uploadTranscript'),
    },
  },
  selectors: {
    video: {
      openLanguages: jest.fn(),
    },
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

  test('clicking an open language item dispatches updateTranscriptLanguage', () => {
    const mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    const { video } = selectors;
    jest.spyOn(video, 'openLanguages').mockReturnValue([[lang2Code, lang2], [lang3Code, lang3]]);
    render(<LanguageSelector index={1} language={lang1Code} />);
    fireEvent.click(screen.getByRole('button', { name: 'Languages' }));
    fireEvent.click(screen.getByText(lang2));
    expect(thunkActions.video.updateTranscriptLanguage).toHaveBeenCalledWith({
      newLanguageCode: lang2Code,
      languageBeforeChange: lang1Code,
    });
    expect(mockDispatch).toHaveBeenCalled();
  });
});
