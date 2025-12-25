import { Check } from 'lucide-react';
import { WIZARD_STEPS } from '@/types/decision';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = index === WIZARD_STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step indicator */}
              <button
                onClick={() => onStepClick?.(step.id)}
                disabled={step.id > currentStep}
                className={cn(
                  'wizard-step group',
                  step.id <= currentStep && 'cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'wizard-step-indicator',
                    isActive && 'active',
                    isCompleted && 'completed',
                    !isActive && !isCompleted && 'pending'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors hidden sm:block',
                    isActive && 'text-primary',
                    isCompleted && 'text-primary',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector */}
              {!isLast && (
                <div
                  className={cn(
                    'wizard-connector mx-2 sm:mx-4',
                    isCompleted ? 'active' : 'pending'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
