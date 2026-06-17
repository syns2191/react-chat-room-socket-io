import SendIcon from '@mui/icons-material/Send';
import OutlinedInput from '@mui/material/OutlinedInput';
import { createTheme } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const theme = createTheme();

const WrapForm = styled(FormControl)({
  display: "flex",
  justifyContent: "center",
  width: "95%",
  position: 'absolute',
  bottom: '4px'
});

export const ChatInput = ({ data, onChange, onButtonClick, value, onKeyDown }) => {
  return (
    <>
      <WrapForm>
        <OutlinedInput
          id="filled-adornment-password"
          type='text'
          placeholder='Send Text'
          onChange={onChange}
          value={value}
          onKeyDown={onKeyDown}
          disabled={data.state !== data.status.OPEN}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                color='secondary'
                aria-label="toggle password visibility"
                onClick={onButtonClick}
                edge="end"
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </WrapForm>
    </>
  );
};

ChatInput.propTypes = {
  data: PropTypes.any,
  onChange: PropTypes.func,
  onButtonClick: PropTypes.func,
  value: PropTypes.string,
  onKeyDown: PropTypes.func
};
