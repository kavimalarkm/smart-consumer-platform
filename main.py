from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from textblob import TextBlob

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def analyze_sentiment(reviews: list[str]) -> int:
    if not reviews:
        return 50
    total = 0
    for review in reviews:
        blob = TextBlob(review)
        score = (blob.sentiment.polarity + 1) / 2 * 100
        total += score
    return round(total / len(reviews))

def detect_fake_reviews(reviews: list[str]) -> int:
    if not reviews:
        return 50
    unique = len(set(reviews))
    total = len(reviews)
    trust = round((unique / total) * 100)
    return trust

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

def get_complaints(reviews, sentiment):
    complaints = []
    positives = []
    for r in reviews:
        blob = TextBlob(r)
        if blob.sentiment.polarity < 0:
            complaints.append(r[:30])
        else:
            positives.append(r[:30])
    return complaints[:2], positives[:2]

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
        complaints, positives = get_complaints(p["reviews"], sentiment)
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

    return {
        "query": query,
        "total": len(results),
        "products": results
    }