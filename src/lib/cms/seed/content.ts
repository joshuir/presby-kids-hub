import type {
  ClassDoc,
  EventDoc,
  FaqDoc,
  GalleryDoc,
  LessonDoc,
  MilestoneDoc,
  PostDoc,
  SiteSettingsDoc,
  TeacherDoc,
  UnitDoc,
} from "../types";

// Starter content (mirrors the reference site). Every item is editable in the CMS.

export const seedSettings: SiteSettingsDoc[] = [
  {
    id: "site",
    status: "published",
    siteName: "Children's Ministry",
    churchName: "Presbyterian Church",
    footerBlurb:
      "The children's ministry of Presbyterian Church, Accra — Bible-centred Sunday classes for ages 3 to 13, led by trained, safeguarding-checked teachers.",
    ctaLabel: "Join Our Service",
    heroBadge: "Sundays · 9:00 am · Ages 3–13",
    heroTitle: "Helping Children",
    heroWords: ["Know", "Love", "Live"],
    heroSubtitle: "Bible stories, songs and prayer in age-based classes — safe, joyful and led by trained teachers.",
    heroImage: "",
    serviceTimes: ["Sunday Children's Service|9:00 – 10:45 am", "Midweek Bible Club|Wed 5:30 – 6:30 pm"],
    welcomeTitle: "You're so welcome here",
    welcomeText:
      "Whether your child is three or thirteen, there's a seat with their name on it. Come early on your first Sunday — we'd love to say hello.",
    welcomeName: "Deaconess Abena Owusu",
    welcomeRole: "Children's Ministry Director",
    stats: ["age-based classes|9", "trained teachers|24", "children each Sunday|180+", "serving families since|2006"],
    sundayTitle: "What happens on a Sunday?",
    sundayIntro: "Worship together, then age-based classes on the same Bible passage — so families can talk about it over lunch.",
    sundaySteps: [
      "Worship together|Songs, actions and prayer to open the morning.",
      "Learn the Word|An age-appropriate Bible lesson with a memory verse.",
      "Make & play|Crafts, games and activities that help it stick.",
      "Safe hand-over|Secure check-in and check-out for every child.",
    ],
    sundayImage: "",
    groups: [
      "beginners|Beginners|Ages 3–5|Short stories, songs with actions and hands-on play for our youngest learners.",
      "primary|Primary|Ages 6–8|Bible stories told with drama and crafts, plus first steps in finding verses.",
      "juniors|Juniors|Ages 9–10|Exploring the big story of the Bible, learning to pray aloud and serve others.",
      "seniors|Seniors|Ages 11–13|Discussion, real questions and building a faith that's ready for secondary school.",
    ],
    featuredLessonId: "primary-2-the-good-samaritan",
    aboutTitle: "Small hands, big faith.",
    aboutSubtitle: "Helping children in Accra discover the Bible since 2006.",
    vision: "A generation of children who know God, love His Word and shine His light in their homes, schools and communities.",
    missionIntro: "We pursue that vision through four everyday commitments:",
    missionItems: [
      "Teach the whole Bible|A three-year teaching plan that walks children through the big story of Scripture, from Creation to the New Creation.",
      "Partner with parents|Weekly take-home guides and app content so faith conversations continue around the dinner table.",
      "Train and care for teachers|Ongoing training in Bible teaching, child development and safeguarding for every volunteer.",
      "Serve our city|Harvests, outreaches and evangelism days where children learn that faith is something you live out.",
    ],
    historyTitle: "Twenty years of growing faith",
    historyPdf: "",
    appTitle: "Sunday's lesson, all week long",
    appText: "This week's lesson, memory-verse audio and event reminders. No ads.",
    googlePlayUrl: "https://play.google.com/store",
    appStoreUrl: "https://apps.apple.com/",
    showApp: "yes",
    socials: [
      "Facebook|@pcm.kids|Like our page|https://facebook.com/",
      "Instagram|@pcm.kids|Follow|https://instagram.com/",
      "YouTube|Children's Ministry TV|Subscribe|https://youtube.com/",
      "TikTok|@pcm.kids|Follow|https://tiktok.com/",
      "X|@pcm.kids|Follow|https://x.com/",
      "WhatsApp|Parents' channel|Join channel|https://wa.me/233200000000",
    ],
    phone: "+233 30 000 0000",
    whatsapp: "+233 20 000 0000",
    email: "children@pcm-kids.example.org",
    address: "Presbyterian Church, Accra, 12 Ring Road Central, Accra, Ghana",
    mapQuery: "Ring Road Central, Accra, Ghana",
    newsletterTitle: "Family updates, once a month",
    newsletterText: "Lessons, events and prayer points — straight to your inbox.",
    pagesUpdated: "1 October 2026",
    welcomeVideoUrl: "",
    safeguardingBody: `## Our commitment
Every child who attends Children's Ministry has the right to be safe, respected and protected from harm. We follow the safeguarding policy of Presbyterian Church, Accra and Ghana's Children's Act (Act 560).

## Who teaches your child
- All teachers and helpers are church members of at least six months.
- Every adult passes a background check and two references before serving.
- Safeguarding training is completed on joining and refreshed every year.
- There are always at least two adults in every classroom — never one adult alone with a child.

## Check-in and collection
Each family receives a QR check-in card. Children can only be collected by adults listed on that card. If someone else is collecting, please tell the welcome desk in person before service.

## Photos and video
- We only photograph children whose parent or guardian has given written consent.
- We share group photos only — no names, school uniforms, or details that could identify where a child lives or studies.
- You can withdraw consent at any time, and we'll remove images within seven days.

## Online safety on this website
- Children cannot create accounts, post or comment.
- Only verified teachers can publish posts; every post is approved by a ministry administrator.
- The Bible games use a nickname and a mascot only — no names, emails or photos.

## Raising a concern
If you are worried about a child, speak to our Safeguarding Lead, Yaw Amponsah, on a Sunday, or email us with the subject "Safeguarding". If a child is in immediate danger, contact the police or the Department of Social Welfare straight away.`,
    accessibilityBody: `## What we've done
- We aim to meet WCAG 2.2 level AA.
- Text and controls meet colour-contrast guidelines, with large, readable type.
- Everything works with a keyboard, with clear focus indicators and a skip link.
- Images have text alternatives, and forms have labels and clear error messages.
- Animations are switched off automatically if your device asks for reduced motion.
- Buttons and links are at least 44 pixels tall for easy tapping.

## At church
Our children's wing is step-free, and we're happy to talk about any additional needs your child has so we can support them well in class.

## Tell us if something doesn't work
If you find something hard to use, please email us or message us on WhatsApp — we'll fix it.`,
    privacyBody: `## Who we are
This website is run by the children's ministry of Presbyterian Church, Accra.

## What we collect
- **Messages** — when you contact us or subscribe to family updates, we store your name, email, phone (optional) and message.
- **Clothing requests** — the item, colour and size you ask about, with your contact details.
- **Bible games** — the nickname and mascot a child chooses, XP, streaks and badges. No real names or emails are needed to play. Progress is saved on your device.

## Cookies and storage
We don't use advertising or tracking cookies. Your device stores game progress and admin sign-in only.

## How we use it
Only to reply to you, send the updates you asked for and run the ministry. We never sell your data.

## Your choices
Ask us to see, correct or delete your details at any time, and unsubscribe from updates whenever you like.`,
    termsBody: `## Using this website
This website shares information about the children's ministry, lessons, events and resources. Please use it respectfully.

## Bible games
Children choose a nickname — please don't use full real names. Unkind nicknames may be removed from the leaderboard.

## Downloads
Lesson sheets, colouring pages and songs are for personal, family and church use.

## Clothing collection
Prices and availability are shown for information. Requests are confirmed by the ministry team before any payment is arranged.

## Changes
We may update these terms; the latest version will always be on this page.`,
  },
];

