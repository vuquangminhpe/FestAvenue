import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Eye } from 'lucide-react'
import type { getCategoryActiveRes } from '@/types/categories.types'

interface CategoryListProps {
  categories: getCategoryActiveRes[]
  onEdit: (category: getCategoryActiveRes) => void
  onCreate: () => void
  isLoading?: boolean
}

export default function CategoryList({ categories, onEdit, onCreate, isLoading }: CategoryListProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý danh mục</h2>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo danh mục mới
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'https://via.placeholder.com/400x225?text=No+Image'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-1">{category.name}</h3>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    <p>Tạo: {formatDate(category.createdAt)}</p>
                    <p>Cập nhật: {formatDate(category.updatedAt)}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(category)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Eye className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có danh mục nào</h3>
          <p className="text-gray-500 mb-6">Tạo danh mục đầu tiên để bắt đầu quản lý.</p>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo danh mục đầu tiên
          </Button>
        </div>
      )}

    </div>
  )
}