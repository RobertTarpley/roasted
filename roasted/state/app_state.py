"""Centralized state management for the coffee roasting tracker"""
import reflex as rx
from datetime import datetime
from typing import Optional


class AppState(rx.State):
    """Main application state"""

    # Navigation state
    current_page: str = "timer"

    # Timer state
    is_roasting: bool = False
    start_time: Optional[datetime] = None
    current_time: Optional[datetime] = None
    elapsed_seconds: int = 0

    # Roast event state
    first_crack_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    # Roast data state
    green_weight: float = 0.0
    roasted_weight: float = 0.0
    selected_bean_id: Optional[int] = None
    roast_notes: str = ""

    # UI state
    show_add_bean_modal: bool = False
    loading: bool = False

    def set_current_page(self, page: str):
        """Update current page for navigation highlighting"""
        self.current_page = page
