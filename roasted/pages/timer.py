"""Timer page for the coffee roasting tracker"""
import reflex as rx
from roasted.components.navbar import page_layout
from roasted.state.app_state import AppState


def timer_display() -> rx.Component:
    """Large timer display showing total time and active lap timer"""
    return rx.vstack(
        # Main total timer
        rx.box(
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
            background="#1f2937",
            width="100%",
            text_align="center",
        ),
        # Lap timers display
        rx.cond(
            AppState.roast_phase != "ready",
            rx.hstack(
                # Development timer (First Crack to End Roast)
                rx.cond(
                    AppState.first_crack_logged,
                    rx.box(
                        rx.text("Development", size="1", color="gray", text_align="center"),
                        rx.text(
                            AppState.formatted_development_time,
                            size="4",
                            font_weight="bold",
                            text_align="center",
                            color=rx.cond(
                                AppState.roast_phase == "roasting",
                                "#f97316",  # Orange when active
                                "white"
                            )
                        ),
                        padding="1rem",
                        border="1px solid #374151",
                        border_radius="0.5rem",
                        background="#111827",
                        flex="1",
                        text_align="center"
                    )
                ),
                # Cooling timer (End Roast to End Cooling)
                rx.cond(
                    AppState.roast_phase == "cooling",
                    rx.box(
                        rx.text("Cooling", size="1", color="gray", text_align="center"),
                        rx.text(
                            AppState.formatted_cooling_time,
                            size="4",
                            font_weight="bold",
                            text_align="center",
                            color="#06b6d4"  # Cyan when active
                        ),
                        padding="1rem",
                        border="1px solid #374151",
                        border_radius="0.5rem",
                        background="#111827",
                        flex="1",
                        text_align="center"
                    )
                ),
                spacing="3",
                width="100%"
            )
        ),
        spacing="3",
        width="100%"
    )


def timer_status() -> rx.Component:
    """Show active timer status indicators"""
    return rx.cond(
        AppState.roast_phase != "ready",
        rx.box(
            rx.heading("Active Timers", size="3", margin_bottom="1rem"),
            rx.vstack(
                # Total timer - always active during roast
                rx.hstack(
                    rx.box(
                        width="8px",
                        height="8px",
                        border_radius="50%",
                        background=AppState.timer_display_color
                    ),
                    rx.text("Total Roast Time", font_weight="medium"),
                    rx.spacer(),
                    rx.text("Running", color="green", font_size="sm"),
                    width="100%",
                    align_items="center"
                ),
                # Development timer indicator
                rx.cond(
                    AppState.first_crack_logged & (AppState.roast_phase == "roasting"),
                    rx.hstack(
                        rx.box(
                            width="8px",
                            height="8px",
                            border_radius="50%",
                            background="#f97316"
                        ),
                        rx.text("Development Timer", font_weight="medium"),
                        rx.spacer(),
                        rx.text("Active", color="#f97316", font_size="sm"),
                        width="100%",
                        align_items="center"
                    )
                ),
                # Cooling timer indicator
                rx.cond(
                    AppState.roast_phase == "cooling",
                    rx.hstack(
                        rx.box(
                            width="8px",
                            height="8px",
                            border_radius="50%",
                            background="#06b6d4"
                        ),
                        rx.text("Cooling Timer", font_weight="medium"),
                        rx.spacer(),
                        rx.text("Active", color="#06b6d4", font_size="sm"),
                        width="100%",
                        align_items="center"
                    )
                ),
                spacing="2",
                width="100%"
            ),
            padding="1rem",
            border="1px solid #374151",
            border_radius="0.5rem",
            background="#111827",
            margin_bottom="2rem"
        )
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
                    lambda event: rx.vstack(
                        rx.hstack(
                            rx.text(event["name"], font_weight="bold"),
                            rx.spacer(),
                            rx.text(event["elapsed"], color="white"),
                            width="100%",
                            justify="between"
                        ),
                        # Show lap time if available
                        rx.cond(
                            event.contains("lap"),
                            rx.hstack(
                                rx.text("↳ Lap time:", color="gray", font_size="sm"),
                                rx.spacer(),
                                rx.text(event["lap"], color="#22c55e", font_size="sm", font_weight="bold"),
                                width="100%",
                                justify="between",
                                padding_left="1rem"
                            )
                        ),
                        spacing="1",
                        width="100%"
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
            timer_status(),
            timer_controls(),
            roast_events(),
            spacing="4",
            width="100%",
        )
    )