export const seedTeachers: TeacherDoc[] = [
  { id: "abena-owusu", name: "Abena Owusu", role: "Children's Ministry Director", team: "leadership", classIds: [], since: "2014", bio: "Abena leads the ministry, trains our teachers and loves seeing children fall in love with God's Word.", highlights: ["Serving since 2014", "Ministry leadership", "Safeguarding trained & checked"], photo: "", order: 1, status: "published" },
  { id: "kwame-mensah", name: "Kwame Mensah", role: "Senior Class Teacher", team: "seniors", classIds: ["seniors-1", "seniors-2"], since: "2016", bio: "Kwame helps Seniors ask honest questions and build a faith ready for secondary school.", highlights: ["Serving since 2016", "Seniors 1 & 2", "Safeguarding trained & checked"], photo: "", order: 2, status: "published" },
  { id: "esi-boateng", name: "Esi Boateng", role: "Beginners Lead Teacher", team: "beginners", classIds: ["beginners-1", "beginners-2"], since: "2015", bio: "Esi brings stories to life with songs, puppets and plenty of hugs.", highlights: ["Serving since 2015", "Beginners 1 & 2", "Safeguarding trained & checked"], photo: "", order: 3, status: "published" },
  { id: "daniel-asante", name: "Daniel Asante", role: "Primary Class Teacher", team: "primary", classIds: ["primary-1", "primary-2"], since: "2018", bio: "Daniel turns memory verses into songs — guitar always in hand.", highlights: ["Serving since 2018", "Primary 1 & 2", "Safeguarding trained & checked"], photo: "", order: 4, status: "published" },
  { id: "grace-adjei", name: "Grace Adjei", role: "Primary Class Teacher", team: "primary", classIds: ["primary-3"], since: "2019", bio: "Grace helps Primary 3 find their way around their own Bibles.", highlights: ["Serving since 2019", "Primary 3", "Safeguarding trained & checked"], photo: "", order: 5, status: "published" },
  { id: "samuel-ofori", name: "Samuel Ofori", role: "Juniors Class Teacher", team: "juniors", classIds: ["juniors-1", "juniors-2"], since: "2017", bio: "Samuel leads Bible detective work and a service project every term.", highlights: ["Serving since 2017", "Juniors 1 & 2", "Safeguarding trained & checked"], photo: "", order: 6, status: "published" },
  { id: "akosua-darko", name: "Akosua Darko", role: "Beginners Assistant", team: "beginners", classIds: ["beginners-2"], since: "2021", bio: "Akosua makes sure every little one feels at home from the first minute.", highlights: ["Serving since 2021", "Beginners 2", "Safeguarding trained & checked"], photo: "", order: 7, status: "published" },
  { id: "yaw-amponsah", name: "Yaw Amponsah", role: "Safeguarding Lead", team: "leadership", classIds: ["juniors-2"], since: "2016", bio: "Yaw oversees check-in, vetting and training so every child is safe.", highlights: ["Serving since 2016", "Safeguarding lead", "Safeguarding trained & checked"], photo: "", order: 8, status: "published" },
];

