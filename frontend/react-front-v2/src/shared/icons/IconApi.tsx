interface Props {
  width?: string
  height?: string
  className?: string
  color?: string
}
const IconApi = ({
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
      <path
        fill={color}
        d="M7 7H5a2 2 0 0 0-2 2v8h2v-4h2v4h2V9a2 2 0 0 0-2-2m0 4H5V9h2m7-2h-4v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2m0 4h-2V9h2m6 0v6h1v2h-4v-2h1V9h-1V7h4v2Z"
      />
    </svg>
  )
}

export default IconApi
