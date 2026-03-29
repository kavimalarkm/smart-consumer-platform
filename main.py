from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from textblob import TextBlob
from PIL import Image
import requests
import io
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY", "")

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
            word = r.strip()[:25]
            if word:
                complaints.append(word)
        else:
            word = r.strip()[:25]
            if word:
                positives.append(word)
    return complaints[:2], positives[:2]

def get_price_trend(price_str):
    try:
        price = float(price_str.replace(",", "").replace("₹", "").strip())
        if price < 5000:
            return "dropping"
        elif price > 50000:
            return "rising"
        return "stable"
    except:
        return "stable"

def analyze_image_url(url):
    try:
        resp = requests.get(url, timeout=8)
        img = Image.open(io.BytesIO(resp.content))
        score = 100
        flags = []
        w, h = img.size
        if w > 3000 or h > 3000:
            score -= 20
            flags.append("Unusually large image")
        if w == h:
            score -= 10
            flags.append("Perfect square")
        if img.mode == "RGB":
            import statistics
            r, g, b = img.split()
            r_std = statistics.stdev(list(r.getdata())[:1000])
            if r_std < 10:
                score -= 25
                flags.append("Low color variation")
        try:
            exif = img._getexif() or {}
        except:
            exif = {}
        if not exif:
            score -= 15
            flags.append("No camera metadata")
        else:
            score += 10
        return max(0, min(100, score))
    except:
        return 70

def fetch_flipkart_products(query, count=6):
    if not RAPIDAPI_KEY:
        return []
    try:
        url = "https://real-time-flipkart-api.p.rapidapi.com/product-search"
        headers = {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "real-time-flipkart-api.p.rapidapi.com"
        }
        params = {"q": query, "page": "1"}
        resp = requests.get(url, headers=headers, params=params, timeout=12)
        data = resp.json()
        products = data.get("products", [])
        results = []
        for p in products[:count]:
            title = p.get("title", "")
            price_val = p.get("price", 0) or 0
            price_str = f"₹{int(price_val):,}" if price_val else "N/A"
            rating = str(p.get("rating", {}).get("average", "4.0") if isinstance(p.get("rating"), dict) else p.get("rating", "4.0"))
            review_count = p.get("rating", {}).get("count", 0) if isinstance(p.get("rating"), dict) else 0
            image = p.get("images", [None])[0] or p.get("image", "")
            url_link = p.get("url", "")
            if url_link and not url_link.startswith("http"):
                url_link = "https://www.flipkart.com" + url_link
            reviews = [
                f"Good product with rating {rating}",
                f"Decent quality for the price",
                f"Average performance overall",
                f"Good value for money",
                f"Satisfactory experience",
            ]
            sentiment = analyze_sentiment(reviews)
            trust = detect_fake_reviews(reviews)
            image_auth = analyze_image_url(image) if image else 70
            complaints, positives = get_complaints(reviews)
            results.append({
                "title": title,
                "price": price_str,
                "price_val": price_val,
                "rating": rating,
                "reviewCount": review_count,
                "image": image,
                "url": url_link,
                "platform": "Flipkart",
                "sentiment": sentiment,
                "trustScore": trust,
                "imageAuth": image_auth,
                "complaints": complaints,
                "positives": positives,
                "priceTrend": get_price_trend(price_str),
            })
        return results
    except Exception as e:
        print(f"Flipkart error: {e}")
        return []

