import { Stack } from '@openedx/paragon';
import { ReactNode } from 'react';

interface CertificateSectionProps {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const CertificateSection = ({
  title,
  actions,
  children,
  ...rest
}: CertificateSectionProps) => (
  <section {...rest}>
    <Stack className="justify-content-between mb-2.5" direction="horizontal">
      <h2 className="lead section-title mb-0">{title}</h2>
      {actions}
    </Stack>
    <hr className="mt-0 mb-4" />
    <div>
      {children}
    </div>
  </section>
);

export default CertificateSection;
