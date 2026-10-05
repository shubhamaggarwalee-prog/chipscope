import { dayNumber } from '@/lib/learningCalendar';

export interface LearningSource { label: string; url: string }
export interface LearningFact {
  id: string;
  year: number;
  title: string;
  body: string;
  whyItMatters: string;
  topic: 'Origins' | 'Inventions' | 'Industry';
  source: LearningSource;
  quiz: { question: string; options: [string, string, string]; correctIndex: number };
}

const museum = (path: string): LearningSource => ({
  label: 'Computer History Museum',
  url: `https://www.computerhistory.org/siliconengine/${path}/`,
});
export const CONTENT_REVIEWED_ON = '2026-10-05';

/** Separate learning content: the supplied teardown JSON remains unchanged. */
export const LEARNING_FACTS: LearningFact[] = [
  {
    id: 'first-effect', year: 1833, topic: 'Origins', title: 'It started before the transistor',
    body: 'The Computer History Museum traces the first recorded semiconductor effect to 1833. Semiconductor science began long before computers or microchips.',
    whyItMatters: '1947 marks the transistor era, not the beginning of all semiconductor research.',
    source: museum('first-semiconductor-effect-is-recorded'),
    quiz: { question: 'Does semiconductor history begin with the 1947 transistor?', options: ['Yes, nothing came before it', 'No, earlier effects were studied in the 1800s', 'It began with the smartphone'], correctIndex: 1 },
  },
  {
    id: 'rectifier', year: 1874, topic: 'Origins', title: 'A material that treats directions differently',
    body: 'In 1874, Ferdinand Braun discovered the semiconductor point-contact rectifier effect. A rectifier conducts differently depending on the direction of current.',
    whyItMatters: 'Rectification became a foundation for semiconductor detectors and diodes.',
    source: museum('semiconductor-point-contact-rectifier-effect-is-discovered'),
    quiz: { question: 'What does a rectifier do?', options: ['Stores an entire computer program', 'Makes current flow equally in both directions', 'Conducts differently in opposite directions'], correctIndex: 2 },
  },
  {
    id: 'pn-junction', year: 1940, topic: 'Origins', title: 'The junction behind transistors and solar cells',
    body: 'Russell Ohl discovered the p-n junction and photovoltaic effects in silicon in 1940. These discoveries helped lead to junction transistors and solar cells.',
    whyItMatters: 'The same semiconductor physics connects computing and solar energy.',
    source: museum('discovery-of-the-p-n-junction'),
    quiz: { question: 'Which two technologies were helped by p-n junction research?', options: ['Junction transistors and solar cells', 'Steam engines and turbines', 'Mechanical clocks and typewriters'], correctIndex: 0 },
  },
  {
    id: 'first-transistor', year: 1947, topic: 'Inventions', title: 'The transistor era begins',
    body: 'John Bardeen and Walter Brattain achieved transistor action in a germanium point-contact device at Bell Labs in December 1947.',
    whyItMatters: 'An electronic device could amplify a signal without relying on a vacuum tube.',
    source: museum('invention-of-the-point-contact-transistor'),
    quiz: { question: 'What material was used in the 1947 point-contact transistor?', options: ['Graphene', 'Germanium', 'Diamond'], correctIndex: 1 },
  },
  {
    id: 'silicon-transistors', year: 1954, topic: 'Inventions', title: 'Silicon earns its place',
    body: 'The museum’s 1954 milestone records silicon transistors offering superior operating characteristics. Silicon became a central material in transistor manufacturing.',
    whyItMatters: 'Today’s “silicon” industry grew out of choices about materials, not just circuit designs.',
    source: museum('silicon-transistors-offer-superior-operating-characteristics'),
    quiz: { question: 'Which material is highlighted in this 1954 transistor milestone?', options: ['Silicon', 'Wood', 'Copper wire alone'], correctIndex: 0 },
  },
  {
    id: 'kilby-circuit', year: 1958, topic: 'Inventions', title: 'An entire circuit in semiconductor material',
    body: 'Jack Kilby demonstrated an all-semiconductor “solid circuit” in 1958, combining active and passive components fabricated from semiconductor material.',
    whyItMatters: 'Putting components together opened the path from individual transistors to integrated circuits.',
    source: museum('all-semiconductor-solid-circuit-is-demonstrated'),
    quiz: { question: 'Who demonstrated the all-semiconductor solid circuit in 1958?', options: ['Gordon Moore', 'Jensen Huang', 'Jack Kilby'], correctIndex: 2 },
  },
  {
    id: 'planar-process', year: 1959, topic: 'Inventions', title: 'Manufacturing becomes part of the invention',
    body: 'Jean Hoerni developed the planar manufacturing process in 1959. This surface-based approach became a key step toward practical integrated circuits.',
    whyItMatters: 'A good circuit must also be manufacturable repeatedly and at scale.',
    source: museum('invention-of-the-planar-manufacturing-process'),
    quiz: { question: 'What did Jean Hoerni develop in 1959?', options: ['The planar manufacturing process', 'The smartphone app store', 'A mechanical calculator'], correctIndex: 0 },
  },
  {
    id: 'noyce-monolithic', year: 1959, topic: 'Inventions', title: 'The practical monolithic circuit',
    body: 'Robert Noyce built on Hoerni’s planar process to patent a monolithic integrated-circuit structure in 1959 that could be manufactured in high volume.',
    whyItMatters: 'Integration matters most when manufacturers can produce usable chips in large numbers.',
    source: museum('practical-monolithic-integrated-circuit-concept-patented'),
    quiz: { question: 'Which process did Noyce build on for his monolithic IC concept?', options: ['Steam-powered machining', 'Hoerni’s planar process', '3D graphics rendering'], correctIndex: 1 },
  },
  {
    id: 'mos-transistor', year: 1960, topic: 'Inventions', title: 'The MOS transistor is demonstrated',
    body: 'Atalla and Dawon Kahng fabricated working MOS transistors and demonstrated a successful MOS field-effect amplifier. The museum records this milestone in 1960.',
    whyItMatters: 'MOS technology is central to the story of highly integrated electronics.',
    source: museum('metal-oxide-semiconductor-mos-transistor-demonstrated'),
    quiz: { question: 'What does MOS stand for?', options: ['Memory-only storage', 'Mechanical optical switch', 'Metal-oxide-semiconductor'], correctIndex: 2 },
  },
  {
    id: 'cmos', year: 1963, topic: 'Inventions', title: 'Complementary transistors team up',
    body: 'The complementary MOS circuit configuration was invented in 1963. CMOS combines complementary transistor types rather than relying on only one type.',
    whyItMatters: 'CMOS is a major part of the evolution toward modern integrated circuits.',
    source: museum('complementary-mos-circuit-configuration-is-invented'),
    quiz: { question: 'What is the “C” in CMOS?', options: ['Complementary', 'Carbon', 'Commercial'], correctIndex: 0 },
  },
  {
    id: 'commercial-mos', year: 1964, topic: 'Inventions', title: 'MOS reaches commercial chips',
    body: 'General Microelectronics introduced a commercial MOS integrated circuit in 1964 and built a calculator chip set using the technology.',
    whyItMatters: 'Everyday calculators were an important market for early chip integration.',
    source: museum('first-commercial-mos-ic-introduced'),
    quiz: { question: 'Which everyday product used this early commercial MOS chip set?', options: ['A steam locomotive', 'A calculator', 'A modern smartwatch'], correctIndex: 1 },
  },
  {
    id: 'intel-4004', year: 1971, topic: 'Inventions', title: 'A processor on a chip',
    body: 'Intel introduced the 4004 in November 1971. Developed for a Japanese calculator maker, this early commercial microprocessor worked in four-bit chunks.',
    whyItMatters: 'A programmable processor can do different jobs by following different instructions.',
    source: { label: 'Computer History Museum', url: 'https://www.computerhistory.org/timeline/computers/' },
    quiz: { question: 'How wide were the Intel 4004’s processing chunks?', options: ['64 bits', '32 bits', '4 bits'], correctIndex: 2 },
  },
  {
    id: 'asml-founded', year: 1984, topic: 'Industry', title: 'A chip-machine company starts in a shed',
    body: 'Philips and ASMI created ASM Lithography in 1984. The company that became ASML began in a shed near a Philips office in Eindhoven.',
    whyItMatters: 'Chip manufacturing depends on specialized equipment companies as well as chip designers and factories.',
    source: { label: 'ASML company history', url: 'https://www.asml.com/en/company/about-asml/history' },
    quiz: { question: 'Which companies created ASML in 1984?', options: ['Philips and ASMI', 'Apple and Samsung', 'Intel and NVIDIA'], correctIndex: 0 },
  },
  {
    id: 'tsmc-founded', year: 1987, topic: 'Industry', title: 'The foundry business model takes shape',
    body: 'TSMC was established in 1987 and pioneered the pure-play foundry model: manufacturing customers’ chips without competing with their branded chip products.',
    whyItMatters: 'A chip company can design a product without owning the factories that manufacture it.',
    source: { label: 'TSMC 2025 annual report', url: 'https://investor.tsmc.com/static/annualReports/2025/english/index.html' },
    quiz: { question: 'What is a pure-play foundry focused on?', options: ['Selling only its own chip designs', 'Manufacturing customers’ chip designs', 'Writing smartphone operating systems'], correctIndex: 1 },
  },
  {
    id: 'nvidia-founded', year: 1993, topic: 'Industry', title: 'NVIDIA starts with a graphics vision',
    body: 'Jensen Huang, Chris Malachowsky, and Curtis Priem founded NVIDIA on April 5, 1993, with a vision for 3D graphics in gaming and multimedia.',
    whyItMatters: 'The origins of a company can be very different from the markets it later helps shape.',
    source: { label: 'NVIDIA corporate timeline', url: 'https://www.nvidia.com/en-us/about-nvidia/corporate-timeline/' },
    quiz: { question: 'What was NVIDIA’s founding focus?', options: ['Solar panels', '3D graphics for gaming and multimedia', 'Memory-card manufacturing'], correctIndex: 1 },
  },
];

