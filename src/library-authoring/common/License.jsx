import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, Row } from '@edx/paragon';
import {
  Attribution,
  Cc,
  Copyright,
  Nc,
  Nd,
  Sa,
} from '@edx/paragon/icons';
import { commonsOptionsFromSpec, commonsOptionsShape, linkFromSpec } from './data';
import messages from './messages';

/**
 * CreativeCommonsLicense
 * Displays a Creative Commons license in an accessible manner.
 */
export const CreativeCommonsLicenseBase = ({ intl, link, commonsOptions }) => (
  <a href={link} target="_blank" rel="noopener noreferrer license" className="text-gray-700">
    <Row className="m-0 align-items-center">
      <>
        <span className="sr-only">
          {intl.formatMessage(messages['library.common.license.cc.preface'])}
        </span>
        <Icon
          src={Cc}
          className="mr-1"
          size="small"
        />
      </>
      {commonsOptions.attribution && (
        <>
          <span className="sr-only">{intl.formatMessage(messages['library.common.license.cc.attribution'])}</span>
          <Icon
            src={Attribution}
            className="mr-1"
            size="small"
          />
        </>
      )}
      {commonsOptions.nonCommercial && (
        <>
          <span className="sr-only">{intl.formatMessage(messages['library.common.license.cc.noncommercial'])}</span>
          <Icon
            src={Nc}
            className="mr-1"
            size="small"
          />
        </>
      )}
      {commonsOptions.noDerivatives && (
        <>
          <span className="sr-only">{intl.formatMessage(messages['library.common.license.cc.no_derivatives'])}</span>
          <Icon
            src={Nd}
            className="mr-1"
            size="small"
          />
        </>
      )}
      {commonsOptions.shareAlike && (
        <>
          <span className="sr-only">{intl.formatMessage(messages['library.common.license.cc.share_alike'])}</span>
          <Icon
            src={Sa}
            className="mr-1"
            size="small"
          />
        </>
      )}
      <div>
        {intl.formatMessage(messages['library.common.license.cc.postscript'])}
      </div>
    </Row>
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
  <Row className="m-0 align-items-center">
    <Icon src={Copyright} size="inline" />
    <div className="ml-1">
      {intl.formatMessage(messages['library.common.license.none'])}
    </div>
  </Row>

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
