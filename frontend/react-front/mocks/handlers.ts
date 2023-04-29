import { rest } from 'msw'

export const handlers = [
  rest.post('http://localhost:3000/login', (req, res, ctx) => {
    const user = {
      avatar: 'https://www.bountyblok.io/img/logo_256x256.png',
      username: 'abdel',
    }
    const message = 'The signature is valid for account abdel'
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50IjoiYWJkZWwifQ.rgoGLN_cMxVVg-wl0kG9i1aWrv-1vq_E0A3KJ5wwSqQ'
    const data = { message, token, user }

    return res(ctx.status(200), ctx.json(data))
  }),

  rest.get('https://oig.sentnl.io/api/rescan/3dkrenderwax', (req, res, ctx) => {
    const data = {
      message:
        'You need to login first using your Guild active key before scanning',
      type: 'error',
    }

    return res(ctx.status(200), ctx.json(data))
  }),
]
