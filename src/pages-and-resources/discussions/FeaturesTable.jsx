import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default function FeaturesTable({ forums, featuresList }) {
  return (
    <div className="table-responsive features-table border border-info-300 p-3 mb-4">
      <table className="w-100">
        <thead>
          <tr>
            <th>&nbsp;</th>
            {forums.map(forum => (
              <th className="text-center py-3" key={forum.forumId}><h5>{forum.forumId}</h5></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featuresList.map(feature => (
            <tr key={feature}>
              <th key={feature} className="py-3">{feature}</th>
              {forums.map(forum => (
                <td className="text-center py-3" key={forum.forumId}>
                  {forum.features.includes(feature) && <FontAwesomeIcon icon={faCheck} />}
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
  forums: PropTypes.arrayOf(PropTypes.object).isRequired,
  featuresList: PropTypes.arrayOf(PropTypes.string).isRequired,
};
