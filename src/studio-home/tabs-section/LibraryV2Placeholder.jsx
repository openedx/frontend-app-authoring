import React from 'react';
import { Container } from '@openedx/paragon';
import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';

import Header from '../../header';
import SubHeader from '../../generic/sub-header/SubHeader';
import messages from './messages';

/* istanbul ignore next */
const LibraryV2Placeholder = () => {
  const intl = useIntl();

  return (
    <>
      <Header isHiddenMainMenu />
      <Container size="xl" className="p-4 mt-3">
        <section className="mb-4">
          <article className="studio-home-sub-header">
            <section>
              <SubHeader
                title={intl.formatMessage(messages.libraryV2PlaceholderTitle)}
              />
            </section>
          </article>
          <section>
            <p>{intl.formatMessage(messages.libraryV2PlaceholderBody)}</p>
          </section>
        </section>
      </Container>
      <StudioFooter />
    </>
  );
};

export default LibraryV2Placeholder;
