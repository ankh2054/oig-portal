interface Props {
  icon: JSX.Element
  name: string
}
const ServiceState = ({ icon, name }: Props) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-success"></span>
        {icon}
      </div>
      <div className="text-gray">{name}</div>
    </div>
  )
}
export default ServiceState
