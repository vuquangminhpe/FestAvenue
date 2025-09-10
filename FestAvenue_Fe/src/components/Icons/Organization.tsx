import type { SVGProps } from 'react'
const Organization = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={30} height={30} viewBox='0 0 24 24' fill='none' {...props}>
    <path fill='currentColor' d='M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5zM4 17V8.5l8-4 8 4V17H4z' />
    <path fill='currentColor' d='M8 10h2v2H8zm0 3h2v2H8zm3-3h2v2h-2zm0 3h2v2h-2zm3-3h2v2h-2zm0 3h2v2h-2z' />
    <circle cx='12' cy='7' r='1.5' fill='currentColor' />
  </svg>
)
export default Organization
