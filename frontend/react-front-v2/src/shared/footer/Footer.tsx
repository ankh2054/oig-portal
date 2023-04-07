import Container from '../container/Container'
import IconGithub from '../icons/IconGithub'
import IconTwitter from '../icons/IconTwitter'
import IconYoutube from '../icons/IconYoutube'
import Logo from '../icons/Logo'

const Footer = () => {
  return (
    <footer className="w-full bg-secondary px-8 py-4 text-white">
      <Container className="flex flex-col items-center gap-y-2">
        <Logo width="100%" />
        <p>
          © 2023 OIG portal. A product of{' '}
          <span className="font-bold">Sentnl</span>.
        </p>
        <div className="flex gap-x-2">
          <a href="https://twitter.com" target="_blank">
            <IconTwitter />
          </a>
          <a href="https://gitub.com" target="_blank">
            <IconGithub />
          </a>
          <a href="https://youtube.com" target="_blank">
            <IconYoutube />
          </a>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
