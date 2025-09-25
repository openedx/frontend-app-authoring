import Queue from 'queue';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppEventContext } from 'context/AppEventContext';
import { useDialog } from 'shared/context/dialog';
import { ThinkingProgressPayload } from 'types/thinkingProgress';
import { ServerToClientEventPayloadMap, SocketEvent } from '../../../context/AppEventContext/types';
import { cn } from '../../lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import ProgressBar from '../Common/ProgressBar';

const TOTAL_STICKS = 71;

const STEP_STREAMING_DELAY = 500;

interface ThinkingProgressProps {
  className?: string;
  onCourseIdChange?: (courseId: string | null) => void;
}

export default function ThinkingProgress({ className, onCourseIdChange }: ThinkingProgressProps) {
  const { registerEventCallback } = useAppEventContext();
  const { close } = useDialog();

  const [thinkingProgress, setThinkingProgress] = useState<ThinkingProgressPayload | null>(null);

  const stepQueue = useMemo(
    () => new Queue({
      autostart: true,
      concurrency: 1,
    }),
    [],
  );

  useEffect(() => {
    if (onCourseIdChange) {
      onCourseIdChange(thinkingProgress?.courseId || null);
    }
  }, [thinkingProgress?.courseId, onCourseIdChange]);

  useEffect(() => {
    const isCompleted = Number(thinkingProgress?.progress) === 100;

    if (isCompleted) {
      setTimeout(() => {
        close();
      }, 1000);
    }
  }, [thinkingProgress?.progress, close]);

  useEffect(() => {
    const unregister = registerEventCallback(SocketEvent.THINKING_PROGRESS, (data) => {
      enqueueSocketEvent(data);
    });

    return unregister;
  }, []);

  useEffect(() => {
    return () => {
      stepQueue.end();
    };
  }, [stepQueue]);

  const enqueueSocketEvent = useCallback(
    (socketEvent: ServerToClientEventPayloadMap[SocketEvent.THINKING_PROGRESS]) => {
      const handleEvent = () => {
        const { event } = socketEvent;
        switch (event) {
          case 'THINKING_PROGRESS_STREAM': {
            setThinkingProgress(socketEvent.data);
            break;
          }

          default: {
            console.warn('Unknown socket event type:', event);
            break;
          }
        }
      };

      stepQueue.push(() => {
        return new Promise((resolve) => {
          handleEvent();

          // Delay between chunks streaming
          setTimeout(() => {
            resolve(undefined);
          }, STEP_STREAMING_DELAY);
        });
      });
    },
    [stepQueue],
  );

  const shouldShowProgressHeader = thinkingProgress?.step && thinkingProgress?.progress;

  return (
    <Accordion
      type="single"
      collapsible
      className="tw-border tw-border-gray-200 tw-border-solid tw-shadow-xs tw-rounded-[12px]"
    >
      <AccordionItem
        value="thinking-progress"
        className={cn(
          'tw-p-4 tw-bg-[linear-gradient(125.19deg,#FFFFFF_0.08%,rgba(255,255,255,0.3)_100.08%)] tw-rounded-[24px] tw-flex tw-gap-4 tw-flex-col tw-border tw-border-white',
          className,
        )}
      >
        <div className="tw-flex tw-flex-col tw-gap-4 tw-h-fit">
          {shouldShowProgressHeader && (
            <div className="tw-flex tw-flex-col tw-gap-2">
              <div className="tw-flex tw-justify-between tw-items-center tw-gap-2 tw-text-gray-600 tw-font-semibold tw-text-md">
                {thinkingProgress?.step}
              </div>
              <div className="tw-text-xs tw-text-grayWarm-500 tw-font-normal">
                Choose the knowledge unit to be tested from the available matrix.
              </div>
            </div>
          )}
          <AccordionTrigger className="tw-p-0 !tw-h-6 tw-bg-transparent tw-border-none tw-gap-2">
            <ProgressBar
              progress={thinkingProgress?.progress || 0}
              totalSticks={TOTAL_STICKS}
            />
          </AccordionTrigger>
        </div>
        <AccordionContent className="!tw-pb-0">
          <div className="tw-flex tw-flex-col tw-gap-3">
            {/* {thinkingProgress.steps.map((step, index) => (
                <div
                  className={cn('tw-flex tw-gap-4 tw-relative')}
                  key={step.title}
                >
                  {index !== thinkingProgress.steps.length - 1 && (
                  <div
                    className={cn(
                      'tw-absolute tw-top-[20px] tw-left-[10px] tw-w-[1px] tw-h-[42px]',
                      step.status === ThinkingProgressStatus.SUCCESS
                        ? 'tw-bg-[linear-gradient(0deg,#009EFD_-30.65%,#2AF598_100%)]'
                        : 'tw-bg-grayWarm-300',
                    )}
                  />
                  )}
                  <div className="tw-p-0.5 tw-w-5 tw-h-5">
                    {step.status === ThinkingProgressStatus.SUCCESS ? (
                      <CheckGradientIcon />
                    ) : (
                      <div className="h-full flex">
                        <Loader
                          size="tiny"
                          className="animate-spin h-full"
                        />
                      </div>
                    )}
                  </div>
                  <div className="tw-flex tw-flex-col tw-gap-0.5">
                    <div className="tw-text-grayWarm-600 tw-text-sm tw-font-semibold">{step.title}</div>
                    <div className="tw-text-grayWarm-500 tw-text-xs">{step.description}</div>
                  </div>
                </div>
              ))} */}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
