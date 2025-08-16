# Coffee Roasting Tracker - Step-by-Step Build Plan

## Phase 1: Foundation & Basic Timer (Days 1-2)
**Goal:** Get a working roast timer - the core functionality

### Step 1.1: Project Setup
- [x] Initialize Reflex project with blank template
- [ ] Set up basic app structure and routing
- [ ] Create main layout with navigation

### Step 1.2: Basic Roast Timer
- [ ] Create timer state (start time, current time, is_running)
- [ ] Build timer display (shows elapsed time in MM:SS format)
- [ ] Add Start/Stop/Reset timer buttons
- [ ] Test timer functionality works correctly

### Step 1.3: Roast Event Logging
- [ ] Add "First Crack" button that logs timestamp
- [ ] Add "End Roast" button that stops timer
- [ ] Display logged events on screen during roast
- [ ] Calculate development time automatically

**Milestone:** You can time a roast and log key events

---

## Phase 2: Data Persistence & Roast Records (Days 3-4)
**Goal:** Save roast data and view simple history

### Step 2.1: Database Setup
- [ ] Set up SQLAlchemy models for roasts table
- [ ] Create database initialization
- [ ] Test database connection

### Step 2.2: Enhanced Roast Logging
- [ ] Add green bean weight input
- [ ] Add roasted bean weight input (post-roast)
- [ ] Calculate extraction percentage automatically
- [ ] Save complete roast record to database

### Step 2.3: Basic Roast History
- [ ] Create roast history page
- [ ] Display all past roasts in a simple table
- [ ] Show: date, green weight, roasted weight, total time, extraction %

**Milestone:** Your roasts are saved permanently and you can review them

---

## Phase 3: Green Bean Inventory (Days 5-6)
**Goal:** Manage your green coffee inventory

### Step 3.1: Bean Inventory Models
- [ ] Create green_beans database table
- [ ] Add fields: name, origin, type, score, purchase_date, quantity
- [ ] Set up relationships between beans and roasts

### Step 3.2: Inventory Management
- [ ] Create "Add Bean" form (name, origin, type, score, quantity)
- [ ] Build inventory list view with all beans
- [ ] Add edit/delete functionality for beans
- [ ] Show remaining quantity for each bean

### Step 3.3: Connect Inventory to Roasting
- [ ] Bean selection dropdown when starting a roast
- [ ] Automatically subtract green weight from inventory
- [ ] Warning when bean quantity gets low

**Milestone:** Complete inventory management integrated with roasting

---

## Phase 4: UI Polish & Mobile Optimization (Days 7-8)
**Goal:** Make it look and feel like a real mobile app

### Step 4.1: Responsive Design
- [ ] Optimize layouts for mobile screens
- [ ] Improve timer display (large, easy to read)
- [ ] Add mobile-friendly navigation
- [ ] Test on actual mobile device

### Step 4.2: Visual Improvements
- [ ] Add a cohesive color scheme
- [ ] Improve typography and spacing
- [ ] Add icons for actions (start, stop, first crack, etc.)
- [ ] Better form styling

### Step 4.3: User Experience
- [ ] Add confirmation dialogs for important actions
- [ ] Improve error handling and validation
- [ ] Add loading states where needed
- [ ] Keyboard shortcuts for common actions

**Milestone:** App looks professional and works great on mobile

---

## Phase 5: Analytics & Advanced Features (Days 9-10)
**Goal:** Add insights and advanced tracking

### Step 5.1: Roast Analytics
- [ ] Create analytics/stats page
- [ ] Show average roast times, extraction percentages
- [ ] Most-used beans, roast frequency
- [ ] Simple charts/graphs of trends over time

### Step 5.2: Enhanced History & Search
- [ ] Add search/filter to roast history
- [ ] Filter by date range, bean type, extraction %
- [ ] Sort by different columns
- [ ] Export data functionality

### Step 5.3: Advanced Timer Features
- [ ] Add cooling timer (separate from roast timer)
- [ ] Roast notes/comments field
- [ ] Environmental tracking (ambient temp, humidity)
- [ ] Roast curve predictions

**Milestone:** Full-featured coffee roasting tracker with insights

---

## Phase 6: Native Mobile App (Days 11-12)
**Goal:** Convert to installable mobile app

### Step 6.1: Capacitor Integration
- [ ] Install and configure Capacitor
- [ ] Create iOS/Android project files
- [ ] Test basic app functionality in mobile environment

### Step 6.2: Mobile-Specific Features
- [ ] Add push notifications for timer alerts
- [ ] Camera integration for bean photos
- [ ] Local storage optimization
- [ ] Offline functionality

### Step 6.3: Distribution
- [ ] Build production apps
- [ ] Install on your devices
- [ ] Performance testing and optimization

**Milestone:** Installable native mobile app ready for daily use

---

## Technical Notes

### Core Technologies
- **Framework:** Reflex (Python)
- **Database:** SQLite (built into Reflex)
- **Mobile:** Capacitor for native app conversion
- **Charts:** Reflex built-in chart components

### Key State Management
```python
class RoastState(rx.State):
    # Timer
    start_time: datetime = None
    current_time: datetime = None
    is_roasting: bool = False
    
    # Events
    first_crack_time: datetime = None
    end_time: datetime = None
    
    # Weights
    green_weight: float = 0.0
    roasted_weight: float = 0.0
```

### Database Schema Preview
```sql
-- Green beans inventory
green_beans: id, name, origin, type, score, purchase_date, quantity

-- Roast records  
roasts: id, bean_id, green_weight, roasted_weight, start_time, 
        first_crack_time, end_time, extraction_percentage, notes
```

---

## Development Tips

1. **Start Simple:** Get the timer working first - everything else builds on this
2. **Test Frequently:** Use `uv run reflex run` often to see your progress
3. **Mobile First:** Test on your phone regularly, not just desktop
4. **Iterate:** Each phase should result in a working app you could actually use

**Estimated Timeline:** 12 days for full app, but you'll have a usable roast timer after just 2 days!

Ready to start with Phase 1? 🚀