import type { SVGProps } from 'react'
const Bookmark = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={20} height={20} viewBox='0 0 20 20' fill='none' {...props}>
    <path
      fill='currentColor'
      d='M5 17V4.5c0-.412.147-.766.44-1.06.294-.293.647-.44 1.06-.44h7c.412 0 .766.147 1.06.44.293.294.44.648.44 1.06V17l-5-2-5 2Zm1.5-2.23 3.5-1.395 3.5 1.396V4.5h-7v10.27Z'
    />
  </svg>
)
export default Bookmark
