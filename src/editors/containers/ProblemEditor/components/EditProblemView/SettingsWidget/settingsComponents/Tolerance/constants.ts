import messages from './messages';

export const ToleranceTypes = {
  percent: {
    type: 'Percent',
    message: messages.typesPercentage,
  },
  number: {
    type: 'Number',
    message: messages.typesNumber,
  },
  none: {
    type: 'None',
    message: messages.typesNone,
  },
} as const;
