import type { Role } from "./types";

/**
 * Rich snippets a canned answer can carry. Vehicle-bearing snippets are
 * resolved through findVehicleForRole() at render time, so the chatbot can
 * never show a persona a car it isn't allowed to see.
 */
export type ChatSnippet =
  | { kind: "vehicle"; vin: string }
  | { kind: "checks"; vin: string }
  | { kind: "link"; href: string; label: string };

export interface ChatQa {
  /** The suggested-question chip label, and the exact text matched on submit. */
  q: string;
  a: string;
  snippet?: ChatSnippet;
}

const HERO = "MALBB51RLSM104921";
const PRICE_CASE = "MALBB51RLSM104009";
const VARIANT_CASE = "MALBB51RLSM104010";
const SLA_CASE = "MALBB51RLSM104011";
const SUBSTITUTION_CASE = "MALBB51RLSM104012";
const TRANSIT_KRISHNA = "MALBB51RLSM104003";
const TRANSIT_METRO = "MALBB51RLSM104014";
const AWAITING_PICKUP = "MALBB51RLSM104004";
const FUNDING_PENDING_KRISHNA = "MALBB51RLSM104006";
const DELIVERED_KRISHNA = "MALBB51RLSM104001";

/** Every persona gets its own script — same shared record, six different questions. */
export const CHAT_SCRIPTS: Record<Role, ChatQa[]> = {
  hq: [
    {
      q: "Where is the pipeline stuck right now?",
      a: "Five cars are held up: one chassis mismatch, one price-circular mismatch, one variant mismatch, one funding request past the 72-hour SLA, and one substitution in progress with the Chandigarh RO.",
      snippet: { kind: "link", href: "/hq/exceptions", label: "Open the exception queue" },
    },
    {
      q: "Which car has been waiting longest?",
      a: "Chassis 4011 at Krishna Hyundai — the funding confirmation has been pending 76 hours, past the 48–72h dealer-finance norm.",
      snippet: { kind: "vehicle", vin: SLA_CASE },
    },
    {
      q: "What is blocking chassis 4921?",
      a: "The bank's funding confirmation cites chassis 4912; the HMIL invoice says 4921. One digit, transposed. Gate pass stays blocked until the two records agree.",
      snippet: { kind: "checks", vin: HERO },
    },
    {
      q: "Which bank is slower to fund?",
      a: "Across the seeded records, HDFC's dealer-finance desk averages roughly a day longer from funding request to confirmation than ICICI's. The funding-lag chart on your overview breaks it down.",
      snippet: { kind: "link", href: "/hq", label: "See the funding-lag chart" },
    },
    {
      q: "How is the North region doing?",
      a: "Chandigarh RO carries the bulk of the exceptions — Krishna Hyundai alone accounts for four of the five stuck cars. Metro Hyundai's single stuck car is a variant mismatch on chassis 4010.",
      snippet: { kind: "vehicle", vin: VARIANT_CASE },
    },
    {
      q: "What would fixing this be worth?",
      a: "Every stuck car is dealer working capital parked at the plant. Cutting the invoice-to-gate-out wait on these five cars alone frees the yard and pulls forward retail — without a single follow-up phone call.",
    },
  ],
  plant: [
    {
      q: "Which cars can I gate-out today?",
      a: "Any car whose five cross-checks are all CLEAR and whose funding has landed. The gate-pass button stays disabled everywhere else, so nothing leaves the yard against a mismatched document.",
      snippet: { kind: "link", href: "/plant/queue", label: "Open the gate-out queue" },
    },
    {
      q: "Why is chassis 4921 blocked?",
      a: "Chassis mismatch. The bank confirmed funding against 4912, the invoice is for 4921 — four of five checks are clear, that one is not.",
      snippet: { kind: "checks", vin: HERO },
    },
    {
      q: "What is holding chassis 4009?",
      a: "The invoice was priced off the July circular (PC-2026-07-01), but PC-2026-08-01 was active on the invoice date. Price match fails until the invoice is re-raised.",
      snippet: { kind: "vehicle", vin: PRICE_CASE },
    },
    {
      q: "What is the substitution case?",
      a: "Chassis 4012 was damaged during plant loading. A substitute VIN allocation is in progress with the Chandigarh RO; the funding request is reissued once that confirms.",
      snippet: { kind: "vehicle", vin: SUBSTITUTION_CASE },
    },
    {
      q: "Do I ever have to call the dealer?",
      a: "No. The moment the dealer's bank confirmation lands, the checks re-run here and the car turns green on this screen by itself. That is the phone call DhanFlow replaces.",
    },
  ],
  ro: [
    {
      q: "Which dealer is worst hit?",
      a: "Krishna Hyundai, Chandigarh. Four of its nine cars are stuck — a chassis mismatch, a price mismatch, a funding SLA breach and a substitution in progress.",
      snippet: { kind: "link", href: "/ro/dealers", label: "Open the dealer rollup" },
    },
    {
      q: "Which cars breach the 72-hour funding SLA?",
      a: "Chassis 4011 — the funding confirmation has been pending 76 hours. It is the one worth chasing this morning.",
      snippet: { kind: "vehicle", vin: SLA_CASE },
    },
    {
      q: "What is stuck at Krishna Hyundai?",
      a: "Chassis 4921 (chassis mismatch), 4009 (price circular), 4011 (funding pending 76h) and 4012 (substitution in progress).",
      snippet: { kind: "checks", vin: HERO },
    },
    {
      q: "What can I do about chassis 4921?",
      a: "Add a note on the VIN thread — it lands on the dealer's copy of the same record and shows up in the HQ exception queue. No email chain, no separate escalation form.",
      snippet: { kind: "vehicle", vin: HERO },
    },
    {
      q: "How many cars am I responsible for?",
      a: "Every car invoiced to a dealer in the Chandigarh region — both Krishna Hyundai and Metro Hyundai, Ludhiana. Cars outside your region never enter this view.",
    },
  ],
  dealer: [
    {
      q: "How many of my cars are at risk?",
      a: "Four. Chassis 4921 is held on a chassis mismatch, 4009 on a price circular, 4011 is waiting on your bank past the SLA, and 4012 is being substituted after loading damage.",
      snippet: { kind: "link", href: "/dealer/exceptions", label: "See all four" },
    },
    {
      q: "Where is my Creta SX(O)?",
      a: "Still at the Sriperumbudur plant. Funding was confirmed, but against chassis 4912 instead of 4921 — the gate pass is blocked on that one digit.",
      snippet: { kind: "vehicle", vin: HERO },
    },
    {
      q: "What do I need to do to unblock it?",
      a: "Ask HDFC to reissue the funding confirmation against chassis 4921. The moment it lands, all five checks turn green and the plant can issue the gate pass the same day.",
      snippet: { kind: "checks", vin: HERO },
    },
    {
      q: "When do my cars in transit arrive?",
      a: "Two cars are on the road from Sriperumbudur to Chandigarh, both running to promise. You can watch the truck move on the tracking screen.",
      snippet: { kind: "link", href: "/dealer/tracking", label: "View on map" },
    },
    {
      q: "Is funding confirmed for my Creta SX?",
      a: "Not yet — chassis 4006 is sitting at funding requested. It is inside the normal turnaround window, so nothing to chase today.",
      snippet: { kind: "vehicle", vin: FUNDING_PENDING_KRISHNA },
    },
    {
      q: "Which cars have I already received?",
      a: "Chassis 4001, the Titan Grey Creta SX(O), was delivered to your yard on 8 August — invoice to delivery in six days with no phone calls in between.",
      snippet: { kind: "vehicle", vin: DELIVERED_KRISHNA },
    },
  ],
  bank: [
    {
      q: "Which funding requests are still open?",
      a: "Two requests against Krishna Hyundai are still awaiting confirmation — chassis 4006 and chassis 4011.",
      snippet: { kind: "link", href: "/bank/funding", label: "Open the request table" },
    },
    {
      q: "Why is chassis 4921 flagged?",
      a: "Your confirmation references chassis 4912; HMIL's invoice is for 4921. DhanFlow flags the difference rather than letting the car sit at the plant unexplained.",
      snippet: { kind: "checks", vin: HERO },
    },
    {
      q: "Which request is oldest?",
      a: "Chassis 4011 — requested 76 hours ago, past the 48–72 hour dealer-finance norm.",
      snippet: { kind: "vehicle", vin: SLA_CASE },
    },
    {
      q: "What happens when I mark funding released?",
      a: "The status flips on the one shared record: the dealer sees it, the plant's checks re-run, and — if everything matches — the car becomes gate-pass eligible immediately.",
    },
    {
      q: "Does DhanFlow send you documents?",
      a: "No. DhanFlow never sends anything to a bank and never creates an invoice. It reads the status of a funding request and shows it to everyone who needs it.",
    },
  ],
  lsp: [
    {
      q: "Which trip is running late?",
      a: "The Ludhiana run is held at the Nagpur checkpoint for inspection — roughly two days behind the promise date. The Chandigarh run is on schedule.",
      snippet: { kind: "link", href: "/lsp/tracking", label: "View on map" },
    },
    {
      q: "Where is truck PB-11-AT-5590?",
      a: "Past the Nagpur checkpoint and running to plan on the Sriperumbudur → Chandigarh leg, carrying cars for Krishna Hyundai.",
      snippet: { kind: "vehicle", vin: TRANSIT_KRISHNA },
    },
    {
      q: "Which car is behind schedule?",
      a: "Chassis 4014, on the Ludhiana leg — held at Nagpur for inspection, about two days past its promised arrival.",
      snippet: { kind: "vehicle", vin: TRANSIT_METRO },
    },
    {
      q: "Which cars are waiting for pickup?",
      a: "Chassis 4004 has its gate pass and is standing in the plant yard awaiting pickup.",
      snippet: { kind: "vehicle", vin: AWAITING_PICKUP },
    },
    {
      q: "What do I update when I deliver?",
      a: "Set the milestone to 'Delivered to Dealer' on the car. The dealer's ETA line updates on the same record instantly — no proof-of-delivery email to anybody.",
    },
  ],
};

export const CHAT_FALLBACK =
  "In this demo I answer the suggested questions — in production I answer anything the shared record knows.";
