from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/checkout", response_model=schemas.OrderResponse)
def checkout(request: schemas.CheckoutRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    items = request.items
    if not items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")
    
    total_amount = 0.0
    order_items = []
    
    for item in items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for product {product.name}")
        
        # Dummy payment gateway here: we just assume payment is successful and deduct stock.
        product.stock -= item.quantity
        
        price = product.discount_price * item.quantity
        total_amount += price
        
        order_item = models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=product.discount_price
        )
        order_items.append(order_item)
    
    new_order = models.Order(
        user_id=current_user.id, 
        total_amount=total_amount, 
        status="Pending",
        shipping_address=request.shipping_address
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    for order_item in order_items:
        order_item.order_id = new_order.id
        db.add(order_item)
    
    db.commit()
    db.refresh(new_order)
    
    return new_order

@router.get("/my-orders", response_model=List[schemas.OrderResponse])
def get_my_orders(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return order
