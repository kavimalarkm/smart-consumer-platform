from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCTS = [
    {
        "id": 1, "rank": 1,
        "name": "Redmi Note 13 Pro",
        "price": "₹18,999",
        "priceTrend": "dropping",
        "sentiment": 82,
        "trustScore": 85,
        "imageAuth": 90,
        "complaints": ["Slow charging"],
        "positives": ["Camera loved", "Great display"],
    },
    {
        "id": 2, "rank": 2,
        "name": "Samsung Galaxy A35",
        "price": "₹19,499",
        "priceTrend": "stable",
        "sentiment": 74,
        "trustScore": 70,
        "imageAuth": 78,
        "complaints": ["Battery drains fast", "Some fake reviews"],
        "positives": ["Good build quality"],
    },
    {
        "id": 3, "rank": 3,
        "name": "Poco X6 Neo",
        "price": "₹16,999",
        "priceTrend": "rising",
        "sentiment": 65,
        "trustScore": 58,
        "imageAuth": 45,
        "complaints": ["Image may be fake", "Many fake reviews", "Heating issues"],
        "positives": [],
    },
]

@app.get("/")
def root():
    return {"message": "Smart Consumer Intelligence API is running!"}

@app.get("/search")
def search(query: str = ""):
    return {
        "query": query,
        "total": len(PRODUCTS),
        "products": PRODUCTS
    }