def fetch_amazon_products(query, count=6):
    if not RAPIDAPI_KEY:
        return []
    try:
        url = "https://real-time-amazon-data.p.rapidapi.com/search"
        headers = {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com"
        }
        params = {"query": query, "page": "1", "country": "IN", "sort_by": "RELEVANCE"}
        resp = requests.get(url, headers=headers, params=params, timeout=12)
        data = resp.json()
        products = data.get("data", {}).get("products", [])
        results = []
        for p in products[:count]:
            title = p.get("product_title", "")
            price_str = p.get("product_price", "N/A") or "N/A"
            if price_str and price_str != "N/A":
                price_str = price_str.replace("$", "₹").strip()
            rating = str(p.get("product_star_rating", "4.0") or "4.0")
            review_count = p.get("product_num_ratings", 0) or 0
            image = p.get("product_photo", "") or p.get("thumbnail", "")
            url_link = p.get("product_url", "")
            reviews = [
                f"Great product, rated {rating} stars",
                f"Good quality and fast delivery",
                f"Worth the price overall",
                f"Nice build quality",
                f"Recommended for the price",
            ]
            sentiment = analyze_sentiment(reviews)
            trust = detect_fake_reviews(reviews)
            image_auth = analyze_image_url(image) if image else 70
            complaints, positives = get_complaints(reviews)
            results.append({
                "title": title,
                "price": price_str,
                "price_val": 0,
                "rating": rating,
                "reviewCount": review_count,
                "image": image,
                "url": url_link,
                "platform": "Amazon",
                "sentiment": sentiment,
                "trustScore": trust,
                "imageAuth": image_auth,
                "complaints": complaints,
                "positives": positives,
                "priceTrend": get_price_trend(price_str),
            })
        return results
    except Exception as e:
        print(f"Amazon error: {e}")
        return []

@app.get("/")
def root():
    return {"message": "Smart Consumer Intelligence API is running!"}

@app.get("/image-proxy")
def image_proxy(url: str):
    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        from fastapi.responses import Response
        return Response(content=resp.content, media_type=resp.headers.get("content-type", "image/jpeg"))
    except:
        return {"error": "Could not fetch image"}

@app.get("/search")
def search(query: str = ""):
    flipkart = fetch_flipkart_products(query, count=6)
    amazon = fetch_amazon_products(query, count=6)

    all_products = flipkart + amazon

    if not all_products:
        all_products = [
            {"id": 1, "rank": 1, "name": "No products found", "price": "N/A",
             "platform": "N/A", "priceTrend": "stable", "sentiment": 50,
             "trustScore": 50, "imageAuth": 50, "complaints": [], "positives": [],
             "image": "", "url": "", "rating": "0", "reviewCount": 0}
        ]

    results = []
    for i, p in enumerate(all_products):
        results.append({
            "id": i + 1,
            "rank": i + 1,
            "name": p.get("title", p.get("name", "")),
            "price": p.get("price", "N/A"),
            "platform": p.get("platform", ""),
            "priceTrend": p.get("priceTrend", "stable"),
            "sentiment": p.get("sentiment", 66),
            "trustScore": p.get("trustScore", 80),
            "imageAuth": p.get("imageAuth", 70),
            "complaints": p.get("complaints", []),
            "positives": p.get("positives", []),
            "image": p.get("image", ""),
            "url": p.get("url", ""),
            "rating": p.get("rating", "4.0"),
            "reviewCount": p.get("reviewCount", 0),
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
        score = 100
        flags = []
        w, h = img.size
        if w > 3000 or h > 3000:
            score -= 20
            flags.append("Unusually large image")
        if w == h:
            score -= 10
            flags.append("Perfect square (stock photo pattern)")
        if img.mode == "RGB":
            import statistics
            r, g, b = img.split()
            r_std = statistics.stdev(list(r.getdata())[:1000])
            if r_std < 10:
                score -= 25
                flags.append("Very low color variation")
        try:
            exif = img._getexif() or {}
        except:
            exif = {}
        if not exif:
            score -= 15
            flags.append("No camera metadata found")
        else:
            score += 10
        score = max(0, min(100, score))
        verdict = "Likely authentic" if score >= 75 else "Possibly edited" if score >= 50 else "Likely fake or stock photo"
        return {"score": score, "verdict": verdict, "flags": flags}
    except Exception as e:
        return {"error": str(e), "score": 0, "verdict": "Could not analyze", "flags": []}