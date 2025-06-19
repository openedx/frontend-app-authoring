import { useEffect } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useFormikContext } from 'formik';
import { DivisionSchemes } from '../../../../../data/constants';
import FormSwitchGroup from '../../../../../generic/FormSwitchGroup';
import messages from '../../messages';

const DivisionByUserGroupFields = ({ intl }) => {
  const {
    handleChange,
    handleBlur,
    values: appConfig,
    setFieldValue,
  } = useFormikContext();

  const { divideByUserGroups, userGroupsEnabled } = appConfig;

  useEffect(() => {
    if (divideByUserGroups) {
      setFieldValue('division_scheme', DivisionSchemes.USER_GROUP);
    } else {
      setFieldValue('division_scheme', DivisionSchemes.NONE);
    }
  }, [divideByUserGroups, setFieldValue]);

  return (
    <>
      <h5 className="text-gray-500 mb-4 mt-4">
        {intl.formatMessage(messages.divisionByUserGroup)}
      </h5>
      {!userGroupsEnabled && (
        <div className="alert alert-info bg-light-200 font-weight-normal h5" id="alert-usergroups">
          {intl.formatMessage(messages.userGroupsEnabled)}
        </div>
      )}
      <FormSwitchGroup
        onChange={handleChange}
        className="mt-2"
        onBlur={handleBlur}
        id="divideByUserGroups"
        checked={divideByUserGroups}
        label={intl.formatMessage(messages.divideByUserGroupsLabel)}
        helpText={intl.formatMessage(messages.divideByUserGroupsHelp)}
        disabled={!userGroupsEnabled}
      />
    </>
  );
};

DivisionByUserGroupFields.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DivisionByUserGroupFields);
