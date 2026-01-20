# Karthik Samak - AI Voice Bot

A professional voice-enabled AI assistant that represents Karthik Samak's technical profile and expertise. Built with Flask, Groq AI, and Web Speech API.

## Overview

This application provides an interactive voice interface for learning about Karthik Samak's professional background, projects, certifications, and technical skills. The bot uses natural language processing to answer questions and maintains a strict first-person persona.

## Features

### Core Functionality
- Voice-based interaction using Web Speech API
- AI-powered responses via Groq's Llama 3.3 70B model
- Continuous listening mode with automatic turn-taking
- Indian English male voice synthesis (Microsoft Ravi)
- Audio feedback for microphone activation/deactivation

### Technical Highlights
- Prepared answers for common interview questions
- Strict persona boundaries (only discusses Karthik's profile)
- Real-time speech recognition with interim results
- Premium glassmorphism UI with animated gradients
- Responsive design for all screen sizes
- Zero-build deployment

## Installation

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome or Edge recommended)
- **Note:** Groq API key is already included in the `.env` file for immediate use

### Setup Instructions

**Quick Start (Ready to Run):**

This project is configured for immediate use. The API key is already included.

1. Navigate to the project directory:
```bash
cd "c:\100x gen-ai\voice-bot"
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
   - The `.env` file contains your Groq API key
   - To update: edit `.env` and set `GROQ_API_KEY=your_key_here`

4. Start the application:
```bash
python app.py
```

5. Access the interface:
   - Open your browser to `http://127.0.0.1:5000`
   - Click the microphone button to begin
   - Allow microphone permissions when prompted

## Usage

### Starting a Conversation
1. Click the microphone button (it will glow cyan)
2. Speak your question clearly
3. Wait for the AI response (avatar glows purple during speech)
4. The microphone automatically reactivates for continuous conversation
5. Click the microphone again to pause

### Example Questions
- "Tell me about yourself"
- "What is your superpower?"
- "What projects have you worked on?"
- "Tell me about your medical chatbot"
- "What certifications do you have?"
- "How do you push your boundaries?"

### Prepared Interview Responses

The bot has optimized answers for these specific questions:

1. **Life Story**: Overview of education, certifications, and key projects
2. **Superpower**: Ability to translate AI concepts into working applications
3. **Growth Areas**: Distributed systems, prompt engineering, leadership
4. **Misconceptions**: Hands-on implementation vs theoretical knowledge
5. **Pushing Boundaries**: Learning through building challenging projects

## Technical Architecture

### Backend (Flask)
- **Framework**: Flask with Python 3.8+
- **AI Model**: Groq Llama 3.3 70B Versatile
- **Response Time**: <1s for prepared answers, 1-2s for AI-generated
- **Error Handling**: Graceful fallbacks with user-friendly messages

### Frontend
- **Speech Recognition**: Web Speech API (continuous mode)
- **Voice Synthesis**: Browser-native TTS with Indian English male voice
- **Audio Feedback**: Web Audio API for microphone state sounds
- **Styling**: Vanilla CSS3 with animations and glassmorphism
- **JavaScript**: ES6+ with no external frameworks

### Voice Configuration
- **Primary Voice**: Microsoft Ravi (Indian English Male)
- **Pitch**: 0.8 (deeper, masculine tone)
- **Rate**: 0.95 (confident, clear pacing)
- **Fallback**: Automatic selection of best available male voice

## Project Structure

```
voice-bot/
├── app.py                    # Flask backend with AI integration
├── .env                      # Environment variables (API keys)
├── .gitignore               # Git ignore rules
├── requirements.txt         # Python dependencies
├── README.md                # This file
├── templates/
│   └── index.html          # Main application template
└── static/
    ├── style.css           # UI styling and animations
    ├── script.js           # Voice interaction logic
    └── avatar.png          # Avatar image
```

## Configuration

### Changing the AI Model
Edit `app.py`, line 76:
```python
model="llama-3.3-70b-versatile",  # Replace with desired Groq model
```

### Adjusting Voice Parameters
Edit `static/script.js`, lines 133-134:
```javascript
utterThis.pitch = 0.8;  // Range: 0.5 to 2.0
utterThis.rate = 0.95;  // Range: 0.1 to 10
```

### Modifying Response Length
Edit `app.py`, line 78:
```python
max_tokens=120,  # Increase for longer responses
```

## Troubleshooting

### Microphone Access Denied
- Check browser permissions (click lock icon in address bar)
- Ensure you're using HTTPS or localhost
- Try a different browser (Chrome/Edge recommended)

### No Voice Output
- Verify system volume is not muted
- Check speaker/headphone connections
- Confirm browser supports Web Speech API
- Try refreshing the page

### Bot Not Responding
- Check terminal for error messages
- Verify Groq API key is valid and has credits
- Ensure internet connection is stable
- Refresh the browser page

### Voice Quality Issues
- Indian English voice may not be available on all systems
- The bot will automatically fall back to the best available male voice
- Check browser console for voice selection logs

## Security Considerations

- API keys are stored in `.env` (excluded from version control)
- All communication occurs over localhost
- No user data is logged or stored permanently
- Environment variables are loaded securely via python-dotenv

## Browser Compatibility

- **Recommended**: Google Chrome 90+, Microsoft Edge 90+
- **Speech Recognition**: Requires Chromium-based browser
- **Voice Synthesis**: Works in all modern browsers
- **Audio API**: Supported in all major browsers

## Performance

- **Initial Load**: <1 second
- **Voice Recognition**: Real-time with <100ms latency
- **AI Response**: 1-2 seconds average
- **Memory Usage**: <50MB typical
- **Animation**: 60fps smooth rendering

## Development

### Running in Debug Mode
The application runs in debug mode by default:
```python
app.run(debug=True, port=5000, use_reloader=False)
```

### Adding New Prepared Answers
Edit `app.py` and add to the `PREPARED_ANSWERS` dictionary:
```python
PREPARED_ANSWERS = {
    "new_question": "Your prepared answer here",
    # ...
}
```

Then add keyword detection in the `/chat` route.

## License

Personal project. All rights reserved.

## About Karthik Samak

6th semester Computer Science student at Jyothy Institute of Technology, Bengaluru. Specializes in Generative AI and Full Stack Development.

**Key Projects**:
- End-to-End Medical Chatbot (RAG Architecture)
- GitSkill Insights Engine (GitHub Analytics)
- Indian Logistics Intelligence Platform
- Password Cracking Simulator

**Certifications**:
- Oracle Cloud Infrastructure 2025 Certified Generative AI Professional
- Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate
- NPTEL Programming in Java (IIT Kharagpur)
- IIT Madras AI: Search Methods for Problem Solving

## Support

For issues or questions, refer to the troubleshooting section above or check the browser console for detailed error messages.

---

Built with Flask, Groq AI, and Web Speech API
