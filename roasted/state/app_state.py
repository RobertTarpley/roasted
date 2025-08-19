"""Centralized state management for the coffee roasting tracker"""
import reflex as rx
import asyncio
from datetime import datetime
from typing import Optional, List


class RoastEvent:
    """Simple class to track roast events"""
    def __init__(self, name: str, time: datetime, elapsed_seconds: int, lap_seconds: Optional[int] = None):
        self.name = name
        self.time = time
        self.elapsed_seconds = elapsed_seconds
        self.lap_seconds = lap_seconds

    def to_dict(self):
        result = {
            "name": self.name,
            "time": self.time.strftime("%H:%M:%S"),
            "elapsed": f"{self.elapsed_seconds // 60:02d}:{self.elapsed_seconds % 60:02d}"
        }
        if self.lap_seconds is not None:
            result["lap"] = f"{self.lap_seconds // 60:02d}:{self.lap_seconds % 60:02d}"
        return result


class AppState(rx.State):
    """Main application state"""

    # Navigation state
    current_page: str = "timer"

    # Overall timer state
    is_active: bool = False  # True from start until cooling ends
    start_time: Optional[datetime] = None
    total_elapsed_seconds: int = 0

    # Roast phase tracking
    roast_phase: str = "ready"  # "ready", "roasting", "cooling", "complete"

    # Development timer (first crack to roast end)
    development_start_time: Optional[datetime] = None
    development_elapsed_seconds: int = 0

    # Cooling timer (roast end to cooling complete)
    cooling_start_time: Optional[datetime] = None
    cooling_elapsed_seconds: int = 0

    # Event tracking
    roast_events: list[dict] = []
    first_crack_logged: bool = False

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

    @rx.var
    def formatted_total_time(self) -> str:
        """Format total elapsed time as MM:SS"""
        minutes = self.total_elapsed_seconds // 60
        seconds = self.total_elapsed_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"

    @rx.var
    def formatted_development_time(self) -> str:
        """Format development lap time as MM:SS"""
        minutes = self.development_elapsed_seconds // 60
        seconds = self.development_elapsed_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"

    @rx.var
    def formatted_cooling_time(self) -> str:
        """Format cooling lap time as MM:SS"""
        minutes = self.cooling_elapsed_seconds // 60
        seconds = self.cooling_elapsed_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"

    @rx.var
    def timer_display_color(self) -> str:
        """Change timer color based on phase"""
        if self.roast_phase == "roasting":
            return "#f97316"  # Orange when roasting
        elif self.roast_phase == "cooling":
            return "#06b6d4"  # Cyan when cooling
        elif self.roast_phase == "complete":
            return "#22c55e"  # Green when complete
        return "white"  # White when ready

    @rx.var
    def phase_description(self) -> str:
        """Describe current roasting phase"""
        if self.roast_phase == "ready":
            return "Ready to start roasting"
        elif self.roast_phase == "roasting":
            return "🔥 Roasting in progress..."
        elif self.roast_phase == "cooling":
            return "❄️ Cooling beans..."
        elif self.roast_phase == "complete":
            return "✅ Roast complete!"
        return ""

    def start_roast(self):
        """Start the overall roast timer"""
        if self.roast_phase == "ready":
            self.start_time = datetime.now()
            self.is_active = True
            self.roast_phase = "roasting"
            self.total_elapsed_seconds = 0
            self.development_elapsed_seconds = 0
            self.cooling_elapsed_seconds = 0
            self.roast_events = []
            self.first_crack_logged = False
            # Start the timer update loop
            yield AppState.update_timer

    def log_first_crack(self):
        """Log first crack and start development timer"""
        if self.roast_phase == "roasting" and not self.first_crack_logged:
            # Log the first crack event
            event = RoastEvent("First Crack", datetime.now(), self.total_elapsed_seconds)
            self.roast_events.append(event.to_dict())
            self.first_crack_logged = True

            # Start development timer (lap timer)
            self.development_start_time = datetime.now()
            self.development_elapsed_seconds = 0

    def end_roast(self):
        """End roasting phase and start cooling"""
        if self.roast_phase == "roasting":
            # Log development time if first crack was logged
            if self.first_crack_logged:
                event = RoastEvent(
                    "Development Complete",
                    datetime.now(),
                    self.total_elapsed_seconds,
                    self.development_elapsed_seconds
                )
                self.roast_events.append(event.to_dict())

            # Log roast end and start cooling
            event = RoastEvent("Beans to Cooler", datetime.now(), self.total_elapsed_seconds)
            self.roast_events.append(event.to_dict())

            # Switch to cooling phase
            self.roast_phase = "cooling"
            self.cooling_start_time = datetime.now()
            self.cooling_elapsed_seconds = 0

    def end_cooling(self):
        """End cooling phase and complete roast"""
        if self.roast_phase == "cooling":
            # Log cooling completion
            event = RoastEvent(
                "Cooling Complete",
                datetime.now(),
                self.total_elapsed_seconds,
                self.cooling_elapsed_seconds
            )
            self.roast_events.append(event.to_dict())

            # Complete the roast
            self.roast_phase = "complete"
            self.is_active = False

    def reset_roast(self):
        """Reset everything back to ready state"""
        self.is_active = False
        self.roast_phase = "ready"
        self.start_time = None
        self.development_start_time = None
        self.cooling_start_time = None
        self.total_elapsed_seconds = 0
        self.development_elapsed_seconds = 0
        self.cooling_elapsed_seconds = 0
        self.roast_events = []
        self.first_crack_logged = False


    @rx.event(background=True)
    async def update_timer(self):
        """Update all active timers every second"""
        while self.is_active and self.start_time:
            await asyncio.sleep(1)
            
            async with self:  # Required pattern for background tasks
                if not self.is_active or not self.start_time:
                    break

                # Always update total time
                if self.start_time:
                    elapsed = datetime.now() - self.start_time
                    self.total_elapsed_seconds = int(elapsed.total_seconds())

                # Update development timer if active
                if self.development_start_time and self.roast_phase == "roasting":
                    dev_elapsed = datetime.now() - self.development_start_time
                    self.development_elapsed_seconds = int(dev_elapsed.total_seconds())

                # Update cooling timer if active
                if self.cooling_start_time and self.roast_phase == "cooling":
                    cool_elapsed = datetime.now() - self.cooling_start_time
                    self.cooling_elapsed_seconds = int(cool_elapsed.total_seconds())
