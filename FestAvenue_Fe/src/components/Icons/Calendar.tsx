import type { SVGProps } from 'react'
const Calendar = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={15} height={16} viewBox='0 0 15 16' fill='none' {...props}>
    <rect width={14} height={12.364} x={0.5} y={2.641} stroke='#444' rx={1.5} />
    <path fill='#444' d='M0 4.14a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2V5.96H0V4.14Z' />
    <path
      stroke='#444'
      strokeLinecap='round'
      strokeWidth={3}
      d='M2.727 1.5v2.545M2.727 1.5v2.545M2.727 1.5v2.545M11.59 1.5v2.545M11.59 1.5v2.545M11.59 1.5v2.545'
    />
  </svg>
)
export default Calendar
