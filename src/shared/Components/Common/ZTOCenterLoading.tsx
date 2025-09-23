import { cn } from 'shared/lib/utils';

import { Loader, LoaderSize } from './ZTOLoader';

interface CenterLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  isFullPage?: boolean;
  loaderSize?: LoaderSize;
  dataTestId?: string;
  description?: string;
}

const CenterLoading = ({
  isFullPage = false,
  loaderSize = 'large',
  dataTestId = 'center-loading',
  description,
  className,
  ...rest
}: CenterLoadingProps) => {
  return (
    <div
      className={cn(
        'tw-w-full tw-h-full tw-flex tw-justify-center tw-items-center tw-py-4',
        isFullPage ? 'is-full-page tw-h-screen' : 'is-default',
        description && 'has-description',
        className,
      )}
      data-testid={dataTestId}
      {...rest}
    >
      <Loader size={loaderSize} />
      {description && (
        <p className="is-description tw-text-gray-500 tw-text-sm tw-mt-4 tw-mb-0">{description}</p>
      )}
    </div>
  );
};

export default CenterLoading;
