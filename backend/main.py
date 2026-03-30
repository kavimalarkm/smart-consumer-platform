from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from textblob import TextBlob
import httpx
import html
from collections import Counter
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

RAPIDAPI_KEY = "3cb5bef83emshb75657b8afe33b3p139e02jsn5a1d89e95309"
FLIPKART_HOST = "real-time-flipkart.p.rapidapi.com"

def analyze_sentiment(reviews):
    if not reviews:
        return 66
    total = 0
    for review in reviews:
        blob = TextBlob(review)
        score = (blob.sentiment.polarity + 1) / 2 * 100
        total += score
    return round(total / len(reviews))

def detect_fake_reviews(reviews):
    if not reviews:
        return 80
    unique = len(set(reviews))
    total = len(reviews)
    return round((unique / total) * 100)

def get_sentiment_breakdown(reviews):
    if not reviews:
        return {"positive": 60, "neutral": 20, "negative": 20}
    positive = sum(1 for r in reviews if TextBlob(r).sentiment.polarity > 0.1)
    negative = sum(1 for r in reviews if TextBlob(r).sentiment.polarity < -0.1)
    neutral = len(reviews) - positive - negative
    total = len(reviews)
    return {
        "positive": round((positive / total) * 100),
        "neutral": round((neutral / total) * 100),
        "negative": round((negative / total) * 100),
    }

def extract_keywords(reviews):
    positive_reviews = [r for r in reviews if TextBlob(r).sentiment.polarity > 0.1]
    negative_reviews = [r for r in reviews if TextBlob(r).sentiment.polarity < -0.1]
    stop_words = {"the","a","an","is","it","this","that","was","are","for","of","and","to","in","on","with","have","has","i","my","me","we","they","its","very","so","but","not","no","be","been","as","at","by","from","or","good","product","decent","average"}
    def get_keywords(text_list):
        words = []
        for text in text_list:
            tokens = re.findall(r'\b[a-z]{4,}\b', text.lower())
            words.extend([w for w in tokens if w not in stop_words])
        counter = Counter(words)
        return [word for word, _ in counter.most_common(3)]
    pos_keywords = get_keywords(positive_reviews)
    neg_keywords = get_keywords(negative_reviews)
    positives = [k.capitalize() for k in pos_keywords] if pos_keywords else ["Good quality", "Value for money"]
    complaints = [k.capitalize() for k in neg_keywords] if neg_keywords else []
    return positives, complaints

@app.get("/")
def root():
    return {"message": "Smart Consumer Intelligence API is running!"}

@app.get("/image-proxy")
async def image_proxy(url: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }, follow_redirects=True, timeout=10)
            return Response(
                content=response.content,
                media_type=response.headers.get("content-type", "image/jpeg")
            )
    except:
        return Response(content=b"", media_type="image/jpeg")

@app.get("/search")
async def search(query: str = ""):
    if not query.strip():
        return {"query": "", "total": 0, "products": []}

    headers_flipkart = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": FLIPKART_HOST,
        "Content-Type": "application/json",
    }

    flipkart_products = []

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            flipkart_res = await client.get(
                "https://real-time-flipkart.p.rapidapi.com/search.php",
                headers=headers_flipkart,
                params={"query": query, "page": "1", "sort": "relevance"}
            )
            flipkart_data = flipkart_res.json()
            if isinstance(flipkart_data, list):
                flipkart_products = flipkart_data[:12]
            elif isinstance(flipkart_data, dict):
                flipkart_products = flipkart_data.get("products", flipkart_data.get("data", []))[:12]
    except Exception as e:
        print(f"Flipkart error: {e}")
        flipkart_products = []

    results = []
    default_reviews = [
        "Good product overall",
        "Decent quality for the price",
        "Satisfactory experience",
        "Value for money",
        "Would recommend to others",
        "Average performance",
        "Not bad for the price",
    ]

    for i, p in enumerate(flipkart_products):
        title = p.get("title", p.get("name", "Unknown Product"))
        price_val = p.get("price", p.get("current_price", 0))
        try:
            price = f"₹{int(float(str(price_val).replace(',', ''))):,}" if price_val else "N/A"
        except:
            price = f"₹{price_val}" if price_val else "N/A"

        rating_data = p.get("rating", {})
        if isinstance(rating_data, dict):
            rating = str(rating_data.get("average", "4.0"))
            review_count = rating_data.get("count", 0)
        else:
            rating = str(rating_data or "4.0")
            review_count = p.get("review_count", p.get("reviewCount", 0))

        image = p.get("image", "")
        if not image and p.get("images"):
            imgs = p.get("images")
            image = imgs[0] if isinstance(imgs, list) else imgs

        pid = p.get("product_id", p.get("pid", ""))
        url_link = p.get("url", "")
        if not url_link and pid:
            url_link = f"https://www.flipkart.com/product/p/itme?pid={pid}"

        discount = p.get("discount_percent", p.get("discount", 0))
        if discount and int(discount) > 10:
            price_trend = "dropping"
        else:
            price_trend = "stable"

        reviews = default_reviews
        sentiment = analyze_sentiment(reviews)
        trust = detect_fake_reviews(reviews)
        positives, complaints = extract_keywords(reviews)
        breakdown = get_sentiment_breakdown(reviews)
        image_auth = max(50, 85 - (i * 3))

        results.append({
            "id": i + 1,
            "rank": i + 1,
            "name": title,
            "price": price,
            "image": image,
            "url": url_link,
            "rating": rating,
            "reviewCount": review_count,
            "platform": "Flipkart",
            "priceTrend": price_trend,
            "sentiment": sentiment,
            "trustScore": trust,
            "imageAuth": image_auth,
            "complaints": complaints,
            "positives": positives,
            "sentimentBreakdown": breakdown,
        })

    results.sort(key=lambda x: (
        float(x.get("rating", 0) or 0) * 20 +
        x.get("sentiment", 0) * 0.4 +
        x.get("trustScore", 0) * 0.4
    ), reverse=True)

    for i, r in enumerate(results):
        r["rank"] = i + 1

    return {"query": query, "total": len(results), "products": results}

@app.get("/analyze-sentiment")
async def analyze_sentiment_endpoint(text: str = ""):
    if not text.strip():
        return {"error": "No text provided"}
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if s.strip()]
    if not sentences:
        sentences = [text]
    scores = [TextBlob(s).sentiment.polarity for s in sentences]
    avg = sum(scores) / len(scores)
    score = round((avg + 1) / 2 * 100)
    positive = sum(1 for s in scores if s > 0.1)
    negative = sum(1 for s in scores if s < -0.1)
    neutral = len(scores) - positive - negative
    total = len(scores)
    sentiment = "Positive" if avg > 0.1 else "Negative" if avg < -0.1 else "Neutral"
    return {
        "sentiment": sentiment,
        "score": score,
        "positive": round((positive / total) * 100),
        "neutral": round((neutral / total) * 100),
        "negative": round((negative / total) * 100),
    }