import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import type { FormData } from '../../types'

interface SecuritySettingsProps {
  form: UseFormReturn<FormData>
}

export function SecuritySettings({ form }: SecuritySettingsProps) {
  return (
    <div className='space-y-6'>
      {/* Security Settings */}
      <div className='bg-gradient-to-br from-orange-50/50 to-red-50/30 p-6 rounded-xl border border-orange-100'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-300 rounded-lg flex items-center justify-center'>
            <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div>
            <h4 className='text-lg font-semibold text-slate-800'>Bảo mật</h4>
            <p className='text-sm text-slate-600'>Cấu hình chính sách bảo mật cho tổ chức</p>
          </div>
        </div>

        <div className='space-y-6'>
          {/* SSO Toggle */}
          <FormField
            control={form.control}
            name='ssoEnabled'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base font-medium text-slate-800 flex items-center gap-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      Đăng nhập một lần (SSO)
                    </FormLabel>
                    <div className='text-sm text-slate-600'>
                      Cho phép nhân viên đăng nhập bằng tài khoản doanh nghiệp
                    </div>
                  </div>
                  <FormControl>
                    <button
                      type='button'
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
                        field.value ? 'bg-cyan-600' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          field.value ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          {/* Password Policy */}
          <div className='space-y-4'>
            <h5 className='text-sm font-semibold text-slate-700'>Chính sách mật khẩu</h5>

            <div className='grid md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='minPasswordLength'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-700 font-medium text-sm'>Độ dài tối thiểu</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type='number'
                          min='6'
                          max='50'
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200 rounded-lg shadow-sm'
                        />
                        <div className='absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500'>
                          ký tự
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='passwordExpirationDays'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-700 font-medium text-sm'>Hết hạn sau</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type='number'
                          min='0'
                          max='365'
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200 rounded-lg shadow-sm'
                        />
                        <div className='absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500'>
                          ngày
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm'>
              <h6 className='text-sm font-medium text-slate-700'>Yêu cầu mật khẩu phức tạp</h6>
              <div className='space-y-3'>
                <FormField
                  control={form.control}
                  name='requireSpecialChar'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                      <FormControl>
                        <button
                          type='button'
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                            field.value ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white border-slate-300'
                          )}
                        >
                          {field.value && (
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </button>
                      </FormControl>
                      <FormLabel
                        className='text-sm font-medium text-slate-700 cursor-pointer'
                        onClick={() => field.onChange(!field.value)}
                      >
                        Ký tự đặc biệt (@, #, $, %)
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='requireNumber'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                      <FormControl>
                        <button
                          type='button'
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                            field.value ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white border-slate-300'
                          )}
                        >
                          {field.value && (
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </button>
                      </FormControl>
                      <FormLabel
                        className='text-sm font-medium text-slate-700 cursor-pointer'
                        onClick={() => field.onChange(!field.value)}
                      >
                        Chữ số (0-9)
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='requireUppercase'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                      <FormControl>
                        <button
                          type='button'
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                            field.value ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white border-slate-300'
                          )}
                        >
                          {field.value && (
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </button>
                      </FormControl>
                      <FormLabel
                        className='text-sm font-medium text-slate-700 cursor-pointer'
                        onClick={() => field.onChange(!field.value)}
                      >
                        Chữ hoa (A-Z)
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
