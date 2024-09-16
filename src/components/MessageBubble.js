import { Avatar } from "@mui/material";
import PageviewIcon from '@mui/icons-material/Pageview';
import { green, pink, deepPurple } from '@mui/material/colors';

const MessageBubble = (props) => {
    return (
        <div className="messageBubbleContainer">
            <div>
            { props.type === 'out' ? <Avatar sx={{ bgcolor: deepPurple[500], display: 'flex', alignItems: 'center', width: 24, height: 24, fontSize: '15px'}}>Y</Avatar>
            : <Avatar sx={{ bgcolor: pink[500], display: 'flex', alignItems: 'center', width: 24, height: 24, fontSize: '15px'}}>AI</Avatar> }
            </div>
            <div className={`messageBubble ${props.type === 'in' ? 'inMsg' : ''}`}>
                {props.message}
            </div>
        </div>        
    );
};


export default MessageBubble;