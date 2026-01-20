"""
Karthik Samak - AI Voice Bot
A professional voice-enabled AI assistant representing Karthik Samak's technical profile.

This Flask application provides an interactive voice interface powered by Groq's
Llama 3.3 70B model, with prepared answers for common interview questions and
strict persona boundaries.

Author: Karthik Samak
"""

import os
from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(override=True)

app = Flask(__name__)

# Initialize Groq API client
api_key = os.environ.get("GROQ_API_KEY", "").strip()
print(f"Groq API Key loaded: {api_key[:10]}...{api_key[-5:]}")

client = Groq(api_key=api_key)


def get_karthik_profile():
    """
    Load Karthik's complete professional profile from PROFILE.md.
    
    Returns:
        str: Full profile content or fallback description
    """
    try:
        profile_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '../PROFILE.md')
        )
        with open(profile_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return "Karthik Samak - AI and Full Stack Developer"


# Prepared answers for specific interview questions
# These provide instant, optimized responses for key questions
PREPARED_ANSWERS = {
    "life_story": (
        "I'm Karthik Samak, a 6th semester Computer Science student at "
        "Jyothy Institute of Technology with a passion for Generative AI. "
        "I've built production-grade projects like a medical chatbot using "
        "RAG architecture, earned Oracle's GenAI Professional certification, "
        "and completed internships in full-stack development and Android AI integration."
    ),
    
    "superpower": (
        "My superpower is translating complex AI concepts into working applications. "
        "I don't just understand theory—I build end-to-end systems like my medical "
        "chatbot with LangChain, Pinecone, and Groq, or my GitSkill Insights engine "
        "that analyzes developer competency from GitHub data."
    ),
    
    "growth_areas": (
        "I want to grow in three areas: first, distributed systems architecture for "
        "scaling AI applications; second, advanced prompt engineering and fine-tuning "
        "techniques; and third, leadership skills to guide technical teams through "
        "complex AI projects."
    ),
    
    "misconception": (
        "People often think I'm purely theoretical because I talk about AI research, "
        "but I'm actually extremely hands-on. Every concept I discuss, I've implemented—"
        "from RAG pipelines to real-time logistics dashboards with live APIs."
    ),
    
    "push_boundaries": (
        "I push my limits by taking on projects outside my comfort zone. When I didn't "
        "know vector databases, I built a medical chatbot anyway. When I wanted to "
        "understand algorithms deeply, I created a password cracking visualizer. "
        "I learn by building, not just reading."
    )
}

# System prompt defining the AI's persona and behavior
SYSTEM_PROMPT = f"""You are Karthik Samak. You ONLY talk about yourself based on this profile:

{get_karthik_profile()}

CRITICAL RULES:
1. ONLY answer questions about Karthik Samak's life, projects, skills, and experiences
2. If asked about anything else (weather, general knowledge, other people), politely redirect: 
   "I'm here to talk about my work and experience. What would you like to know about my projects?"
3. Use FIRST PERSON always ("I", "my", "me")
4. Keep responses SHORT (1-2 sentences max) unless asked for details
5. Be CONFIDENT and PROFESSIONAL
6. For these specific questions, use these prepared answers:
   - "life story" or "tell me about yourself" → {PREPARED_ANSWERS['life_story']}
   - "superpower" or "greatest strength" → {PREPARED_ANSWERS['superpower']}
   - "growth areas" or "areas to improve" → {PREPARED_ANSWERS['growth_areas']}
   - "misconception" or "what people get wrong" → {PREPARED_ANSWERS['misconception']}
   - "push boundaries" or "challenge yourself" → {PREPARED_ANSWERS['push_boundaries']}

NEVER discuss: politics, religion, other people's work, general trivia, or anything 
unrelated to Karthik's professional profile."""


@app.route('/')
def home():
    """Render the main application page."""
    return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    """
    Handle chat requests from the frontend.
    
    Processes user input, checks for prepared answers first, then falls back
    to AI-generated responses if needed.
    
    Returns:
        JSON: Response object with 'response' field containing the bot's reply
    """
    user_input = request.json.get('message', '').strip()
    
    if not user_input:
        return jsonify({"response": "I didn't catch that."})
    
    print(f"User: {user_input}")
    
    # Check for specific prepared questions (keyword matching)
    user_lower = user_input.lower()
    
    if any(phrase in user_lower for phrase in ["life story", "tell me about yourself", "who are you"]):
        response_text = PREPARED_ANSWERS['life_story']
    elif any(phrase in user_lower for phrase in ["superpower", "greatest strength", "best skill"]):
        response_text = PREPARED_ANSWERS['superpower']
    elif any(phrase in user_lower for phrase in ["growth", "improve", "develop", "learn"]):
        response_text = PREPARED_ANSWERS['growth_areas']
    elif any(phrase in user_lower for phrase in ["misconception", "wrong about you", "misunderstand"]):
        response_text = PREPARED_ANSWERS['misconception']
    elif any(phrase in user_lower for phrase in ["push boundaries", "challenge", "limits", "comfort zone"]):
        response_text = PREPARED_ANSWERS['push_boundaries']
    else:
        # Use AI for other questions
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.7,
                max_tokens=120,
                top_p=1,
            )
            response_text = completion.choices[0].message.content
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"response": "Could you repeat that?"})
    
    print(f"Bot: {response_text}")
    return jsonify({"response": response_text})


if __name__ == '__main__':
    print("Starting Karthik's Voice Bot on http://127.0.0.1:5000")
    app.run(debug=True, port=5000, use_reloader=False)
