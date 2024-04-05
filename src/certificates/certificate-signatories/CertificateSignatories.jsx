import PropTypes from 'prop-types';
import { Stack, Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import CertificateSection from '../certificate-section/CertificateSection';
import Signatory from './signatory/Signatory';
import SignatoryForm from './signatory/SignatoryForm';
import useEditSignatory from './hooks/useEditSignatory';
import useCreateSignatory from './hooks/useCreateSignatory';
import messages from './messages';

const CertificateSignatories = ({
  isForm,
  editModes,
  signatories,
  arrayHelpers,
  initialSignatoriesValues,
  setFieldValue,
  setEditModes,
  handleBlur,
  handleChange,
}) => {
  const intl = useIntl();

  const {
    toggleEditSignatory,
    handleDeleteSignatory,
    handleCancelUpdateSignatory,
  } = useEditSignatory({
    arrayHelpers, editModes, setEditModes, setFieldValue, initialSignatoriesValues,
  });

  const { handleAddSignatory } = useCreateSignatory({ arrayHelpers });

  return (
    <CertificateSection
      title={intl.formatMessage(messages.signatoriesSectionTitle)}
      className="certificate-signatories"
    >
      <div>
        <p className="mb-4.5">
          {intl.formatMessage(messages.signatoriesRecommendation)}
        </p>
        <Stack gap="4.5">
          {signatories.map(({
            id, name, title, organization, signatureImagePath,
          }, idx) => (
            isForm || editModes[idx] ? (
              <SignatoryForm
                key={id}
                index={idx}
                isEdit={editModes[idx]}
                name={name}
                title={title}
                organization={organization}
                signatureImagePath={signatureImagePath}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
                showDeleteButton={signatories.length > 1 && !editModes[idx]}
                handleDeleteSignatory={() => handleDeleteSignatory(idx)}
                {...(editModes[idx] && {
                  handleCancelUpdateSignatory: () => handleCancelUpdateSignatory(idx),
                })}
              />
            ) : (
              <Signatory
                key={id}
                index={idx}
                name={name}
                title={title}
                organization={organization}
                signatureImagePath={signatureImagePath}
                handleEdit={() => toggleEditSignatory(idx)}
              />
            )
          ))}
        </Stack>
        {isForm && (
          <>
            <Button variant="outline-primary" onClick={handleAddSignatory} className="w-100 mt-4">
              {intl.formatMessage(messages.addSignatoryButton)}
            </Button>
            <Form.Control.Feedback>
              <span className="x-small">{intl.formatMessage(messages.addSignatoryButtonDescription)}</span>
            </Form.Control.Feedback>
          </>
        )}
      </div>
    </CertificateSection>
  );
};

CertificateSignatories.defaultProps = {
  handleChange: null,
  handleBlur: null,
  setFieldValue: null,
  arrayHelpers: null,
  isForm: false,
  editModes: {},
  setEditModes: null,
  initialSignatoriesValues: null,
};

CertificateSignatories.propTypes = {
  isForm: PropTypes.bool,
  editModes: PropTypes.objectOf(PropTypes.bool),
  initialSignatoriesValues: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    organization: PropTypes.string.isRequired,
    signatureImagePath: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })),
  handleChange: PropTypes.func,
  handleBlur: PropTypes.func,
  setFieldValue: PropTypes.func,
  setEditModes: PropTypes.func,
  arrayHelpers: PropTypes.shape({
    push: PropTypes.func,
    remove: PropTypes.func,
  }),
  signatories: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    organization: PropTypes.string.isRequired,
    signatureImagePath: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
};

export default CertificateSignatories;
