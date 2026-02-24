from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

import models, schemas, database
from routers.auth import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=schemas.ProductResponse, dependencies=[Depends(get_current_admin)])
def create_product(product: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    # Auto calc discount_price if discount_percentage is provided but price is 0
    dp = product.discount_price
    if dp == 0 and product.discount_percentage > 0:
        dp = product.mrp * (1 - (product.discount_percentage / 100))
    elif dp == 0:
        dp = product.mrp

    db_product = models.Product(
        name=product.name,
        description=product.description,
        color=product.color,
        fabric=product.fabric,
        rating=product.rating,
        category=product.category,
        tags=product.tags,
        mrp=product.mrp,
        discount_percentage=product.discount_percentage,
        discount_price=dp,
        photos=product.photos,
        stock=product.stock
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=schemas.ProductResponse, dependencies=[Depends(get_current_admin)])
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    dp = product.discount_price
    if dp == 0 and product.discount_percentage > 0:
        dp = product.mrp * (1 - (product.discount_percentage / 100))
    elif dp == 0:
        dp = product.mrp

    db_product.name = product.name
    db_product.description = product.description
    db_product.color = product.color
    db_product.fabric = product.fabric
    db_product.rating = product.rating
    db_product.category = product.category
    db_product.tags = product.tags
    db_product.mrp = product.mrp
    db_product.discount_percentage = product.discount_percentage
    db_product.discount_price = dp
    db_product.photos = product.photos
    db_product.stock = product.stock

    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}", dependencies=[Depends(get_current_admin)])
def delete_product(product_id: int, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted successfully"}

class BulkDiscountRequest(BaseModel):
    category: str
    discount_percentage: float

@router.post("/bulk-discount", dependencies=[Depends(get_current_admin)])
def apply_bulk_discount(req: BulkDiscountRequest, db: Session = Depends(database.get_db)):
    products = db.query(models.Product).filter(models.Product.category == req.category).all()
    updated_count = 0
    for p in products:
        p.discount_percentage = req.discount_percentage
        p.discount_price = p.mrp * (1 - (req.discount_percentage / 100))
        updated_count += 1
    db.commit()
    return {"detail": f"Updated {updated_count} products in category '{req.category}'"}

@router.post("/seed", dependencies=[Depends(get_current_admin)])
def seed_dummy_data(db: Session = Depends(database.get_db)):
    # Create dummy products if empty
    if db.query(models.Product).count() > 0:
        return {"detail": "Database already populated"}
    
    dummies = [
        {"name": "Midnight Bomber Jacket", "cat": "Men", "tags": "New Arrival", "mrp": 2999, "color": "Black", "fabric": "Leather", "rating": 4.8},
        {"name": "Midnight Bomber Jacket", "cat": "Men", "tags": "New Arrival", "mrp": 2999, "color": "Brown", "fabric": "Leather", "rating": 4.5},
        {"name": "Midnight Bomber Jacket", "cat": "Men", "tags": "New Arrival", "mrp": 2999, "color": "Navy", "fabric": "Leather", "rating": 4.9},
        {"name": "Silk Wrap Dress", "cat": "Women", "tags": "Trending", "mrp": 3499, "color": "Crimson", "fabric": "Silk", "rating": 5.0},
        {"name": "Silk Wrap Dress", "cat": "Women", "tags": "Trending", "mrp": 3499, "color": "Emerald", "fabric": "Silk", "rating": 4.7},
        {"name": "Urban Runner Sneakers", "cat": "Men", "tags": "New Arrival, Trending", "mrp": 4999, "color": "White", "fabric": "Mesh", "rating": 4.2}
    ]
    
    mock_photos = [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1572804013309-8c98c08f43c3?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800"
    ]

    for d in dummies:
        p = models.Product(
            name=d["name"],
            description=f"Premium quality {d['name']} tailored for comfort and durability.",
            category=d["cat"],
            tags=d["tags"],
            mrp=d["mrp"],
            discount_percentage=10.0,
            discount_price=d["mrp"] * 0.9,
            photos=mock_photos,
            stock=50,
            color=d.get("color"),
            fabric=d.get("fabric"),
            rating=d.get("rating")
        )
        db.add(p)
    db.commit()
    return {"detail": "Dummy data seeded"}
