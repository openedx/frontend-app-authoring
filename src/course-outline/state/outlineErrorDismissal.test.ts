import {
  computeErrorSignature,
  filterDismissedErrors,
  pruneDismissedErrorSignatures,
} from './outlineErrorDismissal';

describe('computeErrorSignature', () => {
  it('returns "null" for null input', () => {
    expect(computeErrorSignature(null)).toBe('null');
  });

  it('produces same signature for equal payloads', () => {
    const a = { type: 'serverError', data: '{"msg":"fail"}', status: 500, dismissible: true };
    const b = { type: 'serverError', data: '{"msg":"fail"}', status: 500, dismissible: true };
    expect(computeErrorSignature(a)).toBe(computeErrorSignature(b));
  });

  it('produces different signature when error data changes', () => {
    const a = { type: 'serverError', data: '{"msg":"fail"}', status: 500, dismissible: true };
    const b = { type: 'serverError', data: '{"msg":"changed"}', status: 500, dismissible: true };
    expect(computeErrorSignature(a)).not.toBe(computeErrorSignature(b));
  });

  it('ignores extra fields beyond the stable set', () => {
    const a = { type: 'serverError', data: '{"msg":"fail"}', status: 500, dismissible: true };
    const b = { type: 'serverError', data: '{"msg":"fail"}', status: 500, dismissible: true, extra: 'ignored' };
    expect(computeErrorSignature(a)).toBe(computeErrorSignature(b));
  });
});

describe('filterDismissedErrors', () => {
  it('returns base errors unchanged when no dismissals', () => {
    const base = { a: { type: 'serverError' }, b: null };
    expect(filterDismissedErrors(base, {})).toEqual(base);
  });

  it('hides error when signature matches', () => {
    const error = { type: 'serverError', data: 'fail', status: 500, dismissible: true };
    const sig = computeErrorSignature(error);
    const base = { outlineIndexApi: error, otherApi: null };
    const result = filterDismissedErrors(base, { outlineIndexApi: sig });
    expect(result.outlineIndexApi).toBeNull();
    expect(result.otherApi).toBeNull();
  });

  it('does not hide error when signature differs (error changed)', () => {
    const oldError = { type: 'serverError', data: 'old message', status: 500, dismissible: true };
    const newError = { type: 'serverError', data: 'new message', status: 500, dismissible: true };
    const oldSig = computeErrorSignature(oldError);
    const base = { outlineIndexApi: newError };
    // Stored signature is from the old error — current error has different signature.
    const result = filterDismissedErrors(base, { outlineIndexApi: oldSig });
    expect(result.outlineIndexApi).toEqual(newError);
  });

  it('handles mixed: hides matching, shows non-matching, clears null', () => {
    const errA = { type: 'serverError', data: 'A', status: 500, dismissible: true };
    const errB = { type: 'serverError', data: 'B', status: 500, dismissible: true };
    const sigA = computeErrorSignature(errA);
    const base = {
      keyA: errA,
      keyB: errB,
      keyC: null,
    };
    const result = filterDismissedErrors(base, {
      keyA: sigA, // matches → hidden
      keyB: 'wrong', // doesn't match → visible
      keyC: 'stale', // error is null → visible (null)
    });
    expect(result.keyA).toBeNull();
    expect(result.keyB).toEqual(errB);
    expect(result.keyC).toBeNull();
  });

  it('ignores dismissal keys not present in base errors', () => {
    const base = { a: { type: 'serverError' } };
    const result = filterDismissedErrors(base, { nonexistent: 'sig' });
    expect(result).toEqual(base);
  });
});

describe('pruneDismissedErrorSignatures', () => {
  it('keeps entry when error unchanged', () => {
    const err = { type: 'serverError', data: 'msg', status: 500, dismissible: true };
    const sig = computeErrorSignature(err);
    const result = pruneDismissedErrorSignatures(
      { k: err },
      { k: sig },
    );
    expect(result).toEqual({ k: sig });
  });

  it('drops entry when error changed (different signature)', () => {
    const oldErr = { type: 'serverError', data: 'old', status: 500, dismissible: true };
    const newErr = { type: 'serverError', data: 'new', status: 500, dismissible: true };
    const oldSig = computeErrorSignature(oldErr);
    const result = pruneDismissedErrorSignatures(
      { k: newErr },
      { k: oldSig },
    );
    expect(result).toEqual({});
  });

  it('handles mixed: keeps valid, drops stale and null', () => {
    const errValid = { type: 'serverError', data: 'valid', status: 500, dismissible: true };
    const sigValid = computeErrorSignature(errValid);
    const sigChanged = computeErrorSignature({ type: 'serverError', data: 'old', status: 500, dismissible: true });

    const result = pruneDismissedErrorSignatures(
      {
        keep: errValid,
        changed: { type: 'serverError', data: 'new', status: 500, dismissible: true },
        cleared: null,
        missing: null,
      },
      {
        keep: sigValid,
        changed: sigChanged,
        cleared: 'stale-sig',
        missing: 'not-in-base',
      },
    );
    // Only 'keep' survives.
    expect(result).toEqual({ keep: sigValid });
  });
});
