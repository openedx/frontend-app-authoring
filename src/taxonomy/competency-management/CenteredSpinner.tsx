import { LoadingSpinner } from '@src/generic/Loading';

/** A small spinner centered in its own row: the associations panel's loading state. */
const CenteredSpinner = () => (
  <div className="d-flex justify-content-center py-3">
    <LoadingSpinner size="sm" />
  </div>
);

export default CenteredSpinner;
