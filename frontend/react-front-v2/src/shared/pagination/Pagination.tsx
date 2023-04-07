interface Props {
  className?: string
}
const Pagination = ({ className }: Props) => {
  return (
    <nav aria-label="Page navigation" className={className}>
      <ul className="list-style-none flex gap-x-2 ">
        <li>
          <a className="pointer-events-none relative block rounded-sm bg-transparent px-2 py-0.5 text-sm text-black transition-all duration-300 ">
            « Previous
          </a>
        </li>
        <li>
          <a
            className="relative block rounded-sm bg-transparent  px-2 py-0.5 text-sm text-black transition-all duration-300 hover:bg-neutral-100"
            href="#!"
          >
            1
          </a>
        </li>
        <li aria-current="page">
          <a
            className="relative block rounded-sm bg-primary px-2 py-0.5 text-sm font-medium text-white transition-all duration-300"
            href="#!"
          >
            2
          </a>
        </li>
        <li>
          <a
            className="relative block rounded-sm bg-transparent px-2 py-0.5 text-sm text-black transition-all duration-300"
            href="#!"
          >
            3
          </a>
        </li>
        <li>...</li>
        <li>
          <a
            className="relative block rounded-sm bg-transparent px-2 py-0.5 text-sm text-black transition-all duration-300"
            href="#!"
          >
            10
          </a>
        </li>
        <li>
          <a
            className="relative block rounded-sm bg-transparent px-2 py-0.5 text-sm text-black transition-all duration-300 hover:text-primary"
            href="#!"
          >
            Next »
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
