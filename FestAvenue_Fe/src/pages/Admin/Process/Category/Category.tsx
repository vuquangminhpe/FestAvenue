import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCategoryQuery } from './hooks/useCategoryQuery'
import CategoryList from './components/CategoryList'
import CategoryForm from './components/CategoryForm'
import type { getCategoryActiveRes } from '@/types/categories.types'
import type { bodyCreateCategory, bodyUpdateCategory } from '@/types/admin.types'
import { gsap } from 'gsap'

export default function Category() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<getCategoryActiveRes | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    categoriesQuery,
    createCategoryMutation,
    updateCategoryMutation,
    uploadImageMutation
  } = useCategoryQuery()

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
    }
  }, [])

  const handleCreate = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const handleEdit = (category: getCategoryActiveRes) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }


  const handleSubmit = async (data: bodyCreateCategory | bodyUpdateCategory) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync(data as bodyUpdateCategory)
      } else {
        await createCategoryMutation.mutateAsync(data as bodyCreateCategory)
      }
      setIsFormOpen(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div ref={containerRef} className="p-6 max-w-7xl mx-auto">
      <CategoryList
        categories={categoriesQuery.data?.data || []}
        onEdit={handleEdit}
        onCreate={handleCreate}
        isLoading={categoriesQuery.isLoading}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            uploadImageMutation={uploadImageMutation}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
