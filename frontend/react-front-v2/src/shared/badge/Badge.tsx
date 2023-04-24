import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  bgColor: string
  textColor?: string
}
const Badge = ({ children, bgColor, textColor }: Props) => {
  return (
    <div
      className={`rounded-sm  px-1 text-sm text-white ${bgColor} ${textColor}`}
    >
      {children}
    </div>
  )
}

export default Badge
