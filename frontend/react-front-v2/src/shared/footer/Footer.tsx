import Container from '../container/Container'
import Logo from '../icons/Logo'

const Footer = () => {
  return (
    <footer className="w-full bg-secondary px-8 py-4 text-white">
      <Container className="flex flex-col items-center">
        <Logo width="100%" />
        <p>
          © 2023 OIG portal. A product of{' '}
          <span className="font-bold">Sentnl</span>.
        </p>
      </Container>
    </footer>
  )
}

export default Footer
