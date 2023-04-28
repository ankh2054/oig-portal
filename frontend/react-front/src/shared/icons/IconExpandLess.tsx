interface Props {
  width?: string
  height?: string
  className?: string
  color?: string
}
const IconExpandLess = ({
  width = '24',
  height = '24',
  className,
  color = 'currentColor',
}: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={width}
      className={className}
      fill={color}
      viewBox="0 0 24 24"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z" />{' '}
    </svg>
  )
}

export default IconExpandLess
