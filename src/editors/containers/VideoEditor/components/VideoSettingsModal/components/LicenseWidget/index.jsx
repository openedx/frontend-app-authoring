import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Stack } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import { actions, selectors } from '../../../../../../data/redux';
import * as hooks from './hooks';
import messages from './messages';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import LicenseBlurb from './LicenseBlurb';
import LicenseSelector from './LicenseSelector';
import LicenseDetails from './LicenseDetails';
import LicenseDisplay from './LicenseDisplay';

const LicenseWidget = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  // Redux state selectors
  const isLibrary = useSelector(selectors.app.isLibrary);
  const licenseType = useSelector(selectors.video.licenseType);
  const licenseDetails = useSelector(selectors.video.licenseDetails);
  const courseLicenseType = useSelector(selectors.video.courseLicenseType);
  const courseLicenseDetails = useSelector(selectors.video.courseLicenseDetails);

  // Dispatch action
  const updateField = (stateUpdate) => {
    dispatch(actions.video.updateField(stateUpdate));
  };

  // Business logic hooks
  const { license, details, level } = hooks.determineLicense({
    isLibrary,
    licenseType,
    licenseDetails,
    courseLicenseType,
    courseLicenseDetails,
  });
  const { licenseDescription, levelDescription } = hooks.determineText({ level });

  return (
    <CollapsibleFormWidget
      subtitle={(
        <div>
          <LicenseBlurb license={license} details={details} />
          <div className="x-small mt-2">{levelDescription}</div>
        </div>
      )}
      title={intl.formatMessage(messages.title)}
    >
      <Stack gap={4}>
        {license ? (
          <>
            <LicenseSelector license={license} level={level} />
            <LicenseDetails license={license} details={details} level={level} />
            <LicenseDisplay
              license={license}
              details={details}
              licenseDescription={licenseDescription}
            />
          </>
        ) : null }
        {!licenseType ? (
          <>
            <div className="border-primary-100 border-bottom my-2" />
            <Button
              className="text-primary-500 font-weight-bold justify-content-start pl-0"
              size="sm"
              iconBefore={Add}
              variant="link"
              onClick={() => updateField({ licenseType: 'select', licenseDetails: {} })}
            >
              <FormattedMessage {...messages.addLicenseButtonLabel} />
            </Button>
          </>
        ) : null }
      </Stack>
    </CollapsibleFormWidget>
  );
};

LicenseWidget.propTypes = {
  // If needed for test or wrapper use
  isLibrary: PropTypes.bool,
  licenseType: PropTypes.string,
  licenseDetails: PropTypes.shape({}),
  courseLicenseType: PropTypes.string,
  courseLicenseDetails: PropTypes.shape({}),
  updateField: PropTypes.func,
};

export default LicenseWidget;
