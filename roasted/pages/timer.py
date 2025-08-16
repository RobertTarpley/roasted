"""Timer page for the coffee roasting tracker"""
import reflex as rx
from roasted.components.navbar import page_layout
from roasted.state.app_state import AppState # Will be used when we add timer functionality


def timer_display() -> rx.Component:
    """Large timer display showing elapsed time"""
    return rx.box(
        rx.heading("00:00", size="9", text_align="center"),
        rx.text("Ready to start roasting", text_align="center", color="gray"),
        padding="2rem",
        border="2px solid #e2e8f0",
        border_radius="1rem",
        background="white",
        width="100%",
        text_align="center",
    )


def timer_controls() -> rx.Component:
    """Control buttons for the roasting process"""
    return rx.hstack(
        rx.button(
            "Start Roast",
            size="3",
            color_scheme="blue",
            variant="solid",
            # We'll add the actual timer logic in the next step
        ),
        rx.button(
            "First Crack",
            size="3",
            color_scheme="orange",
            disabled=True,  # Enabled when roasting
            width="100%",
        ),
        rx.button(
            "End Roast",
            size="3",
            color_scheme="red",
            disabled=True,  # Enabled when roasting
            width="100%",
        ),
        spacing="2",
        width="100%",
    )


def roast_events() -> rx.Component:
    """Display logged events during the roast"""
    return rx.box(
        rx.heading("Roast Events", size="4", margin_bottom="1rem"),
        rx.text("No events yet - start a roast!", color="gray"),
        padding="1rem",
        border="1px solid #e2e8f0",
        border_radius="0.5rem",
        background="white",
        width="100%",
        margin_top="2rem",
    )


def timer_page() -> rx.Component:
    """Main roasting timer page"""
    return page_layout(
        rx.vstack(
            rx.heading("Roast Timer", size="7", margin_bottom="2rem"),
            timer_display(),
            timer_controls(),
            roast_events(),
            spacing="4",
            width="100%",
        )
    )
