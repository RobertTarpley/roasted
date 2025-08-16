"""Inventory page for managing green bean stock"""
import reflex as rx
from roasted.components.navbar import page_layout
from roasted.state.app_state import AppState


def inventory_header() -> rx.Component:
    """Header with title and add bean button"""
    return rx.hstack(
        rx.heading("Green Bean Inventory", size="7"),
        rx.button(
            "Add Bean",
            size="2",
            color_scheme="blue",
            variant="solid",
            # We'll add modal functionality later
        ),
        justify="between",
        align="center",
        width="100%",
        margin_bottom="2rem",
    )


def inventory_placeholder() -> rx.Component:
    """Placeholder for when no beans exist"""
    return rx.box(
        rx.text("No green beans in inventory!", text_align="center", color="gray"),
        rx.text("Add your first batch of green beans to get started.", text_align="center", color="gray", size="2"),
        padding="2rem",
        border="2px dashed #e2e8f0",
        border_radius="1rem",
        text_align="center",
        width="100%",
    )


def inventory_page() -> rx.Component:
    """Green bean inventory page"""
    return page_layout(
        rx.vstack(
            inventory_header(),
            inventory_placeholder(),
            spacing="4",
            width="100%",
        )
    )
