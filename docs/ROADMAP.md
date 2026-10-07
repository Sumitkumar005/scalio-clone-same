# Build roadmap

Send screenshots of each logged-in screen; we build in this order.

| # | Module | Status | Depends on |
|---|---|---|---|
| 0 | Login (desktop + mobile, 8 languages, Google / email / phone) | ✅ built, MongoDB + Better Auth | Resend + SMS provider to go live |
| 1 | App shell: top nav, credits pill, account menu, chat button | ✅ built | |
| 2 | Copilot + Director chat (streaming, DeepSeek/Gemini/Groq, knows the business) | ✅ built | LLM key |
| 3 | Onboarding: welcome, goals, website reader, business review, Instagram handle | ✅ built | Meta app for real Instagram connect |
| 3b | Home: hero, create cards, personalised idea storyboards; Ideas, Library (saved), Settings | ✅ built | |
| 3c | Guest mode: no sign-up wall, guest data moves over on sign-in | ✅ built | |
| 4 | Fashion Studio: photoshoot (model, pose, scene, styling) + marketplace pack | ✅ built, preview renders until FAL_KEY | fal.ai key; move jobs to a queue at scale |
| 5 | Calendar: month/week/list, festivals, statuses, editor, branded creatives, customize | ✅ built | yearly festival date check |
| 5b | Director: reel chats, search, plan card, usage meter, idea → video | ✅ built | DeepSeek key for open-ended chat |
| 5c | Library: one feed across studios, filters, outputs, report, delete | ✅ built | |
| 6 | Render reels to MP4 (Remotion) from director plans | ⏳ | worker |
| 7 | Publish to Instagram | ⏳ | Meta app review |
| 8 | Growth: Google Business Profile + reviews | ⏳ | Google API access approval |
| 9 | Inbox: WhatsApp AI receptionist | ⏳ | WhatsApp Business verification |
| 10 | Billing + credits | ⏳ | Razorpay/Stripe |
| 11 | Expo mobile app | ⏳ | modules 3 to 10 stable |

Long lead items, apply now: Meta app review (Instagram publishing, WhatsApp),
Google Business Profile API access, Razorpay KYC. Each takes days to weeks.
