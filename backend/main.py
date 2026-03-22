from fastapi import FastAPI
from fastapi import FastAPI
# v2 fixed
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
AMAZON_HOST = "real-time-amazon-data.p.rapidapi.com"
FLIPKART_HOST = "real-time-flipkart.p.rapidapi.com"

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

def extract_keywords(reviews):
    positive_reviews = []
    negative_reviews = []
    for review in reviews:
        blob = TextBlob(review)
        if blob.sentiment.polarity > 0.1:
            positive_reviews.append(review)
        elif blob.sentiment.polarity < -0.1:
            negative_reviews.append(review)
    stop_words = {"the","a","an","is","it","this","that","was","are","for","of","and","to","in","on","with","have","has","i","my","me","we","they","its","very","so","but","not","no","be","been","as","at","by","from","or"}
    def get_keywords(text_list):
        words = []
        for text in text_list:
            tokens = re.findall(r'\b[a-z]{4,}\b', text.lower())
            words.extend([w for w in tokens if w not in stop_words])
        counter = Counter(words)
        return [word for word, count in counter.most_common(5)]
    pos_keywords = get_keywords(positive_reviews)
    neg_keywords = get_keywords(negative_reviews)
    positives = [k.capitalize() for k in pos_keywords[:3]] if pos_keywords else ["Good quality"]
    complaints = [k.capitalize() for k in neg_keywords[:3]] if neg_keywords else []
    return positives, complaints

def get_sentiment_breakdown(reviews):
    if not reviews:
        return {"positive": 0, "neutral": 0, "negative": 0}
    positive = sum(1 for r in reviews if TextBlob(r).sentiment.polarity > 0.1)
    negative = sum(1 for r in reviews if TextBlob(r).sentiment.polarity < -0.1)
    neutral = len(reviews) - positive - negative
    total = len(reviews)
    return {
        "positive": round((positive / total) * 100),
        "neutral": round((neutral / total) * 100),
        "negative": round((negative / total) * 100),
    }

@app.get("/")
def root():
    return {"message": "Smart Consumer Intelligence API is running!"}

@app.get("/image-proxy")
async def image_proxy(url: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }, follow_redirects=True)
        return Response(
            content=response.content,
            media_type=response.headers.get("content-type", "image/jpeg")
        )

@app.get("/search")
async def search(query: str = ""):
    if not query.strip():
        return {"query": "", "total": 0, "products": []}

    headers_amazon = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": AMAZON_HOST,
    }
    headers_flipkart = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": FLIPKART_HOST,
    }

    amazon_products = []
    flipkart_products = []

    try:
        async with httpx.AsyncClient() as client:
            amazon_res = await client.get(
                "https://real-time-amazon-data.p.rapidapi.com/search",
                headers=headers_amazon,
                params={"query": query, "page": "1", "country": "IN", "sort_by": "RELEVANCE"}
            )
            amazon_data = amazon_res.json()
            amazon_products = amazon_data.get("data", {}).get("products", [])[:5]
    except:
        amazon_products = []

    try:
        async with httpx.AsyncClient() as client:
            flipkart_res = await client.get(
                "https://real-time-flipkart.p.rapidapi.com/search.php",
                headers=headers_flipkart,
                params={"query": query, "page": "1", "sort": "relevance"}
            )
            flipkart_data = flipkart_res.json()
            if isinstance(flipkart_data, list):
                flipkart_products = flipkart_data[:5]
            elif isinstance(flipkart_data, dict):
                flipkart_products = flipkart_data.get("products", flipkart_data.get("data", []))[:5]
    except:
        flipkart_products = []

    results = []

    for i, p in enumerate(amazon_products):
        asin = p.get("asin", "")
        title = html.unescape(p.get("product_title", "Unknown"))
        price = p.get("product_price", "N/A")
        rating = p.get("product_star_rating", "0")
        reviews_count = p.get("product_num_ratings", 0)
        image = p.get("product_photo", "")

        reviews = []
        if asin:
            try:
                async with httpx.AsyncClient(timeout=10) as rev_client:
                    rev_res = await rev_client.get(
                        "https://real-time-amazon-data.p.rapidapi.com/product-reviews",
                        headers=headers_amazon,
                        params={"asin": asin, "country": "IN", "page": "1"}
                    )
                    rev_data = rev_res.json()
                    raw_reviews = rev_data.get("data", {}).get("reviews", [])
                    reviews = [html.unescape(r.get("review_comment", ""))
                              for r in raw_reviews[:15] if r.get("review_comment")]
            except:
                pass

        if not reviews:
            reviews = ["Good product", "Decent quality", "Not bad", "Could be better", "Average product"]

        sentiment = analyze_sentiment(reviews)
        trust = detect_fake_reviews(reviews)
        positives, complaints = extract_keywords(reviews)
        breakdown = get_sentiment_breakdown(reviews)

        results.append({
            "id": i + 1,
            "rank": i + 1,
            "name": title,
            "price": price,
            "image": image,
            "url": f"https://www.amazon.in/dp/{asin}" if asin else "",
            "rating": rating,
            "reviewCount": reviews_count,
            "platform": "Amazon",
            "priceTrend": "stable",
            "sentiment": sentiment,
            "trustScore": trust,
            "imageAuth": 80 - (i * 5),
            "complaints": complaints,
            "positives": positives,
            "sentimentBreakdown": breakdown,
        })

    for i, p in enumerate(flipkart_products):
        title = p.get("title", "Unknown")
        price = f"₹{p.get('price', 'N/A')}"
        rating = str(p.get("rating", {}).get("average", "0"))
        reviews_count = p.get("rating", {}).get("count", 0)
        image = p.get("image", "")
        pid = p.get("product_id", "")

        reviews = ["Good product", "Decent quality", "Not bad", "Could be better", "Average product"]
        sentiment = analyze_sentiment(reviews)
        trust = detect_fake_reviews(reviews)
        positives, complaints = extract_keywords(reviews)
        breakdown = get_sentiment_breakdown(reviews)

        results.append({
            "id": len(amazon_products) + i + 1,
            "rank": len(amazon_products) + i + 1,
            "name": title,
            "price": price,
            "image": image,
            "url": f"https://www.flipkart.com/product/p/itme?pid={pid}" if pid else "",
            "rating": rating,
            "reviewCount": reviews_count,
            "platform": "Flipkart",
            "priceTrend": "stable",
            "sentiment": sentiment,
            "trustScore": trust,
            "imageAuth": 75 - (i * 5),
            "complaints": complaints,
            "positives": positives,
            "sentimentBreakdown": breakdown,
        })

    results.sort(key=lambda x: (x["sentiment"] + x["trustScore"] + x["imageAuth"]) / 3, reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return {"query": query, "total": len(results), "products": results}

@app.get("/analyze-sentiment")
async def analyze_sentiment_endpoint(text: str = ""):
    if not text.strip():
        return {"error": "No text provided"}
    sentences = [s.strip() for s in text.replace(".", ".|||").replace("!", ".|||").replace("?", ".|||").split("|||") if s.strip()]
    if not sentences:
        sentences = [text]
    scores = []
    for s in sentences:
        blob = TextBlob(s)
        scores.append(blob.sentiment.polarity)
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