import type {
  ConstitutionDoc,
  EventDoc,
  MilestoneDoc,
  PolicyDoc,
  PostDoc,
  SiteSettingsDoc,
  TeacherDoc,
  TestimonialDoc,
} from "../types";

// Starter content for every CMS-managed page. Admins can edit or replace all of it.

export const seedSettings: SiteSettingsDoc[] = [
  {
    id: "site",
    status: "published",
    siteName: "Presby Children Service",
    churchName: "Presbyterian Church, Accra",
    tagline: "Growing in faith, together.",
    heroTitle: "A safe, joyful place for children to grow in faith",
    heroSubtitle:
      "Bible-centred classes for ages 2–17, caring teachers, and a church family where every child belongs.",
    heroImage: "",
    welcomeVideoUrl: "",
    mission:
      "To help every child know God’s love, understand Scripture, and live it out with joy — in partnership with their families.",
    vision:
      "A generation of children who love God, love people, and lead with integrity in their homes, schools and communities.",
    values: [
      "Bible-centred teaching",
      "Safety and care for every child",
      "Partnership with parents",
      "Joyful worship",
      "Belonging for all",
    ],
    background:
      "The children’s service grew from a small Sunday school class into a structured ministry serving families across Accra. Today our trained teachers lead age-based classes every Sunday, supported by volunteers, parents and church leadership.",
    serviceTimes: ["Sundays • 9:00 AM – 10:30 AM (all classes)", "Midweek Bible club • Wednesdays 4:30 PM"],
    address: "Presbyterian Church, Accra, Ghana",
    mapQuery: "Presbyterian Church Accra Ghana",
    phone: "+233 00 000 0000",
    whatsapp: "+233000000000",
    email: "children@example.org",
    facebook: "",
    youtube: "",
    instagram: "",
    constitutionPdf: "",
    historyIntro:
      "From humble beginnings to a structured ministry — these milestones show how God has grown our children’s service.",
    impactStats: ["Classes every Sunday|8", "Age range|2–17", "Bible stories in the games|16", "Quiz questions|640+"],
    announcement: "",
    privacyBody: "## Who we are\nThis website is run by the children’s ministry of the church named in the footer. Contact us using the details on the Contact page.\n\n## What we collect\n- **Forms** — when you send a message, register a child or request clothing, we store what you type (names, contact details, notes).\n- **Parent accounts** — your email, name, phone/WhatsApp and the children you add (name, date of birth, class, care notes).\n- **Bible games** — the player name and mascot a child chooses, XP, streaks and badges. No registration, email or real name is needed to play.\n- **Analytics (only if you accept)** — the pages viewed, the referring website and a random visitor ID stored in your browser. No IP addresses or advertising trackers.\n\n## Cookies and local storage\n- **Essential** — remembers your cookie choice, admin/parent sign-in and game progress on this device.\n- **Analytics** — only after you click “Accept all”. Change your choice any time with “Cookie settings” in the footer.\n\n## How we use it\nTo care for your children, place them in the right class, reply to you and improve the website. We never sell your data or use it for advertising.\n\n## Who can see it\nOnly approved ministry administrators, with access limited to what their role needs. Data is stored securely with our database provider (Supabase).\n\n## How long we keep it\nAnalytics are deleted after about 13 months. Messages and registrations are kept while needed for ministry care. You can delete children or your account details from your parent account, or ask us to delete everything.\n\n## Your choices\nYou can ask to see, correct or delete your information at any time by contacting us.",
    termsBody: "## Using this website\nThis website shares information about the children’s ministry, lessons, events and resources. Please use it respectfully and lawfully.\n\n## Bible games\nChildren choose a nickname — please don’t use full real names. Nicknames that are unkind or inappropriate may be removed from the leaderboard.\n\n## Downloads and media\nWorksheets, flyers and lesson materials are for personal, family and church use. Please don’t resell them.\n\n## Clothing collection\nPrices and availability are shown for information. Requests are confirmed by the ministry team before any payment is arranged.\n\n## Accounts\nKeep your password private. You are responsible for the accuracy of the details you provide about your children.\n\n## Changes\nWe may update these terms; the latest version will always be on this page.",
  },
];

export const seedTeachers: TeacherDoc[] = [
  { id: "teacher-a", name: "Teacher A", role: "Beginners lead teacher", classIds: ["beg-1", "beg-2"], bio: "Loves telling Bible stories with songs, puppets and plenty of smiles.", photo: "", order: 1, status: "published" },
  { id: "teacher-b", name: "Teacher B", role: "Primary lead teacher", classIds: ["pri-1", "pri-2", "pri-3"], bio: "Helps children memorise Scripture through games and hands-on activities.", photo: "", order: 2, status: "published" },
  { id: "teacher-c", name: "Teacher C", role: "Juniors & Seniors mentor", classIds: ["jun", "sen-1", "sen-2"], bio: "Leads discussion-based studies and mentors young leaders.", photo: "", order: 3, status: "published" },
];

