"""Timer page for the coffee roasting tracker"""
import reflex as rx
from roasted.components.navbar import page_layout
from roasted.state.app_state import AppState


def timer_display() -> rx.Component:
    """Large timer display showing elapsed time"""
    return rx.box(
        rx.heading(
            AppState.formatted_total_time,
            size="9",
            text_align="center",
            color=AppState.timer_display_color
        ),
        rx.text(
            AppState.phase_description,
            text_align="center",
            color="gray"
        ),
        padding="2rem",
        border="2px solid #e2e8f0",
        border_radius="1rem",
        background="#1f2937",  # Dark background so colored text is visible
        width="100%",
        text_align="center",
    )


def timer_controls() -> rx.Component:
    """Control buttons for the roasting process"""
    return rx.vstack(
        rx.button(
            "Start Roast",
            size="4",
            color_scheme="green",
            width="100%",
            on_click=AppState.start_roast,
            disabled=AppState.roast_phase != "ready"
        ),
        rx.button(
            "First Crack",
            size="3",
            color_scheme="orange",
            disabled=(AppState.roast_phase != "roasting") | AppState.first_crack_logged,
            width="100%",
            on_click=AppState.log_first_crack
        ),
        rx.button(
            "End Roast",
            size="3",
            color_scheme="red",
            disabled=AppState.roast_phase != "roasting",
            width="100%",
            on_click=AppState.end_roast
        ),
        spacing="2",
        width="100%",
    )


def roast_events() -> rx.Component:
    """Display logged events during the roast"""
    return rx.box(
        rx.heading("Roast Events", size="4", margin_bottom="1rem"),
        rx.cond(
            AppState.roast_events.length() > 0,
            rx.vstack(
                rx.foreach(
                    AppState.roast_events,
                    lambda event: rx.hstack(
                        rx.text(event["name"], font_weight="bold"),
                        rx.spacer(),
                        rx.text(event["elapsed"], color="white"),
                        width="100%",
                        justify="between"
                    )
                ),
                spacing="2",
                width="100%"
            ),
            rx.text("No events yet - start a roast!", color="gray")
        ),
        rx.cond(
            AppState.roast_phase != "ready",
            rx.hstack(
                rx.button(
                    "Reset",
                    size="2",
                    color_scheme="gray",
                    on_click=AppState.reset_roast,
                    margin_top="1rem"
                ),
                rx.cond(
                    AppState.roast_phase == "cooling",
                    rx.button(
                        "End Cooling",
                        size="2",
                        color_scheme="blue",
                        on_click=AppState.end_cooling,
                        margin_top="1rem"
                    )
                ),
                spacing="2"
            )
        ),
        padding="1rem",
        border="1px solid #e2e8f0",
        border_radius="0.5rem",
        background="#1f2937",
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
