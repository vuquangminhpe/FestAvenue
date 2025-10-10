import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { steps } from '../constants'

interface ProgressStepsProps {
  currentStep: number
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className='mb-8'>
      <div className='flex items-start justify-between'>
        {steps.map((step, index) => (
          <div key={step.id} className='flex items-start flex-1'>
            <div className='flex flex-col items-center flex-1'>
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 flex-shrink-0',
                  currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                      : 'bg-slate-200 text-slate-500'
                )}
              >
                {currentStep > step.id ? <Check className='w-5 h-5' /> : step.id}
              </div>
              <p className='text-xs font-medium text-slate-700 mt-2 text-center hidden sm:block min-h-[32px] leading-tight max-w-[100px]'>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className='flex-1 h-1 mx-2 mt-5'>
                <div
                  className={cn(
                    'h-full rounded transition-all duration-300',
                    currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
