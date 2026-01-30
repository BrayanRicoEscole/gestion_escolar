
import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const StepIndicator: React.FC<{ steps: any[], currentStep: number, onStepClick: (id: number) => void }> = ({ steps, currentStep, onStepClick }) => (
  <div className="mb-16 overflow-x-auto pb-8 scrollbar-hide">
    <div className="flex items-center gap-4 min-w-max px-2">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <button 
            onClick={() => onStepClick(step.id)}
            className={`flex items-center gap-5 px-8 py-5 rounded-[2.5rem] transition-all duration-500 border-4 ${
              currentStep === step.id 
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-110 z-10' 
                : currentStep > step.id ? 'bg-green-50 text-green-700 border-green-100' : 'bg-white text-slate-300 border-slate-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
              currentStep === step.id ? 'bg-primary rotate-12 scale-110' : currentStep > step.id ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-300'
            }`}>
              {currentStep > step.id ? <CheckCircle2 size={24} /> : step.id}
            </div>
            <div className="text-left">
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${currentStep === step.id ? 'text-slate-400' : 'text-slate-400'}`}>Módulo</p>
              <p className="text-lg font-black tracking-tighter">{step.title}</p>
            </div>
          </button>
          {idx < steps.length - 1 && <div className="w-12 h-1.5 bg-slate-100 rounded-full" />}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export const GradingFooter: React.FC<{ currentStep: number, totalSteps: number, onPrev: () => void, onNext: () => void }> = ({ currentStep, totalSteps, onPrev, onNext }) => (
  <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-white/80 backdrop-blur-3xl border-t border-slate-100 px-12 py-8 flex items-center justify-between z-20 shadow-2xl">
    <button onClick={onPrev} disabled={currentStep === 1} className="px-12 py-5 rounded-[1.5rem] font-black text-base text-slate-600 hover:bg-slate-50 disabled:opacity-0 transition-all">
      Etapa Anterior
    </button>
    <Button 
       onClick={onNext} 
       disabled={currentStep > totalSteps} 
       size="lg" 
       className="px-16 py-7 rounded-[2rem] text-lg shadow-primary/20"
    >
      {currentStep === totalSteps ? 'Finalizar' : 'Continuar'} <ArrowRight size={24} className="ml-2" />
    </Button>
  </div>
);
