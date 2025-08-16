"""Coffee Roasting Tracker - Main application file"""
import reflex as rx
from rxconfig import config

# Import pages
from roasted.pages.timer import timer_page
from roasted.pages.history import history_page
from roasted.pages.inventory import inventory_page

# Import models to ensure they're registered
from roasted.models.database import GreenBean, Roast

# Import state
from roasted.state.app_state import AppState

# Import components to ensure they're available
from roasted.components import navbar

# Create the app with mobile-optimized configuration
app = rx.App(
    # Global styles for mobile optimization
    stylesheets=[
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    ],
    theme=rx.theme(
    appearance="dark",
    has_background=True,
    radius="large",  # More modern rounded corners
    scaling="100%",
    accent_color="blue",  # Modern blue accent
    )
)

# Add pages with routes
app.add_page(
    inventory_page,
    route="/",
    title="Roasted - Inventory"
)
app.add_page(
    timer_page,
    route="/timer",
    title="Roasted - Timer"
)

app.add_page(
    history_page,
    route="/history",
    title="Roasted - History"
)
