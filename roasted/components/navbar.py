"""Navigation bar component for the coffee roasting tracker"""
import reflex as rx


def navbar() -> rx.Component:
    """Mobile-friendly navigation bar"""
    return rx.box(
        rx.hstack(
            # App title/logo
            rx.heading("⚡ Roasted", size="6", color="white"),

            # Navigation tabs - simple, no conditionals
            rx.hstack(
                rx.link(
                    rx.button("Inventory", size="2", variant="soft"),
                    href="/",
                ),
                rx.link(
                    rx.button("Timer", size="2", variant="soft"),
                    href="/timer",
                ),
                rx.link(
                    rx.button("History", size="2", variant="soft"),
                    href="/history",
                ),
                spacing="3",
            ),

            justify="between",
            align="center",
            width="100%",
        ),

        # Styling for mobile-first navbar
        padding="1rem",
        border_bottom="1px solid var(--gray-6)",
        background="var(--gray-2)",
        position="sticky",
        top="0",
        z_index="1000",
        width="100%",
    )


def page_layout(content: rx.Component) -> rx.Component:
    """Layout wrapper for all pages"""
    return rx.box(
        navbar(),
        rx.container(
            content,
            padding="1rem",
            max_width="800px",  # Good for mobile and desktop
            margin="0 auto",
        ),
        min_height="100vh",
        background="var(--gray-1)",
    )
