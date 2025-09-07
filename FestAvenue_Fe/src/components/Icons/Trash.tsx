import { SVGProps } from 'react'
const Trash = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={24} height={24} viewBox='0 0 24 24' fill='none' {...props}>
    <path
      fill='currentColor'
      d='M7.308 20.502c-.499 0-.925-.177-1.278-.53a1.742 1.742 0 0 1-.53-1.278V6.002h-1v-1.5H9v-.885h6v.885h4.5v1.5h-1v12.692c0 .505-.175.933-.525 1.283-.35.35-.778.525-1.283.525H7.308ZM17 6.002H7v12.692a.3.3 0 0 0 .087.221.3.3 0 0 0 .22.087h9.385a.294.294 0 0 0 .212-.097.294.294 0 0 0 .096-.211V6.002Zm-7.596 11h1.5v-9h-1.5v9Zm3.692 0h1.5v-9h-1.5v9Z'
    />
  </svg>
)
export default Trash