const C = (id: string, group: ClassDoc["group"], number: number, name: string, ageRange: string, room: string, teacherIds: string[], color: string, order: number, description: string): ClassDoc => ({
  id, group, number, name, ageRange, room, teacherIds, color, order, description, schedule: "Sundays 9:00 – 10:45 am", status: "published",
});

export const seedClasses: ClassDoc[] = [
  C("beginners-1", "beginners", 1, "Beginners 1", "Age 3–4", "Sunshine Room", ["esi-boateng"], "#F59E0B", 1, "A gentle first classroom: we sit on the story mat, sing, pray and learn one big truth each week through play."),
  C("beginners-2", "beginners", 2, "Beginners 2", "Age 4–5", "Rainbow Room", ["esi-boateng", "akosua-darko"], "#F97316", 2, "Story, song and craft, with simple memory verses and lots of practice saying thank you to God."),
  C("primary-1", "primary", 1, "Primary 1", "Age 6", "Olive Room", ["daniel-asante"], "#22C55E", 3, "Children learn to retell Bible stories in order and start reading short verses for themselves."),
  C("primary-2", "primary", 2, "Primary 2", "Age 7", "Cedar Room", ["daniel-asante"], "#10B981", 4, "Drama, music and craft help children see how each story shows who God is."),
  C("primary-3", "primary", 3, "Primary 3", "Age 8", "Palm Room", ["grace-adjei"], "#14B8A6", 5, "Children use their own Bibles each week, learning the books of the Bible and how to find a verse."),
  C("juniors-1", "juniors", 1, "Juniors 1", "Age 9", "Harbour Room", ["samuel-ofori"], "#3B82F6", 6, "Small-group discussion, Bible detective work and practical ways to live out each lesson at school."),
  C("juniors-2", "juniors", 2, "Juniors 2", "Age 10", "Lighthouse Room", ["samuel-ofori", "yaw-amponsah"], "#6366F1", 7, "Juniors start leading prayer and reading aloud, and plan one service project each term."),
  C("seniors-1", "seniors", 1, "Seniors 1", "Age 11–12", "Summit Room", ["kwame-mensah"], "#8B5CF6", 8, "Honest questions welcome. Seniors dig into context, apply Scripture to real life and practise sharing their faith."),
  C("seniors-2", "seniors", 2, "Seniors 2", "Age 12–13", "Horizon Room", ["kwame-mensah"], "#EC4899", 9, "Preparing for the move to youth church with deeper study, mentoring and leadership opportunities."),
];

