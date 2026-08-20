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
const AWAITING_CHECKS_KRISHNA = "MALBB51RLSM104006";
const DELIVERED_KRISHNA = "MALBB51RLSM104001";

/** Every persona gets its own script — same shared record, six different questions. */
export const CHAT_SCRIPTS: Record<Role, ChatQa[]> = {
  hq: [
    {
      q: "Where is the pipeline stuck right now?",
      a: "Five cars are held up: dispatch papers raised against the wrong chassis, a superseded price circular, an allocation variant mismatch, one car past the 48-hour document-verification SLA, and one substitution after loading damage.",
      snippet: { kind: "link", href: "/hq/exceptions", label: "Open the exception queue" },
    },
    {
      q: "Which car has been waiting longest?",
      a: "Chassis 4011 at Krishna Hyundai — document verification has been open 76 hours against a 48-hour SLA, so no dispatch paperwork exists yet.",
      snippet: { kind: "vehicle", vin: SLA_CASE },
    },
    {
      q: "What is blocking chassis 4921?",
      a: "The e-way bill and challan were raised against chassis 4912; the invoice says 4921. One digit, transposed. The gate pass stays blocked until the papers and the invoice agree.",
      snippet: { kind: "checks", vin: HERO },
    },
    {
      q: "Which leg is costing the most time?",
      a: "Allocation to documents-verified is the slow leg — it is where cars sit while a mismatch is chased. The dwell chart on your overview breaks the whole flow down leg by leg.",
      snippet: { kind: "link", href: "/hq", label: "See the dwell chart" },
    },
    {
      q: "How is the North region doing?",
      a: "Chandigarh RO carries the bulk of the exceptions — Krishna Hyundai alone accounts for four of the five stuck cars. Metro Hyundai's single stuck car is a variant mismatch on chassis 4010.",
      snippet: { kind: "vehicle", vin: VARIANT_CASE },
    },
    {
      q: "Which dealer orders are waiting on me?",
      a: "Two bookings from Krishna Hyundai are unverified — a Creta SX(O) pair that can go off stock, and three Verna SX that need a build slot and will land after the date the dealer asked for.",
      snippet: { kind: "link", href: "/hq/orders", label: "Open the order book" },
    },
    {
      q: "Are any documents out of line?",
      a: "The rulebook is flagging dispatch papers on the wrong chassis, a superseded price circular, an allocation variant mismatch, a challan raised against the wrong dealer code, a lapsed e-way bill and two missing attachments.",
      snippet: { kind: "link", href: "/hq/compliance", label: "Open the compliance report" },
    },
    {
      q: "What would fixing this be worth?",
      a: "Every stuck car is dealer working capital parked at the plant. Cutting the invoice-to-gate-out wait on these five cars alone frees the yard and pulls forward retail — without a single follow-up phone call.",
    },
  ],
  plant: [
    {
      q: "Which cars can I gate-out today?",
      a: "Any car whose five cross-checks are clear and whose e-way bill and challan are raised against the right chassis. The gate-pass button stays disabled everywhere else, so nothing leaves the yard against a mismatched document.",
      snippet: { kind: "link", href: "/plant/queue", label: "Open the gate-out queue" },
    },
    {
      q: "Why is chassis 4921 blocked?",
      a: "Chassis mismatch. The dispatch papers were raised against 4912, the invoice is for 4921 — four of five checks are clear, that one is not.",
      snippet: { kind: "checks", vin: HERO },
    },
    {
      q: "What is holding chassis 4009?",
      a: "The invoice was priced off the July circular (PC-2026-07-01), but PC-2026-08-01 was active on the invoice date. Price match fails until the invoice is re-raised.",
      snippet: { kind: "vehicle", vin: PRICE_CASE },
    },
    {
      q: "What is the substitution case?",
      a: "Chassis 4012 was damaged during plant loading. A substitute VIN allocation is in progress with the Chandigarh RO; the invoice is re-raised against the substitute unit once that confirms.",
      snippet: { kind: "vehicle", vin: SUBSTITUTION_CASE },
    },
    {
      q: "Do I ever have to call the dealer?",
      a: "No. The moment a document is corrected anywhere, the checks re-run here and the car turns green on this screen by itself. That is the phone call DhanFlow replaces.",
    },
  ],
  ro: [
    {
      q: "Which dealer is worst hit?",
      a: "Krishna Hyundai, Chandigarh. Four of its nine cars are stuck — dispatch papers on the wrong chassis, a price mismatch, a document-verification SLA breach and a substitution in progress.",
      snippet: { kind: "link", href: "/ro/dealers", label: "Open the dealer rollup" },
    },
    {
      q: "Which cars are past their SLA?",
      a: "Chassis 4011 — document verification has been open 76 hours against a 48-hour promise. It is the one worth chasing this morning.",
      snippet: { kind: "vehicle", vin: SLA_CASE },
    },
    {
      q: "What is stuck at Krishna Hyundai?",
      a: "Chassis 4921 (papers on the wrong chassis), 4009 (price circular), 4011 (verification open 76h) and 4012 (substitution in progress).",
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
      a: "Four. Chassis 4921 is held on dispatch papers raised against the wrong chassis, 4009 on a superseded price circular, 4011 is past its document-verification SLA, and 4012 is being substituted after loading damage.",
      snippet: { kind: "link", href: "/dealer/exceptions", label: "See all four" },
    },
    {
      q: "Where is my Creta SX(O)?",
      a: "Still at the Sriperumbudur plant. The e-way bill and challan were raised against chassis 4912 instead of 4921 — the gate pass is blocked on that one digit.",
      snippet: { kind: "vehicle", vin: HERO },
    },
    {
      q: "What do I need to do to unblock it?",
      a: "The plant has to cancel the e-way bill on 4912 and re-raise it against 4921. The moment it lands, all five checks turn green and the gate pass can be issued the same day.",
      snippet: { kind: "checks", vin: HERO },
    },
    {
      q: "When do my cars in transit arrive?",
      a: "Two cars are on the road from Sriperumbudur to Chandigarh, both running to promise. You can watch the truck move on the tracking screen.",
      snippet: { kind: "link", href: "/dealer/tracking", label: "View on map" },
    },
    {
      q: "Are the papers ready on my Creta SX?",
      a: "Not yet — chassis 4006 is with the plant for document verification, still inside the 48-hour SLA, so nothing to chase today.",
      snippet: { kind: "vehicle", vin: AWAITING_CHECKS_KRISHNA },
    },
    {
      q: "Can I book more cars for Diwali?",
      a: "Yes — the booking desk checks the plant's live position as you type, so you know before you submit whether the cars come off stock or need a build slot.",
      snippet: { kind: "link", href: "/dealer/orders", label: "Book an order" },
    },
    {
      q: "Are my papers in order?",
      a: "Mostly. The rulebook is holding one chassis mismatch and one price-circular problem against your cars, plus a challan raised on the wrong dealer code that nobody would have caught by eye.",
      snippet: { kind: "link", href: "/dealer/compliance", label: "Open the compliance report" },
    },
    {
      q: "Which cars have I already received?",
      a: "Chassis 4001, the Titan Grey Creta SX(O), was delivered to your yard on 8 August — invoice to delivery in six days with no phone calls in between.",
      snippet: { kind: "vehicle", vin: DELIVERED_KRISHNA },
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
