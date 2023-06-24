import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  bgColor: string
  textColor?: string
  className?: string
}
const Badge = ({ children, bgColor, textColor, className }: Props) => {
  return (
    <div
      className={`rounded-sm  px-1 text-sm text-white ${bgColor} ${textColor} ${className}`}
    >
      {children}
    </div>
  )
}

export default Badge
