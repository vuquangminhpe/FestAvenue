import { SVGProps } from 'react'
const Pen = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={24} height={24} viewBox='0 0 24 24' fill='none' {...props}>
    <path
      fill='currentColor'
      d='M5 19h1.261L16.498 8.764l-1.262-1.262L5 17.738V19Zm-1.5 1.5v-3.384L16.69 3.93c.152-.138.319-.244.501-.319a1.5 1.5 0 0 1 .575-.112c.2 0 .395.036.583.107.188.07.354.184.499.34l1.221 1.236c.155.145.266.311.332.5.066.188.099.377.099.565 0 .201-.034.393-.103.576-.069.183-.178.35-.328.501L6.885 20.5H3.5ZM15.856 8.144l-.62-.642 1.262 1.262-.642-.62Z'
    />
  </svg>
)
export default Pen
