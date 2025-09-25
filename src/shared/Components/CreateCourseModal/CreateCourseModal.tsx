import { cn } from 'shared/lib/utils';
import animationData from 'assets/lotties/steamese-bot.json';
import Lottie from 'lottie-react';
import { useDialog } from 'shared/context/dialog';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import Button from '../Common/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import ThinkingProgress from './ThinkingProgress';
import messages from './message';

const CreateCourseModal = () => {
  const { isOpen, close } = useDialog();
  const navigate = useNavigate();
  const intl = useIntl();

  const [courseId, setCourseId] = useState<string | null>(null);

  const handleCourseIdChange = (newCourseId: string | null) => {
    setCourseId(newCourseId);
  };

  const handleGoToCourseList = () => {
    navigate('/courses');
    close();
  };

  const handleGoToCourseContent = () => {
    navigate(`/course/${courseId}`);
    close();
  };

  return (
    <Dialog key={courseId} open={isOpen} onOpenChange={close}>
      <DialogContent
        className={cn(
          'sm:max-w-[425px] tw-bg-white !tw-rounded-2xl !tw-w-[600px] !tw-max-w-[600px] tw-gap-0 !tw-p-0',
          'tw-border tw-border-gray-200 tw-border-solid',
          'tw-shadow-[0px_4px_6px_-2px_#10182808,0px_12px_16px_-4px_#10182814]',
          'tw-overflow-hidden',
        )}
      >
        <div className="tw-h-full tw-px-6">
          <DialogHeader className="!tw-pt-8 !tw-pb-4">
            <DialogTitle className="!tw-text-2xl !tw-font-semibold tw-text-gray-900">
              {intl.formatMessage(messages.title)}
            </DialogTitle>
          </DialogHeader>
          <div className="tw-pt-4 tw-pb-6 tw-flex tw-flex-col tw-gap-6">
            <div
              id="bot-container"
              className="tw-w-full tw-h-[192px] tw-rounded-2xl tw-bg-gradient-to-tl tw-from-[#F5C8F5] tw-relative
            tw-to-[#DADDFA]"
            >
              <Lottie
                className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full"
                style={{
                  transform: 'scale(1.5)',
                }}
                animationData={animationData}
                loop
                autoPlay
              />
            </div>
            <DialogDescription className="tw-text-gray-600 tw-font-normal tw-text-md tw-text-center">
              {intl.formatMessage(messages.description)}
            </DialogDescription>
            <ThinkingProgress onCourseIdChange={handleCourseIdChange} />
          </div>
        </div>
        <DialogFooter className="tw-sticky tw-bottom-0 tw-bg-gray-50 tw-p-6 !tw-w-full tw-flex !tw-gap-3 tw-flex-row !tw-justify-between">
          <DialogClose asChild>
            <Button variant="tertiary" size="sm" labels={{ default: intl.formatMessage(messages.goToCourseListButton) }} onClick={handleGoToCourseList} />
          </DialogClose>
          <Button variant="brand" size="sm" labels={{ default: intl.formatMessage(messages.goToCourseContentButton) }} onClick={handleGoToCourseContent} disabled={!courseId} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseModal;