export interface IndustryLeader {
  id: string; name: string; segment: string; headline: string; explanation: string;
  period: string; source: LearningSource; relatedVendors: string[];
}
export const INDUSTRY_LEADERS: IndustryLeader[] = [
  {
    id: 'nvidia', name: 'NVIDIA', segment: 'Semiconductor vendor revenue',
    headline: 'Led Gartner’s 2025 vendor ranking',
    explanation: 'Gartner’s public 2025 market-share analysis says NVIDIA maintained its leadership as AI infrastructure spending drove industry growth. This is a vendor-revenue ranking, not a ranking of manufacturing factories.',
    period: '2025 market · analysis published March 2026',
    source: { label: 'Gartner public research summary', url: 'https://www.gartner.com/en/documents/7652461' },
    relatedVendors: ['NVIDIA'],
  },
  {
    id: 'tsmc', name: 'TSMC', segment: 'Dedicated semiconductor foundries',
    headline: 'Manufacturing specialist, not a consumer chip brand',
    explanation: 'TSMC describes itself as a world-leading dedicated foundry in its 2025 annual report. Its role is to manufacture customers’ designs. That is a different category from companies that sell their own chip products.',
    period: '2025 annual report',
    source: { label: 'TSMC annual report', url: 'https://investor.tsmc.com/static/annualReports/2025/english/index.html' },
    relatedVendors: ['Apple', 'Qualcomm', 'MediaTek', 'NVIDIA'],
  },
  {
    id: 'asml', name: 'ASML', segment: 'EUV lithography equipment',
    headline: 'The only EUV system manufacturer in its 2025 report',
    explanation: 'ASML’s 2025 annual report identifies it as the world’s only manufacturer of EUV lithography systems. These machines help pattern advanced chips; ASML is not itself a foundry or a chip-design vendor.',
    period: '2025 annual report · published February 2026',
    source: { label: 'ASML annual report (PDF)', url: 'https://ourbrand.asml.com/m/6ea363f69344ebd4/original/asml-2025-annual-report-based-on-ifrs.pdf' },
    relatedVendors: [],
  },
];

export function getDailyFact(day: string): LearningFact {
  return LEARNING_FACTS[dayNumber(day) % LEARNING_FACTS.length]!;
}
export function getDailyQuiz(day: string, storedQuestionId?: string): LearningFact {
  return LEARNING_FACTS.find((fact) => fact.id === storedQuestionId)
    ?? LEARNING_FACTS[(dayNumber(day) + 7) % LEARNING_FACTS.length]!;
}
