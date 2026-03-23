from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from textblob import TextBlob
from PIL import Image
import requests
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def analyze_sentiment(reviews):
    if not reviews:
        return 50
    total = 0
    for review in reviews:
        blob = TextBlob(review)
        score = (blob.sentiment.polarity + 1) / 2 * 100
        total += score
    return round(total / len(reviews))

def detect_fake_reviews(reviews):
    if not reviews:
        return 50
    unique = len(set(reviews))
    total = len(reviews)
    return round((unique / total) * 100)

def get_complaints(reviews):
    complaints = []
    positives = []
    for r in reviews:
        blob = TextBlob(r)
        if blob.sentiment.polarity < 0:
            complaints.append(r[:30])
        else:
            positives.append(r[:30])
    return complaints[:2], positives[:2]

def analyze_image(img):
    score = 100
    flags = []

    width, height = img.size
    if width > 3000 or height > 3000:
        score -= 20
        flags.append("Unusually large image")
    if width == height:
        score -= 10
        flags.append("Perfect square (stock photo pattern)")

    if img.mode == "RGB":
        r, g, b = img.split()
        import statistics
        r_std = statistics.stdev(list(r.getdata())[:1000])
        if r_std < 10:
            score -= 25
            flags.append("Very low color variation")

    exif_data = {}
    try:
        exif_data = img._getexif() or {}
    except:
        pass

    if not exif_data:
        score -= 15
        flags.append("No camera metadata found")
    else:
        score += 10

    score = max(0, min(100, score))
    return score, flags

PRODUCTS_DATA = {
    "smartphone": [
        {
            "id": 1, "rank": 1,
            "name": "Redmi Note 13 Pro",
            "price": "₹18,999",
            "priceTrend": "dropping",
            "imageAuth": 90,
            "reviews": [
                "Amazing camera quality, love this phone!",
                "Great display and performance",
                "Battery could be better but camera is excellent",
                "Slow charging is annoying but overall great",
                "Best phone under 20000 rupees",
            ]
        },
        {
            "id": 2, "rank": 2,
            "name": "Samsung Galaxy A35",
            "price": "₹19,499",
            "priceTrend": "stable",
            "imageAuth": 78,
            "reviews": [
                "Good build quality",
                "Good build quality",
                "Battery drains too fast",
                "Not worth the price",
                "Good build quality",
            ]
        },
        {
            "id": 3, "rank": 3,
            "name": "Poco X6 Neo",
            "price": "₹16,999",
            "priceTrend": "rising",
            "imageAuth": 45,
            "reviews": [
                "Terrible experience, phone heats up",
                "Fake product images",
                "Not good at all",
                "Heating issues every day",
                "Very disappointing",
            ]
        },
    ]
}

@app.get("/")
def root():
    return {"message": "Smart Consumer Intelligence API is running!"}

@app.get("/search")
def search(query: str = ""):
    query_lower = query.lower()
    matched_key = "smartphone"
    for key in PRODUCTS_DATA:
        if key in query_lower:
            matched_key = key
            break

    raw_products = PRODUCTS_DATA[matched_key]
    results = []
    for p in raw_products:
        sentiment = analyze_sentiment(p["reviews"])
        trust = detect_fake_reviews(p["reviews"])
        complaints, positives = get_complaints(p["reviews"])
        results.append({
            "id": p["id"],
            "rank": p["rank"],
            "name": p["name"],
            "price": p["price"],
            "priceTrend": p["priceTrend"],
            "sentiment": sentiment,
            "trustScore": trust,
            "imageAuth": p["imageAuth"],
            "complaints": complaints,
            "positives": positives,
        })

    return {"query": query, "total": len(results), "products": results}

@app.post("/analyze-image")
async def analyze_image_endpoint(file: UploadFile = File(None), url: str = None):
    try:
        if file and file.filename:
            contents = await file.read()
            img = Image.open(io.BytesIO(contents))
        elif url:
            response = requests.get(url, timeout=10)
            img = Image.open(io.BytesIO(response.content))
        else:
            return {"error": "Please provide an image file or URL"}

        score, flags = analyze_image(img)
        verdict = "Likely authentic" if score >= 75 else "Possibly edited" if score >= 50 else "Likely fake or stock photo"

        return {
            "score": score,
            "verdict": verdict,
            "flags": flags,
        }
    except Exception as e:
        return {"error": str(e), "score": 0, "verdict": "Could not analyze", "flags": []}