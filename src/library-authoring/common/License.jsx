import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreativeCommonsBy,
  faCreativeCommonsNc,
  faCreativeCommonsNd,
  faCreativeCommonsSa,
} from '@fortawesome/free-brands-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { commonsOptionsFromSpec, commonsOptionsShape, linkFromSpec } from './data';
import messages from './messages';


/**
 * CreativeCommonsLicense
 * Displays a Creative Commons license in an accessible manner.
 */
export const CreativeCommonsLicenseBase = ({ intl, link, commonsOptions }) => (
  <a href={link} target="_blank" rel="noopener noreferrer license">
    <span className="sr-only">
      {intl.formatMessage(messages['library.common.license.cc.preface'])}
    </span>
    {commonsOptions.attribution && (
      <>
        <span className="sr-only">{intl.formatMessage(messages['library.common.license.cc.attribution'])}</span>
        <FontAwesomeIcon icon={faCreativeCommonsBy} className="aria-hidden mr-1" />
      </>
    )}
    {commonsOptions.nonCommercial && (
      <>
        <span className="sr-only">{intl.formatMessage(messages['library.common.license.cc.noncommercial'])}</span>
        <FontAwesomeIcon icon={faCreativeCommonsNc} className="aria-hidden mx-1" />
      </>
    )}
    {commonsOptions.noDerivatives && (
      <>
        <span className="sr-only">{intl.formatMessage(messages['library.common.license.cc.no_derivatives'])}</span>
        <FontAwesomeIcon icon={faCreativeCommonsNd} className="aria-hidden mx-1" />
      </>
    )}
    {commonsOptions.shareAlike && (
      <>
        <span className="sr-only">{intl.formatMessage(messages['library.common.license.cc.share_alike'])}</span>
        <FontAwesomeIcon icon={faCreativeCommonsSa} className="aria-hidden mx-1" />
      </>
    )}
    <strong>{intl.formatMessage(messages['library.common.license.cc.postscript'])}</strong>
  </a>
);

CreativeCommonsLicenseBase.propTypes = {
  intl: intlShape.isRequired,
  link: PropTypes.string.isRequired,
  commonsOptions: commonsOptionsShape.isRequired,
};

export const CreativeCommonsLicense = injectIntl(CreativeCommonsLicenseBase);


/**
 * Displays an 'All Rights Reserved' tag.
 */
export const AllRightsReservedBase = ({ intl }) => (
  <strong>{intl.formatMessage(messages['library.common.license.none'])}</strong>
);

AllRightsReservedBase.propTypes = {
  intl: intlShape.isRequired,
};

export const AllRightsReserved = injectIntl(AllRightsReservedBase);

/**
 * LicenseContainer
 * Given a string representing the license, either empty or in the form of a creative commons string,
 * displays an accessible license stamp with relevant URL if applicable.
 */
export const LicenseContainer = ({ spec }) => {
  const link = spec && linkFromSpec(spec);
  const commonsOptions = commonsOptionsFromSpec(spec);
  // No link, blank license. A blank license is All Rights Reserved.
  if (!link) {
    return <AllRightsReserved />;
  }
  return <CreativeCommonsLicense link={link} commonsOptions={commonsOptions} />;
};

LicenseContainer.propTypes = {
  spec: PropTypes.string.isRequired,
};
