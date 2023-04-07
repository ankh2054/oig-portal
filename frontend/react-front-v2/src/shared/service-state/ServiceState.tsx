import IconHistory from '../icons/IconHistory'

const ServiceState = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-success"></span>
        <IconHistory />
      </div>
      <div>History v1</div>
    </div>
  )
}
export default ServiceState
