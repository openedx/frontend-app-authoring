import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './PageNotFound/messages';

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="page-not-found">
      <Container fluid className="h-100">
        <Row className="h-100 align-items-center justify-content-center">
          <Col xs={12} md={8} lg={6} className="text-center">
            <div className="error-content">
              {/* 404 Number */}
              <div className="error-code">
                <h1 className="display-1 fw-bold">404</h1>
              </div>
              
              {/* Error Message */}
              <div className="error-message mb-4">
                <h2 className="h3 mb-3">
                  <FormattedMessage {...messages.title} />
                </h2>
                <p className="lead text-muted">
                  <FormattedMessage {...messages.description} />
                </p>
              </div>

              {/* Action Buttons */}
              <div className="error-actions">
                <Button
                  variant="primary"
                  size="md"
                  className="me-3"
                  onClick={handleGoHome}
                >
                  <FormattedMessage {...messages.goHome} />
                </Button>
                <Button
                  variant="outline-primary"
                  size="md"
                  onClick={handleGoBack}
                >
                  <FormattedMessage {...messages.goBack} />
                </Button>
              </div>

              {/* Help Text */}
              <div className="error-help mt-4">
                <p className="small text-muted">
                  <FormattedMessage {...messages.help} />
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .page-not-found {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          display: flex;
          align-items: center;
        }
        
        .error-content {
          background: white;
          padding: 3rem 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .error-code h1 {
          font-size: 8rem;
          line-height: 1;
          margin-bottom: 0;
          background: linear-gradient(45deg, #007bff, #0056b3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .error-message h2 {
          color: #495057;
          font-weight: 600;
        }
        
        .error-actions .btn {
          min-width: 140px;
          padding: 0.75rem 1.5rem;
        }
        
        @media (max-width: 768px) {
          .error-code h1 {
            font-size: 6rem;
          }
          
          .error-content {
            padding: 2rem 1.5rem;
          }
          
          .error-actions .btn {
            display: block;
            width: 100%;
            margin-bottom: 1rem;
          }
          
          .error-actions .btn:last-child {
            margin-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PageNotFound;
