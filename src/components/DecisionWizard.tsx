import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDecisionWizard } from '@/hooks/useDecisionWizard';
import { WizardProgress } from './wizard/WizardProgress';
import { Step1ProblemDefinition } from './wizard/Step1ProblemDefinition';
import { Step2CriteriaSetup } from './wizard/Step2CriteriaSetup';
import { Step3DataEntry } from './wizard/Step3DataEntry';
import { Step4MethodSelection } from './wizard/Step4MethodSelection';
import { Step5Results } from './wizard/Step5Results';

export function DecisionWizard() {
  const {
    currentStep,
    problem,
    updateProblem,
    updateCriterion,
    updateAlternative,
    updateAlternativeValue,
    updateWeights,
    setWeightingMode,
    updateAHPMatrix,
    selectMethod,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    canProceed,
  } = useDecisionWizard();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ProblemDefinition
            problem={problem}
            updateProblem={updateProblem}
          />
        );
      case 2:
        return (
          <Step2CriteriaSetup
            problem={problem}
            updateCriterion={updateCriterion}
            updateWeights={updateWeights}
            setWeightingMode={setWeightingMode}
            updateAHPMatrix={updateAHPMatrix}
          />
        );
      case 3:
        return (
          <Step3DataEntry
            problem={problem}
            updateAlternative={updateAlternative}
            updateAlternativeValue={updateAlternativeValue}
          />
        );
      case 4:
        return (
          <Step4MethodSelection
            selectedMethod={problem.selectedMethod}
            selectMethod={selectMethod}
          />
        );
      case 5:
        return (
          <Step5Results
            problem={problem}
            resetWizard={resetWizard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Decidr</h1>
                <p className="text-xs text-muted-foreground">Multi-Criteria Decision Platform</p>
              </div>
            </div>
            {problem.projectName && (
              <div className="hidden sm:block text-right">
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{problem.projectName}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto">
          <WizardProgress currentStep={currentStep} onStepClick={goToStep} />
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>
      </main>

      {/* Navigation Footer */}
      {currentStep < 5 && (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="text-sm text-muted-foreground">
                Step {currentStep} of 5
              </div>

              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2"
              >
                {currentStep === 4 ? 'Calculate Results' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
