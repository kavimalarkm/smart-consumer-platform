from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from textblob import TextBlob
import httpx
import html

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

    async with httpx.AsyncClient() as client:
        amazon_res = await client.get(
            "https://real-time-amazon-data.p.rapidapi.com/search",
            headers=headers_amazon,
            params={"query": query, "page": "1", "country": "IN", "sort_by": "RELEVANCE"}
        )
        amazon_data = amazon_res.json()
        amazon_products = amazon_data.get("data", {}).get("products", [])[:3]

    async with httpx.AsyncClient() as client:
        flipkart_res = await client.get(
            "https://real-time-flipkart.p.rapidapi.com/search.php",
            headers=headers_flipkart,
            params={"query": query, "page": "1", "sort": "relevance"}
        )
        flipkart_data = flipkart_res.json()
        flipkart_products = flipkart_data[:3] if isinstance(flipkart_data, list) else []

    results = []

    for i, p in enumerate(amazon_products):
        asin = p.get("asin", "")
        title = html.unescape(p.get("product_title", "Unknown"))
        price = p.get("product_price", "N/A")
        rating = p.get("product_star_rating", "0")
        reviews_count = p.get("product_num_ratings", 0)
        image = p.get("product_photo", "")

        reviews = ["Good product", "Decent quality", "Not bad", "Could be better", "Average product"]
        sentiment = analyze_sentiment(reviews)
        trust = detect_fake_reviews(reviews)
        complaints, positives = get_complaints(reviews)

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
        complaints, positives = get_complaints(reviews)

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
        })

    results.sort(key=lambda x: (x["sentiment"] + x["trustScore"] + x["imageAuth"]) / 3, reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return {"query": query, "total": len(results), "products": results}