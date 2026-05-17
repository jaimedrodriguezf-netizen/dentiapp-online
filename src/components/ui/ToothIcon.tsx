import { SVGProps } from 'react'

export function Tooth(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.267 19.108c1.387-2.77 2.347-5.08 2.56-8.108.267-3.867 1.6-6.667 4.267-7.733.373-.16.746-.267 1.12-.32 2.08-.267 4.4.667 5.6 2.4 1.467 2.133 2.133 4.8 2.133 7.733 0 2.4-.533 4.533-1.6 6.4-1.067 1.867-2.667 3.2-4.533 3.733-1.867.533-3.733.267-5.333-.8-1.6-1.067-2.933-2.667-4.267-4.8z" />
      <path d="M12 3v18" />
    </svg>
  )
}
