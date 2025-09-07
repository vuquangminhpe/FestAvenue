import type { SVGProps } from 'react'
const Menu = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={20} height={20} viewBox='0 0 20 20' fill='none' {...props}>
    <path fill='#222' d='M3 14.5V13h14v1.5H3Zm0-3.75v-1.5h14v1.5H3ZM3 7V5.5h14V7H3Z' />
  </svg>
)
export default Menu
