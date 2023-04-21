interface Props {
  width?: string
  height?: string
  className?: string
  color?: string
}
const IconSeedNode = ({
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
        d="M9 14H2v2h7v3l4-4l-4-4v3m6-1v-3h7V8h-7V5l-4 4l4 4Z"
      />
    </svg>
  )
}

export default IconSeedNode
