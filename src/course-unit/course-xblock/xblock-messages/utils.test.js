import { MESSAGE_ERROR_TYPES } from '../constants';
import { getMessagesBlockType } from './utils';

describe('xblock-messages utils', () => {
  describe('getMessagesBlockType', () => {
    it('returns "warning" when there are no error messages', () => {
      const messages = [
        { type: MESSAGE_ERROR_TYPES.warning, text: 'This is a warning' },
        { type: MESSAGE_ERROR_TYPES.warning, text: 'Another warning' },
      ];
      const result = getMessagesBlockType(messages);

      expect(result).toBe(MESSAGE_ERROR_TYPES.warning);
    });

    it('returns "error" when there is at least one error message', () => {
      const messages = [
        { type: MESSAGE_ERROR_TYPES.warning, text: 'This is a warning' },
        { type: MESSAGE_ERROR_TYPES.error, text: 'This is an error' },
        { type: MESSAGE_ERROR_TYPES.warning, text: 'Another warning' },
      ];
      const result = getMessagesBlockType(messages);

      expect(result).toBe(MESSAGE_ERROR_TYPES.error);
    });

    it('returns "error" when there are only error messages', () => {
      const messages = [
        { type: MESSAGE_ERROR_TYPES.error, text: 'This is an error' },
        { type: MESSAGE_ERROR_TYPES.error, text: 'Another error' },
      ];
      const result = getMessagesBlockType(messages);

      expect(result).toBe(MESSAGE_ERROR_TYPES.error);
    });

    it('returns "warning" when there are no messages', () => {
      const messages = [];
      const result = getMessagesBlockType(messages);

      expect(result).toBe(MESSAGE_ERROR_TYPES.warning);
    });
  });
});
