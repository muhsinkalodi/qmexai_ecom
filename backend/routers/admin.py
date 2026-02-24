from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from fastapi.responses import Response
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

import models, schemas, database
from routers.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])

@router.get("/orders", response_model=List[schemas.OrderResponse])
def get_all_orders(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return orders

@router.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def view_order(order_id: int, db: Session = Depends(database.get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Automatically trigger 'Processing' status when an admin views the order
    if order.status == "Pending":
        order.status = "Processing"
        db.commit()
        db.refresh(order)
        
    return order

@router.get("/orders/{order_id}/invoice", response_class=Response)
def generate_invoice(order_id: int, db: Session = Depends(database.get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    p.setFont("Helvetica-Bold", 20)
    p.drawString(50, 750, "INVOICE")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, 720, f"Order ID: {order.id}")
    p.drawString(50, 700, f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
    p.drawString(50, 680, f"Status: {order.status}")
    p.drawString(50, 660, f"Customer Email: {order.user.email}")
    
    y = 620
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Item")
    p.drawString(300, y, "Qty")
    p.drawString(400, y, "Price")
    p.drawString(500, y, "Total")
    
    y -= 20
    p.setFont("Helvetica", 12)
    for item in order.items:
        p.drawString(50, y, item.product.name)
        p.drawString(300, y, str(item.quantity))
        p.drawString(400, y, f"${item.price:.2f}")
        p.drawString(500, y, f"${(item.price * item.quantity):.2f}")
        y -= 20
        
    y -= 20
    p.setFont("Helvetica-Bold", 14)
    p.drawString(400, y, "Total Amount:")
    p.drawString(500, y, f"${order.total_amount:.2f}")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    headers = {
        'Content-Disposition': f'attachment; filename="invoice_{order.id}.pdf"'
    }
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

@router.get("/stats", response_model=schemas.RevenueStats)
def get_admin_stats(db: Session = Depends(database.get_db)):
    total_sales = db.query(func.sum(models.Order.total_amount)).scalar() or 0.0
    order_count = db.query(models.Order).count()
    
    # Aggregate status counts
    status_query = db.query(models.Order.status, func.count(models.Order.id)).group_by(models.Order.status).all()
    status_counts = {status: count for status, count in status_query}
    
    return schemas.RevenueStats(total_sales=total_sales, order_count=order_count, status_counts=status_counts)
