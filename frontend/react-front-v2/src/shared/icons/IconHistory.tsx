interface Props {
  width?: string
  height?: string
  className?: string
  color?: string
}

const IconHistory = ({
  width = '24',
  height = '24',
  className,
  color,
}: Props) => {
  return (
    <svg
      height={height}
      width={width}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z" />
    </svg>
  )
}

export default IconHistory
