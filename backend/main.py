from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from textblob import TextBlob
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

RAPIDAPI_KEY = "3cb5bef83emshb75657b8afe33b3p139e02jsn5a1d89e95309"
RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com"

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
            complaints.append(r[:40])
        else:
            positives.append(r[:40])
    return complaints[:2], positives[:2]

@app.get("/")
def root():
    return {"message": "Smart Consumer Intelligence API is running!"}

@app.get("/search")
async def search(query: str = ""):
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://real-time-amazon-data.p.rapidapi.com/search",
            headers=headers,
            params={"query": query, "page": "1", "country": "IN", "sort_by": "RELEVANCE"}
        )
        data = res.json()

    products = data.get("data", {}).get("products", [])[:3]

    results = []
    for i, p in enumerate(products):
        title = p.get("product_title", "Unknown")
        price = p.get("product_price", "N/A")
        rating = p.get("product_star_rating", "0")
        reviews_count = p.get("product_num_ratings", 0)
        image = p.get("product_photo", "")
        url = p.get("product_url", "")

        fake_reviews = ["Great product"] * 3 + ["Not good"] * 2
        sentiment = analyze_sentiment(fake_reviews)
        trust = detect_fake_reviews(fake_reviews)
        complaints, positives = get_complaints(fake_reviews)

        results.append({
            "id": i + 1,
            "rank": i + 1,
            "name": title,
            "price": price,
            "image": image,
            "url": url,
            "rating": rating,
            "reviewCount": reviews_count,
            "priceTrend": "stable",
            "sentiment": sentiment,
            "trustScore": trust,
            "imageAuth": 80 - (i * 10),
            "complaints": complaints,
            "positives": positives,
        })

    return {"query": query, "total": len(results), "products": results}