import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { intlShape, injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Hyperlink,
  Image,
  TransitionReplace,
} from '@edx/paragon';
import { ExpandLess, ExpandMore, Help } from '@edx/paragon/icons';
import messages from './messages';

const Footer = ({
  marketingBaseUrl,
  termsOfServiceUrl,
  privacyPolicyUrl,
  supportEmail,
  platformName,
  lmsBaseUrl,
  studioBaseUrl,
  showAccessibilityPage,
  // injected
  intl,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="m-0 row align-items-center justify-content-center">
        <div className="col border-top mr-2" />
        <Button
          data-testid="helpToggleButton"
          variant="outline-primary"
          onClick={() => setIsOpen(!isOpen)}
          iconBefore={Help}
          iconAfter={isOpen ? ExpandLess : ExpandMore}
          size="sm"
        >
          {isOpen ? intl.formatMessage(messages.closeHelpButtonLabel)
            : intl.formatMessage(messages.openHelpButtonLabel)}
        </Button>
        <div className="col border-top ml-2" />
      </div>
      <TransitionReplace>
        {isOpen ? (
          <ActionRow key="help-link-button-row" className="py-4" data-testid="helpButtonRow">
            <ActionRow.Spacer />
            <Button as="a" href="https://docs.edx.org/" size="sm">
              <FormattedMessage {...messages.edxDocumentationButtonLabel} />
            </Button>
            {platformName === 'edX' ? (
              <Button
                as="a"
                href="https://partner.edx.org/"
                size="sm"
                data-testid="edXPortalButton"
              >
                <FormattedMessage {...messages.parnterPortalButtonLabel} />
              </Button>
            ) : (
              <Button
                as="a"
                href="https://open.edx.org/"
                size="sm"
                data-testid="openEdXPortalButton"
              >
                <FormattedMessage {...messages.openEdxPortalButtonLabel} />
              </Button>
            )}
            <Button
              as="a"
              href="https://www.edx.org/course/edx101-overview-of-creating-an-edx-course#.VO4eaLPF-n1"
              size="sm"
            >
              <FormattedMessage {...messages.edx101ButtonLabel} />
            </Button>
            <Button
              as="a"
              href="https://www.edx.org/course/studiox-creating-a-course-with-edx-studio"
              size="sm"
            >
              <FormattedMessage {...messages.studioXButtonLabel} />
            </Button>
            {!_.isEmpty(supportEmail) && (
              <Button
                as="a"
                href={`mailto:${supportEmail}`}
                size="sm"
                data-testid="contactUsButton"
              >
                <FormattedMessage {...messages.contactUsButtonLabel} />
              </Button>
            )}
            <ActionRow.Spacer />
          </ActionRow>
        ) : null}
      </TransitionReplace>
      <ActionRow className="pt-3 px-4 m-0 x-small">
        © {new Date().getFullYear()} <Hyperlink destination={marketingBaseUrl} target="_blank" className="ml-2">{platformName}</Hyperlink>
        <ActionRow.Spacer />
        {!_.isEmpty(termsOfServiceUrl) && (
          <Hyperlink destination={termsOfServiceUrl} data-testid="termsOfService">
            {intl.formatMessage(messages.termsOfServiceLinkLabel)}
          </Hyperlink>
        )}{!_.isEmpty(privacyPolicyUrl) && (
          <Hyperlink destination={privacyPolicyUrl} data-testid="privacyPolicy">
            {intl.formatMessage(messages.privacyPolicyLinkLabel)}
          </Hyperlink>
        )}
        {showAccessibilityPage && (
          <Hyperlink
            destination={`${studioBaseUrl}/accessibility`}
            data-testid="accessibilityRequest"
          >
            {intl.formatMessage(messages.accessibilityRequestLinkLabel)}
          </Hyperlink>
        )}
        <Hyperlink destination={lmsBaseUrl}>LMS</Hyperlink>
      </ActionRow>
      <ActionRow className="mt-3 mx-4 pb-4 x-small">
        {/*
          Site operators: Please do not remove this paragraph! this attributes back to edX and
            makes your acknowledgement of edX's trademarks clear.
          Translators: 'edX' and 'Open edX' are trademarks of 'edX Inc.'. Please do not translate
            any of these trademarks and company names.
        */}
        <FormattedMessage {...messages.trademarkMessage} />
        <Hyperlink className="ml-1" destination="https://www.edx.org">edX Inc</Hyperlink>.
        <ActionRow.Spacer />
        <Hyperlink destination="https://open.edx.org" className="float-right">
          <Image
            width="120px"
            alt="Powered by Open edX"
            src="https://logos.openedx.org/open-edx-logo-tag.png"
          />
        </Hyperlink>
      </ActionRow>
    </>
  );
};

Footer.defaultProps = {
  marketingBaseUrl: null,
  termsOfServiceUrl: null,
  privacyPolicyUrl: null,
  spanishPrivacyPolicy: null,
  supportEmail: null,
};

Footer.propTypes = {
  marketingBaseUrl: PropTypes.string,
  termsOfServiceUrl: PropTypes.string,
  privacyPolicyUrl: PropTypes.string,
  spanishPrivacyPolicy: PropTypes.string,
  supportEmail: PropTypes.string,
  platformName: PropTypes.string.isRequired,
  lmsBaseUrl: PropTypes.string.isRequired,
  studioBaseUrl: PropTypes.string.isRequired,
  showAccessibilityPage: PropTypes.bool.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(Footer);
