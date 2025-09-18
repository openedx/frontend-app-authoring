import { ReactNode } from 'react';
import {
  Breadcrumb, Col, Container, Row, Button, Badge,
} from '@openedx/paragon';

interface BreadcrumbLink {
  label: string;
  to?: string;
}

interface Action {
  label: string;
  onClick: () => void;
}

export interface AuthZTitleProps {
  activeLabel: string;
  pageTitle: string;
  pageSubtitle: string | ReactNode;
  navLinks?: BreadcrumbLink[];
  actions?: Action[];
}

const AuthZTitle = ({
  activeLabel, navLinks = [], pageTitle, pageSubtitle, actions = [],
}: AuthZTitleProps) => (
  <Container className="p-5 bg-light-100">
    <Breadcrumb
      links={navLinks}
      activeLabel={activeLabel}
    />
    <Row className="mt-4">
      <Col xs={12} md={8} className="mb-4">
        <h1 className="text-primary">{pageTitle}</h1>
        {typeof pageSubtitle === 'string'
          ? <h3><Badge className="py-2 px-3 font-weight-normal" variant="light">{pageSubtitle}</Badge></h3>
          : pageSubtitle}
      </Col>
      <Col xs={12} md={4}>
        <div className="d-flex justify-content-md-end">
          {
            actions.map(({ label, onClick }) => <Button key={`authz-header-action-${label}`} onClick={onClick}>{label}</Button>)
          }
        </div>
      </Col>
    </Row>
  </Container>
);

export default AuthZTitle;
