import { openLanguages } from './selectors';
import { openLanguagesDataSet } from '../../constants/video';

describe('openLanguages selector', () => {
  const allLangCodes = Object.keys(openLanguagesDataSet);

  it('should return all languages when transcripts is undefined', () => {
    const state = { transcripts: undefined };
    const result = openLanguages.resultFunc(state.transcripts);
    expect(result).toEqual(allLangCodes);
  });

  it('should return only languages not present in transcripts', () => {
    const transcripts = [allLangCodes[0], allLangCodes[1]];
    const state = { transcripts };
    const result = openLanguages.resultFunc(state.transcripts);
    const expected = allLangCodes.filter(
      code => !transcripts.includes(code),
    );
    expect(result).toEqual(expected);
  });

  it('should return empty array if all languages are in transcripts', () => {
    const transcripts = [...allLangCodes];
    const state = { transcripts };
    const result = openLanguages.resultFunc(state.transcripts);
    expect(result).toEqual([]);
  });
});
