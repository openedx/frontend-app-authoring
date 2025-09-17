// HTML symbols to unescape in a Alphanumeric value : Literal mapping.
const alphanumericMap = {
  cent: '¢',
  pound: '£',
  sect: '§',
  copy: '©',
  laquo: '«',
  raquo: '»',
  reg: '®',
  deg: '°',
  plusmn: '±',
  para: '¶',
  middot: '·',
  frac12: '½',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  sbquo: '‚',
  rdquo: '”',
  ldquo: '“',
  dagger: '†',
  Dagger: '‡',
  bull: '•',
  hellip: '…',
  prime: '′',
  Prime: '″',
  euro: '€',
  trade: '™',
  asymp: '≈',
  ne: '≠',
  le: '≤',
  ge: '≥',
  quot: '"',
};
export default alphanumericMap;

export const HEADING = '## Heading\n\n';
export const MULTIPLE_CHOICE = '( ) Option 1\n( ) Option 2\n(x) Correct\n';
export const CHECKBOXES = '[ ] Incorrect\n[x] Correct\n';
export const TEXT_INPUT = 'Type your answer here: ___\n';
export const NUMERICAL_INPUT = '= 100 +-5\n';
export const DROPDOWN = '[Dropdown: Option A\nOption B\nCorrect Option* ]\n';
export const EXPLANATION = '>> Add explanation text here <<\n';
