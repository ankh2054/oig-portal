import PropTypes from 'prop-types';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Stack, Card, Avatar, CardHeader, Typography } from '@mui/material';
// utils
import { fShortenNumber } from '../../utils/formatNumber';
// _mock_
// import { _appAuthors } from '../../../../_mock';
// components
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import { Link } from 'react-router-dom'

// ----------------------------------------------------------------------

const IconWrapperStyle = styled('div')(({ theme }) => ({
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
}));

// ----------------------------------------------------------------------

const getUniqueTop21Guilds = (guilds) => {
  let uniqueGuilds = []
  for (let char of guilds) {
    let check = uniqueGuilds.find(e=> JSON.stringify(e) == JSON.stringify(char))
    if(!check) {
      uniqueGuilds.push(char)
    }
  }
  return uniqueGuilds;
}

export default function Top21({top21Guilds}) {
    const unique = getUniqueTop21Guilds(top21Guilds)

  return (
    <Scrollbar style={{ maxWidth: 400, maxHeight: 500 }}>
        <Box>
        <CardHeader title="Top 21 Guilds" />
        <Stack spacing={3} sx={{ p: 3 }}>
          {unique.map((top21Guild, index) => (
            <AuthorItem key={index} author={top21Guild.owner_name} logo_svg={top21Guild.logo_svg} index={index} />
          ))}
        </Stack>
        </Box>
    </Scrollbar>
  );
}

// ----------------------------------------------------------------------

AuthorItem.propTypes = {
  author: PropTypes.shape({
    avatar: PropTypes.string,
    favourite: PropTypes.number,
    name: PropTypes.string,
  }),
  index: PropTypes.number,
};

function AuthorItem({ author, logo_svg, index }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Link to={`/guilds/${author}`}>
        <Avatar alt={author.name} src={logo_svg} />
      </Link>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2">{author}</Typography>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
          }}
        >
          {/* <Iconify icon={'eva:heart-fill'} sx={{ width: 16, height: 16, mr: 0.5 }} /> */}
          {/* {fShortenNumber(author.favourite)} */}
        </Typography>
      </Box>

      <IconWrapperStyle
        sx={{
          ...(index === 1 && {
            color: 'info.main',
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
          })
        }}
      >
        <Iconify icon={'ant-design:trophy-filled'} width={20} height={20} />
      </IconWrapperStyle>
    </Stack>
  );
}