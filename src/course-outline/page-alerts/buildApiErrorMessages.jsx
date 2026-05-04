import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import {
  Hyperlink,
  Truncate,
} from '@openedx/paragon';
import { uniqBy } from 'lodash';

import { API_ERROR_TYPES } from '../constants';
import messages from './messages';

export const buildApiErrorMessages = ({ errors = {}, intl }) => uniqBy(
  Object.entries(errors)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => {
      switch (value.type) {
        case API_ERROR_TYPES.forbidden: {
          const description = intl.formatMessage(messages.forbiddenAlertBody, {
            LMS: (
              <Hyperlink
                destination={`${getConfig().LMS_BASE_URL}`}
                target="_blank"
                showLaunchIcon={false}
              >
                {intl.formatMessage(messages.forbiddenAlertLmsUrl)}
              </Hyperlink>
            ),
          });
          return {
            key,
            desc: description,
            title: intl.formatMessage(messages.forbiddenAlert),
            dismissible: value.dismissible,
          };
        }
        case API_ERROR_TYPES.serverError: {
          const description = (
            <Truncate.Deprecated lines={2}>
              {value.data || intl.formatMessage(messages.serverErrorAlertBody)}
            </Truncate.Deprecated>
          );
          return {
            key,
            desc: description,
            title: intl.formatMessage(messages.serverErrorAlert),
            dismissible: value.dismissible,
          };
        }
        case API_ERROR_TYPES.networkError:
          return {
            key,
            title: intl.formatMessage(messages.networkErrorAlert),
            dismissible: value.dismissible,
          };
        default:
          return {
            key,
            title: value.data,
            dismissible: value.dismissible,
          };
      }
    }),
  'title',
);
