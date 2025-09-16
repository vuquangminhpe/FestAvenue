import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Mail, Users } from 'lucide-react'
import { toast } from 'sonner'

const inviteSchema = z.object({
  emails: z
    .array(
      z.object({
        email: z.string().email('Email không hợp lệ')
      })
    )
    .min(1, 'Phải có ít nhất 1 email')
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteUsersModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (emails: string[]) => void
  organizationName: string
  isLoading?: boolean
}

export default function InviteUsersModal({
  isOpen,
  onClose,
  onInvite,
  organizationName,
  isLoading
}: InviteUsersModalProps) {
  const [bulkEmails, setBulkEmails] = useState('')

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      emails: [{ email: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'emails'
  })

  const handleSubmit = (data: InviteFormData) => {
    const emailList = data.emails.map((item) => item.email).filter((email) => email.trim() !== '')
    if (emailList.length === 0) {
      toast.error('Vui lòng nhập ít nhất một email')
      return
    }
    onInvite(emailList)
  }

  const handleBulkAdd = () => {
    if (!bulkEmails.trim()) return

    const emails = bulkEmails
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email && email.includes('@'))

    if (emails.length === 0) {
      toast.error('Không tìm thấy email hợp lệ')
      return
    }

    // Remove existing empty fields
    const currentEmails = form.getValues('emails').filter((item) => item.email.trim() !== '')

    // Add new emails
    const newEmails = [...currentEmails, ...emails.map((email) => ({ email }))]
    form.setValue('emails', newEmails)
    setBulkEmails('')
    toast.success(`Đã thêm ${emails.length} email`)
  }

  const addEmailField = () => {
    append({ email: '' })
  }

  const removeEmailField = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handleClose = () => {
    form.reset()
    setBulkEmails('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh]  overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Users className='h-5 w-5' />
            Mời thành viên vào tổ chức
          </DialogTitle>
          <DialogDescription>
            Mời người dùng tham gia tổ chức <strong>{organizationName}</strong>. Họ sẽ nhận được email mời để tham gia.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6 '>
            {/* Bulk Add Section */}
            <Card className='bg-blue-50  border-blue-200'>
              <CardContent className='p-4'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-blue-600' />
                    <Label className='text-sm font-medium text-blue-800'>Thêm nhiều email cùng lúc</Label>
                  </div>
                  <textarea
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder='Nhập nhiều email, cách nhau bằng dấu phẩy hoặc xuống dòng&#10;Ví dụ: user1@example.com, user2@example.com'
                    className='w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
                    rows={3}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleBulkAdd}
                    className='bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  >
                    <Plus className='h-4 w-4 mr-1' />
                    Thêm email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Individual Email Fields */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>Danh sách email mời ({fields.length})</Label>
                <Button type='button' variant='outline' size='sm' onClick={addEmailField}>
                  <Plus className='h-4 w-4 mr-1' />
                  Thêm email
                </Button>
              </div>

              <div className='space-y-3 max-h-60 overflow-y-auto'>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`emails.${index}.email`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <div className='flex gap-2'>
                          <FormControl>
                            <Input {...formField} placeholder={`Email ${index + 1}`} className='flex-1' />
                          </FormControl>
                          {fields.length > 1 && (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => removeEmailField(index)}
                              className='px-3'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            {fields.some((field) => form.watch(`emails.${fields.indexOf(field)}.email`)) && (
              <Card className='bg-green-50 border-green-200'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge className='bg-green-600'>
                      {fields.filter((_, index) => form.watch(`emails.${index}.email`)).length} email
                    </Badge>
                    <span className='text-sm text-green-800'>sẽ được gửi lời mời</span>
                  </div>
                  <p className='text-xs text-green-700'>
                    Người dùng sẽ nhận được email mời tham gia tổ chức và có thể chấp nhận lời mời để trở thành thành
                    viên.
                  </p>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading} className='bg-blue-600 hover:bg-blue-700'>
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Mail className='h-4 w-4 mr-2' />
                    Gửi lời mời
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
