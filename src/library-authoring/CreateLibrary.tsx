import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';

import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';

import messages from './messages';

/* istanbul ignore next This is only a placeholder component */
const CreateLibrary = () => (
  <>
    <Header isHiddenMainMenu />
    <Container size="xl" className="p-4 mt-3">
      <SubHeader
        title={<FormattedMessage {...messages.createLibrary} />}
      />
      <div className="d-flex my-6 justify-content-center">
        <FormattedMessage
          {...messages.createLibraryTempPlaceholder}
        />
      </div>
    </Container>
  </>
);

export default CreateLibrary;
