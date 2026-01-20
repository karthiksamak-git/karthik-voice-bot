/**
 * Karthik Samak - AI Voice Bot
 * Frontend Voice Interaction Logic
 * 
 * Handles speech recognition, synthesis, and UI state management for the
 * voice-enabled AI assistant. Prioritizes Indian English male voice (Microsoft Ravi)
 * and provides audio feedback for user interactions.
 * 
 * Features:
 * - Continuous speech recognition with auto-restart
 * - Indian English male voice synthesis
 * - Audio feedback for microphone state changes
 * - Real-time UI updates and status indicators
 * - Graceful error handling and fallbacks
 */

// DOM element references
const micBtn = document.getElementById('mic-btn');
const statusBadge = document.getElementById('status-badge');
const statusText = document.getElementById('status-text');
const avatarSection = document.querySelector('.avatar-section');
const transcriptText = document.getElementById('user-transcript');

// ---------------------------------------------------------
// 0. SOUND EFFECTS - Mic On/Off Feedback
// ---------------------------------------------------------
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'on') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds for on/off
    if (type === 'on') {
        // Rising tone for activation
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioContext.currentTime + duration);
    } else {
        // Falling tone for deactivation
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.7, audioContext.currentTime + duration);
    }

    oscillator.type = 'sine';

    // Smooth envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playMicOnSound() {
    playSound(800, 0.15, 'on');  // Pleasant rising beep
}

function playMicOffSound() {
    playSound(600, 0.15, 'off');  // Gentle falling beep
}

// ---------------------------------------------------------
// 1. SPEECH SYNTHESIS (TTS) - The Voice of Karthik
// ---------------------------------------------------------
const synth = window.speechSynthesis;
let karthikVoice = null;

function loadVoices() {
    const voices = synth.getVoices();
    if (voices.length === 0) return;

    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));

    // PRIORITIZE INDIAN ENGLISH **MALE** VOICES
    // Explicitly exclude female voices like Heera, Zira, etc.
    const femaleVoiceNames = ["heera", "zira", "susan", "hazel", "female"];

    // First priority: Indian English MALE voices
    const indianMaleVoices = [
        "Microsoft Ravi",           // Windows Indian Male (PRIMARY CHOICE)
        "Ravi",
        "Indian Male"
    ];

    // Second priority: Other English male voices
    const otherMaleVoices = [
        "Microsoft David",
        "Google UK English Male",
        "Google US English Male",
        "Alex",
        "Daniel",
        "Thomas",
        "James"
    ];

    // Helper function to check if voice is NOT female
    function isNotFemale(voice) {
        const nameLower = voice.name.toLowerCase();
        return !femaleVoiceNames.some(female => nameLower.includes(female));
    }

    // STEP 1: Try to find Indian English MALE voice
    for (const indianVoice of indianMaleVoices) {
        const found = voices.find(v =>
            v.name.includes(indianVoice) &&
            (v.lang.includes("en-IN") || v.lang.includes("IN")) &&
            isNotFemale(v)
        );
        if (found) {
            karthikVoice = found;
            console.log("✓ SELECTED INDIAN MALE VOICE:", karthikVoice.name);
            return;
        }
    }

    // STEP 2: Try any en-IN voice that's male
    const anyIndianMale = voices.find(v =>
        v.lang === "en-IN" &&
        isNotFemale(v) &&
        (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("ravi"))
    );
    if (anyIndianMale) {
        karthikVoice = anyIndianMale;
        console.log("✓ SELECTED INDIAN MALE VOICE:", karthikVoice.name);
        return;
    }

    // STEP 3: Fallback to other English male voices
    for (const maleName of otherMaleVoices) {
        const found = voices.find(v =>
            v.name.includes(maleName) &&
            v.lang.startsWith("en") &&
            isNotFemale(v)
        );
        if (found) {
            karthikVoice = found;
            console.log("✓ SELECTED MALE VOICE (fallback):", karthikVoice.name);
            return;
        }
    }

    // STEP 4: Last resort - any male English voice
    karthikVoice = voices.find(v =>
        v.name.toLowerCase().includes("male") &&
        v.lang.startsWith("en") &&
        isNotFemale(v)
    ) || voices.find(v => v.lang === "en-US") || voices[0];

    console.log("✓ SELECTED VOICE:", karthikVoice ? karthikVoice.name : "System Default");
}

// Robust Voice Loading
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}

// Polling fallback
const voiceLoader = setInterval(() => {
    if (synth.getVoices().length > 0) {
        loadVoices();
        clearInterval(voiceLoader);
    }
}, 100);

function speak(text) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }

    // Stop listening while speaking to prevent bot hearing itself
    stopListening();
    setStatus('speaking');

    const utterThis = new SpeechSynthesisUtterance(text);
    if (karthikVoice) {
        utterThis.voice = karthikVoice;
    }

    // Masculine voice settings
    utterThis.pitch = 0.8;  // Deeper pitch (0.8 = more masculine)
    utterThis.rate = 0.95;  // Slightly slower for confidence and clarity

    utterThis.onend = function (event) {
        setStatus('idle');
        // Resume listening immediately after speaking
        startListening();
    };

    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
        setStatus('idle');
        startListening();
    };

    synth.speak(utterThis);
}

