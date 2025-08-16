"""Database models for the coffee roasting tracker"""
import reflex as rx
from datetime import datetime
from typing import Optional


class GreenBean(rx.Model, table=True):
    """Green coffee bean inventory model"""

    # Required fields
    name: str
    origin: str

    # Optional fields with defaults
    variety: str = "Unknown"
    process: str = "Unknown"
    cupping_score: Optional[float] = None
    quantity_pounds: float = 0.0
    cost_per_pound: Optional[float] = None
    supplier: Optional[str] = None
    notes: Optional[str] = None

    # Timestamp fields
    purchase_date: datetime
    created_at: datetime


class Roast(rx.Model, table=True):
    """Individual roast record model"""

    # Foreign key - reference to GreenBean
    bean_id: int

    # Required timing fields
    roast_date: datetime
    start_time: datetime
    end_time: datetime
    green_weight_grams: float
    roasted_weight_grams: float

    # Optional timing fields
    first_crack_time: Optional[datetime] = None
    development_start_time: Optional[datetime] = None
    cooling_start_time: Optional[datetime] = None
    cooling_end_time: Optional[datetime] = None

    # Optional environmental conditions
    ambient_temp_f: Optional[float] = None
    humidity_percent: Optional[float] = None

    # Optional roast profile data
    drop_temp_f: Optional[float] = None
    first_crack_temp_f: Optional[float] = None
    end_temp_f: Optional[float] = None

    # Optional notes and rating
    notes: Optional[str] = None
    personal_rating: Optional[int] = None

    # Timestamp field
    created_at: datetime

    @property
    def total_roast_time_seconds(self) -> int:
        """Calculate total roast time in seconds"""
        if self.start_time and self.end_time:
            return int((self.end_time - self.start_time).total_seconds())
        return 0

    @property
    def development_time_seconds(self) -> int:
        """Calculate development time (first crack to end)"""
        if self.first_crack_time and self.end_time:
            return int((self.end_time - self.first_crack_time).total_seconds())
        return 0

    @property
    def weight_loss_percent(self) -> float:
        """Calculate weight loss percentage"""
        if self.green_weight_grams > 0:
            return ((self.green_weight_grams - self.roasted_weight_grams) / self.green_weight_grams) * 100
        return 0.0

    @property
    def development_ratio_percent(self) -> float:
        """Calculate development time as percentage of total roast"""
        total_time = self.total_roast_time_seconds
        dev_time = self.development_time_seconds
        if total_time > 0:
            return (dev_time / total_time) * 100
        return 0.0
