"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Palette (pulled from reference image) ──────────────────────────────────────
// Background:   #040202  (near-absolute black with red undertone)
// Primary red:  #C8102E  (TED red)
// Deep crimson: #8B0000  (dark energy veins)
// Blood glow:   #E02020  (mid-energy)
// Hot core:     #FF2A2A  (brightest red, the touch point)
// Text primary: #c0282a  → no. Text must be legible — use #b03030 for muted, #e84040 for accent
// All "white" replaced with very pale red: #ffd6d6 at low opacity
// ──────────────────────────────────────────────────────────────────────────────

const C = {
  bg: "#040202",
  bgSection: "#070101",
  red: "#C8102E",
  redHot: "#FF2A2A",
  redDeep: "#6B0010",
  text: "rgba(235,195,195,0.95)", // boosted — warm off-white with red tint
  textMuted: "rgba(210,145,145,0.78)", // was 0.45 — much more visible now
  textDim: "rgba(195,120,120,0.62)", // was 0.28 — readable body copy
  textGhost: "rgba(175,100,100,0.48)", // was 0.18 — labels & metadata
  border: "rgba(180,30,30,0.18)",
  borderMid: "rgba(180,30,30,0.28)",
};

const SPEAKERS = [
  {
    name: "Dr. Anya Krishnan",
    role: "Cognitive Neuroscientist",
    talk: "The Neurology of Empathy",
    org: "IIT Bombay",
  },
  {
    name: "Rahul Mehrotra",
    role: "Architect & Urbanist",
    talk: "Cities That Remember",
    org: "Harvard GSD",
  },
  {
    name: "Leila Nasser",
    role: "Conflict Mediator",
    talk: "Silence as a Language",
    org: "UN Geneva",
  },
  {
    name: "Vikram Anand",
    role: "Poet & Essayist",
    talk: "What Words Cannot Hold",
    org: "JNU Delhi",
  },
];

const SCHEDULE = [
  { time: "09:00", event: "Doors Open", type: "logistics" },
  { time: "09:45", event: "Opening Address", type: "session" },
  { time: "10:15", event: "Dr. Anya Krishnan", type: "talk" },
  { time: "11:00", event: "Rahul Mehrotra", type: "talk" },
  { time: "11:45", event: "Intermission", type: "logistics" },
  { time: "13:00", event: "Leila Nasser", type: "talk" },
  { time: "13:45", event: "Vikram Anand", type: "talk" },
  { time: "14:30", event: "Closing Ceremony", type: "session" },
];

// ── Film grain ────────────────────────────────────────────────────────────────
function Grain() {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ opacity: 0.045, mixBlendMode: "screen" }}
    >
      <filter id="g">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#g)" />
    </svg>
  );
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Section label + rule ──────────────────────────────────────────────────────
function Rule({ label }) {
  return (
    <div className="flex items-center gap-5 mb-16">
      <span
        className="text-[10px] uppercase tracking-[0.38em] whitespace-nowrap"
        style={{ fontFamily: "sans-serif", color: C.textDim }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: C.border }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function ProfileAvatar({ session }) {
  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "?";
  return session?.user?.image ? (
    <img
      src={session.user.image}
      alt={session.user.name ?? "Profile"}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: `1px solid rgba(200,16,46,0.55)`,
        objectFit: "cover",
        display: "block",
      }}
    />
  ) : (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: `1px solid rgba(200,16,46,0.55)`,
        background: "rgba(200,16,46,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        color: "#C8102E",
        fontFamily: "sans-serif",
        letterSpacing: 0,
      }}
    >
      {initial}
    </div>
  );
}

