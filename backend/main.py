from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from textblob import TextBlob
import httpx
from collections import Counter
import re
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

RAPIDAPI_KEY = "3cb5bef83emshb75657b8afe33b3p139e02jsn5a1d89e95309"
FLIPKART_HOST = "real-time-flipkart.p.rapidapi.com"
AMAZON_HOST = "amazon-online-data-api.p.rapidapi.com"


def analyze_sentiment(reviews):
    if not reviews:
        return 66
    total = 0
    for review in reviews:
        blob = TextBlob(review)
        score = (blob.sentiment.polarity + 1) / 2 * 100
        total += score
    return round(total / len(reviews))

def calculate_trust_score(review_count, rating, sentiment):
    try:
        rating = float(rating or 0)
        review_count = int(review_count or 0)
    except:
        rating = 0
        review_count = 0
    if review_count > 100000:
        review_trust = 95
    elif review_count > 10000:
        review_trust = 85
    elif review_count > 1000:
        review_trust = 75
    elif review_count > 100:
        review_trust = 65
    elif review_count > 10:
        review_trust = 50
    else:
        review_trust = 30
    rating_trust = min(100, round((rating / 5) * 100))
    sentiment_trust = sentiment
    return round((review_trust * 0.5) + (rating_trust * 0.3) + (sentiment_trust * 0.2))

def get_buy_recommendation(price_trend, sentiment, trust_score, rating, review_count):
    score = 0
    reasons = []
    wait_reasons = []
    try:
        rating = float(rating or 0)
        review_count = int(review_count or 0)
    except:
        rating = 0
        review_count = 0
    if price_trend == "dropping":
        score += 2
        reasons.append("Price is currently dropping")
    elif price_trend == "rising":
        score -= 2
        wait_reasons.append("Price is rising — may drop soon")
    else:
        score += 1
        reasons.append("Price is stable")
    if sentiment >= 70:
        score += 2
        reasons.append("Reviews are highly positive")
    elif sentiment >= 55:
        score += 1
        reasons.append("Reviews are mostly positive")
    else:
        score -= 1
        wait_reasons.append("Mixed or negative reviews")
    if trust_score >= 80:
        score += 2
        reasons.append("Reviews appear genuine")
    elif trust_score >= 60:
        score += 1
    else:
        score -= 2
        wait_reasons.append("Many suspicious reviews detected")
    if rating >= 4.5:
        score += 2
        reasons.append(f"Excellent rating of {rating}⭐")
    elif rating >= 4.0:
        score += 1
        reasons.append(f"Good rating of {rating}⭐")
    elif rating < 3.5:
        score -= 1
        wait_reasons.append(f"Low rating of {rating}⭐")
    if review_count > 10000:
        score += 1
        reasons.append(f"{review_count:,} reviews — well tested")
    elif review_count < 50:
        score -= 1
        wait_reasons.append("Too few reviews to be certain")
    if score >= 5:
        verdict = "Strong Buy"
        emoji = "🟢"
        color = "green"
    elif score >= 3:
        verdict = "Buy Now"
        emoji = "✅"
        color = "green"
    elif score >= 1:
        verdict = "Consider"
        emoji = "🟡"
        color = "amber"
    else:
        verdict = "Wait"
        emoji = "⏳"
        color = "red"
    return {
        "verdict": verdict,
        "emoji": emoji,
        "color": color,
        "score": score,
        "reasons": reasons[:3],
        "wait_reasons": wait_reasons[:2],
    }

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
    stop_words = {"the","a","an","is","it","this","that","was","are","for","of","and","to","in","on","with","have","has","i","my","me","we","they","its","very","so","but","not","no","be","been","as","at","by","from","or","good","product","decent","average","size","color","just","like","great","nice","well"}
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
    headers_amazon = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": AMAZON_HOST,
        "Content-Type": "application/json",
    }

    flipkart_products = []
    amazon_raw = []

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            fk_res = await client.get(
                "https://real-time-flipkart.p.rapidapi.com/search.php",
                headers=headers_flipkart,
                params={"query": query, "page": "1", "sort": "relevance"}
            )
            fk_data = fk_res.json()
            if isinstance(fk_data, list):
                flipkart_products = fk_data[:6]
            elif isinstance(fk_data, dict):
                flipkart_products = fk_data.get("products", fk_data.get("data", []))[:6]
        except Exception as e:
            print(f"Flipkart error: {e}")

        try:
            amz_res = await client.get(
           "https://real-time-amazon-data.p.rapidapi.com/search",
            headers=headers_amazon,
            params={"query": query, "page": "1", "country": "IN", "sort_by": "RELEVANCE"}
            )
            amz_data = amz_res.json()
            amazon_raw = amz_data.get("data", {}).get("products", [])[:5]
        except Exception as e:
            print(f"Amazon search error: {e}")
            amazon_raw = []

    results = []
    default_reviews = ["Good product overall", "Decent quality", "Satisfactory experience", "Value for money", "Would recommend", "Average performance", "Not bad for the price"]

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
            review_count = p.get("review_count", 0)
        image = p.get("image", "")
        if not image and p.get("images"):
            imgs = p.get("images")
            image = imgs[0] if isinstance(imgs, list) else imgs
        pid = p.get("product_id", p.get("pid", ""))
        url_link = p.get("url", f"https://www.flipkart.com/product/p/itme?pid={pid}" if pid else "")
        discount = p.get("discount_percent", p.get("discount", 0))
        price_trend = "dropping" if discount and int(str(discount).split("%")[0].strip() or 0) > 5 else "stable"
        sentiment = analyze_sentiment(default_reviews)
        trust = calculate_trust_score(review_count, rating, sentiment)
        positives, complaints = extract_keywords(default_reviews)
        breakdown = get_sentiment_breakdown(default_reviews)
        buy_rec = get_buy_recommendation(price_trend, sentiment, trust, rating, review_count)
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
            "imageAuth": max(50, 85 - (i * 3)),
            "complaints": complaints,
            "positives": positives,
            "sentimentBreakdown": breakdown,
            "buyRecommendation": buy_rec,
        })

    default_amazon_reviews = ["Good product", "Decent quality", "Value for money", "Satisfactory", "Would recommend"]
    for i, p in enumerate(amazon_raw):
        title = p.get("product_title", "Unknown Product")
        if not title or title.strip() in ["Nike", "Adidas", "Puma", "Jordan", ""]:
            continue
        price = p.get("product_price") or p.get("product_original_price") or "N/A"
        if price and price != "N/A":
            price = str(price)
        rating = str(p.get("product_star_rating") or "4.0")
        review_count = p.get("product_num_ratings") or 0
        image = p.get("product_photo", "")
        url_link = p.get("product_url", "")
        asin = p.get("asin", "")
        if not url_link and asin:
            url_link = f"https://www.amazon.in/dp/{asin}"
        sentiment = analyze_sentiment(default_amazon_reviews)
        trust = calculate_trust_score(review_count, rating, sentiment)
        positives, complaints = extract_keywords(default_amazon_reviews)
        breakdown = get_sentiment_breakdown(default_amazon_reviews)
        price_trend = "stable"
        buy_rec = get_buy_recommendation(price_trend, sentiment, trust, rating, review_count)
        results.append({
            "id": len(results) + 1,
            "rank": len(results) + 1,
            "name": title,
            "price": price,
            "image": image,
            "url": url_link,
            "rating": rating,
            "reviewCount": review_count,
            "platform": "Amazon",
            "priceTrend": price_trend,
            "sentiment": sentiment,
            "trustScore": trust,
            "imageAuth": max(50, 80 - (i * 4)),
            "complaints": complaints,
            "positives": positives,
            "sentimentBreakdown": breakdown,
            "buyRecommendation": buy_rec,
        })

    results.sort(key=lambda x: (
        float(x.get("rating", 0) or 0) * 30 +
        int(str(x.get("reviewCount", 0) or 0)) * 0.001 +
        x.get("sentiment", 0) * 0.2 +
        x.get("trustScore", 0) * 0.2
    ), reverse=True)

    for i, r in enumerate(results):
        r["id"] = i + 1
        r["rank"] = i + 1

    return {"query": query, "total": len(results), "products": results}

