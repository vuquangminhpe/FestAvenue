import { useState, useMemo, useEffect } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  X,
  Loader2,
  Sparkles,
  List,
  ChevronDown,
  ChevronUp,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import eventApis from '@/apis/event.api'
import categoryApis from '@/apis/categories.api'
import EventCard from '@/components/custom/EventCard'
import { DateTimePicker } from '@/components/ui/DateTimePicker'
import type { ReqFilterOwnerEvent } from '@/types/event.types'

type SearchMode = 'ai' | 'normal'
type AISearchType = 'text' | 'image' | 'both'

export default function EventSearch() {
  const [searchParams] = useSearchParams()
  const [searchMode, setSearchMode] = useState<SearchMode>('normal')
  const [aiSearchType, setAiSearchType] = useState<AISearchType>('text')
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchImage, setSearchImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)

  // Filters for normal mode
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [fromCapacity, setFromCapacity] = useState<string>('')
  const [toCapacity, setToCapacity] = useState<string>('')
  const [fromSaleTicket, setFromSaleTicket] = useState<Date | undefined>()
  const [toSaleTicket, setToSaleTicket] = useState<Date | undefined>()
  const [searchMailEvent, setSearchMailEvent] = useState<string>('')
  const [searchPhoneEvent, setSearchPhoneEvent] = useState<string>('')
  const [hashtags, setHashtags] = useState<string>('')
  const [searchOrganization, setSearchOrganization] = useState<string>('')

  // Filters for AI mode (client-side)
  const [aiSelectedCategory, setAiSelectedCategory] = useState<string>('')
  const [aiFromDate, setAiFromDate] = useState<Date | undefined>()
  const [aiToDate, setAiToDate] = useState<Date | undefined>()

  // Handle hashtag and search query from URL parameters
  useEffect(() => {
    const hashtagParam = searchParams.get('hashtag')
    const searchParam = searchParams.get('q')

    if (hashtagParam) {
      setHashtags(hashtagParam)
      setShowFilters(true) // Auto-expand filters to show hashtag
      // Trigger search automatically
      setSearchText('')
      setSearchQuery('')
    }

    if (searchParam) {
      setSearchText(searchParam)
      setSearchQuery(searchParam)
      setSearchMode('normal') // Use normal search mode for text search from header
    }
  }, [searchParams])

  // Get categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApis.getCategoryActive()
  })

  // AI Search Query (returns max 40 events)
  const {
    data: aiSearchData,
    isLoading: isAiLoading,
    refetch: refetchAiSearch
  } = useQuery({
    queryKey: ['aiSearchEvents', searchQuery, searchImage],
    queryFn: () => {
      const payload: { SearchText?: string; SearchImage?: File } = {}

      // Only add SearchText if not in image-only mode and has value
      if (aiSearchType !== 'image' && searchQuery.trim().length > 0) {
        payload.SearchText = searchQuery
      }

      // Only add SearchImage if not in text-only mode and has file
      if (aiSearchType !== 'text' && searchImage instanceof File) {
        payload.SearchImage = searchImage
      }

      return eventApis.searchEventWithAI(payload)
    },
    enabled: searchMode === 'ai' && (searchQuery.length > 0 || searchImage !== null)
  })

  // Normal Search with Infinite Query
  const {
    data: normalSearchData,
    isLoading: isNormalLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: [
      'normalSearchEvents',
      searchQuery,
      selectedCategory,
      fromDate,
      toDate,
      fromCapacity,
      toCapacity,
      fromSaleTicket,
      toSaleTicket,
      searchMailEvent,
      searchPhoneEvent,
      hashtags,
      searchOrganization
    ],
    queryFn: ({ pageParam = 1 }) => {
      // Parse hashtags string to array
      const hashtagsArray =
        hashtags && hashtags.trim().length > 0
          ? hashtags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : undefined

      return eventApis.searchEventsWithPaging({
        searchText: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        fromEventDate: fromDate ? fromDate.toISOString() : undefined,
        toEventDate: toDate ? toDate.toISOString() : undefined,
        fromCapacity: fromCapacity ? parseInt(fromCapacity) : undefined,
        toCapacity: toCapacity ? parseInt(toCapacity) : undefined,
        fromSaleTicket: fromSaleTicket ? fromSaleTicket.toISOString() : undefined,
        toSaleTicket: toSaleTicket ? toSaleTicket.toISOString() : undefined,
        searchMailEvent: searchMailEvent || undefined,
        searchPhoneEvent: searchPhoneEvent || undefined,
        hashtags: hashtagsArray,
        searchOrganization: searchOrganization || undefined,
        pagination: {
          pageIndex: pageParam,
          isPaging: true,
          pageSize: 12
        }
      })
    },
    getNextPageParam: (lastPage: any, allPages) => {
      const currentPage = allPages.length
      const totalPages = Math.ceil((lastPage?.data?.pagination?.total || 0) / 12)
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    enabled: searchMode === 'normal'
  })

  // Client-side filtering for AI mode
  const filteredAiEvents = useMemo(() => {
    if (!aiSearchData?.data) return []

    let filtered = aiSearchData.data

    // Filter by category
    if (aiSelectedCategory) {
      filtered = filtered.filter((event) => event.categoryId === aiSelectedCategory)
    }

    // Filter by date range
    if (aiFromDate) {
      filtered = filtered.filter((event) => {
        if (!event.startTimeEventTime) return false
        return new Date(event.startTimeEventTime) >= new Date(aiFromDate)
      })
    }

    if (aiToDate) {
      filtered = filtered.filter((event) => {
        if (!event.startTimeEventTime) return false
        return new Date(event.startTimeEventTime) <= new Date(aiToDate)
      })
    }

    return filtered
  }, [aiSearchData, aiSelectedCategory, aiFromDate, aiToDate])

  // Get all events from normal search pages
  const normalEvents = useMemo(() => {
    if (!normalSearchData?.pages) return []
    return normalSearchData.pages.flatMap((page) => (page?.data as any)?.result || [])
  }, [normalSearchData])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSearchImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSearchImage(null)
    setImagePreview(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchText)
    if (searchMode === 'ai') {
      refetchAiSearch()
    }
  }

  const handleClearFilters = () => {
    if (searchMode === 'ai') {
      setAiSelectedCategory('')
      setAiFromDate(undefined)
      setAiToDate(undefined)
    } else {
      setSelectedCategory('')
      setFromDate(undefined)
      setToDate(undefined)
      setFromCapacity('')
      setToCapacity('')
      setFromSaleTicket(undefined)
      setToSaleTicket(undefined)
      setSearchMailEvent('')
      setSearchPhoneEvent('')
      setHashtags('')
      setSearchOrganization('')
    }
  }

  const handleClearSearch = () => {
    setSearchText('')
    setSearchQuery('')
    setSearchImage(null)
    setImagePreview(null)
  }

  const eventsToDisplay = searchMode === 'ai' ? filteredAiEvents : normalEvents
  const isLoading = searchMode === 'ai' ? isAiLoading : isNormalLoading
  const totalEvents =
    searchMode === 'ai' ? aiSearchData?.data?.length || 0 : normalSearchData?.pages?.[0]?.data?.pagination?.total || 0

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Tìm kiếm sự kiện</h1>

          {/* Search Mode Toggle */}
          <div className='flex items-center gap-4 mb-6'>
            <button
              onClick={() => setSearchMode('normal')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                searchMode === 'normal'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className='w-5 h-5' />
              Tìm kiếm thông thường
            </button>
            <button
              onClick={() => setSearchMode('ai')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                searchMode === 'ai'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className='w-5 h-5' />
              Tìm kiếm với AI
            </button>
          </div>

          {/* AI Search Type Toggle - Only show in AI mode */}
          {searchMode === 'ai' && (
            <div className='flex items-center gap-3 mb-4'>
              <span className='text-sm font-medium text-gray-700'>Tìm kiếm bằng:</span>
              <button
                type='button'
                onClick={() => setAiSearchType('text')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  aiSearchType === 'text'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Văn bản
              </button>
              <button
                type='button'
                onClick={() => setAiSearchType('image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  aiSearchType === 'image'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hình ảnh
              </button>
              <button
                type='button'
                onClick={() => setAiSearchType('both')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  aiSearchType === 'both'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cả hai
              </button>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className='w-full space-y-4'>
            {/* Text Search - Show when not image-only mode */}
            {(searchMode === 'normal' || aiSearchType !== 'image') && (
              <div className='relative flex items-center'>
                <Search className='absolute left-4 h-5 w-5 text-gray-400' />
                <input
                  type='text'
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={
                    searchMode === 'ai'
                      ? 'Tìm kiếm sự kiện với AI (tối đa 40 kết quả)...'
                      : 'Tìm kiếm sự kiện theo tên...'
                  }
                  className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500'
                />
                <button
                  type='submit'
                  className='ml-2 px-6 py-4 bg-gradient-to-r from-cyan-400 to-blue-300 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-blue-400 transition-all duration-200'
                >
                  Tìm kiếm
                </button>
                {(searchQuery || searchImage) && (
                  <button
                    type='button'
                    onClick={handleClearSearch}
                    className='ml-2 px-4 py-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200'
                  >
                    <X className='w-5 h-5' />
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => setShowFilters(!showFilters)}
                  className='ml-2 lg:hidden px-4 py-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200'
                >
                  <Filter className='w-5 h-5' />
                </button>
              </div>
            )}

            {/* Image Upload - Only show in AI mode when image or both selected */}
            {searchMode === 'ai' && (aiSearchType === 'image' || aiSearchType === 'both') && (
              <div className='space-y-3'>
                {!imagePreview ? (
                  <div className='relative'>
                    <label
                      htmlFor='image-upload'
                      className='flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200'
                    >
                      <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <Upload className='w-10 h-10 mb-3 text-gray-400' />
                        <p className='mb-2 text-sm text-gray-500'>
                          <span className='font-semibold'>Nhấn để tải ảnh lên</span> hoặc kéo thả
                        </p>
                        <p className='text-xs text-gray-500'>PNG, JPG, JPEG (tối đa 10MB)</p>
                      </div>
                      <input
                        id='image-upload'
                        type='file'
                        className='hidden'
                        accept='image/*'
                        onChange={handleImageUpload}
                      />
                    </label>
                    {aiSearchType === 'image' && (
                      <button
                        type='submit'
                        disabled={!searchImage}
                        className='mt-3 w-full px-6 py-4 bg-gradient-to-r from-cyan-400 to-blue-300 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        Tìm kiếm bằng ảnh
                      </button>
                    )}
                  </div>
                ) : (
                  <div className='relative'>
                    <div className='relative w-full h-40 rounded-lg overflow-hidden border-2 border-cyan-400'>
                      <img src={imagePreview} alt='Preview' className='w-full h-full object-cover' />
                      <button
                        type='button'
                        onClick={handleRemoveImage}
                        className='absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                    <div className='mt-2 flex items-center gap-2 text-sm text-gray-600'>
                      <ImageIcon className='w-4 h-4 text-cyan-500' />
                      <span className='font-medium'>{searchImage?.name}</span>
                    </div>
                    {aiSearchType === 'image' && (
                      <button
                        type='submit'
                        className='mt-3 w-full px-6 py-4 bg-gradient-to-r from-cyan-400 to-blue-300 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-blue-400 transition-all duration-200'
                      >
                        Tìm kiếm bằng ảnh
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Content */}
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-80 ${
              showFilters ? 'block' : 'hidden lg:block'
            } bg-white border border-gray-200 rounded-lg p-6 h-fit sticky top-4`}
          >
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                <Filter className='w-5 h-5 text-cyan-500' />
                Bộ lọc
              </h2>
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className='lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                {isFilterExpanded ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className='lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className={`space-y-6 ${isFilterExpanded ? 'block' : 'hidden lg:block'}`}>
              {/* Category Filter */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Danh mục</label>
                <select
                  value={searchMode === 'ai' ? aiSelectedCategory : selectedCategory}
                  onChange={(e) =>
                    searchMode === 'ai' ? setAiSelectedCategory(e.target.value) : setSelectedCategory(e.target.value)
                  }
                  className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                >
                  <option value=''>Tất cả danh mục</option>
                  {categories?.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className='flex gap-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Bắt đầy sự kiện</label>
                  <DateTimePicker
                    value={searchMode === 'ai' ? aiFromDate : fromDate}
                    onChange={(date) => (searchMode === 'ai' ? setAiFromDate(date) : setFromDate(date))}
                    placeholder='Chọn ngày bắt đầu'
                    variant='start'
                    maxDate={searchMode === 'ai' ? aiToDate : toDate}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Kết thúc sự kiện</label>
                  <DateTimePicker
                    value={searchMode === 'ai' ? aiToDate : toDate}
                    onChange={(date) => (searchMode === 'ai' ? setAiToDate(date) : setToDate(date))}
                    placeholder='Chọn ngày kết thúc'
                    variant='end'
                    minDate={searchMode === 'ai' ? aiFromDate : fromDate}
                  />
                </div>
              </div>

              {/* Additional Filters - Only for Normal Search Mode */}
              {searchMode === 'normal' && (
                <>
                  {/* Capacity Range */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Sức chứa</label>
                    <div className='grid grid-cols-2 gap-2'>
                      <input
                        type='number'
                        placeholder='Từ'
                        value={fromCapacity}
                        onChange={(e) => setFromCapacity(e.target.value)}
                        className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                        min='0'
                      />
                      <input
                        type='number'
                        placeholder='Đến'
                        value={toCapacity}
                        onChange={(e) => setToCapacity(e.target.value)}
                        className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                        min='0'
                      />
                    </div>
                  </div>

                  {/* Sale Ticket Date Range */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Thời gian bán vé từ</label>
                    <DateTimePicker
                      value={fromSaleTicket}
                      onChange={setFromSaleTicket}
                      placeholder='Chọn ngày bắt đầu bán'
                      variant='start'
                      maxDate={toSaleTicket}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Thời gian bán vé đến</label>
                    <DateTimePicker
                      value={toSaleTicket}
                      onChange={setToSaleTicket}
                      placeholder='Chọn ngày kết thúc bán'
                      variant='end'
                      minDate={fromSaleTicket}
                    />
                  </div>

                  {/* Organization Search */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Tổ chức</label>
                    <input
                      type='text'
                      placeholder='Tên tổ chức'
                      value={searchOrganization}
                      onChange={(e) => setSearchOrganization(e.target.value)}
                      className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                    />
                  </div>

                  {/* Email Search */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                    <input
                      type='email'
                      placeholder='Email tổ chức'
                      value={searchMailEvent}
                      onChange={(e) => setSearchMailEvent(e.target.value)}
                      className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                    />
                  </div>

                  {/* Phone Search */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Số điện thoại</label>
                    <input
                      type='tel'
                      placeholder='SĐT tổ chức'
                      value={searchPhoneEvent}
                      onChange={(e) => setSearchPhoneEvent(e.target.value)}
                      className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                    />
                  </div>

                  {/* Hashtags */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Hashtags</label>
                    <input
                      type='text'
                      placeholder='#tag1, #tag2, #tag3'
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Nhập các hashtag, cách nhau bởi dấu phẩy</p>
                  </div>
                </>
              )}

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className='w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200'
              >
                Xóa bộ lọc
              </button>
            </div>
          </aside>

          {/* Events Grid */}
          <main className='flex-1'>
            {/* Results Info */}
            {searchQuery && (
              <div className='mb-6'>
                <p className='text-lg text-gray-700'>
                  {isLoading ? (
                    <span className='flex items-center gap-2'>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      Đang tìm kiếm...
                    </span>
                  ) : (
                    <>
                      Tìm thấy <span className='font-bold text-cyan-600'>{eventsToDisplay.length}</span>{' '}
                      {searchMode === 'ai' ? (
                        <>
                          / <span className='font-bold'>{totalEvents}</span>
                        </>
                      ) : (
                        <>
                          trên tổng <span className='font-bold'>{totalEvents}</span>
                        </>
                      )}{' '}
                      sự kiện
                      {searchMode === 'ai' && totalEvents === 40 && ' (Giới hạn AI: 40 sự kiện)'}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className='flex items-center justify-center py-20'>
                <Loader2 className='w-10 h-10 animate-spin text-cyan-500' />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && searchQuery && eventsToDisplay.length === 0 && (
              <div className='text-center py-20'>
                <div className='w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                  <Search className='w-10 h-10 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>Không tìm thấy sự kiện</h3>
                <p className='text-gray-600'>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
              </div>
            )}

            {/* Events Grid */}
            {!isLoading && eventsToDisplay.length > 0 && (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {eventsToDisplay.map((event: ReqFilterOwnerEvent, index: number) => (
                    <EventCard key={event.id} event={event} priority={index < 4} />
                  ))}
                </div>

                {/* Load More Button for Normal Mode */}
                {searchMode === 'normal' && hasNextPage && (
                  <div className='mt-8 text-center'>
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className='px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-300 text-white font-medium rounded-lg hover:from-cyan-500 hover:to-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {isFetchingNextPage ? (
                        <span className='flex items-center gap-2'>
                          <Loader2 className='w-5 h-5 animate-spin' />
                          Đang tải...
                        </span>
                      ) : (
                        'Tải thêm sự kiện'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
