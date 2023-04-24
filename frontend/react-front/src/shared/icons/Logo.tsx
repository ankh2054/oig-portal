interface Props {
  width?: string
  height?: string
  className?: string
}

const Logo = ({ width = '24', height = '24', className }: Props) => {
  return (
    <svg
      height={height}
      width={width}
      className={className}
      viewBox="0 0 104 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M93.1438 7.43767L88.1893 11.573L93.2767 15.8352L103.317 7.43767H93.1438Z"
        fill="#F78E1E"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M60.8312 0.907532L80.8409 17.7459L74.4968 23.0612L61.3671 7.43768H52.8154L29.9284 34.5944H38.4708L57.0908 12.5071L62.4645 18.902H55.4524L51.8739 23.1616H66.0447L70.1643 28.0643H78.6998L78.699 28.0634L85.9275 22.0072L93.1577 28.0643H103.329L70.9967 0.907532H60.8312Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36.067 7.43767L30.9268 21.5375L25.7874 7.43767H17.2535L12.1005 21.5724L6.94833 7.43767H-0.0101318L7.5081 28.0643H16.6929L21.5204 14.8211L26.348 28.0643H35.5064L43.0255 7.43767H36.067Z"
        fill="white"
      />
    </svg>
  )
}

export default Logo