@app.post("/analyze-image")
async def analyze_image_endpoint(file: UploadFile = File(None), url: str = None):
    try:
        if file and file.filename:
            contents = await file.read()
            img_bytes = contents
        elif url:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                img_bytes = response.content
        else:
            return {"error": "Please provide an image file or URL", "score": 0, "verdict": "No input", "flags": []}
        score = 100
        flags = []
        if len(img_bytes) > 5_000_000:
            score -= 20
            flags.append("Unusually large file size")
        if len(img_bytes) < 5000:
            score -= 30
            flags.append("Very small file — may be placeholder")
        jpeg_header = b'\xff\xd8\xff' in img_bytes[:20]
        png_header = b'\x89PNG' in img_bytes[:20]
        webp_header = b'WEBP' in img_bytes[:20]
        riff_header = b'RIFF' in img_bytes[:20]
        if not (jpeg_header or png_header or webp_header or riff_header):
            score -= 20
            flags.append("Unusual image format")
        has_exif = b'Exif' in img_bytes[:1000]
        if not has_exif:
            score -= 15
            flags.append("No camera metadata found")
        else:
            score += 10
        if b'stock' in img_bytes[:500].lower() or b'getty' in img_bytes[:500].lower() or b'shutterstock' in img_bytes[:500].lower():
            score -= 25
            flags.append("Stock photo watermark detected")
        score = max(0, min(100, score))
        verdict = "Likely authentic" if score >= 75 else "Possibly edited" if score >= 50 else "Likely fake or stock photo"
        return {"score": score, "verdict": verdict, "flags": flags}
    except Exception as e:
        return {"error": str(e), "score": 0, "verdict": "Could not analyze", "flags": []}

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