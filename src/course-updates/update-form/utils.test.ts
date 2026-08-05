import type { IntlShape } from 'react-intl';
import { REQUEST_TYPES } from '../constants';
import { geUpdateFormSettings } from './utils';

const intl = {
  formatMessage: (message: { defaultMessage: string; }) => message.defaultMessage,
} as unknown as IntlShape;

const values = (content: string) => ({ id: 1, date: 'July 11, 2023', content });
const validationSchema = geUpdateFormSettings(
  REQUEST_TYPES.add_new_update,
  values('Real content'),
  intl,
).validationSchema;

describe('update form validation', () => {
  it.each(['', '   ', '<p>&nbsp;</p>', '<p><br></p>'])('rejects blank content: %s', async (content) => {
    await expect(validationSchema.isValid(values(content))).resolves.toBe(false);
  });

  it('accepts real content', async () => {
    await expect(validationSchema.isValid(values('<p>Real content</p>'))).resolves.toBe(true);
  });

  it('keeps handouts content optional', async () => {
    const schema = geUpdateFormSettings(
      REQUEST_TYPES.edit_handouts,
      { data: '' },
      intl,
    ).validationSchema;
    await expect(schema.isValid({})).resolves.toBe(true);
  });
});