type L = Omit<LessonDoc, "id" | "classId" | "status" | "bannerUrl" | "flyerUrl" | "introVideoUrl" | "storyMedia" | "resources">;

const LESSONS: L[] = [
  {
    slug: "the-good-samaritan",
    title: "The Good Samaritan",
    lessonDate: "2026-10-11",
    bibleRef: "Luke 10:25–37",
    topic: "Loving our neighbour",
    objective: "Children will be able to retell the parable and name one practical way to show kindness to someone different from them.",
    memoryVerse: "Love your neighbour as yourself.",
    memoryRef: "Luke 10:27",
    story: `One day a man who knew a lot about God's law asked Jesus a question: "What must I do to have eternal life?" Jesus asked what the law said, and the man answered: love God with everything you have, and love your neighbour as yourself. "Then who is my neighbour?" the man asked.

Jesus told a story. A man was walking from Jerusalem down to Jericho when robbers attacked him. They took his clothes, hurt him badly and left him lying by the road.

A priest came along the road. He saw the man — and crossed to the other side. Then a Levite, who helped in the temple, came by. He looked — and he crossed to the other side too.

Then a Samaritan came. Samaritans and Jews did not get along, but when this Samaritan saw the hurt man, he felt sorry for him. He bandaged his wounds, lifted him onto his own donkey and took him to an inn. He even paid the innkeeper to look after him until he came back.

"Which of these three was a neighbour to the man?" Jesus asked. "The one who showed mercy," came the answer. Jesus said, "Go and do the same."`,
    discussion: ["Why do you think the priest and Levite walked past?", "What three things did the Samaritan do to help?", "Who is someone at school who might need a kind friend?"],
    activityTitle: "Kindness map",
    activitySteps: ["Draw the road from Jerusalem to Jericho on a long sheet.", "Children add the three travellers and colour the Samaritan's donkey.", "On the back, each child writes or draws one kind thing they'll do this week."],
    prayer: "Dear God, thank You for loving us first. Help us to notice people who are hurting, and give us brave, kind hearts to help them — even when it's hard. In Jesus' name, Amen.",
  },
  {
    slug: "jesus-calms-the-storm",
    title: "Jesus Calms the Storm",
    lessonDate: "2026-10-04",
    bibleRef: "Mark 4:35–41",
    topic: "Trusting Jesus when we're afraid",
    objective: "Children will learn that Jesus has power over nature and that they can pray when afraid.",
    memoryVerse: "When I am afraid, I will put my trust in You.",
    memoryRef: "Psalm 56:3",
    story: `At the end of a long day of teaching, Jesus said to His disciples, "Let's cross to the other side of the lake." They got into a boat, and Jesus, tired, fell asleep on a cushion at the back.

Suddenly a fierce storm blew up. Huge waves crashed over the sides, and the boat began to fill with water. The disciples were terrified.

They woke Jesus: "Teacher, don't You care that we're going to drown?" Jesus stood up and spoke to the wind and the waves: "Peace! Be still!" At once the wind stopped and everything became completely calm.

"Why are you so afraid?" Jesus asked. "Do you still not have faith?" The disciples were amazed and asked each other, "Who is this? Even the wind and waves obey Him!"`,
    discussion: ["How did the disciples feel?", "What happened when Jesus spoke?", "What 'storms' make you feel scared?"],
    activityTitle: "Storm in a bottle",
    activitySteps: ["Fill a bottle with water and a drop of blue colour.", "Shake it to make a storm, then watch it calm.", "Talk about how Jesus brings calm."],
    prayer: "Jesus, You are stronger than every storm. When I feel scared, help me remember You are with me and I can trust You. Amen.",
  },
  {
    slug: "zacchaeus",
    title: "Zacchaeus Meets Jesus",
    lessonDate: "2026-09-27",
    bibleRef: "Luke 19:1–10",
    topic: "Jesus came to seek and save the lost",
    objective: "Children will learn that meeting Jesus changed how Zacchaeus lived.",
    memoryVerse: "The Son of Man came to seek and to save that which was lost.",
    memoryRef: "Luke 19:10",
    story: `Jesus was passing through Jericho, and a big crowd lined the streets. A man named Zacchaeus wanted to see Him. Zacchaeus was a chief tax collector — rich, and not very liked, because he cheated people.

Zacchaeus was also short, so he couldn't see over the crowd. He ran ahead and climbed a sycamore-fig tree.

When Jesus reached the spot, He looked up and said, "Zacchaeus, come down quickly! I must stay at your house today." The crowd grumbled, but Zacchaeus hurried down, full of joy.

Zacchaeus stood up and said, "Lord, I'll give half of what I own to the poor, and if I've cheated anyone, I'll pay them back four times as much." Jesus said, "Today salvation has come to this house. The Son of Man came to seek and to save the lost."`,
    discussion: ["Why didn't people like Zacchaeus?", "What did Zacchaeus do after meeting Jesus?", "Is there something you need to make right?"],
    activityTitle: "Before & after",
    activitySteps: ["Fold paper in half.", "Draw Zacchaeus before and after meeting Jesus.", "Write one word for each side."],
    prayer: "Thank You, Jesus, that You know my name and want to be my friend. Help me to follow You and to make things right when I get things wrong. Amen.",
  },
];

