// ==========================================
// AI POWERED INTERVIEW - SCRIPT.JS
// ==========================================


// ==========================================
// QUESTIONS
// ==========================================

const questions = [

    "Tell me about yourself.",

    "Why do you want this job.",

    "What are your strengths and weaknesses.",

    "Tell me about a challenging project you worked on.",

    "Where do you see yourself in five years."

];


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentQuestion = 0;

let mediaRecorder = null;

let audioChunks = [];

let isRecording = false;

let currentStream = null;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "AI Interviewer JS Loaded"
        );


        // ==================================
        // START INTERVIEW BUTTON
        // ==================================

        const startButton =
            document.getElementById(
                "startInterviewButton"
            );


        if (startButton) {

            console.log(
                "Start button found"
            );


            startButton.addEventListener(
                "click",
                startInterview
            );

        }


        // ==================================
        // INTERVIEW PAGE
        // ==================================

        const questionBox =
            document.getElementById(
                "questionBox"
            );


        if (questionBox) {

            loadInterviewPage();

        }

    }
);


// ==========================================
// START INTERVIEW
// ==========================================

function startInterview() {

    console.log(
        "START INTERVIEW CLICKED"
    );


    const nameInput =
        document.getElementById(
            "candidateName"
        );


    const roleInput =
        document.getElementById(
            "jobRole"
        );


    if (!nameInput) {

        console.error(
            "candidateName input not found"
        );

        return;
    }


    if (!roleInput) {

        console.error(
            "jobRole select not found"
        );

        return;
    }


    const candidateName =
        nameInput.value.trim();


    const jobRole =
        roleInput.value;


    // ==================================
    // VALIDATION
    // ==================================

    if (candidateName === "") {

        alert(
            "Please enter your name."
        );

        nameInput.focus();

        return;
    }


    if (jobRole === "") {

        alert(
            "Please select a job role."
        );

        roleInput.focus();

        return;
    }


    // ==================================
    // SAVE USER DATA
    // ==================================

    localStorage.setItem(
        "candidateName",
        candidateName
    );


    localStorage.setItem(
        "jobRole",
        jobRole
    );


    // ==================================
    // RESET INTERVIEW
    // ==================================

    currentQuestion = 0;


    localStorage.removeItem(
        "lastTranscript"
    );

    localStorage.removeItem(
        "lastDuration"
    );

    localStorage.removeItem(
        "wordCount"
    );

    localStorage.removeItem(
        "speakingSpeed"
    );

    localStorage.removeItem(
        "fillerWords"
    );

    localStorage.removeItem(
        "nlpScore"
    );

    localStorage.removeItem(
        "semanticSimilarity"
    );

    localStorage.removeItem(
        "keywordMatch"
    );

    localStorage.removeItem(
        "answerQuality"
    );

    localStorage.removeItem(
        "keywords"
    );

    localStorage.removeItem(
        "lastQuestion"
    );


    // ==================================
    // GO TO INTERVIEW
    // ==================================

    console.log(
        "Opening interview.html..."
    );


    window.location.href =
        "interview.html";

}


// ==========================================
// LOAD INTERVIEW PAGE
// ==========================================

function loadInterviewPage() {

    console.log(
        "Loading interview page..."
    );


    const candidateName =
        localStorage.getItem(
            "candidateName"
        ) || "Candidate";


    const jobRole =
        localStorage.getItem(
            "jobRole"
        ) || "Selected Role";


    // ==================================
    // WELCOME MESSAGE
    // ==================================

    const welcomeMessage =
        document.getElementById(
            "welcomeMessage"
        );


    if (welcomeMessage) {

        welcomeMessage.textContent =
            `Hello ${candidateName}! Interview for ${jobRole}`;

    }


    // ==================================
    // QUESTION
    // ==================================

    const questionBox =
        document.getElementById(
            "questionBox"
        );


    if (questionBox) {

        questionBox.textContent =
            questions[currentQuestion];

    }


    // ==================================
    // QUESTION NUMBER
    // ==================================

    updateQuestionNumber();


    // ==================================
    // RECORD BUTTON
    // ==================================

    const recordButton =
        document.getElementById(
            "recordButton"
        );


    if (recordButton) {

        recordButton.addEventListener(
            "click",
            startRecording
        );

    }


    // ==================================
    // NEXT BUTTON
    // ==================================

    const nextButton =
        document.getElementById(
            "nextButton"
        );


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextQuestion
        );

        nextButton.disabled = false;

    }

}


// ==========================================
// UPDATE QUESTION NUMBER
// ==========================================

function updateQuestionNumber() {

    const questionNumber =
        document.querySelector(
            ".question-number"
        );


    if (questionNumber) {

        questionNumber.textContent =
            `Question ${currentQuestion + 1} of ${questions.length}`;

    }

}


// ==========================================
// RECORDING
// ==========================================

