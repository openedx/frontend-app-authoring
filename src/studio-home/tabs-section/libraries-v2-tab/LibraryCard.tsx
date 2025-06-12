import React from 'react';
import { Link } from 'react-router-dom';

interface LibraryCardProps {
  title: string;
  org: string;
  id: string;
  path: string;
}

const LibraryCard: React.FC<LibraryCardProps> = ({
  title, org, id, path,
}) => (
  <Link to={path} style={{ textDecoration: 'none' }}>
    <div className="library-card-container">
      <div className="library-card-title">{title}</div>
      <div className="library-card-info-container">
        <div>
          <div className="library-card-info-label">ORGANIZATION</div>
          <div className="library-card-info-value">{org}</div>
        </div>
        <div>
          <div className="library-card-info-label">ID</div>
          <div className="library-card-info-value">{id}</div>
        </div>
      </div>
    </div>
  </Link>
);

export default LibraryCard;
