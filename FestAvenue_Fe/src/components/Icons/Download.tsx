import type { SVGProps } from 'react'
const Download = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={20} height={20} viewBox='0 0 20 20' fill='none' {...props}>
    <path
      fill='#fff'
      d='M10 13 6 9l1.063-1.063 2.187 2.188V3h1.5v7.125l2.188-2.188L14 9l-4 4Zm-4.506 3c-.413 0-.765-.147-1.056-.44A1.45 1.45 0 0 1 4 14.5V13h1.5v1.5h9V13H16v1.5c0 .412-.147.766-.44 1.06-.295.293-.648.44-1.06.44H5.493Z'
    />
  </svg>
)
export default Download
