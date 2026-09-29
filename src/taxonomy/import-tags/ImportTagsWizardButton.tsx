import React from 'react';
import { Button, useToggle } from '@openedx/paragon';

import { ImportTagsWizard, type ImportTagsWizardProps } from './ImportTagsWizard';

type ImportTagsWizardButtonProps =
  & React.ComponentProps<typeof Button>
  & Pick<ImportTagsWizardProps, 'defaultTaxonomyType' | 'onImportSuccess'>
  & {
    /** Not supported: this component owns the button's `onClick` and uses it to open the wizard. */
    onClick?: never;
  };

/**
 * A button that opens the ImportTagsWizard to create a new taxonomy from an uploaded file.
 *
 * Owns the wizard's open/close state; all other props are passed through to the Button, so each
 * caller supplies its own label, icon and styling.
 */
export const ImportTagsWizardButton = ({
  defaultTaxonomyType,
  onImportSuccess,
  ...buttonProps
}: ImportTagsWizardButtonProps) => {
  const [isImportModalOpen, importModalOpen, importModalClose] = useToggle(false);

  return (
    <>
      {isImportModalOpen && (
        <ImportTagsWizard
          isOpen={isImportModalOpen}
          onClose={importModalClose}
          defaultTaxonomyType={defaultTaxonomyType}
          onImportSuccess={onImportSuccess}
        />
      )}
      <Button {...buttonProps} onClick={importModalOpen} />
    </>
  );
};
