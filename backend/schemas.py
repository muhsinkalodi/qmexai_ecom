from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool

class TokenData(BaseModel):
    email: Optional[str] = None

class ProductBase(BaseModel):
    name: str
    description: str
    color: Optional[str] = None
    fabric: Optional[str] = None
    rating: Optional[float] = 0.0
    category: str
    tags: Optional[str] = None
    mrp: float
    discount_percentage: float = 0.0
    discount_price: float
    photos: List[str] = []
    stock: int

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        orm_mode = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class CheckoutRequest(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str

class OrderItemResponse(OrderItemBase):
    id: int
    price: float
    product: ProductResponse

    class Config:
        orm_mode = True

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    shipping_address: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True

class RevenueStats(BaseModel):
    total_sales: float
    order_count: int
    status_counts: Dict[str, int] = {}
