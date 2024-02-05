import { MESSAGE_ERROR_TYPES } from '../constants';

/**
 * Determines the block type based on the types of messages in the given array.
 * @param {Array} messages - An array of message objects.
 * @param {Object[]} messages.type - The type of each message (e.g., MESSAGE_ERROR_TYPES.error).
 * @returns {string} - The block type determined by the messages (e.g., 'warning' or 'error').
 */
// eslint-disable-next-line import/prefer-default-export
export const getMessagesBlockType = (messages) => {
  let type = MESSAGE_ERROR_TYPES.warning;
  if (messages.some((message) => message.type === MESSAGE_ERROR_TYPES.error)) {
    type = MESSAGE_ERROR_TYPES.error;
  }
  return type;
};
