"""History page for viewing past roasts"""
import reflex as rx
from roasted.components.navbar import page_layout
from roasted.state.app_state import AppState  # will be used to fetch history


def history_placeholder() -> rx.Component:
    """Placeholder for when no roasts exist"""
    return rx.box(
        rx.vstack(
            # Modern icon
            rx.text("📊", font_size="3rem", margin_bottom="1rem"),

            # Updated text with white color for dark theme
            rx.text(
                "No roasts recorded yet!",
                text_align="center",
                color="white",
                font_size="1.2rem",
                font_weight="600"
            ),
            rx.text(
                "Complete your first roast to see it here.",
                text_align="center",
                color="var(--gray-9)",  # Lighter grey for secondary text
                size="3"
            ),

            # Call to action
            rx.link(
                rx.button(
                    "Start Your First Roast",
                    size="3",
                    color_scheme="blue",
                    variant="solid",
                    margin_top="1rem"
                ),
                href="/timer"
            ),

            align="center",
            spacing="3",
        ),

        # Modern dark theme styling
        padding="3rem 2rem",
        border="2px dashed var(--gray-6)",
        border_radius="1rem",
        text_align="center",
        width="100%",
        background="var(--gray-2)",
    )


def history_stats_preview() -> rx.Component:
    """Preview stats for when we have data later"""
    return rx.hstack(
        rx.box(
            rx.text("Total Roasts", color="var(--gray-9)", size="2"),
            rx.text("0", color="white", font_size="1.5rem", font_weight="bold"),
            text_align="center",
            padding="1rem",
            background="var(--gray-3)",
            border_radius="0.5rem",
            width="100%",
        ),
        rx.box(
            rx.text("Avg Weight Loss", color="var(--gray-9)", size="2"),
            rx.text("-%", color="white", font_size="1.5rem", font_weight="bold"),
            text_align="center",
            padding="1rem",
            background="var(--gray-3)",
            border_radius="0.5rem",
            width="100%",
        ),
        rx.box(
            rx.text("Favorite Bean", color="var(--gray-9)", size="2"),
            rx.text("-", color="white", font_size="1.5rem", font_weight="bold"),
            text_align="center",
            padding="1rem",
            background="var(--gray-3)",
            border_radius="0.5rem",
            width="100%",
        ),
        spacing="3",
        width="100%",
        margin_bottom="2rem",
    )


def history_page() -> rx.Component:
    """Roast history page"""
    return page_layout(
        rx.vstack(
            # Page header with modern styling
            rx.heading(
                "Roast History",
                size="7",
                color="white",
                margin_bottom="2rem"
            ),

            # Stats preview (will show real data later)
            history_stats_preview(),

            # Placeholder content
            history_placeholder(),

            spacing="4",
            width="100%",
        )
    )
