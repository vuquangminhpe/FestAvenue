import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { steps } from '../../constants'

interface ProgressStepsProps {
  currentStep: number
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className='mb-8'>
      <div className='relative'>
        {/* Progress Line Background */}
        <div className='absolute top-6 left-0 right-0 h-0.5 bg-slate-200 hidden md:block' />

        {/* Progress Line Active */}
        <div
          className='absolute top-6 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-300 transition-all duration-500 ease-out hidden md:block'
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
          }}
        />

        {/* Steps Container */}
        <div className='relative flex items-start justify-between'>
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index + 1 === currentStep
            const isCompleted = index + 1 < currentStep

            return (
              <div key={index} className='flex flex-col items-center flex-1'>
                {/* Step Circle */}
                <div
                  className={cn(
                    'relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 bg-white',
                    isActive
                      ? 'border-cyan-400 shadow-lg shadow-cyan-400/25 scale-110'
                      : isCompleted
                      ? 'border-green-500 bg-green-500'
                      : 'border-slate-300'
                  )}
                >
                  {/* Inner Circle for Active Step */}
                  {isActive && (
                    <div className='w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-300 flex items-center justify-center'>
                      <StepIcon className='w-4 h-4 text-white' />
                    </div>
                  )}

                  {/* Completed Step */}
                  {isCompleted && <Check className='w-5 h-5 text-white' />}

                  {/* Inactive Step */}
                  {!isActive && !isCompleted && <StepIcon className='w-5 h-5 text-slate-400' />}
                </div>

                {/* Step Content */}
                <div className='mt-3 text-center max-w-[140px]'>
                  <div
                    className={cn(
                      'text-sm font-medium leading-tight mb-1',
                      isActive ? 'text-cyan-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                    )}
                  >
                    {step.title}
                  </div>
                  <div className='text-xs text-slate-500 leading-relaxed'>{step.description}</div>

                  {/* Step Number for Mobile */}
                  <div className='md:hidden mt-2'>
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                        isActive
                          ? 'bg-cyan-100 text-cyan-600'
                          : isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Progress Dots */}
        <div className='flex justify-center mt-4 md:hidden'>
          <div className='flex space-x-2'>
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index + 1 <= currentStep ? 'bg-gradient-to-r from-cyan-400 to-blue-300' : 'bg-slate-300'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}