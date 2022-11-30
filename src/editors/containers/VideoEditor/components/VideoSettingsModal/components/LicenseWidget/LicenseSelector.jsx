import React from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import {
  Form,
  Icon,
  IconButtonWithTooltip,
} from '@edx/paragon';
import { Delete } from '@edx/paragon/icons';

import { actions, selectors } from '../../../../../../data/redux';
import hooks from './hooks';
import messages from './messages';
import { LicenseLevel, LicenseNames, LicenseTypes } from '../../../../../../data/constants/licenses';

export const LicenseSelector = ({
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
    <Form.Group className="mt-2 mx-2">
      <Form.Row className="mt-4.5">
        <Form.Control
          as="select"
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
          <IconButtonWithTooltip
            iconAs={Icon}
            src={Delete}
            onClick={() => {
              ref.current.value = courseLicenseType;
              updateField({ licenseType: '', licenseDetails: {} });
            }}
            tooltipPlacement="top"
            tooltipContent={<FormattedMessage {...messages.deleteLicenseSelection} />}
          />
        ) : null }
      </Form.Row>
      <div>{levelDescription}</div>
    </Form.Group>
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

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(LicenseSelector));
