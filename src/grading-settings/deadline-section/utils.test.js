import { formatTime, timerValidation } from './utils';

const setShowSavePrompt = jest.fn();
const setIsError = jest.fn();

describe('formatTime', () => {
  it('formats single-digit time values correctly', () => {
    expect(formatTime(5)).toBe('05');
    expect(formatTime(9)).toBe('09');
  });

  it('does not modify double-digit time values', () => {
    expect(formatTime(10)).toBe('10');
    expect(formatTime(45)).toBe('45');
  });
});

describe('timerValidation', () => {
  it('handles empty input', () => {
    const result = timerValidation('', setShowSavePrompt, setIsError);

    expect(result).toBe(false);
    expect(setShowSavePrompt).toHaveBeenCalledWith(false);
    expect(setIsError).toHaveBeenCalledWith(true);
  });

  it('validates correct HH:MM input', () => {
    const result = timerValidation('12:34', setShowSavePrompt, setIsError);

    expect(result).toBe(true);
    expect(setShowSavePrompt).toHaveBeenCalledWith(true);
    expect(setIsError).toHaveBeenCalledWith(false);
  });

  it('handles invalid input', () => {
    const result = timerValidation('abc', setShowSavePrompt, setIsError);

    expect(result).toBe(false);
    expect(setShowSavePrompt).toHaveBeenCalledWith(false);
    expect(setIsError).toHaveBeenCalledWith(true);
  });
});