async function startRecording() {

    const recordButton =
        document.getElementById(
            "recordButton"
        );


    const recordingStatus =
        document.getElementById(
            "recordingStatus"
        );


    // ==================================
    // START
    // ==================================

    if (!isRecording) {

        try {

            currentStream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        audio: true
                    }
                );


            audioChunks = [];


            mediaRecorder =
                new MediaRecorder(
                    currentStream
                );


            mediaRecorder.ondataavailable =
                function (event) {

                    if (
                        event.data &&
                        event.data.size > 0
                    ) {

                        audioChunks.push(
                            event.data
                        );

                    }

                };


            mediaRecorder.onstop =
                async function () {

                    console.log(
                        "Recording stopped."
                    );


                    const audioBlob =
                        new Blob(
                            audioChunks,
                            {
                                type: "audio/webm"
                            }
                        );


                    if (recordingStatus) {

                        recordingStatus.textContent =
                            "⏳ AI is analyzing your answer...";

                    }


                    if (currentStream) {

                        currentStream
                            .getTracks()
                            .forEach(
                                function (track) {

                                    track.stop();

                                }
                            );

                        currentStream = null;

                    }


                    // ==================================
                    // SEND AUDIO TO FLASK
                    // ==================================

                    const formData =
                        new FormData();


                    formData.append(
                        "audio",
                        audioBlob,
                        "candidate_answer.webm"
                    );


                    formData.append(
                        "question_index",
                        currentQuestion
                    );


                    try {

                        const response =
                            await fetch(
                                "http://127.0.0.1:5000/analyze",
                                {
                                    method: "POST",
                                    body: formData
                                }
                            );


                        const result =
                            await response.json();


                        console.log(
                            "BACKEND RESULT:",
                            result
                        );


                        if (
                            !response.ok ||
                            result.error
                        ) {

                            throw new Error(
                                result.error ||
                                "Analysis failed."
                            );

                        }


                        // ==================================
                        // SAVE TRANSCRIPT
                        // ==================================

                        localStorage.setItem(
                            "lastTranscript",
                            result.transcript || ""
                        );


                        // ==================================
                        // SPEECH
                        // ==================================

                        const speech =
                            result.speech_analysis ||
                            {};


                        localStorage.setItem(
                            "lastDuration",
                            speech.duration || 0
                        );


                        localStorage.setItem(
                            "wordCount",
                            speech.word_count || 0
                        );


                        localStorage.setItem(
                            "speakingSpeed",
                            speech.speaking_speed || 0
                        );


                        localStorage.setItem(
                            "fillerWords",
                            speech.filler_words || 0
                        );


                        // ==================================
                        // NLP
                        // ==================================

                        const nlp =
                            result.nlp_analysis ||
                            {};


                        localStorage.setItem(
                            "nlpScore",
                            nlp.nlp_score || 0
                        );


                        localStorage.setItem(
                            "semanticSimilarity",
                            nlp.semantic_similarity || 0
                        );


                        localStorage.setItem(
                            "keywordMatch",
                            nlp.keyword_match || 0
                        );


                        localStorage.setItem(
                            "answerQuality",
                            nlp.answer_quality ||
                            "Analyzed"
                        );


                        localStorage.setItem(
                            "keywords",
                            Array.isArray(nlp.keywords)
                                ? nlp.keywords.join(", ")
                                : nlp.keywords || ""
                        );


                        localStorage.setItem(
                            "lastQuestion",
                            questions[currentQuestion]
                        );


                        if (recordingStatus) {

                            recordingStatus.textContent =
                                "✅ Answer analyzed successfully!";

                        }


                        console.log(
                            "Analysis saved successfully."
                        );

                    }

                    catch (error) {

                        console.error(
                            "Analysis Error:",
                            error
                        );


                        if (recordingStatus) {

                            recordingStatus.textContent =
                                "❌ Analysis failed.";
                        }

                    }

                };


            mediaRecorder.start();


            isRecording = true;


            if (recordButton) {

                recordButton.textContent =
                    "⏹️ Stop Recording";

            }


            if (recordingStatus) {

                recordingStatus.textContent =
                    "🔴 Recording... Speak your answer.";

            }

        }

        catch (error) {

            console.error(
                "Microphone Error:",
                error
            );


            alert(
                "Microphone access was denied or unavailable."
            );

        }

    }


    // ==================================
    // STOP
    // ==================================

    else {

        if (
            mediaRecorder &&
            mediaRecorder.state !== "inactive"
        ) {

            mediaRecorder.stop();

        }


        isRecording = false;


        if (recordButton) {

            recordButton.textContent =
                "🎙️ Start Recording";

        }


        if (recordingStatus) {

            recordingStatus.textContent =
                "⏳ Processing your answer...";

        }

    }

}


// ==========================================
// NEXT QUESTION
// ==========================================

function nextQuestion() {

    console.log(
        "NEXT QUESTION CLICKED"
    );


    // ==================================
    // DON'T MOVE WHILE RECORDING
    // ==================================

    if (isRecording) {

        alert(
            "Please stop recording first."
        );

        return;

    }


    // ==================================
    // NEXT
    // ==================================

    currentQuestion++;


    console.log(
        "Question index:",
        currentQuestion
    );


    // ==================================
    // FINISHED
    // ==================================

    if (
        currentQuestion >=
        questions.length
    ) {

        console.log(
            "Interview completed!"
        );


        window.location.href =
            "result.html";


        return;

    }


    // ==================================
    // UPDATE QUESTION
    // ==================================

    const questionBox =
        document.getElementById(
            "questionBox"
        );


    if (questionBox) {

        questionBox.textContent =
            questions[currentQuestion];

    }


    // ==================================
    // UPDATE NUMBER
    // ==================================

    updateQuestionNumber();


    // ==================================
    // RESET STATUS
    // ==================================

    const recordingStatus =
        document.getElementById(
            "recordingStatus"
        );


    if (recordingStatus) {

        recordingStatus.textContent =
            "Click the button to start recording.";

    }


    // ==================================
    // RESET RECORD BUTTON
    // ==================================

    const recordButton =
        document.getElementById(
            "recordButton"
        );


    if (recordButton) {

        recordButton.textContent =
            "🎙️ Start Recording";

    }


    // ==================================
    // NEXT BUTTON
    // ==================================

    const nextButton =
        document.getElementById(
            "nextButton"
        );


    if (nextButton) {

        if (
            currentQuestion ===
            questions.length - 1
        ) {

            nextButton.textContent =
                "View Results →";

        }

        else {

            nextButton.textContent =
                "Next Question →";

        }

    }


    console.log(
        "Question updated successfully."
    );

}