const t = "2026-03-01";
export const seedPosts: PostDoc[] = [
  {
    id: "david-and-goliath-courage",
    slug: "david-and-goliath-courage",
    title: "David & Goliath: Courage with faith",
    category: "Bible Stories",
    excerpt: "A kid-friendly retelling plus parent discussion prompts and a simple memory verse.",
    body:
      "Long ago, the army of Israel was afraid of a giant named Goliath. Every day he shouted, and every day the soldiers hid.\n\nBut a young shepherd boy named David trusted God. He had protected his sheep from lions and bears, and he knew God was with him.\n\n## What David did\n- He remembered how God had helped him before\n- He refused heavy armour and used what he knew — a sling and five smooth stones\n- He spoke boldly: the battle belongs to the Lord\n\n## Talk about it at home\n- What makes you feel afraid?\n- How can remembering God’s help give you courage?\n\n**Memory verse:** “The Lord is my light and my salvation — whom shall I fear?” (Psalm 27:1)",
    cover: "",
    videoUrl: "",
    audioUrl: "",
    author: "Children’s Ministry Team",
    date: "2026-03-01",
    tags: ["courage", "Old Testament"],
    status: "published",
    createdAt: t,
  },
  {
    id: "simple-family-devotional-rhythm",
    slug: "simple-family-devotional-rhythm",
    title: "A simple family devotional rhythm",
    category: "Devotionals",
    excerpt: "A 10-minute routine you can do at home — without pressure or perfectionism.",
    body:
      "Family devotions don’t need to be long. Ten minutes, a few times a week, builds a lasting habit.\n\n## A 10-minute rhythm\n- **Read** a short Bible passage (2 minutes)\n- **Ask** one question: what does this show us about God?\n- **Pray** together — let each person say one sentence\n- **Bless** each other before bed\n\nStart small and keep it joyful. Consistency matters more than length.",
    cover: "",
    videoUrl: "",
    audioUrl: "",
    author: "Children’s Ministry Team",
    date: "2026-03-05",
    tags: ["family", "prayer"],
    status: "published",
  },
  {
    id: "helping-kids-build-good-habits",
    slug: "helping-kids-build-good-habits",
    title: "Helping kids build spiritual habits",
    category: "Parent Guides",
    excerpt: "Practical tips for prayer, Scripture, and kindness — aligned with Sunday lessons.",
    body:
      "Children learn habits by watching and doing. Here are simple ways to connect Sunday lessons with everyday life.\n\n## Ideas that work\n- Put the memory verse on the fridge each week\n- Pray in the car on the way to school\n- Celebrate kindness you notice\n- Ask what they learned in class — and listen\n\nOur class pages include printable worksheets you can use at home.",
    cover: "",
    videoUrl: "",
    audioUrl: "",
    author: "Children’s Ministry Team",
    date: "2026-03-10",
    tags: ["habits", "parents"],
    status: "published",
  },
  {
    id: "printable-activity-kindness-challenge",
    slug: "printable-activity-kindness-challenge",
    title: "Printable kindness challenge (7 days)",
    category: "Kids Activities",
    excerpt: "A printable activity that encourages kids to practise love at home and school.",
    body:
      "Try one act of kindness each day this week and tick it off!\n\n- **Day 1:** Say thank you to someone who helps you\n- **Day 2:** Share a toy or snack\n- **Day 3:** Help with a chore without being asked\n- **Day 4:** Write a kind note\n- **Day 5:** Include someone who is alone\n- **Day 6:** Pray for a friend\n- **Day 7:** Tell someone about God’s love\n\n“Be kind and compassionate to one another.” (Ephesians 4:32)",
    cover: "",
    videoUrl: "",
    audioUrl: "",
    author: "Children’s Ministry Team",
    date: "2026-03-12",
    tags: ["kindness", "printable"],
    status: "published",
  },
];

