import React from 'react';

type Step = 'intro' | 'question' | 'score' | 'letter' | 'valentine';

interface JourneyIndicatorProps {
  currentStep: Step;
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'intro', label: 'Welcome' },
  { key: 'question', label: 'Quiz' },
  { key: 'score', label: 'Score' },
  { key: 'letter', label: 'Letter' },
  { key: 'valentine', label: 'Valentine' },
];

export const JourneyIndicator: React.FC<JourneyIndicatorProps> = ({ currentStep }) => {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-rose-200/30 shadow-sm">
      <div className="flex items-center justify-center gap-2 py-3">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={step.key}>
              {index > 0 && (
                <div
                  className={`h-px w-6 sm:w-8 transition-colors duration-500 ${
                    isCompleted || isCurrent ? 'bg-rose-400' : 'bg-rose-200/50'
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`rounded-full transition-all duration-500 ${
                    isCurrent
                      ? 'w-3 h-3 bg-rose-500 shadow-lg shadow-rose-400/50'
                      : isCompleted
                      ? 'w-2.5 h-2.5 bg-rose-400'
                      : 'w-2 h-2 bg-rose-200/60'
                  }`}
                />
                <span
                  className={`text-[10px] transition-all duration-500 hidden sm:block ${
                    isCurrent
                      ? 'text-rose-600 font-medium'
                      : isCompleted
                      ? 'text-rose-400'
                      : 'text-rose-300/60'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
