from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models.maintenance import Equipment, MaintenanceTask, EquipmentPhoto, TaskPhoto, ShoppingItem
from app.schemas.maintenance import (
    EquipmentCreate, EquipmentUpdate, Equipment as EquipmentSchema,
    MaintenanceTaskCreate, MaintenanceTaskUpdate, MaintenanceTask as MaintenanceTaskSchema,
    ShoppingItemCreate, ShoppingItemUpdate, ShoppingItem as ShoppingItemSchema,
    AIAnalysisRequest, AIAnalysisResponse
)
from app.services.ai_service import ai_service
from app.core.config import settings

router = APIRouter()

# Equipment endpoints
@router.get("/equipment/", response_model=List[EquipmentSchema])
def get_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all equipment"""
    equipment = db.query(Equipment).offset(skip).limit(limit).all()
    return equipment

@router.post("/equipment/", response_model=EquipmentSchema)
def create_equipment(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    """Create new equipment"""
    db_equipment = Equipment(**equipment.dict())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.get("/equipment/{equipment_id}", response_model=EquipmentSchema)
def get_equipment_by_id(equipment_id: int, db: Session = Depends(get_db)):
    """Get equipment by ID"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.put("/equipment/{equipment_id}", response_model=EquipmentSchema)
def update_equipment(equipment_id: int, equipment: EquipmentUpdate, db: Session = Depends(get_db)):
    """Update equipment"""
    db_equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    for field, value in equipment.dict(exclude_unset=True).items():
        setattr(db_equipment, field, value)
    
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

# Maintenance tasks endpoints
@router.get("/tasks/", response_model=List[MaintenanceTaskSchema])
def get_maintenance_tasks(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get maintenance tasks with optional filtering"""
    query = db.query(MaintenanceTask)
    
    if status:
        query = query.filter(MaintenanceTask.status == status)
    if priority:
        query = query.filter(MaintenanceTask.priority == priority)
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.post("/tasks/", response_model=MaintenanceTaskSchema)
def create_maintenance_task(task: MaintenanceTaskCreate, db: Session = Depends(get_db)):
    """Create new maintenance task"""
    db_task = MaintenanceTask(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/tasks/{task_id}", response_model=MaintenanceTaskSchema)
def get_maintenance_task(task_id: int, db: Session = Depends(get_db)):
    """Get maintenance task by ID"""
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    return task

@router.put("/tasks/{task_id}", response_model=MaintenanceTaskSchema)
def update_maintenance_task(task_id: int, task: MaintenanceTaskUpdate, db: Session = Depends(get_db)):
    """Update maintenance task"""
    db_task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    
    for field, value in task.dict(exclude_unset=True).items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

# Photo upload and AI analysis endpoints
@router.post("/analyze-image/", response_model=AIAnalysisResponse)
async def analyze_image(request: AIAnalysisRequest):
    """Analyze image description using AI"""
    result = await ai_service.analyze_image(
        image_description=request.image_description,
        context=request.context or "",
        analysis_type=request.analysis_type
    )
    
    return AIAnalysisResponse(
        analysis=result["analysis"],
        recommendations=result["recommendations"],
        priority=result["priority"],
        confidence=result["confidence"],
        processing_time=result["processing_time"]
    )

@router.post("/upload-equipment-photo/")
async def upload_equipment_photo(
    equipment_id: int = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload photo for equipment with AI analysis"""
    # Verify equipment exists
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"equipment_{equipment_id}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Analyze with AI
    ai_result = await ai_service.analyze_image(
        image_description=f"Equipment photo: {description}",
        context=f"Equipment: {equipment.name} at {equipment.location}",
        analysis_type="maintenance"
    )
    
    # Save to database
    photo = EquipmentPhoto(
        equipment_id=equipment_id,
        filename=filename,
        file_path=file_path,
        description=description,
        ai_analysis=ai_result["analysis"]
    )
    
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    return {
        "photo_id": photo.id,
        "filename": filename,
        "ai_analysis": ai_result,
        "message": "Photo uploaded and analyzed successfully"
    }

# Shopping list endpoints
@router.get("/shopping/", response_model=List[ShoppingItemSchema])
def get_shopping_items(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get shopping items"""
    query = db.query(ShoppingItem)
    
    if status:
        query = query.filter(ShoppingItem.status == status)
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.post("/shopping/", response_model=ShoppingItemSchema)
def create_shopping_item(item: ShoppingItemCreate, db: Session = Depends(get_db)):
    """Create new shopping item"""
    db_item = ShoppingItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/shopping/{item_id}", response_model=ShoppingItemSchema)
def update_shopping_item(item_id: int, item: ShoppingItemUpdate, db: Session = Depends(get_db)):
    """Update shopping item"""
    db_item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    
    for field, value in item.dict(exclude_unset=True).items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

# Email generation endpoint
@router.post("/generate-email/")
async def generate_email(
    topic: str = Form(...),
    recipient: str = Form(...),
    urgency: str = Form("normal")
):
    """Generate email content using AI"""
    result = await ai_service.generate_email_content(
        topic=topic,
        recipient=recipient,
        urgency=urgency
    )
    
    return {
        "email_content": result["email_content"],
        "processing_time": result["processing_time"],
        "recipient": result["recipient"],
        "urgency": result["urgency"]
    } 