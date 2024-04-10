import PropTypes from 'prop-types';
import { Card, Stack, Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Formik, Form, FieldArray } from 'formik';

import ModalNotification from '../../generic/modal-notification';
import CertificateDetailsForm from '../certificate-details/CertificateDetailsForm';
import CertificateSignatories from '../certificate-signatories/CertificateSignatories';
import commonMessages from '../messages';
import messages from '../certificate-details/messages';
import useCertificateEditForm from './hooks/useCertificateEditForm';

const CertificateEditForm = ({ courseId }) => {
  const intl = useIntl();
  const {
    confirmOpen,
    courseTitle,
    certificates,
    confirmClose,
    initialValues,
    isConfirmOpen,
    handleCertificateDelete,
    handleCertificateSubmit,
    handleCertificateUpdateCancel,
  } = useCertificateEditForm(courseId);

  return (
    <>
      {certificates.map((certificate, id) => (
        <Formik initialValues={initialValues[id]} onSubmit={handleCertificateSubmit} key={certificate.id}>
          {({
            values, handleChange, handleBlur, resetForm, setFieldValue,
          }) => (
            <>
              <Form className="certificates-card-form" data-testid="certificates-edit-form">
                <Card>
                  <Card.Section>
                    <Stack gap="4">
                      <CertificateDetailsForm
                        courseTitleOverride={values.courseTitle}
                        detailsCourseTitle={courseTitle}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                      />
                      <FieldArray
                        name="signatories"
                        render={arrayHelpers => (
                          <CertificateSignatories
                            isForm
                            signatories={values.signatories}
                            arrayHelpers={arrayHelpers}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                          />
                        )}
                      />
                    </Stack>
                  </Card.Section>
                  <Card.Footer className="justify-content-start">
                    <Button type="submit">
                      {intl.formatMessage(commonMessages.saveTooltip)}
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleCertificateUpdateCancel(resetForm)}
                    >
                      {intl.formatMessage(commonMessages.cardCancel)}
                    </Button>
                    <Button
                      className="ml-auto"
                      variant="tertiary"
                      onClick={() => confirmOpen(certificate.id)}
                    >
                      {intl.formatMessage(commonMessages.deleteTooltip)}
                    </Button>
                  </Card.Footer>
                </Card>
              </Form>
              <ModalNotification
                isOpen={isConfirmOpen}
                title={intl.formatMessage(messages.deleteCertificateConfirmationTitle)}
                message={intl.formatMessage(messages.deleteCertificateMessage)}
                actionButtonText={intl.formatMessage(commonMessages.deleteTooltip)}
                cancelButtonText={intl.formatMessage(commonMessages.cardCancel)}
                handleCancel={() => confirmClose()}
                handleAction={() => {
                  confirmClose();
                  handleCertificateDelete(certificate.id);
                }}
              />
            </>
          )}
        </Formik>
      ))}
    </>
  );
};

CertificateEditForm.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CertificateEditForm;
