import React from 'react';
import PropTypes from 'prop-types';
import { Remove, Check } from '@edx/paragon/icons';
import { DataTable } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import _ from 'lodash';

import messages from './messages';
import appMessages from '../app-config-form/messages';
import { FEATURE_TYPES } from '../data/constants';
import './FeaturesTable.scss';

function FeaturesTable({ apps, features, intl }) {
  const {
    basic, partial, full, common,
  } = _.groupBy(features, (feature) => feature.featureSupportType);

  const createRow = (feature) => {
    const appCheckmarkCells = {};
    // DataTable wants 'data' to be    an array of objects where each property of an object
    // represents a cell in that row, identified by its key.
    apps.forEach(app => {
      // If our app's set of feature Ids includes this feature, return a checkmark.
      // i.e, if this app has the current feature, check it!
      if (FEATURE_TYPES.includes(feature)) {
        appCheckmarkCells[app.id] = <div key={feature} data-testid={feature} />;
      } else {
        appCheckmarkCells[app.id] = (
          <div
            className="text-center"
            key={`${app.id}&${feature.id}`}
            data-testid={`${app.id}-${feature.id.replaceAll('.', '-')}`}
          >
            {
                app.featureIds.includes(feature.id)
                  ? <Check id="check-icon" className="text-success-500" />
                  : <Remove id="remove-icon" className="text-light-700" />
              }
          </div>
        );
      }
    });

    return {
      feature: FEATURE_TYPES.includes(feature) ? (
        <span className="font-weight-bold">
          {intl.formatMessage(messages[`featureType-${feature}`])}
        </span>
      )
        : intl.formatMessage(messages[`featureName-${feature.id}`]),
      // 'feature' is the identifier for cells in the first column.
      // This is spreading the app IDs from appCheckmarkCells into the return array, creating
      // one object with 'feature' and the app.id keys from above.  The values are the JSX
      // above with the font awesome checkmarks in 'em
      ...appCheckmarkCells,
    };
  };

  return (
    <DataTable
      itemCount={features.length}
      data={
        [
          { ...createRow('basic') },
          ...basic.map((feature) => createRow(feature)),
          { ...createRow('partial') },
          ...partial.map((feature) => createRow(feature)),
          { ...createRow('full') },
          ...full.map((feature) => createRow(feature)),
          { ...createRow('common') },
          ...common.map((feature) => createRow(feature)),
        ]
      }
      columns={[
        {
          Header: '',
          accessor: 'feature',
        },
        // We're converting our apps array into a bunch of objects with "Header" and "accessor"
        // keys, like DataTable expects.
        ...apps.map(app => ({
          Header: intl.formatMessage(appMessages[`appName-${app.id}`]),
          accessor: app.id,
        })),
      ]}
    >
      <DataTable.Table />
    </DataTable>
  );
}

export default injectIntl(FeaturesTable);

FeaturesTable.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  features: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: intlShape.isRequired,
};
