import { cn } from '../../lib/utils';

interface ProgressBarProps {
  progress: number;
  totalSticks?: number;
}

const ProgressBar = ({ progress, totalSticks = 41 }: ProgressBarProps) => {
  const currentFilledSticks = Math.round((progress / 100) * totalSticks);

  return (
    <div className="tw-flex tw-w-full tw-items-center tw-gap-1">
      {Array.from({ length: totalSticks }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'tw-h-6 tw-flex-1 tw-rounded-full tw-transition-colors tw-duration-300',
            index < currentFilledSticks
              ? 'tw-bg-[linear-gradient(0deg,#009EFD,#2AF598)]'
              : 'tw-bg-[linear-gradient(180deg,#EDF0F3_0%,#D4DBE2_100%)]',
          )}
        />
      ))}
    </div>
  );
};

export default ProgressBar;
