import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default function FeaturesTable({ apps, features }) {
  return (
    <div className="table-responsive features-table border border-info-300 p-3 mb-4">
      <table className="w-100">
        <thead>
          <tr>
            <th>&nbsp;</th>
            {apps.map(app => (
              <th key={app.id} className="text-center py-3">
                <h5>{app.name}</h5>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map(feature => (
            <tr key={feature.id}>
              <th key={feature.id} className="py-3">
                {feature.name}
              </th>
              {apps.map(app => (
                <td className="text-center py-3" key={app.id}>
                  {app.featureIds.includes(feature.id) && (
                    <FontAwesomeIcon icon={faCheck} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

FeaturesTable.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  features: PropTypes.arrayOf(PropTypes.object).isRequired,
};
