import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import {
  Card,
  Form,
  Icon,
  Stack,
} from '@edx/paragon';
import {
  Attribution,
  Nd,
  Sa,
  Nc,
} from '@edx/paragon/icons';

import { actions } from '../../../../../../data/redux';
import { LicenseLevel, LicenseTypes } from '../../../../../../data/constants/licenses';
import { messages } from './messages';

export const LicenseDetails = ({
  license,
  details,
  level,
  // redux
  updateField,
}) => (
  level === LicenseLevel.block && details && license !== 'select' ? (
    <div className="border-primary-100 border-top pb-3">
      <Form.Group>
        <Form.Label className="mt-3">
          <FormattedMessage {...messages.detailsSubsectionTitle} />
        </Form.Label>

        {license === LicenseTypes.allRightsReserved
          ? (
            <Form.Text>
              <FormattedMessage {...messages.allRightsReservedSectionMessage} />
            </Form.Text>
          )
          : null}

        {license === LicenseTypes.creativeCommons
          ? (
            <Stack gap={3}>
              <Card>
                <Card.Header
                  title={(
                    <div className="d-flex flex-row flex-nowrap">
                      <Icon src={Attribution} />
                      <FormattedMessage {...messages.attributionCheckboxLabel} />
                    </div>
                  )}
                  actions={<Form.Checkbox checked disabled />}
                />
                <Card.Section>
                  <FormattedMessage {...messages.attributionSectionDescription} />
                </Card.Section>
              </Card>

              <Card
                isClickable
                onClick={() => updateField({
                  licenseDetails: {
                    ...details,
                    noncommercial: !details.noncommercial,
                  },
                })}
              >
                <Card.Header
                  title={(
                    <div className="d-flex flex-row flex-row">
                      <Icon src={Nc} />
                      <FormattedMessage {...messages.noncommercialCheckboxLabel} />
                    </div>
                  )}
                  actions={(
                    <Form.Checkbox
                      checked={details.noncommercial}
                      disabled={level !== LicenseLevel.block}
                      onChange={(e) => updateField({
                        licenseDetails: {
                          ...details,
                          noncommercial: e.target.checked,
                        },
                      })}
                    />
                  )}
                />
                <Card.Section>
                  <FormattedMessage {...messages.noncommercialSectionDescription} />
                </Card.Section>
              </Card>

              <Card
                isClickable
                onClick={() => updateField({
                  licenseDetails: {
                    ...details,
                    noDerivatives: !details.noDerivatives,
                    shareAlike: !details.noDerivatives ? false : details.shareAlike,
                  },
                })}
              >
                <Card.Header
                  title={(
                    <div className="d-flex flex-row flex-row">
                      <Icon src={Nd} />
                      <FormattedMessage {...messages.noDerivativesCheckboxLabel} />
                    </div>
                  )}
                  actions={(
                    <Form.Checkbox
                      checked={details.noDerivatives}
                      disabled={level !== LicenseLevel.block}
                      onChange={(e) => updateField({
                        licenseDetails: {
                          ...details,
                          noDerivatives: e.target.checked,
                          shareAlike: e.target.checked ? false : details.shareAlike,
                        },
                      })}
                    />
                  )}
                />
                <Card.Section>
                  <FormattedMessage {...messages.noDerivativesSectionDescription} />
                </Card.Section>
              </Card>

              <Card
                isClickable
                onClick={() => updateField({
                  licenseDetails: {
                    ...details,
                    shareAlike: !details.shareAlike,
                    noDerivatives: !details.shareAlike ? false : details.noDerivatives,
                  },
                })}
              >
                <Card.Header
                  title={(
                    <div className="d-flex flex-row flex-row">
                      <Icon src={Sa} />
                      <FormattedMessage {...messages.shareAlikeCheckboxLabel} />
                    </div>
                  )}
                  actions={(
                    <Form.Checkbox
                      checked={details.shareAlike}
                      disabled={level !== LicenseLevel.block}
                      onChange={(e) => updateField({
                        licenseDetails: {
                          ...details,
                          shareAlike: e.target.checked,
                          noDerivatives: e.target.checked ? false : details.noDerivatives,
                        },
                      })}
                    />
                  )}
                />
                <Card.Section>
                  <FormattedMessage {...messages.shareAlikeSectionDescription} />
                </Card.Section>
              </Card>
            </Stack>
          )
          : null}

      </Form.Group>
    </div>
  ) : null
);

LicenseDetails.propTypes = {
  license: PropTypes.string.isRequired,
  details: PropTypes.shape({
    attribution: PropTypes.bool.isRequired,
    noncommercial: PropTypes.bool.isRequired,
    noDerivatives: PropTypes.bool.isRequired,
    shareAlike: PropTypes.bool.isRequired,
  }).isRequired,
  level: PropTypes.string.isRequired,
  // redux
  updateField: PropTypes.func.isRequired,
};

export const mapStateToProps = () => ({});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LicenseDetails));
