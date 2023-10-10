import React from 'react';
import {
  Button,
  Container,
  FormControl,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';

const TaxonomyListPage = ({ intl }) => {
  const orgDefaultValue = intl.formatMessage(messages.orgInputSelectDefaultValue);

  const getHeaderButtons = () => [
    (
      <Button
        variant="link"
      >
        {intl.formatMessage(messages.downloadTemplateButtonLabel)}
      </Button>
    ),
    (
      <Button
        iconBefore={Add}
      >
        {intl.formatMessage(messages.importButtonLabel)}
      </Button>
    ),
  ];

  const getOrgSelect = () => (
    <FormControl as="select" defaultValue={orgDefaultValue} controlClassName="border-0">
      <option>{orgDefaultValue}</option>
    </FormControl>
  );

  return (
    <>
      <style>
        {`
          body {
              background-color: #E9E6E4; /* light-400 */
          }
        `}
      </style>
      <Header isHiddenMainMenu />
      <div className="pt-4.5 pr-4.5 pl-4.5 pb-2 bg-light-100">
        <Container size="xl">
          <SubHeader
            title={intl.formatMessage(messages.headerTitle)}
            titleActions={getOrgSelect()}
            headerActions={getHeaderButtons()}
            hideBorder
          />
        </Container>
      </div>
      <div className="bg-light-400">
        Taxonomy List Page
      </div>
    </>
  );
};

TaxonomyListPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TaxonomyListPage);
