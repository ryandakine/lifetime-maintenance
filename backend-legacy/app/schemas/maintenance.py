from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Equipment Schemas
class EquipmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = None
    equipment_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    installation_date: Optional[datetime] = None
    last_maintenance: Optional[datetime] = None
    next_maintenance: Optional[datetime] = None
    status: str = "operational"
    notes: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    equipment_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    installation_date: Optional[datetime] = None
    last_maintenance: Optional[datetime] = None
    next_maintenance: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Equipment(EquipmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Maintenance Task Schemas
class MaintenanceTaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    equipment_id: Optional[int] = None
    priority: str = "medium"
    status: str = "pending"
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    cost: Optional[float] = None

class MaintenanceTaskCreate(MaintenanceTaskBase):
    pass

class MaintenanceTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    equipment_id: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    cost: Optional[float] = None

class MaintenanceTask(MaintenanceTaskBase):
    id: int
    completed_date: Optional[datetime] = None
    actual_hours: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Photo Schemas
class PhotoBase(BaseModel):
    description: Optional[str] = None
    ai_analysis: Optional[str] = None

class EquipmentPhotoCreate(PhotoBase):
    equipment_id: int
    filename: str
    file_path: str

class TaskPhotoCreate(PhotoBase):
    task_id: int
    filename: str
    file_path: str

class Photo(PhotoBase):
    id: int
    filename: str
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Shopping Item Schemas
class ShoppingItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    quantity: int = 1
    priority: str = "medium"
    status: str = "pending"
    estimated_cost: Optional[float] = None
    supplier: Optional[str] = None
    notes: Optional[str] = None

class ShoppingItemCreate(ShoppingItemBase):
    pass

class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    supplier: Optional[str] = None
    notes: Optional[str] = None

class ShoppingItem(ShoppingItemBase):
    id: int
    actual_cost: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# AI Analysis Schemas
class AIAnalysisRequest(BaseModel):
    image_description: str
    context: Optional[str] = None
    analysis_type: str = "maintenance"  # maintenance, safety, inspection

class AIAnalysisResponse(BaseModel):
    analysis: str
    recommendations: List[str]
    priority: str
    confidence: float
    processing_time: float 