import PropTypes from 'prop-types';

export interface Usage {
  label: string;
  url: string;
}

export interface Group {
  id: number;
  name: string;
  usage: Usage[];
  version: number;
}

export interface AvailableGroupParameters {
  courseId: string;
}

export interface AvailableGroup {
  active?: boolean;
  description?: string;
  groups: Group[];
  id: number;
  name: string;
  parameters?: AvailableGroupParameters;
  readOnly?: boolean;
  scheme: string;
  version: number;
}

export const availableGroupPropTypes = {
  active: PropTypes.bool,
  description: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      usage: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          url: PropTypes.string,
        }),
      ),
      version: PropTypes.number,
    }),
  ),
  id: PropTypes.number,
  name: PropTypes.string,
  parameters: PropTypes.shape({
    courseId: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  scheme: PropTypes.string,
  version: PropTypes.number,
};

export const MESSAGE_VALIDATION_TYPES = {
  error: 'error',
  warning: 'warning',
} as const;

export type MessageValidationType = typeof MESSAGE_VALIDATION_TYPES[keyof typeof MESSAGE_VALIDATION_TYPES];
