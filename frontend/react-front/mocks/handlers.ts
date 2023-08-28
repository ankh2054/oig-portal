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

  rest.get('https://oig.sentnl.io/api/dates', (req, res, ctx) => {
    const data = [
      { date: new Date(), type: 'Guild Update Submission Cutoff' },
      { date: new Date(), type: 'Report Appeals Begin' },
      { date: new Date(), type: 'Report Appeals End' },
      { date: new Date(), type: 'Publish Final Report' },
    ]

    return res(ctx.status(200), ctx.json(data))
  }),
  rest.get(
    'https://wax.sengine.co/api/missing-blocks-by-days?ownerName=3dkrenderwax&days=30&top21=true',
    (req, res, ctx) => {
      const data = {
        data: [
          {
            block_number: 231959980,
            blocks_missed: true,
            date: '2023-08-12T20:15:42.000Z',
            missed_block_count: 4,
            owner_name: '3dkrenderwax',
            round_missed: false,
          },
          {
            block_number: 232622733,
            blocks_missed: true,
            date: '2023-08-16T16:18:42.000Z',
            missed_block_count: 1,
            owner_name: '3dkrenderwax',
            round_missed: false,
          },
          {
            block_number: 233119411,
            blocks_missed: true,
            date: '2023-08-19T13:17:48.000Z',
            missed_block_count: 1,
            owner_name: '3dkrenderwax',
            round_missed: false,
          },
          {
            block_number: 233299841,
            blocks_missed: true,
            date: '2023-08-20T14:21:24.000Z',
            missed_block_count: 1,
            owner_name: '3dkrenderwax',
            round_missed: false,
          },
        ],
        days: 30,
        missingBlocks: 7,
        ownerName: '3dkrenderwax',
        reliability: 90,
      }

      return res(ctx.status(200), ctx.json(data))
    }
  ),
]