export default function TEDxVITPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(null);

  const { scrollYProgress } = useScroll();
  const { scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const heroY = useTransform(scrollY, [0, 700], [0, 90]);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: C.bg,
        fontFamily: "'Georgia','Times New Roman',serif",
        color: C.text,
      }}
    >
      <Grain />

      {/* Scroll progress — deep red line */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] origin-left"
        style={{
          scaleX,
          height: 1,
          background: `linear-gradient(to right, ${C.redDeep}, ${C.redHot})`,
        }}
      />

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-5"
        style={{
          background: `linear-gradient(to bottom, rgba(4,2,2,0.97), transparent)`,
        }}
      >
        <div
          className="text-sm tracking-[0.22em] uppercase"
          style={{ fontFamily: "sans-serif", fontWeight: 600 }}
        >
          <span style={{ color: C.red }}>TED</span>
          <span style={{ color: C.textDim }}>x</span>
          <span style={{ color: C.textMuted }}> VIT</span>
        </div>

        <div className="flex items-center gap-5">
          <span
            className="hidden md:block text-[11px] tracking-[0.22em] uppercase"
            style={{ fontFamily: "sans-serif", color: C.textGhost }}
          >
            28 March 2026
          </span>

          {status === "authenticated" ? (
            // ── Logged in: avatar + name + logout ──
            <div className="flex items-center gap-3">
              <ProfileAvatar session={session} />
              <span
                className="hidden md:block text-[11px] tracking-[0.1em]"
                style={{
                  fontFamily: "sans-serif",
                  color: C.textMuted,
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session?.user?.name?.split(" ")[0]}
              </span>
              <motion.button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="text-[11px] tracking-[0.2em] uppercase px-5 py-2 border"
                style={{
                  fontFamily: "sans-serif",
                  borderColor: C.redDeep,
                  color: C.textDim,
                }}
                whileHover={{ borderColor: C.red, color: C.red }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.button>
            </div>
          ) : (
            // ── Not logged in: sign in button ──
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <motion.button
                className="text-[11px] tracking-[0.2em] uppercase px-5 py-2 border"
                style={{
                  fontFamily: "sans-serif",
                  borderColor: C.redDeep,
                  color: C.textDim,
                  background: "transparent",
                  cursor: "pointer",
                }}
                whileHover={{ borderColor: C.red, color: C.red }}
                transition={{ duration: 0.2 }}
              >
                Sign In
              </motion.button>
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-screen flex flex-col justify-end pb-24 px-8 md:px-16 overflow-hidden">
        {/* Void base */}
        <div className="absolute inset-0" style={{ background: C.bg }} />

        {/* soul.png — centered, parallax, desaturated slightly to blend into dark bg */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/soul.png')",
              backgroundSize: "65%",
              backgroundPosition: "center 30%",
              backgroundRepeat: "no-repeat",
              opacity: 0.18,
              filter: "saturate(1.4) brightness(0.75)",
              mixBlendMode: "lighten",
            }}
          />
        </motion.div>

        {/* Vignette layer 1 — deep radial darkness pushing in from all edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 60% at 50% 38%, transparent 0%, rgba(4,2,2,0.55) 55%, rgba(4,2,2,0.97) 100%)",
          }}
        />

        {/* Vignette layer 2 — top & bottom hard fade to solid black */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(4,2,2,1) 0%, rgba(4,2,2,0.0) 18%, rgba(4,2,2,0.0) 65%, rgba(4,2,2,1) 100%)",
          }}
        />

        {/* Vignette layer 3 — left & right edge crush */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(4,2,2,0.92) 0%, rgba(4,2,2,0.0) 22%, rgba(4,2,2,0.0) 78%, rgba(4,2,2,0.92) 100%)",
          }}
        />

        {/* Red atmosphere — subtle bloom over the image to tint it deeper */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 50% at 50% 35%, rgba(200,16,46,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Hero text */}
        <div className="relative z-10 max-w-6xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.4 }}
            className="text-[11px] tracking-[0.44em] uppercase mb-9"
            style={{ fontFamily: "sans-serif", color: `${C.red}99` }}
          >
            TEDx VIT &nbsp;·&nbsp; Vellore &nbsp;·&nbsp; MMXXVI
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
            className="font-normal leading-[0.87] mb-12"
            style={{
              fontSize: "clamp(4.5rem, 12vw, 11rem)",
              letterSpacing: "-0.025em",
              color: "rgba(210,140,140,0.9)",
            }}
          >
            Touching
            <br />
            <span style={{ fontStyle: "italic", color: C.red }}>the Souls</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.3, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-end gap-10"
          >
            <p
              className="max-w-sm text-base leading-relaxed"
              style={{
                fontFamily: "sans-serif",
                fontWeight: 300,
                color: C.textDim,
                lineHeight: 1.85,
              }}
            >
              An evening where ideas move past language — into the still space
              where one consciousness genuinely meets another.
            </p>
            <motion.a
              href="#register"
              className="shrink-0 border px-10 py-4 text-[11px] tracking-[0.28em] uppercase cursor-pointer"
              style={{
                fontFamily: "sans-serif",
                borderColor: C.redDeep,
                color: C.textDim,
              }}
              whileHover={{ borderColor: C.red, color: C.red }}
              transition={{ duration: 0.2 }}
            >
              Reserve a Seat
            </motion.a>
          </motion.div>
        </div>

        {/* Scroll line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-10 right-8 md:right-16"
        >
          <motion.div
            animate={{ scaleY: [1, 0.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-14 mx-auto origin-top"
            style={{
              background: `linear-gradient(to bottom, ${C.redDeep}, transparent)`,
            }}
          />
        </motion.div>
      </section>

      {/* ── THEME STATEMENT ── */}
      <section
        className="px-8 md:px-16 py-36 md:py-52"
        style={{ background: C.bg }}
      >
        <Rule label="The Theme" />
        <div className="grid md:grid-cols-12 gap-10">
          <Reveal className="md:col-span-7">
            <blockquote
              className="font-normal leading-[1.3]"
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 3rem)",
                color: "rgba(210,130,130,0.82)",
                letterSpacing: "-0.01em",
              }}
            >
              "Every profound idea begins not as a thought — but as a tremor. A
              recognition that someone else has witnessed what you have
              witnessed."
            </blockquote>
          </Reveal>

          <Reveal
            delay={0.18}
            className="md:col-span-4 md:col-start-9 flex flex-col justify-end gap-7"
          >
            <div className="w-10 h-px" style={{ background: C.red }} />
            <p
              className="text-sm"
              style={{
                fontFamily: "sans-serif",
                fontWeight: 300,
                color: C.textMuted,
                lineHeight: 1.95,
              }}
            >
              Touching the Souls is not a sentiment. It is a precise description
              of what occurs when an idea — carried by a human voice, in a room
              of attentive people — makes contact with another consciousness and
              alters it permanently.
            </p>
            <p
              className="text-sm"
              style={{
                fontFamily: "sans-serif",
                fontWeight: 300,
                color: C.textDim,
                lineHeight: 1.95,
              }}
            >
              This year, TEDx VIT asks its speakers — and its audience — to take
              that moment of contact seriously.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Hairline */}
      <div className="mx-8 md:mx-16 h-px" style={{ background: C.border }} />

      {/* ── PILLARS ── */}
      <section
        className="px-8 md:px-16 py-32 md:py-44"
        style={{
          background: `linear-gradient(180deg, ${C.bg} 0%, #0a0101 50%, ${C.bg} 100%)`,
        }}
      >
        <Rule label="What We Explore" />
        <div
          className="grid md:grid-cols-3 gap-px"
          style={{ background: C.border }}
        >
          {[
            {
              num: "I",
              title: "Presence",
              body: "In an age of infinite distraction, what does it mean to be fully present with another person — to give them the complete weight of your attention?",
            },
            {
              num: "II",
              title: "Resonance",
              body: "Ideas do not transfer — they resonate. They find the harmonic frequency of shared experience. What allows an idea to cross radical difference?",
            },
            {
              num: "III",
              title: "Transformation",
              body: "The soul that has been genuinely touched is not the same soul. We examine the before and after of real intellectual contact.",
            },
          ].map((p, i) => (
            <Reveal key={p.num} delay={i * 0.1}>
              <motion.div
                className="p-10 md:p-14 h-full"
                style={{ background: C.bg }}
                whileHover={{ background: "#0a0101" }}
                transition={{ duration: 0.4 }}
              >
                <span
                  className="block text-[11px] tracking-[0.35em] uppercase mb-10"
                  style={{ fontFamily: "sans-serif", color: `${C.red}55` }}
                >
                  {p.num}
                </span>
                <h3
                  className="font-normal mb-6"
                  style={{
                    fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                    letterSpacing: "-0.01em",
                    color: "rgba(200,120,120,0.7)",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: "sans-serif",
                    fontWeight: 300,
                    color: C.textDim,
                    lineHeight: 1.95,
                  }}
                >
                  {p.body}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SPEAKERS ── */}
      <section
        className="px-8 md:px-16 py-32 md:py-44"
        style={{ background: C.bg }}
      >
        <Rule label="Speakers" />
        <div>
          {SPEAKERS.map((s, i) => (
            <motion.div
              key={s.name}
              onHoverStart={() => setActiveIdx(i)}
              onHoverEnd={() => setActiveIdx(null)}
              className="relative grid grid-cols-12 gap-4 items-center py-9 border-t cursor-default"
              style={{ borderColor: C.border }}
            >
              <span
                className="col-span-1 text-xs"
                style={{ fontFamily: "sans-serif", color: C.textGhost }}
              >
                0{i + 1}
              </span>

              <motion.h3
                className="col-span-5 md:col-span-4 font-normal text-xl md:text-2xl"
                animate={{
                  x: activeIdx === i ? 8 : 0,
                  color:
                    activeIdx === i
                      ? "rgba(220,150,150,0.9)"
                      : "rgba(190,110,110,0.42)",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ letterSpacing: "-0.01em" }}
              >
                {s.name}
              </motion.h3>

              <div className="hidden md:block col-span-4">
                <motion.p
                  className="text-sm italic"
                  animate={{
                    color: activeIdx === i ? `${C.red}cc` : `${C.red}33`,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ fontWeight: 300 }}
                >
                  "{s.talk}"
                </motion.p>
              </div>

              <div className="col-span-6 md:col-span-3 text-right">
                <p
                  className="text-[11px] tracking-[0.14em] uppercase leading-relaxed"
                  style={{ fontFamily: "sans-serif", color: C.textDim }}
                >
                  {s.role}
                  <br />
                  <span style={{ color: C.textGhost }}>{s.org}</span>
                </p>
              </div>

              <motion.div
                className="absolute bottom-0 left-0 right-0 origin-left"
                style={{
                  height: 1,
                  background: `linear-gradient(to right, ${C.redDeep}, ${C.red})`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: activeIdx === i ? 1 : 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>
          ))}
          <div className="border-t" style={{ borderColor: C.border }} />
        </div>
      </section>

      {/* ── SCHEDULE ── */}
      <section
        className="px-8 md:px-16 py-24 md:py-40"
        style={{ background: C.bg }}
      >
        <Rule label="Programme · 28 March 2026" />
        <div className="max-w-xl">
          {SCHEDULE.map((item, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div
                className="flex gap-8 py-5 border-b"
                style={{
                  borderColor: C.border,
                  opacity: item.type === "logistics" ? 0.28 : 1,
                }}
              >
                <span
                  className="text-sm w-12 shrink-0 pt-0.5"
                  style={{
                    fontFamily: "sans-serif",
                    color: C.textDim,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.time}
                </span>
                <div className="flex items-center gap-3">
                  {item.type === "talk" && (
                    <div
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ background: C.red }}
                    />
                  )}
                  <span
                    className="text-base font-normal"
                    style={{
                      color:
                        item.type === "talk"
                          ? "rgba(210,130,130,0.85)"
                          : C.textDim,
                    }}
                  >
                    {item.event}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section
        className="px-8 md:px-16 py-24 md:py-40"
        style={{ background: C.bg }}
      >
        <div className="grid md:grid-cols-12 gap-10">
          <Reveal className="md:col-span-3">
            <p
              className="text-[11px] tracking-[0.32em] uppercase"
              style={{ fontFamily: "sans-serif", color: C.textGhost }}
            >
              About TEDx
            </p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-6 space-y-5">
            <p
              className="text-base"
              style={{
                fontFamily: "sans-serif",
                fontWeight: 300,
                color: C.textMuted,
                lineHeight: 1.95,
              }}
            >
              In the spirit of ideas worth spreading, TEDx is a programme of
              locally organised events that gather people to share a TED-like
              experience. TEDx VIT is independently curated around one
              conviction: that sharing a thought — honestly, carefully, in
              person — remains among the most significant acts available to a
              human being.
            </p>
            <p
              className="text-sm"
              style={{
                fontFamily: "sans-serif",
                fontWeight: 300,
                color: C.textGhost,
                lineHeight: 1.95,
              }}
            >
              VIT Vellore &nbsp;·&nbsp; March 28, 2026 &nbsp;·&nbsp; Doors open
              09:00
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        id="register"
        className="relative px-8 md:px-16 py-48 md:py-64 overflow-hidden text-center"
        style={{ background: C.bg }}
      >
        {/* Deep red bloom from below */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: 800,
            height: 400,
            background: `radial-gradient(ellipse at center, rgba(180,10,30,0.14), transparent 68%)`,
            filter: "blur(70px)",
          }}
        />
        {/* Top vein spread */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: 600,
            height: 300,
            background: `radial-gradient(ellipse at center, rgba(140,8,20,0.08), transparent 70%)`,
            filter: "blur(50px)",
          }}
        />

        <Reveal className="relative z-10 max-w-3xl mx-auto">
          <p
            className="text-[11px] tracking-[0.44em] uppercase mb-9"
            style={{ fontFamily: "sans-serif", color: `${C.red}77` }}
          >
            March 28, 2026
          </p>
          <h2
            className="font-normal leading-[0.9] mb-14"
            style={{
              fontSize: "clamp(3rem, 8vw, 7.5rem)",
              letterSpacing: "-0.025em",
              color: "rgba(210,130,130,0.85)",
            }}
          >
            Be in the room
            <br />
            <span
              style={{ fontStyle: "italic", color: `rgba(180,60,60,0.35)` }}
            >
              when it happens
            </span>
          </h2>
          <motion.a
            href="#"
            className="inline-block border px-14 py-4 text-[11px] tracking-[0.3em] uppercase cursor-pointer"
            style={{
              fontFamily: "sans-serif",
              borderColor: C.redDeep,
              color: C.textDim,
            }}
            whileHover={{ borderColor: C.red, color: C.red }}
            transition={{ duration: 0.2 }}
          >
            Register Now
          </motion.a>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-8 md:px-16 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t"
        style={{ background: C.bg, borderColor: C.border }}
      >
        <div>
          <div
            className="text-sm tracking-[0.22em] uppercase mb-1"
            style={{ fontFamily: "sans-serif", fontWeight: 600 }}
          >
            <span style={{ color: C.red }}>TED</span>
            <span style={{ color: C.textGhost }}>x</span>
            <span style={{ color: C.textDim }}> VIT</span>
          </div>
          <p
            className="text-[11px] tracking-widest"
            style={{ fontFamily: "sans-serif", color: C.textGhost }}
          >
            Ideas Worth Spreading
          </p>
        </div>

        <div className="flex gap-8">
          {["Instagram", "LinkedIn", "YouTube"].map((p) => (
            <motion.a
              key={p}
              href="#"
              className="text-[11px] tracking-[0.2em] uppercase"
              style={{ fontFamily: "sans-serif", color: C.textGhost }}
              whileHover={{ color: C.textMuted }}
              transition={{ duration: 0.2 }}
            >
              {p}
            </motion.a>
          ))}
        </div>

        <p
          className="text-[10px]"
          style={{
            fontFamily: "sans-serif",
            color: `${C.textGhost}`,
            letterSpacing: "0.05em",
          }}
        >
          © 2026 TEDx VIT. Independently organised.
        </p>
      </footer>
    </div>
  );
}
