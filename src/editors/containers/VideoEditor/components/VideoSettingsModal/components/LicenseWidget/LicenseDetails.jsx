import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  CheckboxControl,
  Form,
  Icon,
  Stack,
} from '@openedx/paragon';
import {
  Attribution,
  Nd,
  Sa,
  Nc,
} from '@openedx/paragon/icons';

import { actions } from '../../../../../../data/redux';
import { LicenseLevel, LicenseTypes } from '../../../../../../data/constants/licenses';
import messages from './messages';

const LicenseDetails = ({
  license,
  details,
  level,
  // redux
  updateField,
}) => (
  level !== LicenseLevel.course && details && license !== 'select' ? (
    <div className="x-small border-primary-100 border-bottom m-0 pr-1">
      <Form.Group className="pb-2">
        <div className="mb-3">
          <FormattedMessage {...messages.detailsSubsectionTitle} />
        </div>
        {license === LicenseTypes.allRightsReserved ? (
          <div className="mt-2">
            <FormattedMessage {...messages.allRightsReservedSectionMessage} />
          </div>
        ) : null}
        {license === LicenseTypes.creativeCommons
          ? (
            <Stack gap={4}>
              <div className="border-primary-100 border-bottom pb-4">
                <Form.Group>
                  <ActionRow>
                    <Icon className="text-primary-500" src={Attribution} />
                    <Form.Label className="my-0 text-primary-500">
                      <FormattedMessage {...messages.attributionCheckboxLabel} />
                    </Form.Label>
                    <ActionRow.Spacer />
                    <CheckboxControl
                      disabled
                      checked
                      aria-label="Checkbox"
                    />
                  </ActionRow>
                </Form.Group>
                <div>
                  <FormattedMessage {...messages.attributionSectionDescription} />
                </div>
              </div>
              <div className="border-primary-100 border-bottom pb-4">
                <Form.Group>
                  <ActionRow>
                    <Icon src={Nc} />
                    <Form.Label className="my-0 text-primary-500">
                      <FormattedMessage {...messages.noncommercialCheckboxLabel} />
                    </Form.Label>
                    <ActionRow.Spacer />
                    <CheckboxControl
                      checked={details.noncommercial}
                      disabled={level === LicenseLevel.course}
                      onChange={(e) => updateField({
                        licenseDetails: {
                          ...details,
                          noncommercial: e.target.checked,
                        },
                      })}
                      aria-label="Checkbox"
                    />
                  </ActionRow>
                </Form.Group>
                <div>
                  <FormattedMessage {...messages.noncommercialSectionDescription} />
                </div>
              </div>
              <div className="border-primary-100 border-bottom pb-4">
                <Form.Group>
                  <ActionRow>
                    <Icon src={Nd} />
                    <Form.Label className="my-0 text-primary-500">
                      <FormattedMessage {...messages.noDerivativesCheckboxLabel} />
                    </Form.Label>
                    <ActionRow.Spacer />
                    <CheckboxControl
                      checked={details.noDerivatives}
                      disabled={level === LicenseLevel.course}
                      onChange={(e) => updateField({
                        licenseDetails: {
                          ...details,
                          noDerivatives: e.target.checked,
                          shareAlike: e.target.checked ? false : details.shareAlike,
                        },
                      })}
                      aria-label="Checkbox"
                    />
                  </ActionRow>
                </Form.Group>
                <div>
                  <FormattedMessage {...messages.noDerivativesSectionDescription} />
                </div>
              </div>
              <div>
                <Form.Group>
                  <ActionRow>
                    <Icon src={Sa} />
                    <Form.Label className="my-0 text-primary-500">
                      <FormattedMessage {...messages.shareAlikeCheckboxLabel} />
                    </Form.Label>
                    <ActionRow.Spacer />
                    <CheckboxControl
                      checked={details.shareAlike}
                      disabled={level === LicenseLevel.course}
                      onChange={(e) => updateField({
                        licenseDetails: {
                          ...details,
                          shareAlike: e.target.checked,
                          noDerivatives: e.target.checked ? false : details.noDerivatives,
                        },
                      })}
                      aria-label="Checkbox"
                    />
                  </ActionRow>
                </Form.Group>
                <div>
                  <FormattedMessage {...messages.shareAlikeSectionDescription} />
                </div>
              </div>
            </Stack>
          ) : null}
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

export const LicenseDetailsInternal = LicenseDetails; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LicenseDetails));