// The youngest classes get a shorter memory verse and simpler aim.
const YOUNG: Record<string, Partial<L>> = {
  "the-good-samaritan": { memoryVerse: "Love each other.", memoryRef: "John 15:12", objective: "Children will know that God wants us to be kind and help people who are hurt." },
  "jesus-calms-the-storm": { memoryVerse: "When I am afraid, I will trust in You.", memoryRef: "Psalm 56:3", objective: "Children will know that Jesus is strong and they can talk to Him when they feel scared." },
  zacchaeus: { memoryVerse: "Jesus came to find the lost.", memoryRef: "Luke 19:10", objective: "Children will know that Jesus loves everyone, even people others don't like." },
};

export const seedLessons: LessonDoc[] = seedClasses.flatMap((c) =>
  LESSONS.map((l) => ({
    ...l,
    ...(c.group === "beginners" ? YOUNG[l.slug] : {}),
    id: `${c.id}-${l.slug}`,
    classId: c.id,
    bannerUrl: "",
    flyerUrl: "",
    introVideoUrl: "",
    storyMedia: [],
    resources: [
      { label: `${l.title} — take-home sheet`, url: "#print", kind: "worksheet" as const },
    ],
    status: "published" as const,
  })),
);

export const seedEvents: EventDoc[] = [
  { id: "children-harvest-2026", title: "Children's Harvest Thanksgiving", date: "2026-10-25", startTime: "09:00", endTime: "11:00", location: "Main Auditorium", description: "Children lead worship, recite memory verses and bring gifts for our partner schools. Families warmly invited.", image: "", category: "Special days", registerUrl: "", status: "published" },
  { id: "family-games-night", title: "Bible Club Family Games Night", date: "2026-11-18", startTime: "17:30", endTime: "19:00", location: "Children's Wing", description: "Bring the whole family for Bible quiz games, snacks and a short devotion.", image: "", category: "Family", registerUrl: "", status: "published" },
  { id: "nativity-2026", title: "Children's Nativity & Carols", date: "2026-12-20", startTime: "09:00", endTime: "10:45", location: "Main Auditorium", description: "Every class takes part in the Christmas story — costumes, carols and a few surprises.", image: "", category: "Special days", registerUrl: "", status: "published" },
  { id: "camp-2027", title: "Children's Ministry Camp", date: "2027-04-09", startTime: "08:00", endTime: "17:00", location: "Aburi Retreat Centre", description: "Three days of Bible teaching, games, nature walks and campfire worship for Juniors and Seniors.", image: "", category: "Camp", registerUrl: "", status: "published" },
  { id: "parents-day-2027", title: "Parents' Day", date: "2027-05-16", startTime: "09:00", endTime: "11:00", location: "Children's Wing", description: "Sit in on your child's class, meet the teachers and see what they've been learning.", image: "", category: "Family", registerUrl: "", status: "published" },
];

