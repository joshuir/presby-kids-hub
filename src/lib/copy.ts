/**
 * Every fixed piece of text, image or link on the website that isn't already part of a CMS
 * collection. Admins override any of these in CMS → Site text & images; components read them
 * with useCopy(). Keys are "page.section.thing".
 */
export type CopyKind = "text" | "long" | "image" | "link";
export type CopyEntry = { page: string; label: string; def: string; kind?: CopyKind };

const e = (page: string, label: string, def: string, kind: CopyKind = "text"): CopyEntry => ({ page, label, def, kind });

export const COPY = {
  /* ---------- header & footer (every page) ---------- */
  "header.ctaUrl": e("Header & footer", "Header button link", "/contact/#visit", "link"),
  "footer.visit.title": e("Header & footer", "Visit banner — heading", "Come as you are this Sunday."),
  "footer.visit.whatsapp": e("Header & footer", "Visit banner — WhatsApp button", "WhatsApp us"),
  "footer.visit.whatsappMsg": e("Header & footer", "Visit banner — WhatsApp pre-filled message", "Hello! I'd like to visit the Children's Ministry."),
  "footer.visit.directions": e("Header & footer", "Visit banner — directions button", "Get directions"),
  "footer.col.explore": e("Header & footer", "Footer column heading — links", "Explore"),
  "footer.col.contact": e("Header & footer", "Footer column heading — contact", "Contact"),
  "footer.staffLogin": e("Header & footer", "Footer link to the CMS", "Staff login"),

  /* ---------- home ---------- */
  "home.hero.highlight": e("Home", "Hero — highlighted last line of the heading", "God's Word"),
  "home.hero.cta1": e("Home", "Hero — first button", "Explore Our Classes"),
  "home.hero.cta1Url": e("Home", "Hero — first button link", "/classes/", "link"),
  "home.hero.cta2": e("Home", "Hero — second button", "Meet Our Teachers"),
  "home.hero.cta2Url": e("Home", "Hero — second button link", "/about/#team", "link"),
  "home.welcome.logo": e("Home", "Welcome card — signature logo", "/brand/logo.png", "image"),
  "home.sunday.eyebrow": e("Home", "Sunday — small label", "Our children's service"),
  "home.sunday.badgeLabel": e("Home", "Sunday — floating badge label", "Every Sunday"),
  "home.sunday.badgeTime": e("Home", "Sunday — floating badge time", "9:00 – 10:45 am"),
  "home.sunday.photo2": e("Home", "Sunday — small overlapping photo", "", "image"),
  "home.sunday.button": e("Home", "Sunday — button", "More about us"),
  "home.sunday.buttonUrl": e("Home", "Sunday — button link", "/about/", "link"),
  "home.classes.eyebrow": e("Home", "Classes — small label", "Classes"),
  "home.classes.title": e("Home", "Classes — heading", "A class for every age"),
  "home.classes.intro": e("Home", "Classes — intro", "Four groups. Nine classes. One Bible story each week."),
  "home.events.eyebrow": e("Home", "Events — small label", "Coming up"),
  "home.events.title": e("Home", "Events — heading", "Upcoming activities"),
  "home.events.intro": e("Home", "Events — intro", "Tap a date to see what's on."),
  "home.events.action": e("Home", "Events — link text", "Events calendar"),
  "home.events.empty": e("Home", "Events — nothing planned text", "Nothing planned yet — check back soon."),
  "home.lesson.intro": e("Home", "Featured lesson — text", "Every class explores this passage on Sunday. Keep the conversation going at home.", "long"),
  "home.lesson.button": e("Home", "Featured lesson — button", "Read the lesson"),
  "home.kids.eyebrow": e("Home", "Kids Zone — small label", "Kids Zone"),
  "home.kids.title": e("Home", "Kids Zone — heading", "Play, learn and wear your faith"),
  "home.kids.intro": e("Home", "Kids Zone — intro", "Bible games that grow with your child, and a clothing collection you can try in every colour.", "long"),
  "home.kids.gamesTitle": e("Home", "Kids Zone — games card heading", "Climb the Bible path"),
  "home.kids.gamesText": e("Home", "Kids Zone — games card text", "Story units with four levels each, streaks, badges and a mascot who cheers you on.", "long"),
  "home.kids.gamesButton": e("Home", "Kids Zone — games card button", "Start playing"),
  "home.kids.shopTitle": e("Home", "Kids Zone — clothing card heading", "Wear your faith"),
  "home.kids.shopText": e("Home", "Kids Zone — clothing card text", "Tees and hoodies on the rack — tap a colour tag, flip front and back, or shuffle.", "long"),
  "home.kids.shopButton": e("Home", "Kids Zone — clothing card button", "See the collection"),
  "home.feed.eyebrow": e("Home", "Blog feed — small label", "From the feed"),
  "home.feed.title": e("Home", "Blog feed — heading", "Latest from our classrooms"),
  "home.feed.action": e("Home", "Blog feed — link text", "Open the feed"),
  "home.gallery.eyebrow": e("Home", "Gallery — small label", "Gallery"),
  "home.gallery.title": e("Home", "Gallery — heading", "Moments worth remembering"),
  "home.gallery.action": e("Home", "Gallery — link text", "View gallery"),
  "home.team.eyebrow": e("Home", "Teachers — small label", "Our teachers"),
  "home.team.title": e("Home", "Teachers — heading", "Caring people, trained and checked"),
  "home.team.intro": e("Home", "Teachers — intro", "Every child known by name."),
  "home.social.eyebrow": e("Home", "Social — small label", "Follow our journey"),
  "home.social.title": e("Home", "Social — heading", "Find us everywhere you are"),
  "home.faqs.eyebrow": e("Home", "FAQs — small label", "FAQs"),
  "home.faqs.title": e("Home", "FAQs — heading", "Questions parents ask"),
  "home.faqs.intro": e("Home", "FAQs — intro", "Still wondering about something? Send us a message — a real person will reply.", "long"),

  /* ---------- shared blocks ---------- */
  "app.eyebrow": e("Shared sections", "App promo — small label", "Mobile app"),
  "app.googleButton": e("Shared sections", "App promo — Google Play button", "Get it on Google Play"),
  "app.appleButton": e("Shared sections", "App promo — App Store button", "Download on the App Store"),
  "app.qrTitle": e("Shared sections", "App promo — QR heading", "Scan to download"),
  "app.qrText": e("Shared sections", "App promo — QR text", "Point your phone camera here."),
  "newsletter.button": e("Shared sections", "Newsletter — button", "Subscribe"),
  "newsletter.note": e("Shared sections", "Newsletter — small print", "Monthly family updates only. We never share your details."),

  /* ---------- inner pages ---------- */
  "about.chips": e("About", "Hero chips (separate with |)", "Love|Faith|Joy|Since 2006"),
  "events.upcoming.title": e("Events", "Coming up heading (*word* = highlight)", "Coming *up*"),
  "events.upcoming.empty": e("Events", "No upcoming events text", "No upcoming events yet — check back soon."),
  "events.past.title": e("Events", "Past events heading", "Past events"),
  "classes.openButton": e("Classes", "Class card link text", "Open class page"),
  "contact.cards.call": e("Contact", "Card — Call title", "Call us"),
  "contact.cards.callAction": e("Contact", "Card — Call action", "Call now"),
  "contact.cards.whatsapp": e("Contact", "Card — WhatsApp title", "WhatsApp"),
  "contact.cards.whatsappAction": e("Contact", "Card — WhatsApp action", "Start a chat"),
  "contact.cards.whatsappMsg": e("Contact", "Card — WhatsApp pre-filled message", "Hello! I have a question about the Children's Ministry."),
  "contact.cards.email": e("Contact", "Card — Email title", "Email"),
  "contact.cards.emailAction": e("Contact", "Card — Email action", "Write an email"),
  "contact.cards.visit": e("Contact", "Card — Visit title", "Visit us"),
  "contact.cards.visitAction": e("Contact", "Card — Visit action", "Get directions"),
  "contact.form.title": e("Contact", "Form — heading", "Send us a message"),
  "contact.form.intro": e("Contact", "Form — intro", "We reply within two working days."),
  "contact.form.subjects": e("Contact", "Form — subject choices (separate with |)", "Visiting for the first time|Registering my child|Volunteering as a teacher|Safeguarding concern|Prayer request|Clothing collection|Something else", "long"),
  "contact.form.button": e("Contact", "Form — send button", "Send message"),
  "contact.form.success": e("Contact", "Form — thank-you message", "Thank you — your message is with our team. We'll reply within two working days.", "long"),
  "contact.times.title": e("Contact", "Service times — heading", "Service times"),
  "contact.times.note": e("Contact", "Service times — note", "First visit? Arrive 15 minutes early."),
  "contact.social.title": e("Contact", "Social — heading", "Follow us"),
  "contact.map.eyebrow": e("Contact", "Map — small label", "Find us"),
  "contact.map.button": e("Contact", "Map — button", "Get directions"),
  "contact.faqs.eyebrow": e("Contact", "FAQs — small label", "FAQs"),
  "contact.faqs.title": e("Contact", "FAQs — heading", "Before you visit"),
  "contact.faqs.intro": e("Contact", "FAQs — intro", "Quick answers to the questions we hear most."),
} satisfies Record<string, CopyEntry>;

export type CopyKey = keyof typeof COPY;
export const COPY_PAGES = Array.from(new Set(Object.values(COPY).map((c) => c.page)));
