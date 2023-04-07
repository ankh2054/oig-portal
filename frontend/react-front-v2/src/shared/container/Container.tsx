import cx from 'classnames'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}
const Container = ({ children, className }: Props) => {
  return (
    <div className={cx('mx-auto flex max-w-screen-xl', className)}>
      {children}
    </div>
  )
}

export default Container
