from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255))
    equipment_type = Column(String(100))
    manufacturer = Column(String(255))
    model = Column(String(255))
    serial_number = Column(String(255))
    installation_date = Column(DateTime)
    last_maintenance = Column(DateTime)
    next_maintenance = Column(DateTime)
    status = Column(String(50), default="operational")  # operational, maintenance, out_of_service
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    maintenance_tasks = relationship("MaintenanceTask", back_populates="equipment")
    photos = relationship("EquipmentPhoto", back_populates="equipment")

class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    status = Column(String(20), default="pending")  # pending, in_progress, completed, cancelled
    assigned_to = Column(String(255))
    due_date = Column(DateTime)
    completed_date = Column(DateTime)
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    cost = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    equipment = relationship("Equipment", back_populates="maintenance_tasks")
    photos = relationship("TaskPhoto", back_populates="task")

class EquipmentPhoto(Base):
    __tablename__ = "equipment_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    description = Column(Text)
    ai_analysis = Column(Text)  # Store AI analysis results
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    equipment = relationship("Equipment", back_populates="photos")

class TaskPhoto(Base):
    __tablename__ = "task_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    description = Column(Text)
    ai_analysis = Column(Text)  # Store AI analysis results
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    task = relationship("MaintenanceTask", back_populates="photos")

class ShoppingItem(Base):
    __tablename__ = "shopping_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    quantity = Column(Integer, default=1)
    priority = Column(String(20), default="medium")  # low, medium, high
    status = Column(String(20), default="pending")  # pending, purchased, cancelled
    estimated_cost = Column(Float)
    actual_cost = Column(Float)
    supplier = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 