import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import adminApi from '@/apis/admin.api'
import userApi from '@/apis/user.api'

export const useCategoryQuery = () => {
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: adminApi.getAllCategory
  })

  const categoryByIdQuery = (categoryId: string | null) =>
    useQuery({
      queryKey: ['category', categoryId],
      queryFn: () => adminApi.getCateGoryById(categoryId!),
      enabled: !!categoryId
    })

  const createCategoryMutation = useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Tạo danh mục thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục')
    }
  })

  const updateCategoryMutation = useMutation({
    mutationFn: adminApi.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category'] })
      toast.success('Cập nhật danh mục thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật danh mục')
    }
  })

  const uploadImageMutation = useMutation({
    mutationFn: userApi.uploadsStorage,

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Thông báo mặc định')
    }
  })

  return {
    categoriesQuery,
    categoryByIdQuery,
    createCategoryMutation,
    updateCategoryMutation,
    uploadImageMutation
  }
}
