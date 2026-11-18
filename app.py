from flask import Flask, request, jsonify
from flask_cors import CORS

from faster_whisper import WhisperModel

from nlp import analyze_answer

import os
import re


# ==========================================
# FLASK SETUP
# ==========================================

app = Flask(__name__)

CORS(app)


# ==========================================
# UPLOAD FOLDER
# ==========================================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==========================================
# WHISPER MODEL
# ==========================================

print("Loading Whisper model...")

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

print("Whisper model loaded!")


# ==========================================
# INTERVIEW QUESTIONS + EXPECTED ANSWERS
# ==========================================

INTERVIEW_DATA = [

    {
        "question":
            "Tell me about yourself.",

        "expected_answer":
            """
            The candidate should introduce themselves,
            mention their education, technical skills,
            experience, projects and career interests.
            """
    },

    {
        "question":
            "Why do you want this job?",

        "expected_answer":
            """
            The candidate should explain their interest
            in the job, relevant skills, career goals,
            motivation and how they can contribute
            to the organization.
            """
    },

    {
        "question":
            "What are your strengths and weaknesses?",

        "expected_answer":
            """
            The candidate should describe relevant strengths
            such as communication, problem solving,
            teamwork or technical skills and mention
            a genuine weakness along with improvement efforts.
            """
    },

    {
        "question":
            "Tell me about a challenging project you worked on.",

        "expected_answer":
            """
            The candidate should explain the project,
            their role, the technical challenge,
            the solution they implemented and the outcome.
            """
    },

    {
        "question":
            "Where do you see yourself in five years?",

        "expected_answer":
            """
            The candidate should discuss their career goals,
            professional growth, skill development,
            leadership aspirations and contribution
            to the organization.
            """
    }

]


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/")
def home():

    return "AI Interview Backend is running!"


# ==========================================
# ANALYZE AUDIO
# ==========================================

@app.route(
    "/analyze",
    methods=["POST"]
)
def analyze():

    try:

        # --------------------------------------
        # CHECK AUDIO
        # --------------------------------------

        if "audio" not in request.files:

            return jsonify({
                "error":
                    "No audio file received."
            }), 400


        audio_file = request.files["audio"]


        # --------------------------------------
        # GET QUESTION NUMBER
        # --------------------------------------

        question_index = request.form.get(
            "question_index",
            0
        )

        try:

            question_index = int(
                question_index
            )

        except:

            question_index = 0


        # Keep index safe
        if question_index < 0:

            question_index = 0

        if question_index >= len(INTERVIEW_DATA):

            question_index = 0


        # --------------------------------------
        # GET CURRENT QUESTION
        # --------------------------------------

        current_question = \
            INTERVIEW_DATA[question_index]


        expected_answer = \
            current_question["expected_answer"]


        # --------------------------------------
        # SAVE AUDIO
        # --------------------------------------

        audio_path = os.path.join(
            UPLOAD_FOLDER,
            "candidate_answer.webm"
        )

        audio_file.save(
            audio_path
        )


        print(
            "Audio received:",
            audio_path
        )


        # --------------------------------------
        # WHISPER
        # --------------------------------------

        segments, info = model.transcribe(
            audio_path,
            beam_size=5
        )


        segments = list(
            segments
        )


        # --------------------------------------
        # TRANSCRIPT
        # --------------------------------------

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
        ).strip()


        # --------------------------------------
        # SPEECH DURATION
        # --------------------------------------

        if segments:

            duration = segments[-1].end

        else:

            duration = 0


        # --------------------------------------
        # WORD COUNT
        # --------------------------------------

        words = re.findall(
            r"\b[\w']+\b",
            transcript
        )

        word_count = len(
            words
        )


        # --------------------------------------
        # SPEAKING SPEED
        # --------------------------------------

        if duration > 0:

            speaking_speed = round(
                (
                    word_count
                    /
                    duration
                ) * 60,
                2
            )

        else:

            speaking_speed = 0


        # --------------------------------------
        # FILLER WORDS
        # --------------------------------------

        filler_words_list = [

            "um",
            "uh",
            "like",
            "you know",
            "actually",
            "basically",
            "sort of",
            "kind of"

        ]


        lower_text = transcript.lower()


        filler_count = 0


        for filler in filler_words_list:

            filler_count += \
                lower_text.count(
                    filler
                )


        # --------------------------------------
        # NLP ANALYSIS
        # --------------------------------------

        nlp_result = analyze_answer(
            transcript,
            expected_answer
        )


        # --------------------------------------
        # FINAL RESULT
        # --------------------------------------

        result = {

            "question":
                current_question["question"],

            "transcript":
                transcript,

            "speech_analysis": {

                "duration":
                    round(
                        duration,
                        2
                    ),

                "word_count":
                    word_count,

                "speaking_speed":
                    speaking_speed,

                "filler_words":
                    filler_count

            },

            "nlp_analysis":
                nlp_result

        }


        # --------------------------------------
        # TERMINAL OUTPUT
        # --------------------------------------

        print()
        print(
            "=============================="
        )

        print(
            "QUESTION:",
            current_question["question"]
        )

        print(
            "TRANSCRIPT:",
            transcript
        )

        print(
            "DURATION:",
            duration
        )

        print(
            "WORD COUNT:",
            word_count
        )

        print(
            "SPEAKING SPEED:",
            speaking_speed
        )

        print(
            "FILLER WORDS:",
            filler_count
        )

        print(
            "NLP SCORE:",
            nlp_result["nlp_score"]
        )

        print(
            "SEMANTIC SIMILARITY:",
            nlp_result[
                "semantic_similarity"
            ]
        )

        print(
            "KEYWORD MATCH:",
            nlp_result[
                "keyword_match"
            ]
        )

        print(
            "ANSWER QUALITY:",
            nlp_result[
                "answer_quality"
            ]
        )

        print(
            "=============================="
        )

        print()


        return jsonify(
            result
        )


    except Exception as e:

        print(
            "ERROR:",
            str(e)
        )

        return jsonify({

            "error":
                str(e)

        }), 500


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )