import { SVGProps } from 'react'
const NotDisturb = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={25} height={24} viewBox='0 0 24 24' fill='none' {...props}>
    <g clipPath='url(#a)'>
      <path fill='#fff' d='M12 3c-4.968 0-9 4.032-9 9s4.032 9 9 9 9-4.032 9-9-4.032-9-9-9Zm4.5 9.9h-9v-1.8h9v1.8Z' />
    </g>
    <defs>
      <clipPath id='a'>
        <path fill='#fff' d='M.5 0h24v24H.5z' />
      </clipPath>
    </defs>
  </svg>
)
export default NotDisturb
