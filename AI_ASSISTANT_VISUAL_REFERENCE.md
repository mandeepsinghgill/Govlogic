# 🎨 AI Assistant - Visual Reference

## Where to Find It

The AI Assistant is located in the **sidebar navigation**, right above the "Bid Workspace" section.

---

## Sidebar Views

### Expanded Sidebar (shows text):

```
┌─────────────────────────────────┐
│                                  │
│  [☰] 🟦 GovLogicAI              │
│                                  │
├─────────────────────────────────┤
│                                  │
│  🏠 Dashboard                    │
│  🎯 Opportunities                │
│  🌲 Pipeline Manager             │
│  📝 Proposals                    │
│  💰 Grants                       │
│  💼 Capture                      │
│  📚 Knowledge Base               │
│  📁 Programs                     │
│  📊 Reports & Analytics          │
│                                  │
│  ─────────────────────────────  │
│                                  │
│  ✨ AI Assistant      ← NEW!    │
│                                  │
│  ─────────────────────────────  │
│                                  │
│  BID WORKSPACE                   │
│  💵 Pricing Analysis             │
│  ⬆️ RFP Shredder                │
│  👥 Partner Search               │
│  👍 Go/No-Go                     │
│  ⚡ Proposal Settings            │
│                                  │
└─────────────────────────────────┘
```

### Collapsed Sidebar (shows icon only):

```
┌────┐
│    │
│ ☰  │
│ 🟦 │
│    │
├────┤
│    │
│ 🏠 │
│ 🎯 │
│ 🌲 │
│ 📝 │
│ 💰 │
│ 💼 │
│ 📚 │
│ 📁 │
│ 📊 │
│    │
│ ── │
│    │
│ ✨ │ ← Just the sparkles icon!
│    │
│ ── │
│    │
│ 💵 │
│ ⬆️ │
│ 👥 │
│ 👍 │
│ ⚡ │
│    │
└────┘
```

---

## The Icon

**✨ Purple Sparkles**
- Color: `text-purple-600`
- Size: 20px
- Distinctive and magical
- Represents AI intelligence

---

## Full Page Layout

When you click the AI Assistant:

```
┌────────────────────────────────────────────────────────────────┐
│ [☰] 🟦 GovLogicAI   [🔍 Search...]   [❓][🔔3][⚙️] | [👤 User ▾] │ ← Header
└────────────────────────────────────────────────────────────────┘

┌────┬──────────────────────────────────────────────────────────┐
│    │                                                           │
│ 🏠 │  ┌─────────────────────────────────────────────────────┐ │
│ 🎯 │  │ ✨ AI Assistant                        [Model ▼]    │ │
│ 🌲 │  │ Your intelligent proposal writing companion         │ │
│ 📝 │  └─────────────────────────────────────────────────────┘ │
│ 💰 │                                                           │
│ 💼 │  ┌───────────────────────────────────────────────────┐   │
│ 📚 │  │                                                    │   │
│ 📁 │  │  Welcome to Your AI Assistant                     │   │
│ 📊 │  │                                                    │   │
│ ── │  │  ┌────────────┐  ┌────────────┐                  │   │
│ ✨ │  │  │ 📝 Write   │  │ 💡 Win     │                  │   │
│ ── │  │  │ Summary    │  │ Themes     │                  │   │
│ 💵 │  │  └────────────┘  └────────────┘                  │   │
│ ⬆️ │  │                                                    │   │
│ 👥 │  │  ┌────────────┐  ┌────────────┐                  │   │
│ 👍 │  │  │ 🔍 Research │  │ 📚 Improve │                  │   │
│ ⚡ │  │  │ RFP        │  │ Section    │                  │   │
│    │  │  └────────────┘  └────────────┘                  │   │
│    │  │                                                    │   │
│    │  └───────────────────────────────────────────────────┘   │
│    │                                                           │
│    │  ┌───────────────────────────────────────────────────┐   │
│    │  │ [Type your message...] __________________ [Send →]│   │
│    │  │ Press Enter to send • Powered by Ollama           │   │
│    │  └───────────────────────────────────────────────────┘   │
│    │                                                           │
└────┴──────────────────────────────────────────────────────────┘
 Sidebar                      Main Content Area
```

---

## Message Bubbles

### User Message (Right-aligned):
```
                              ┌──────────────────────────┐
                              │ Help me write an exec   │
                              │ summary for cybersecurity│
                              │ proposal                │
                              └──────────────────────────┘
                                  Purple-indigo gradient
                                  White text
```

### AI Message (Left-aligned):
```
┌──────────────────────────────────────────────┐
│ ✨  I'll help you create a compelling       │
│     executive summary! Here's a structure    │
│     following Shipley standards:             │
│                                               │
│     1. Opening Hook (2-3 sentences)          │
│     2. Your Solution (3-4 sentences)         │
│     3. Key Benefits (3-5 bullets)            │
│     4. Why You (2-3 sentences)               │
│     5. Call to Action (1-2 sentences)        │
│                                               │
│     [Copy] [👍] [👎]                         │
└──────────────────────────────────────────────┘
White background
Gray border
Purple icon
```

---

## Quick Prompt Cards

```
┌─────────────────────────────────┐
│  📝                              │
│  Write Executive Summary         │
│  ─────────────────────────────  │
│  Help me write a compelling     │
│  executive summary for a...      │
│                                  │
│  Proposal Writing               │
└─────────────────────────────────┘
     White card
     Hover: Purple border
     Hover: Shadow increases
```

---

## Color Palette

