import openai
import pyttsx3
import speech_recognition as sr
from flask import Flask, render_template, request
from threading import Thread

# Initialize Flask app
app = Flask(__name__)

# OpenAI API key (replace with your actual OpenAI API key)
openai.api_key = 'your-openai-api-key'

# Initialize text-to-speech engine
engine = pyttsx3.init()

# Speech recognition function
def listen_for_commands():
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()

    with microphone as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Listening for command... Say 'Trobits' to start.")
        audio = recognizer.listen(source)

    try:
        command = recognizer.recognize_google(audio).lower()
        print(f"Heard: {command}")

        if 'trobits' in command:
            speak("How can I help you?")
            audio = recognizer.listen(source)
            command = recognizer.recognize_google(audio).lower()
            print(f"User command: {command}")
            speak(get_gpt_response(command))

    except sr.UnknownValueError:
        print("Sorry, I couldn't understand that.")
    except sr.RequestError as e:
        print(f"Could not request results; {e}")

# GPT-3 response function
import openai


def get_gpt_response(query):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # or "gpt-4"
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": query}
        ]
    )
    return response['choices'][0]['message']['content']

# Text-to-speech function
def speak(text):
    engine.say(text)
    engine.runAndWait()

# Web interface route
@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        query = request.form["query"]
        response = get_gpt_response(query)
        return render_template("index.html", response=response)
    return render_template("index.html", response="")

# Start voice assistant in a separate thread
def start_voice_assistant():
    while True:
        listen_for_commands()


if __name__ == "__main__":
    # Start voice assistant thread
    voice_thread = Thread(target=start_voice_assistant)
    voice_thread.daemon = True
    voice_thread.start()

    # Run the Flask app
    app.run(debug=True, use_reloader=False)