const P = (id: string, kind: PostDoc["kind"], authorId: string, date: string, body: string, extra: Partial<PostDoc> = {}): PostDoc => ({
  id, kind, authorId, date, body, verse: "", verseRef: "", images: [], videoUrl: "", audioUrl: "", eventId: "", reactions: {}, pinned: "no", status: "published", ...extra,
});

export const seedPosts: PostDoc[] = [
  P("p1", "verse", "abena-owusu", "2026-10-07", "This Sunday every class is learning the parable of the Good Samaritan. Here's the verse to practise at home this week 👇", { verse: "Love your neighbour as yourself.", verseRef: "Luke 10:27", reactions: { "❤️": 82, "🙏": 31, "👍": 17 }, pinned: "yes" }),
  P("p2", "video", "daniel-asante", "2026-10-05", "Primary 2 learned this week's memory verse as a song. Play it on the way to school and see if it sticks! 🎶", { videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U", reactions: { "❤️": 96, "👍": 40, "😂": 18 } }),
  P("p3", "event", "yaw-amponsah", "2026-10-03", "Save the date! Our Children's Harvest is coming up. Children can bring a gift of food or school supplies for our partner schools 🧺", { eventId: "children-harvest-2026", reactions: { "❤️": 70, "👍": 33, "🙏": 18 } }),
  P("p4", "photo", "esi-boateng", "2026-09-28", "Beginners built Zacchaeus' tree today — and every single leaf has a name on it, because Jesus knows each of us by name 🌳💛", { reactions: { "❤️": 120, "👍": 50, "😍": 27 } }),
  P("p5", "news", "yaw-amponsah", "2026-09-21", "New check-in from this Sunday: please collect your family QR card at the welcome desk. Only the adults listed on the card can collect children after service. Thank you for helping us keep everyone safe!", { reactions: { "👍": 64, "❤️": 30, "🙏": 18 } }),
  P("p6", "news", "kwame-mensah", "2026-09-14", "Seniors asked brilliant questions today about Daniel and standing firm when friends don't share your faith. Parents — ask them what they'd do in Daniel's shoes. You might be surprised 🦁", { reactions: { "❤️": 55, "👍": 28, "🙏": 12 } }),
];

const G = (id: string, title: string, category: string, date: string, order: number, description: string): GalleryDoc => ({
  id, title, category, date, order, description, cover: "", media: [], featured: order <= 4 ? "yes" : "no", status: "published",
});

export const seedGallery: GalleryDoc[] = [
  G("harvest-2025", "Children's Harvest 2025", "Children Harvest", "2025-10", 1, "Children led worship and brought gifts for our partner schools."),
  G("palm-sunday-2026", "Palm Sunday 2026", "Hosanna", "2026-03", 2, "Waving palms and singing Hosanna around the church."),
  G("graduation-2026", "Seniors Graduation 2026", "Graduation", "2026-07", 3, "Celebrating Seniors 2 as they move up to youth church."),
  G("camp-2026", "Children's Ministry Camp 2026", "Camping", "2026-08", 4, "Three days of games, Bible teaching and campfire worship."),
  G("parents-day-2026", "Parents Day 2026", "Parents Day", "2026-05", 5, "Families joined every class for the morning."),
  G("botanical-gardens", "Trip to the Botanical Gardens", "Excursion", "2026-06", 6, "Exploring God's creation at the Aburi gardens."),
  G("outreach-2025", "Neighbourhood Outreach", "Evangelism", "2025-12", 7, "Carols and gifts for our neighbours at Christmas."),
];

const F = (id: string, category: string, order: number, question: string, answer: string): FaqDoc => ({ id, category, order, question, answer, status: "published" });

export const seedFaqs: FaqDoc[] = [
  F("first-sunday", "Visiting", 1, "What should we expect on our first Sunday?", "Arrive about 15 minutes early and find our welcome desk by the main entrance. A team member will register your child, show you their classroom and introduce you to the teachers. Services run 9:00 – 10:45 am."),
  F("cost", "Visiting", 2, "Does it cost anything?", "No. Sunday classes, the midweek Bible Club and most events are free. For the occasional camp or outing we share costs well in advance, and no child is ever left out because of cost."),
  F("which-class", "Classes", 3, "Which class is right for my child?", "Children are grouped by age: Beginners (3–5), Primary (6–8), Juniors (9–10) and Seniors (11–13). If you're unsure, our welcome team will help you choose — children can always move to the class where they're happiest."),
  F("safety", "Safety", 4, "How do you keep children safe?", "Every teacher and helper is background-checked and safeguarding-trained. Classes always have at least two adults, children are signed in and out with a matching tag, and only the named parent or guardian can collect them."),
  F("allergies", "Safety", 5, "My child has allergies or additional needs. Who should I tell?", "Please mention it at registration, or message us beforehand. We note medical and support needs on your child's record, brief the class teachers, and are happy to talk through anything that will help your child feel at home."),
  F("stay", "Parents", 6, "Can I stay with my child?", "Of course. Many parents stay for the first week or two while their child settles in. You're always welcome to look in on the class, and teachers will come and find you if your child needs you."),
  F("at-home", "Parents", 7, "How can we keep learning at home?", "Each week's Bible lesson — with a memory verse, questions and a simple activity — is on the class pages, and the Bible games let children practise the stories at home."),
  F("contact-teacher", "Parents", 8, "How do I get in touch with a teacher?", "Send us a message through the contact page or WhatsApp and we'll pass it straight to your child's class teachers. You can also catch them at drop-off or pick-up on Sundays."),
];

const M = (id: string, year: string, order: number, title: string, description: string): MilestoneDoc => ({ id, year, order, title, description, image: "", status: "published" });

export const seedMilestones: MilestoneDoc[] = [
  M("m2006", "2006", 1, "Twelve children, one room", "Our children's ministry began in the church vestry with twelve children, two volunteer teachers and a borrowed flannel board."),
  M("m2011", "2011", 2, "Classes by age", "As numbers grew past sixty, we split into Beginners, Primary and Juniors so every child could learn at the right level."),
  M("m2015", "2015", 3, "Our first children's harvest", "Children led their own harvest service, raising food and school supplies for two partner schools in the Central Region."),
  M("m2019", "2019", 4, "Seniors and safer check-in", "We launched Seniors classes for ages 11–13 and introduced secure check-in, safeguarding training and police background checks for all teachers."),
  M("m2023", "2023", 5, "A new children's wing", "Nine bright classrooms opened, each designed around how children of that age learn, play and pray."),
  M("m2026", "2026", 6, "Our ministry goes digital", "Families can now follow each week's lesson, play Bible games and browse our clothing collection on this website."),
];

const U = (id: string, order: number, title: string, icon: string, color: string, testament: UnitDoc["testament"], stories: string[], description: string): UnitDoc => ({
  id, order, title, icon, color, testament, stories, description, status: "published",
});

export const seedUnits: UnitDoc[] = [
  U("beginning", 1, "In the Beginning", "🌳", "#22C55E", "OT", ["The Garden of Eden", "Abraham and Isaac"], "Creation, the first family and Abraham's great trust."),
  U("brave-hearts", 2, "Brave Hearts", "🦁", "#F59E0B", "OT", ["The Call of Gideon", "Jonah and the Great Fish"], "Ordinary people God made brave."),
  U("kings", 3, "Kings & Covenants", "👑", "#8B5CF6", "OT", ["The Ten Commandments at Sinai", "David's Charge to Solomon", "Josiah and the Book of the Law", "Josiah's Reforms"], "God's law and the kings who followed it."),
  U("meeting-jesus", 4, "Meeting Jesus", "✨", "#3B82F6", "NT", ["Jesus and Nicodemus", "The Rich Young Man", "The Woman Caught in Sin"], "People whose lives changed when they met Jesus."),
  U("easter", 5, "The Road to Easter", "✝️", "#EF4444", "NT", ["The Triumphal Entry", "The Last Supper and Gethsemane", "The Burial and Resurrection", "The Road to Emmaus"], "From Palm Sunday to the empty tomb."),
  U("early-church", 6, "The Early Church", "⛓️", "#0EA5E9", "NT", ["Paul and Silas in Philippi"], "Brave believers who sang even in prison."),
];