// ---------------------------------------------------------
// 2. SPEECH RECOGNITION (STT) - Always On Ear
// ---------------------------------------------------------
// ---------------------------------------------------------
// 2. SPEECH RECOGNITION (STT) - Robust & Always On
// ---------------------------------------------------------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;
let userStopped = true; // Start strictly stopped

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // We want distinct turns
    recognition.lang = 'en-US';
    recognition.interimResults = true; // CRITICAL: Show user we hear them
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
        console.log("Recognition started");
        isListening = true;
        if (!synth.speaking) {
            setStatus('listening');
        }
    };

    recognition.onresult = function (event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (interimTranscript) {
            transcriptText.textContent = `... ${interimTranscript}`;
            transcriptText.classList.add('interim');
        }

        if (finalTranscript) {
            transcriptText.classList.remove('interim');
            transcriptText.textContent = `"${finalTranscript}"`;
            console.log("Final Hearing:", finalTranscript);
            // Send to AI
            processUserWithAI(finalTranscript);
        }
    };

    recognition.onerror = function (event) {
        console.error('Recognition error:', event.error);
        if (event.error === 'no-speech') {
            // Very common, just ignore and let it restart
        } else if (event.error === 'not-allowed') {
            transcriptText.textContent = "Mic Access Denied. Check Permissions.";
            userStopped = true;
            updateMicButton(false);
            setStatus('idle');
        } else if (event.error === 'network') {
            transcriptText.textContent = "Network Fluctuation.. Retrying..";
            // Do NOT stop userStopped, just let auto-restart handle it after logging
        } else {
            transcriptText.textContent = `Error: ${event.error}`;
        }
    };

    recognition.onend = function () {
        console.log("Recognition ended");
        isListening = false;

        // Auto-restart logic
        if (!synth.speaking && !userStopped) {
            setTimeout(() => {
                try {
                    transcriptText.textContent = "Listening...";
                    recognition.start();
                } catch (e) { console.log("Restart race condition ignored"); }
            }, 1000); // Increased delay for retry stability
        } else if (synth.speaking) {
            setStatus('speaking');
        } else {
            setStatus('idle');
            updateMicButton(false);
        }
    };
} else {
    transcriptText.textContent = "Browser Not Supported. Use Chrome/Edge.";
}

function startListening() {
    if (userStopped) userStopped = false; // Unflag manual stop
    if (isListening || synth.speaking) return;

    try {
        recognition.start();
        updateMicButton(true);
        transcriptText.textContent = "Listening...";
    } catch (e) {
        console.error("Start error:", e);
    }
}

function stopListening() {
    if (isListening) {
        recognition.stop();
    }
}

// ---------------------------------------------------------
// 3. AI INTEGRATION
// ---------------------------------------------------------
async function processUserWithAI(userText) {
    if (!userText.trim()) return;

    // Temporary stop listening to prevent loop
    setStatus('thinking');

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText }),
        });

        const data = await response.json();
        const botReply = data.response;

        speak(botReply);

    } catch (error) {
        console.error('AI Error:', error);
        transcriptText.textContent = "Connection Error.";
        speak("I seem to be offline for a moment.");
    }
}

// ---------------------------------------------------------
// 4. UI HANDLERS
// ---------------------------------------------------------
function setStatus(state) {
    avatarSection.classList.remove('listening', 'speaking', 'thinking');
    statusBadge.classList.remove('listening', 'speaking');

    if (state === 'listening') {
        statusText.textContent = "Listening";
        statusBadge.classList.add('listening');
        avatarSection.classList.add('listening');
    } else if (state === 'speaking') {
        statusText.textContent = "Speaking";
        statusBadge.classList.add('speaking');
        avatarSection.classList.add('speaking');
        transcriptText.textContent = "...";
    } else if (state === 'thinking') {
        statusText.textContent = "Thinking...";
        avatarSection.classList.add('thinking');
    } else {
        statusText.textContent = "Idle (Click Mic)";
    }
}

function updateMicButton(isActive) {
    if (isActive) {
        micBtn.classList.add('active_state');
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
        micBtn.classList.remove('active_state');
        micBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    }
}

micBtn.addEventListener('click', () => {
    if (userStopped) {
        // Turning ON
        playMicOnSound();  // Sound effect
        userStopped = false;
        // visual feedback
        transcriptText.textContent = "Initializing...";
        startListening();
    } else {
        // Turning OFF manually
        playMicOffSound();  // Sound effect
        userStopped = true;
        stopListening();
        synth.cancel();
        updateMicButton(false);
        setStatus('idle');
    }
});

// Initial State
transcriptText.textContent = "Tap Microphone to Begin";
userStopped = true;
updateMicButton(false);
