import ISO6391 from 'iso-639-1';
import { getLanguageName } from './video';

describe('getLanguageName', () => {
  let displayNamesSpy;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('returns language name from Intl.DisplayNames for given locale', () => {
    displayNamesSpy = jest.spyOn(global.Intl, 'DisplayNames').mockImplementation(() => ({
      of: jest.fn().mockReturnValue('English'),
    }));

    expect(getLanguageName('en')).toBe('English');
    expect(displayNamesSpy).toHaveBeenCalledWith(['en'], { type: 'language' });
  });

  it('falls back to ISO6391 when Intl.DisplayNames throws', () => {
    jest.spyOn(global.Intl, 'DisplayNames').mockImplementation(() => {
      throw new Error('Intl not supported');
    });
    jest.spyOn(ISO6391, 'getName').mockReturnValue('English');

    expect(getLanguageName('en')).toBe('English');
  });

  it('falls back to code when both Intl.DisplayNames and ISO6391 fail', () => {
    jest.spyOn(global.Intl, 'DisplayNames').mockImplementation(() => {
      throw new Error('Intl not supported');
    });
    jest.spyOn(ISO6391, 'getName').mockReturnValue('');

    expect(getLanguageName('xx')).toBe('xx');
  });

  it('returns empty string when langCode is missing', () => {
    expect(getLanguageName('')).toBe('');
    expect(getLanguageName(null)).toBe('');
    expect(getLanguageName(undefined)).toBe('');
  });

  it('is case-insensitive for language codes', () => {
    displayNamesSpy = jest.spyOn(global.Intl, 'DisplayNames').mockImplementation(() => ({
      of: jest.fn().mockReturnValue('English'),
    }));

    expect(getLanguageName('EN')).toBe('English');
    expect(getLanguageName('En')).toBe('English');
  });

  it('tries multiple locales in order', () => {
    const mockOf = jest.fn()
      .mockReturnValueOnce(null) // first locale returns null
      .mockReturnValueOnce('Inglés'); // second locale works

    displayNamesSpy = jest.spyOn(global.Intl, 'DisplayNames').mockImplementation(() => ({
      of: mockOf,
    }));

    expect(getLanguageName('en', ['fr', 'es'])).toBe('Inglés');
    expect(mockOf).toHaveBeenCalledTimes(2);
  });
});
