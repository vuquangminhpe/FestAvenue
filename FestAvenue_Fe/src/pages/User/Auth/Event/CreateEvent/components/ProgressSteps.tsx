import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { steps } from '../constants'

interface ProgressStepsProps {
  currentStep: number
  onStepClick?: (stepId: number) => void
  stepStates?: { id: number; hasError: boolean; isCompleted: boolean }[]
}

export function ProgressSteps({ currentStep, onStepClick, stepStates = [] }: ProgressStepsProps) {
  return (
    <div className='mb-8'>
      <div className='flex items-start justify-between'>
        {steps.map((step, index) => {
          const state = stepStates.find((item) => item.id === step.id)
          const hasError = state?.hasError
          const isCompleted = state?.isCompleted
          const isActive = currentStep === step.id
          const isClickable = Boolean(onStepClick)

          return (
            <div key={step.id} className='flex items-start flex-1'>
              <div className='flex flex-col items-center flex-1'>
                <button
                  type='button'
                  onClick={() => onStepClick?.(step.id)}
                  disabled={!onStepClick}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 flex-shrink-0 border',
                    hasError
                      ? 'bg-red-100 text-red-600 border-red-200'
                      : isCompleted
                      ? 'bg-green-500 text-white border-green-500'
                      : isActive
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200 border-blue-500'
                      : 'bg-slate-200 text-slate-500 border-transparent',
                    isClickable && 'hover:scale-110 cursor-pointer hover:shadow-lg',
                    !isClickable && 'cursor-default'
                  )}
                  aria-label={`Đi đến bước ${step.id}: ${step.title}`}
                >
                  {hasError ? <X className='w-5 h-5' /> : isCompleted ? <Check className='w-5 h-5' /> : step.id}
                </button>
                <p className='text-xs font-medium text-slate-700 mt-2 text-center hidden sm:block min-h-[32px] leading-tight max-w-[100px]'>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className='flex-1 h-1 mx-2 mt-5'>
                  <div
                    className={cn(
                      'h-full rounded transition-all duration-300',
                      hasError
                        ? 'bg-red-300'
                        : isCompleted
                        ? 'bg-green-500'
                        : currentStep > step.id
                        ? 'bg-blue-200'
                        : 'bg-slate-200'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
