# 🚀 CodeLive - Realtime Code Editor & Compiler

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CodeLive-blue)](https://codelive-o86i.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/omkarghodekar18/codelive)

> A powerful real-time collaborative code editor and compiler that brings teams together for seamless coding sessions with instant communication and code execution capabilities.

## ✨ Features

### 🔄 **Real-time Collaboration**
- **Multi-user Support**: Up to 10+ users can collaborate simultaneously
- **Live Code Synchronization**: See changes in real-time as teammates type
- **Instant User Management**: Join/leave notifications with user avatars
- **Room-based Sessions**: Create or join coding rooms with unique IDs

### 💻 **Code Editor & Compilation**
- **Advanced Code Editor**: Powered by CodeMirror with syntax highlighting
- **Multi-language Support**: C, C++, Java, Python, and JavaScript
- **Real-time Compilation**: Execute code using Judge0 API integration
- **Input/Output Handling**: Interactive input/output for program testing
- **Live Output Sync**: Compilation results shared across all users

### 🎙️ **Voice Communication**
- **Built-in Voice Chat**: WebRTC-powered audio communication
- **Push-to-Talk**: Toggle microphone on/off for focused discussions
- **Real-time Audio Streaming**: Low-latency voice transmission using Socket.IO

### 🤖 **AI-Powered Assistant**
- **Integrated Chatbot**: Google Gemini AI for instant coding help
- **Context-Aware**: AI understands your code and provides relevant assistance
- **Markdown Support**: Rich text formatting in chat responses
- **Persistent Chat History**: Conversation maintains context throughout session

### 🎨 **User Experience**
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Dark Theme**: Developer-friendly dark mode interface
- **User Avatars**: Unique avatar generation using DiceBear
- **Toast Notifications**: Real-time feedback for user actions
- **Mobile Responsive**: Works seamlessly across devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **CodeMirror** - Advanced code editor
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation and routing
- **React Hot Toast** - Notification system

### Backend
- **Node.js & Express** - Server framework
- **Socket.IO** - WebSocket communication
- **Judge0 API** - Code compilation service
- **Google Gemini AI** - Chatbot integration
- **CORS** - Cross-origin resource sharing

### APIs & Services
- **Judge0 CE** - Multi-language code execution
- **Google Generative AI** - AI chatbot responses
- **WebRTC** - Peer-to-peer voice communication

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

## 🎯 How to Use

### Starting a Coding Session

1. **Create a Room**: Generate a unique room ID for your session
2. **Share Room ID**: Invite teammates using the room ID
3. **Start Coding**: Write code collaboratively in real-time
4. **Compile & Test**: Execute code with custom inputs
5. **Communicate**: Use voice chat or AI assistant for help

### Supported Languages

| Language | Language ID | File Extensions |
|----------|-------------|-----------------|
| C        | 50          | `.c`           |
| C++      | 54          | `.cpp, .cc`    |
| Java     | 91          | `.java`        |
| Python   | 100         | `.py`          |
| JavaScript | 93        | `.js`          |

### Voice Chat Controls
- **🎤 Microphone Toggle**: Click to start/stop recording
- **Recording Indicator**: Visual feedback when voice is active
- **Real-time Streaming**: Audio automatically shared with room participants

### AI Chatbot Commands
- Ask coding questions in natural language
- Request code explanations and debugging help
- Get syntax help and best practices
- Markdown-formatted responses for better readability
  
## 🚀 Deployment

The application is deployed on Render with automatic builds from the main branch.

**Live URL**: [https://codelive-o86i.onrender.com](https://codelive-o86i.onrender.com)


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👨‍💻 Author

**Omkar Ghodekar**
- GitHub: [@omkarghodekar18](https://github.com/omkarghodekar18)
- LinkedIn: [Connect with Omkar](https://www.linkedin.com/in/omkarghodekar18)

## 🙏 Acknowledgments

- [Judge0 CE](https://judge0.com/) for code compilation services
- [Google Gemini AI](https://ai.google.dev/) for chatbot capabilities
- [Socket.IO](https://socket.io/) for real-time communication
- [CodeMirror](https://codemirror.net/) for the code editor
- [DiceBear](https://dicebear.com/) for avatar generation

---

⭐ **Star this repository if you found it helpful!**