```
Main Colors:
- Primary: Purple-600 (#9333EA)
- Secondary: Indigo-600 (#4F46E5)
- Background: Gradient (Purple-50 → White → Blue-50)

User Messages:
- Background: Purple-600 to Indigo-600 gradient
- Text: White

AI Messages:
- Background: White
- Border: Gray-200
- Icon: Purple-600

Quick Prompts:
- Background: White
- Border: Gray-200
- Hover Border: Purple-500
- Text: Gray-900
- Category Tag: Purple-600
```

---

## State Indicators

### Loading (Typing):
```
┌──────────────────────────────────┐
│ ✨  Thinking...                  │
│     [Loading spinner animation]  │
└──────────────────────────────────┘
```

### Empty State (First Visit):
```
┌────────────────────────────────────────┐
│                                         │
│        ┌──────────┐                    │
│        │    ✨     │  (Large icon)      │
│        └──────────┘                    │
│                                         │
│  Welcome to Your AI Assistant          │
│                                         │
│  I'm here to help you write winning   │
│  government proposals...                │
│                                         │
│  [4 Quick Prompt Cards displayed]      │
│                                         │
└────────────────────────────────────────┘
```

### Active Conversation:
```
┌────────────────────────────────────────┐
│ User: Help me...         (right)  │
│                                         │
│ AI: Here's how...        (left)   │
│ [Copy] [👍] [👎]                       │
│                                         │
│ User: Thanks!            (right)  │
│                                         │
│ AI: You're welcome!      (left)   │
│ [Copy] [👍] [👎]                       │
│                                         │
│ [✨ Thinking...]         (loading) │
└────────────────────────────────────────┘
```

---

## Interactive Elements

### Textarea (Input):
```
┌──────────────────────────────────────────┐
│ Type your message...                     │
│ _____________________________________    │
│                              150 chars   │
└──────────────────────────────────────────┘
    Auto-resizes as you type
    Max height: 128px
    Shows character count
```

### Send Button:
```
┌────────┐
│   →    │  Purple-indigo gradient
└────────┘  Hover: Darker gradient
            Disabled: Opacity 50%
```

### Model Selector:
```
┌──────────────┐
│ Llama 2    ▼ │
└──────────────┘
Click to show:
┌──────────────┐
│ Llama 2      │ ← Selected
│ Mistral      │
│ Code Llama   │
│ Neural Chat  │
└──────────────┘
```

### Clear Button:
```
┌──────────────┐
│ ↻  Clear     │  Gray text
└──────────────┘  Hover: Gray background
```

---

## Responsive Behavior

### Desktop (> 1024px):
- Full sidebar with text
- All quick prompts visible
- Large message area
- Model selector visible

### Tablet (768px - 1024px):
- Collapsed sidebar (icons)
- Quick prompts in 2 columns
- Adjusted message area
- Model selector visible

### Mobile (< 768px):
- Collapsed sidebar (icons)
- Quick prompts stack vertically
- Full-width messages
- Compact header

---

## Animation Effects

### Hover on Quick Prompts:
```
Normal:       border-gray-200
Hover:        border-purple-500
              shadow-lg
              Slight lift effect
              
Icon changes: bg-purple-100 → bg-purple-600
              text-purple-600 → text-white
```

### Message Appearance:
```
Fade in from bottom
Slide up 10px
Duration: 200ms
Easing: ease-out
```

### Scroll Behavior:
```
When new message:
- Smooth scroll to bottom
- Duration: 300ms
- Easing: smooth
```

---

## Keyboard Shortcuts

```
Enter          → Send message
Shift + Enter  → New line
Esc            → Clear focus (future)
Cmd/Ctrl + K   → Clear chat (future)
```

---

## Status Messages

### Ollama Offline:
```
Note: To use the AI features, please ensure the backend 
API is running with Ollama configured.
```

### First Message:
```
I'm your AI Assistant for proposal writing! I can help 
you with:

✨ Proposal Writing: Executive summaries, technical approaches
📊 Win Strategy: Win themes, discriminators
✅ Compliance: Requirements extraction
...
```

---

## Access Points

### Method 1: Sidebar Click
1. Look at sidebar (left)
2. Find ✨ AI Assistant
3. Click

### Method 2: Direct URL
```
http://localhost:3000/ai-assistant
```

### Method 3: User Menu
- Future: Add to user dropdown
- Quick access from anywhere

---

## Visual Hierarchy

```
Level 1: Header (✨ AI Assistant)
Level 2: Welcome message / Messages
Level 3: Quick prompts / Message content
Level 4: Action buttons / Metadata
Level 5: Footer (input area)
```

---

## Design Consistency

**Matches**:
- Grants page gradient background
- Proposals page purple gradient
- Header modern design
- Dashboard statistics cards

**Unique Elements**:
- Chat bubbles (new)
- Message threading (new)
- Sparkles icon (unique)
- Purple theme (distinctive)

---

## Success Indicators

**You know it's working when**:
- ✅ Purple sparkles icon appears in sidebar
- ✅ Page loads with welcome message
- ✅ 4 quick prompts are clickable
- ✅ Can type in textarea
- ✅ Send button is active
- ✅ Messages appear after sending

---

## 🎉 Visual Summary

**The AI Assistant is**:
- ✨ **Distinctive**: Purple sparkles icon
- 🎨 **Beautiful**: Gradient design
- 💬 **ChatGPT-like**: Modern chat interface
- 🚀 **Accessible**: Right in the sidebar
- 🎯 **Useful**: 4 quick action prompts
- 💡 **Smart**: Ollama AI powered

Navigate to `/ai-assistant` to see it in action! 🚀

