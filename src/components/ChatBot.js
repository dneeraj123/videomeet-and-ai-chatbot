import { Button, TextareaAutosize } from "@mui/material";
import { useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";

const ChatBot = () => {

    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [isResponseInProgress, setIsResponseInProgress] = useState(false);
    const OPENAI_API_KEY = 'xxxxx';

    useEffect(() => {
        console.log("Dependency use effect !");
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { "role": "system", "content": "You are a helpful assistant." },
                    { "role": "user", "content": `${message}` },
                ]
            })
        };
        if(isResponseInProgress) {
            fetch('https://api.openai.com/v1/chat/completions', requestOptions)
                .then(res => res.json())
                .then((json) => {
                    setIsResponseInProgress(false);
                    console.log(json);
                    if(json['choices'][0]['message']['content']) {
                        setMessageList([...messageList, { message: json['choices'][0]['message']['content'], type: 'in'}]);
                    }
                    setMessage('');
                }).catch((e) => {
                    setIsResponseInProgress(false);
                    console.log(e);
                });
        }
    }, [isResponseInProgress]);

    const sendMessage = (e) => {
        if(!message) {
            return;
        }
        setMessageList([...messageList, { message: message, type: 'out'}]);
        setIsResponseInProgress(true);
    }

    return (
        <>
            <div className="chat-container">
                <div className="messages-container">
                    {
                        messageList.map((m, idx) => {
                            return <MessageBubble key={idx} message={m.message} type={m.type}/>
                        }) 
                    }
                </div>
                <div className="send-container">
                    <textarea style={{ width: '90%', height: '100%', padding: '5px', outline: 'none' }} placeholder="Type..."
                        value={message} onChange={(e) => setMessage(e.target.value)} />
                    {isResponseInProgress ? <span>...</span> : <Button variant="contained" style={{ width: '10%', height: '100%', borderRadius: '2px', padding: '5px', outline: 'none' }} onClick={sendMessage}>Send</Button>}
                </div>
            </div>
        </>
    );
}

export default ChatBot;