import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  Row,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { LicenseContainer } from './License';
import {
  commonsOptionsFromSpec,
  specFromCommonsOptions,
  withCommonsOption,
} from './data';
import messages from './messages';

/**
 * LicenseField
 * Template component for the license field used in library creation and editing. Managed by LicenseFieldContainer.
 */
export const LicenceFieldBase = (
  {
    intl,
    reservedVariant,
    commonsVariant,
    updateValue,
    value,
    spec,
    updateFlags,
    commonsOptions,
    name,
  },
) => (
  <div>
    <label htmlFor={name}>
      {intl.formatMessage(messages['library.common.fields.license.label'])}
    </label>
    <Row className="m-0">
      <ButtonGroup>
        <Button name={name} className="text-uppercase" variant={reservedVariant} onClick={() => updateValue('')}>
          {intl.formatMessage(messages['library.common.license.none'])}
        </Button>
        <Button name={name} className="text-uppercase" variant={commonsVariant} onClick={() => updateValue(spec)}>
          {intl.formatMessage(messages['library.common.license.cc'])}
        </Button>
      </ButtonGroup>
    </Row>
    {value && (
      <>
        <div className="pt-5">
          <strong>{intl.formatMessage(messages['library.common.fields.license.cc.options'])}</strong>
        </div>
        <Row className="border-bottom py-2">
          <Col xs={1} className="text-center align-self-center">
            <Form.Checkbox
              id="attribution"
              name="attribution"
              className="m-0 p-0 position-relative"
              disabled
              checked
            />
          </Col>
          <Col xs={2} className="text-left align-self-center">
            <label htmlFor="attribution">
              {intl.formatMessage(messages['library.common.license.cc.attribution'])}
            </label>
          </Col>
          <Col xs={9} className="align-self-center">
            {intl.formatMessage(messages['library.common.fields.license.cc.attribution'])}
          </Col>
        </Row>
        <Row className="border-bottom py-2">
          <Col xs={1} className="text-center align-self-center">
            <Form.Checkbox
              id="nonCommercial"
              name="nonCommercial"
              className="m-0 p-0 position-relative"
              onChange={updateFlags}
              checked={commonsOptions.nonCommercial}
            />
          </Col>
          <Col xs={2} className="text-left align-self-center">
            <label htmlFor="nonCommercial">
              {intl.formatMessage(messages['library.common.license.cc.noncommercial'])}
            </label>
          </Col>
          <Col xs={9} className="align-self-center">
            {intl.formatMessage(messages['library.common.fields.license.cc.noncommercial'])}
          </Col>
        </Row>
        <Row className="border-bottom py-2">
          <Col xs={1} className="text-center align-self-center">
            <Form.Checkbox
              name="noDerivatives"
              id="noDerivatives"
              className="m-0 p-0 position-relative"
              onChange={updateFlags}
              checked={commonsOptions.noDerivatives}
            />
          </Col>
          <Col xs={2} className="text-left align-self-center">
            <label htmlFor="noDerivatives">
              {intl.formatMessage(messages['library.common.license.cc.no_derivatives'])}
            </label>
          </Col>
          <Col xs={9} className="align-self-center">
            {intl.formatMessage(messages['library.common.fields.license.cc.no_derivatives'])}
          </Col>
        </Row>
        <Row className="border-bottom py-2">
          <Col xs={1} className="text-center align-self-center">
            <Form.Checkbox
              id="shareAlike"
              name="shareAlike"
              className="m-0 p-0 position-relative"
              onChange={updateFlags}
              checked={commonsOptions.shareAlike}
            />
          </Col>
          <Col xs={2} className="text-left align-self-center">
            <label htmlFor="shareAlike">
              {intl.formatMessage(messages['library.common.license.cc.share_alike'])}
            </label>
          </Col>
          <Col xs={9} className="align-self-center">
            {intl.formatMessage(messages['library.common.fields.license.cc.share_alike'])}
          </Col>
        </Row>
      </>
    )}
    <Row className="mt-2">
      <Col xs={12}>
        <div className="mt-2">{intl.formatMessage(messages['library.common.license.preview.title'])}</div>
        <div className="small my-2">{intl.formatMessage(messages['library.common.license.preview.message'])}</div>
      </Col>
      <Col xs={12}>
        <LicenseContainer spec={value} />
      </Col>
    </Row>
  </div>
);

LicenceFieldBase.propTypes = {
  intl: intlShape.isRequired,
  reservedVariant: PropTypes.string.isRequired,
  commonsVariant: PropTypes.string.isRequired,
  updateFlags: PropTypes.func.isRequired,
  commonsOptions: PropTypes.shape({
    attribution: PropTypes.bool.isRequired,
    nonCommercial: PropTypes.bool.isRequired,
    noDerivatives: PropTypes.bool.isRequired,
    shareAlike: PropTypes.bool.isRequired,
  }).isRequired,
  value: PropTypes.string.isRequired,
  spec: PropTypes.string.isRequired,
  updateValue: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};

// We inject later because code introspection tools get confused about 'intl' otherwise.
export const LicenseField = injectIntl(LicenceFieldBase);

/**
 * LicenseFieldContainer
 * Container for the LicenseField-- dynamically displays the license options and allows a user to toggle features
 * for supported licenses.
 */
export const LicenseFieldContainerBase = ({ value, updateValue, name }) => {
  // We need to remember these values. If the user switches away from Creative Commons, we should remember what
  // checkboxes were checked.
  const [cachedSpec, updateCache] = useState(value);
  const commonsOptions = commonsOptionsFromSpec(cachedSpec);
  let commonVariant;
  let reservedVariant;
  if (value) {
    commonVariant = 'primary';
    reservedVariant = 'outline-primary';
  } else {
    commonVariant = 'outline-primary';
    reservedVariant = 'primary';
  }

  const spec = specFromCommonsOptions(commonsOptions);

  const updateFlags = useCallback((event) => {
    const el = event.target;
    const result = withCommonsOption(commonsOptions, el.name, el.checked);
    const newSpec = specFromCommonsOptions(result);
    updateValue(newSpec);
    updateCache(newSpec);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commonsOptions]);

  return (
    <LicenseField
      commonsVariant={commonVariant}
      reservedVariant={reservedVariant}
      commonsOptions={commonsOptions}
      updateFlags={updateFlags}
      value={value}
      spec={spec}
      updateValue={updateValue}
      name={name}
    />
  );
};

LicenseFieldContainerBase.propTypes = {
  value: PropTypes.string.isRequired,
  updateValue: PropTypes.func.isRequired,
  name: PropTypes.string,
};

LicenseFieldContainerBase.defaultProps = {
  name: 'license',
};

export const LicenseFieldContainer = injectIntl(LicenseFieldContainerBase);
