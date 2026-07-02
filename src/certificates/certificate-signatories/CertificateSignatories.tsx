import React from 'react';
import { Stack, Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import CertificateSection from '../certificate-section/CertificateSection';
import Signatory from './signatory/Signatory';
import SignatoryForm from './signatory/SignatoryForm';
import useEditSignatory from './hooks/useEditSignatory';
import useCreateSignatory from './hooks/useCreateSignatory';
import messages from './messages';
import { type FieldArrayRenderProps } from 'formik';

interface CertificateSignatoriesProps {
  isForm?: boolean;
  editModes?: Record<string, boolean>;
  initialSignatoriesValues?: {
    name: string;
    organization: string;
    signatureImagePath: string;
    title: string;
  }[];
  handleChange: React.ChangeEventHandler<any>;
  handleBlur: React.FocusEventHandler<any>;
  setFieldValue: (filed: string, value: any) => void;
  setEditModes?: (modes: Record<string, boolean>) => void;
  arrayHelpers: FieldArrayRenderProps;
  signatories: {
    id: string;
    name: string;
    organization: string;
    signatureImagePath: string;
    title: string;
  }[];
}

const CertificateSignatories = ({
  isForm = false,
  editModes = {},
  signatories,
  arrayHelpers,
  initialSignatoriesValues,
  setFieldValue,
  setEditModes,
  handleBlur,
  handleChange,
}: CertificateSignatoriesProps) => {
  const intl = useIntl();

  const {
    toggleEditSignatory,
    handleDeleteSignatory,
    handleCancelUpdateSignatory,
  } = useEditSignatory({
    arrayHelpers,
    editModes,
    setEditModes,
    setFieldValue,
    initialSignatoriesValues,
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
        <Stack gap={4.5}>
          {signatories.map(({
            id,
            name,
            title,
            organization,
            signatureImagePath,
          }, idx) => (
            isForm || editModes[idx] ?
              (
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
              ) :
              (
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

export default CertificateSignatories;