export const seedEvents: EventDoc[] = [
  { id: "family-fun-day", title: "Family Fun Day", date: "2026-11-21", startTime: "10:00", endTime: "14:00", location: "Church grounds", description: "Games, food, face painting and a short family worship time. Bring a friend!", image: "", category: "Family", registerUrl: "", status: "published" },
  { id: "carols-rehearsal", title: "Christmas Carols Rehearsal", date: "2026-12-05", startTime: "15:00", endTime: "17:00", location: "Main hall", description: "Practice for the children’s carol service. All classes welcome.", image: "", category: "Music", registerUrl: "", status: "published" },
  { id: "kids-carol-service", title: "Children’s Carol Service", date: "2026-12-20", startTime: "09:00", endTime: "11:00", location: "Main sanctuary", description: "Our children lead the congregation in carols, readings and a nativity drama.", image: "", category: "Service", registerUrl: "", status: "published" },
];

export const seedTestimonials: TestimonialDoc[] = [
  { id: "t1", quote: "My daughter can’t wait for Sunday. She comes home singing the memory verse every week.", name: "Abena", role: "Parent, Primary 2", order: 1, status: "published" },
  { id: "t2", quote: "The check-in process and the teachers’ care give us real peace of mind.", name: "Kofi", role: "Parent, Beginners 1", order: 2, status: "published" },
  { id: "t3", quote: "The Bible games have made my son want to read the stories for himself.", name: "Efua", role: "Parent, Juniors", order: 3, status: "published" },
];

export const seedMilestones: MilestoneDoc[] = [
  { id: "m2012", year: "2012", title: "Ministry launched", description: "First dedicated children’s classes organised with weekly lesson plans.", image: "", order: 1, status: "published" },
  { id: "m2016", year: "2016", title: "Safety policies formalised", description: "Check-in/out procedures and supervision guidelines standardised.", image: "", order: 2, status: "published" },
  { id: "m2020", year: "2020", title: "Family communication upgrades", description: "Monthly updates and parent guides introduced for consistency at home.", image: "", order: 3, status: "published" },
  { id: "m2024", year: "2024", title: "Curriculum refresh", description: "Age-appropriate curriculum with interactive activities and resources.", image: "", order: 4, status: "published" },
  { id: "m2026", year: "2026", title: "Digital Kids Hub", description: "Online lesson hubs, Bible games and parent accounts launched for every class.", image: "", order: 5, status: "published" },
];

export const seedConstitution: ConstitutionDoc[] = [
  { id: "c1", order: 1, status: "published", title: "Purpose of the children’s ministry", body: "Our purpose is to support families by teaching Scripture in age-appropriate ways, encouraging worship and prayer, and creating a safe community where children can learn and belong." },
  { id: "c2", order: 2, status: "published", title: "Leadership structure", body: "Leadership includes ministry oversight, class teachers, and approved volunteers. Responsibilities include curriculum planning, safety enforcement, and parent communication." },
  { id: "c3", order: 3, status: "published", title: "Rules and guidelines", body: "All participants agree to classroom rules that promote safety, respect, and orderly learning. Teachers maintain consistent routines appropriate to each age group." },
  { id: "c4", order: 4, status: "published", title: "Code of conduct (teachers, children, parents)", body: "Teachers uphold professional conduct, appropriate boundaries, and respectful communication. Children are encouraged to be kind, listen and take part. Parents support check-in/out procedures and communicate any relevant medical or care needs." },
  { id: "c5", order: 5, status: "published", title: "Class structure policies", body: "Classes are organised by age band (Beginners, Primary, Juniors, Seniors) with a defined learning focus, schedule and teacher assignment. Children move up each new church year." },
  { id: "c6", order: 6, status: "published", title: "Attendance and participation guidelines", body: "Attendance helps us provide care, plan resources, and ensure safety. Participation in activities is encouraged but never forced. Please let your child’s teacher know about extended absences." },
];

export const seedPolicies: PolicyDoc[] = [
  { id: "p1", order: 1, status: "published", icon: "🛡️", title: "Secure check-in & check-out", description: "Children are signed in and only released to an authorised adult." },
  { id: "p2", order: 2, status: "published", icon: "👩‍🏫", title: "Trained, vetted teachers", description: "Every teacher and volunteer is approved and trained in child safeguarding." },
  { id: "p3", order: 3, status: "published", icon: "👥", title: "Two-adult rule & safe ratios", description: "At least two adults in every class, with age-appropriate ratios." },
  { id: "p4", order: 4, status: "published", icon: "📝", title: "Clear incident reporting", description: "Any incident is recorded and parents are informed the same day." },
  { id: "p5", order: 5, status: "published", icon: "📷", title: "Photo consent", description: "We only share photos of children with parental consent." },
  { id: "p6", order: 6, status: "published", icon: "🩺", title: "Care & allergy notes", description: "Medical and allergy notes from parents are shared with teachers." },
];
