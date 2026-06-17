import { deepOrange } from "@mui/material/colors";
import { createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const theme = createTheme();

const MessageRow = styled('div')({
  display: "flex"
});

const MessageRowRight = styled('div')({
  display: "flex",
  justifyContent: "flex-end"
});

const MessageBlue = styled('div')({
  position: "relative",
  marginLeft: "20px",
  minHeight: "30px",
  minWidth: "150px",
  marginBottom: "10px",
  padding: "10px",
  backgroundColor: theme.palette.primary.main,
  width: "60%",
  textAlign: "left",
  font: "400 .9em 'Open Sans', sans-serif",
  border: "1px solid #97C6E3",
  borderRadius: "10px",
  color: '#fff',
  "&:after": {
    content: "''",
    position: "absolute",
    width: "0",
    height: "0",
    borderTop: `15px solid ${theme.palette.primary.main}`,
    borderLeft: "15px solid transparent",
    borderRight: "15px solid transparent",
    top: "0",
    left: "-15px"
  },
  "&:before": {
    content: "''",
    position: "absolute",
    width: "0",
    height: "0",
    borderTop: `17px solid ${theme.palette.primary.main}`,
    borderLeft: "16px solid transparent",
    borderRight: "16px solid transparent",
    top: "-1px",
    left: "-17px"
  }
});

const MessageOrange = styled('div')({
  position: "relative",
  marginRight: "20px",
  marginBottom: "10px",
  minHeight: "30px",
  padding: "10px",
  backgroundColor: theme.palette.secondary.main,
  width: "60%",
  textAlign: "left",
  font: "400 .9em 'Open Sans', sans-serif",
  border: "1px solid #dfd087",
  borderRadius: "10px",
  color: '#fff',
  "&:after": {
    content: "''",
    position: "absolute",
    width: "0",
    height: "0",
    borderTop: `15px solid ${theme.palette.secondary.main}`,
    borderLeft: "15px solid transparent",
    borderRight: "15px solid transparent",
    top: "0",
    right: "-15px"
  },
  "&:before": {
    content: "''",
    position: "absolute",
    width: "0",
    height: "0",
    borderTop: `17px solid ${theme.palette.secondary.main}`,
    borderLeft: "16px solid transparent",
    borderRight: "16px solid transparent",
    top: "-1px",
    right: "-17px"
  }
});

const MessageContent = styled('p')({
  padding: 0,
  margin: 0,
  wordWrap: 'break-word'
});

const MessageTimeStampRight = styled('div')({
  position: "absolute",
  fontSize: ".85em",
  fontWeight: "300",
  marginTop: "10px",
  bottom: "-1px",
  right: "5px"
});

const DisplayName = styled('div')({
  marginLeft: "20px",
  fontSize: '11px',
  fontWeight: 'bold',
  left: '-24px',
  top: '-8px',
  position: 'relative'
});

export const MessageLeft = (props) => {
  const message = props.message ? props.message : 'no message';
  const timestamp = props.timestamp ? props.timestamp : '';
  const displayName = props.displayName ? props.displayName : '';

  return (
    <>
      <MessageRow>
        <MessageBlue>
          <DisplayName>{`@${displayName}`}</DisplayName>
          <div>
            <MessageContent>{message}</MessageContent>
          </div>
          <MessageTimeStampRight>{timestamp}</MessageTimeStampRight>
        </MessageBlue>
      </MessageRow>
    </>
  );
};

MessageLeft.propTypes = {
  message: PropTypes.string,
  timestamp: PropTypes.string,
  displayName: PropTypes.string
};

export const MessageRight = (props) => {
  const message = props.message ? props.message : "no message";
  const timestamp = props.timestamp ? props.timestamp : "";
  return (
    <MessageRowRight>
      <MessageOrange>
        <MessageContent>{message}</MessageContent>
        <MessageTimeStampRight>{timestamp}</MessageTimeStampRight>
      </MessageOrange>
    </MessageRowRight>
  );
};

MessageRight.propTypes = {
  message: PropTypes.string,
  timestamp: PropTypes.string
};
