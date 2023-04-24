import IconChevronRight from '../icons/IconChevronRight'
import IconHome from '../icons/IconHome'

type BreadcrumbItem = { url: string; label: string }
interface Props {
  className?: string
  items: Array<BreadcrumbItem>
}
const Breadcrumb = ({ className, items }: Props) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <a
            href="/"
            className="inline-flex items-center text-sm font-medium text-white hover:text-primary "
          >
            <IconHome color="white" className="mr-2" />
            Home
          </a>
        </li>
        {items.map((item, index) => {
          if (index === items.length - 1) {
            return (
              <li key={index}>
                <div className="flex items-center">
                  <IconChevronRight color="white" />
                  <span className="ml-1 text-sm font-medium text-white opacity-80 md:ml-2">
                    {item.label}
                  </span>
                </div>
              </li>
            )
          } else {
            return (
              <li key={index}>
                <div className="flex items-center">
                  <IconChevronRight color="white" />
                  <a
                    href={`/guilds/${item.url}`}
                    className="ml-1 text-sm font-medium text-white  hover:text-primary md:ml-2"
                  >
                    {item.label}
                  </a>
                </div>
              </li>
            )
          }
        })}
      </ol>
    </nav>
  )
}
export default Breadcrumb
