// @mui
import { Stack, Button, Typography } from '@mui/material';
// assets
import { DocIllustration } from '../assets';

// ----------------------------------------------------------------------

export default function NavbarDocs() {

  return (
    <Stack
      spacing={3}
      sx={{ px: 5, pb: 5, mt: 10, width: 1, textAlign: 'center', display: 'block' }}
    >
      <DocIllustration sx={{ width: 1 }} />

      <div>
        <Typography gutterBottom variant="subtitle1">
          Hi Admin,
        </Typography>
        <Typography variant="body2" sx={{ color: 'red' }}>
          Need help?
          <br /> Please check our docs
        </Typography>
      </div>

      <Button style={{background: 'gray', borderRadius: '18px', padding: '4px 14px', textTransform: 'capitalize', fontWeight: '600'}} href='https://on.wax.io/wax-io/' target="_blank" rel="noopener" variant="contained">
        Help
      </Button>
    </Stack>
  );
}
