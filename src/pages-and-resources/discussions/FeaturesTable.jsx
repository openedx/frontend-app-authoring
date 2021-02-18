import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { DataTable } from '@edx/paragon';

export default function FeaturesTable({ apps, features }) {
  return (
    <>
      <DataTable
        itemCount={features.length}
        data={features.map(feature => {
          const appChecks = {};
          apps.forEach(app => {
            appChecks[app.id] = app.featureIds.includes(feature.id) ? (
              <div key={`${app.id}&${feature.id}`}>
                <FontAwesomeIcon icon={faCheck} />
              </div>
            ) : null;
          });

          return {
            feature: feature.name,
            ...appChecks,
          };
        })}
        columns={[
          {
            Header: '',
            accessor: 'feature',
          },
          ...apps.map(app => ({
            Header: app.name,
            accessor: app.id,
          })),
        ]}
      >
        <DataTable.Table />
      </DataTable>
    </>
  );
}

FeaturesTable.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  features: PropTypes.arrayOf(PropTypes.object).isRequired,
};
