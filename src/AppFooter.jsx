import { Footer } from '@edx/frontend-lib-content-components';

const AppFooter = () => (
  <div className="mt-6">
    <Footer
      marketingBaseUrl={process.env.MARKETING_SITE_BASE_URL}
      termsOfServiceUrl={process.env.TERMS_OF_SERVICE_URL}
      privacyPolicyUrl={process.env.PRIVACY_POLICY_URL}
      supportEmail={process.env.SUPPORT_EMAIL}
      platformName={process.env.SITE_NAME}
      lmsBaseUrl={process.env.LMS_BASE_URL}
      studioBaseUrl={process.env.STUDIO_BASE_URL}
      showAccessibilityPage={process.env.ENABLE_ACCESSIBILITY_PAGE === 'true'}
    />
  </div>
);

export default AppFooter;
