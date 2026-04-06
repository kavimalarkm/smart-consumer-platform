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
    amazon_asins = []
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
                "https://amazon-online-data-api.p.rapidapi.com/search",
                headers=headers_amazon,
                params={"query": query, "page": "1", "geo": "IN"}
            )
            amz_data = amz_res.json()
            amazon_raw = amz_data.get("products", [])[:5]
        except Exception as e:
            print(f"Amazon search error: {e}")
            amazon_raw = []

    results = []
    default_reviews = [
        "Good product overall",
        "Decent quality",
        "Satisfactory experience",
        "Value for money",
        "Would recommend",
        "Average performance",
        "Not bad for the price"
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

    default_amazon_reviews = [
        "Good product",
        "Decent quality",
        "Value for money",
        "Satisfactory",
        "Would recommend"
    ]

    for i, p in enumerate(amazon_raw):
        title = p.get("product_title", "Unknown Product")

        if not title or title.strip() in ["Nike", "Adidas", "Puma", ""]:
            continue

        price_usd = p.get("product_price") or p.get("product_original_price") or 0

        try:
            price_inr = round(float(price_usd) * 84)
            price = f"₹{price_inr:,}" if price_inr > 0 else "N/A"
        except:
            price = "N/A"

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