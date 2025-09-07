import type { SVGProps } from 'react'
const Close = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={20} height={20} viewBox='0 0 20 20' fill='none' {...props}>
    <path
      fill='#222'
      d='M6.063 15 5 13.937 8.938 10 5 6.062 6.063 5 10 8.938 13.938 5 15 6.063 11.062 10 15 13.938 13.937 15 10 11.062 6.062 15Z'
    />
  </svg>
)
export default Close
