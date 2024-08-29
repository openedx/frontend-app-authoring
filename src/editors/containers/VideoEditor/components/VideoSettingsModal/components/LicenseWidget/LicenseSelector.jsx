import React from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Form,
  Icon,
  IconButtonWithTooltip,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';

import { actions, selectors } from '../../../../../../data/redux';
import * as hooks from './hooks';
import messages from './messages';
import { LicenseLevel, LicenseNames, LicenseTypes } from '../../../../../../data/constants/licenses';

const LicenseSelector = ({
  license,
  level,
  // injected
  intl,
  // redux
  courseLicenseType,
  updateField,
}) => {
  const { levelDescription } = hooks.determineText({ level });
  const onLicenseChange = hooks.onSelectLicense({ dispatch: useDispatch() });
  const ref = React.useRef();
  return (
    <>
      <ActionRow>
        <Form.Control
          as="select"
          className="w-100 m-0 p-0"
          ref={ref}
          defaultValue={license}
          disabled={level === LicenseLevel.course}
          floatingLabel={intl.formatMessage(messages.licenseTypeLabel)}
          onChange={(e) => onLicenseChange(e.target.value)}
        >
          {Object.entries(LicenseNames).map(([key, text]) => {
            if (license === key) { return (<option value={LicenseTypes[key]} selected>{text}</option>); }
            if (key === LicenseTypes.select) { return (<option hidden>{text}</option>); }
            return (<option value={LicenseTypes[key]}>{text}</option>);
          })}
        </Form.Control>
        {level !== LicenseLevel.course ? (
          <>
            <ActionRow.Spacer />
            <IconButtonWithTooltip
              iconAs={Icon}
              src={DeleteOutline}
              onClick={() => {
                ref.current.value = courseLicenseType;
                updateField({ licenseType: '', licenseDetails: {} });
              }}
              tooltipPlacement="top"
              tooltipContent={<FormattedMessage {...messages.deleteLicenseSelection} />}
            />
          </>
        ) : null }
      </ActionRow>
      <div className="x-small mt-3">{levelDescription}</div>
      {license === LicenseTypes.select ? null : <div className="border-primary-100 mt-3 border-bottom" />}
    </>
  );
};

LicenseSelector.propTypes = {
  license: PropTypes.string.isRequired,
  level: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
  // redux
  courseLicenseType: PropTypes.string.isRequired,
  updateField: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  courseLicenseType: selectors.video.courseLicenseType(state),
});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});

export const LicenseSelectorInternal = LicenseSelector; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LicenseSelector));
