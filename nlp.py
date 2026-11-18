import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ==========================================
# TEXT CLEANING
# ==========================================

def clean_text(text):

    text = text.lower()

    text = re.sub(
        r"[^a-zA-Z0-9\s]",
        "",
        text
    )

    return text


# ==========================================
# KEYWORD EXTRACTION
# ==========================================

def extract_keywords(text):

    stop_words = {
        "the", "is", "are", "was", "were",
        "a", "an", "and", "or", "but",
        "to", "of", "in", "on", "for",
        "with", "my", "i", "me", "this",
        "that", "it", "as", "at", "from",
        "can", "have", "has", "been",
        "will", "would", "should"
    }

    words = clean_text(text).split()

    keywords = []

    for word in words:

        if word not in stop_words and len(word) > 2:

            if word not in keywords:
                keywords.append(word)

    return keywords[:10]


# ==========================================
# SEMANTIC SIMILARITY
# ==========================================

def calculate_similarity(
    candidate_answer,
    expected_answer
):

    candidate_answer = clean_text(candidate_answer)
    expected_answer = clean_text(expected_answer)

    if not candidate_answer:
        return 0

    if not expected_answer:
        return 0

    try:

        vectorizer = TfidfVectorizer()

        vectors = vectorizer.fit_transform([
            candidate_answer,
            expected_answer
        ])

        similarity = cosine_similarity(
            vectors[0:1],
            vectors[1:2]
        )[0][0]

        return round(
            similarity * 100,
            2
        )

    except Exception:

        return 0


# ==========================================
# KEYWORD MATCHING
# ==========================================

def keyword_score(
    candidate_answer,
    expected_answer
):

    candidate_words = set(
        extract_keywords(candidate_answer)
    )

    expected_words = set(
        extract_keywords(expected_answer)
    )

    if not expected_words:
        return 0

    matched_words = (
        candidate_words &
        expected_words
    )

    score = (
        len(matched_words)
        /
        len(expected_words)
    ) * 100

    return round(score, 2)


# ==========================================
# ANSWER QUALITY
# ==========================================

def get_answer_quality(
    word_count,
    similarity
):

    if word_count >= 40 and similarity >= 60:

        return "Excellent"

    elif word_count >= 25 and similarity >= 40:

        return "Good"

    elif word_count >= 15 and similarity >= 25:

        return "Average"

    else:

        return "Needs Improvement"


# ==========================================
# MAIN NLP ANALYSIS
# ==========================================

def analyze_answer(
    candidate_answer,
    expected_answer
):

    keywords = extract_keywords(
        candidate_answer
    )

    similarity = calculate_similarity(
        candidate_answer,
        expected_answer
    )

    keyword_match = keyword_score(
        candidate_answer,
        expected_answer
    )

    word_count = len(
        candidate_answer.split()
    )

    quality = get_answer_quality(
        word_count,
        similarity
    )

    # Combined NLP score
    nlp_score = (
        similarity * 0.60
        +
        keyword_match * 0.40
    )

    nlp_score = round(
        nlp_score,
        2
    )

    return {

        "keywords": keywords,

        "semantic_similarity":
            similarity,

        "keyword_match":
            keyword_match,

        "answer_quality":
            quality,

        "nlp_score":
            nlp_score

    }