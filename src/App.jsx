import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import imgProcessing from './assets/processing.gif';

const API_KEY = "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";
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}

function App() {
  const [ inicio, setInicio] = useState(true);
  const [ generating, setGenerating] = useState(false);
  const [ AdGenerated, setAdGenerated] = useState(false);
  const [ adTitle, setadTitle] = useState('Ad title');
  const [ adContent, setadContent] = useState('');
  const [ adImage, setadImg] = useState('');
  const [chatNumber, setChatNumber] = useState(0);

  const [messages, setMessages] = useState([
    {
      message: "Hello.. I am your Facebook Ad Genie! Let's build your new Ad... what do you have in mind?",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
// Funcion de enviar y recibir mensajes
  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };
// start Generating ADS

const generateAd = (content) => {
    setGenerating(true);

    setadContent(content);

    const InicioImage = content.indexOf('Image');
    const IncioHeadline = content.indexOf('Title');
    const InicioContent = content.indexOf('Content');

    const ParametrosImage = content.substring((InicioImage+7),IncioHeadline);
    const Headline = content.substring((IncioHeadline+8),InicioContent);
    const Content = content.substring((InicioContent+8));
    
    fetch ("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + API_KEY,
      },
      body: JSON.stringify({
        prompt: ParametrosImage,
        n: 1,
        size:"1024x1024",
      }),
    })
    .then((response) => response.json())
    .then((img) => {
        setadImg(img.data[0].url);
    })
    
    setadTitle(Headline);
    setadContent(Content);
    setGenerating(false);
    setAdGenerated(true);
}


//end generating ads


// Funcion de Inicio del Ciclo 
  const handleInicio = async (message) => {
    setInicio(false);
    const newMessage = {
      message: "I​ ​want​ ​to​ ​create a​ ​Facebook​ ​ad.​ ​Can​ ​you​ ​ask​ ​me one question at a time, asking a maximum of 3 questions in total so that you have ​enough​ information​ ​to​ ​make​ ​an​ ​effective​ ​ad. Ask​ ​one​ ​question​ ​at​ ​a​ ​time.When you make the facebook ad, please generate an image, title and content",
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };
// Procesamiento chatGPT
  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
      
      let chatN = chatNumber + 1;

      setChatNumber(chatN);
      let answerToCheck = data.choices[0].message.content;
      console.log(chatNumber);
      if (chatNumber === 3 )  {
        const lastAnswer = data.choices[0].message.content;
        console.log(lastAnswer);
        generateAd(lastAnswer);
      }
      console.log(chatNumber);
    });
  }

  return (

    <div className="App">
    { inicio &&
      <div className = "CapaInicio"style={{
          position: "absolute", 
          height: "100vh", 
          width: "100vw", 
          backgroundColor: "white", 
          display: "flex", 
          zIndex: "10",
          justifyContent: "center",
          alignItems: "center", top: "0", left: "0", transition: "all 0.2s" }}>
            <button style={{ backgroundColor: "#395693", color: "#fff"}} onClick={handleInicio}>I need to create a Facebook Ad pronto!</button>
      </div>
    }
    { generating &&
      <div className = "CapaInicio"style={{
          position: "absolute", 
          height: "100vh", 
          width: "100vw", 
          backgroundColor: "white", 
          display: "flex",
          flexDirection: "column", 
          zIndex: "10",
          justifyContent: "center",
          alignItems: "center", top: "0", left: "0", transition: "all 0.2s" }}>
            <p style={{color: "#000", fontWeight: "bold"}}>Please hold on for a moment, your awesome ad is being created!</p>
            <img src={imgProcessing} alt="Generating Ads ..." style={{width: "200px"}}/>
      </div>
    }
    { AdGenerated &&
      <div className = "CapaInicio"style={{
          position: "absolute", 
          height: "100vh", 
          width: "100vw", 
          backgroundColor: "white", 
          display: "flex",
          flexDirection: "column", 
          zIndex: "10",
          justifyContent: "center",
          alignItems: "center", top: "0", left: "0", transition: "all 0.2s" }}>
            <p style={{color: "#000", fontWeight: "bold"}}> Your <span style={{color:"#395693"}}>Facebook Ad</span> is ready based on your goals. I hope you like it!</p>
            <div style={{maxWidth: "320px", width: "100%", borderRadius: "10px", border: "1px solid #395693", padding: "10px", boxShadow: " 0px 0px 20px 4px #cdcdcd"}}>
              <p style={{color: "#000", fontWeight: "bold", textAlign: "left"}}>{adTitle}</p>
              { adImage && 
                <img src={adImage } alt="Generating Ads ..." style={{width: "100%"}}/>
              }
              <p style={{color: "#000", textAlign: "justify"}}>{adContent}</p>
            </div>
      </div>
    }
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Facebook Ads Generatos is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
