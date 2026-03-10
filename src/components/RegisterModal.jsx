"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const SEATS = [
  { value: "general", label: "General — Standard seating" },
  { value: "premium", label: "Premium — Front mid-section" },
  { value: "vip", label: "VIP — Front row + networking" },
];

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: focused ? "#E62B1E" : "#888",
          marginBottom: "8px",
          transition: "color 0.3s ease",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "14px 18px",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${error ? "#E62B1E" : focused ? "#E62B1E" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "10px",
          color: "#F5F5F5",
          fontSize: "15px",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          transition: "border 0.3s ease, box-shadow 0.3s ease",
          boxShadow: focused
            ? "0 0 0 3px rgba(230,43,30,0.15), 0 0 20px rgba(230,43,30,0.08)"
            : "none",
          backdropFilter: "blur(4px)",
        }}
      />
      {error && (
        <p
          style={{
            fontSize: "11px",
            color: "#E62B1E",
            marginTop: "6px",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterModal({ open, onClose }) {
  const { data: session } = useSession();

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    seat: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [seatOpen, setSeatOpen] = useState(false);

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        email: f.email || session.user.email || "",
        fullName: f.fullName || session.user.name || "",
      }));
    }
  }, [session]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setErrors({});
      setServerError("");
      setSuccess(false);
      setSeatOpen(false);
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email address";
    if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber.replace(/\s+/g, "")))
      e.phoneNumber = "Enter a valid 10-digit Indian mobile number";
    if (!form.seat) e.seat = "Please select a seat type";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: session?.user?.id ?? null }),
      });
      const data = await res.json();
      if (!res.ok) setServerError(data.error || "Registration failed");
      else setSuccess(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(11,11,11,0.85)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* Card — exact auth page style */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "460px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "rgba(15,15,15,0.92)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          padding: "48px 44px",
          backdropFilter: "blur(24px)",
          boxShadow:
            "0 0 80px rgba(0,0,0,0.65), 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {success ? (
          /* ── Success state ── */
          <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                justifyContent: "center",
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "22px",
                  color: "#E62B1E",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                TED
              </span>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "14px",
                  color: "#E62B1E",
                  lineHeight: 1,
                  marginTop: "-6px",
                }}
              >
                x
              </span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "22px",
                  color: "#F5F5F5",
                  letterSpacing: "1px",
                  lineHeight: 1,
                  marginLeft: "4px",
                }}
              >
                VIT
              </span>
            </div>

            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(230,43,30,0.1)",
                border: "1px solid rgba(230,43,30,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 28,
                color: "#E62B1E",
              }}
            >
              ✓
            </div>

            <h2
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#F5F5F5",
                letterSpacing: "-0.5px",
                margin: "0 0 10px",
              }}
            >
              You&apos;re registered.
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#555",
                lineHeight: 1.85,
                margin: "0 0 6px",
              }}
            >
              See you on{" "}
              <span style={{ color: "#E62B1E", fontWeight: 600 }}>
                28 March 2026
              </span>{" "}
              at VIT Vellore.
            </p>
            <p
              style={{ fontSize: "12px", color: "#444", marginBottom: "32px" }}
            >
              Registered under{" "}
              <span style={{ color: "#888" }}>{form.email}</span>
            </p>

            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "15px",
                background: "linear-gradient(135deg, #E62B1E, #b01f15)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            {/* Logo + close */}
            <div style={{ marginBottom: "28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "2px" }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: "22px",
                      color: "#E62B1E",
                      letterSpacing: "-0.5px",
                      lineHeight: 1,
                    }}
                  >
                    TED
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: "14px",
                      color: "#E62B1E",
                      lineHeight: 1,
                      marginTop: "-6px",
                    }}
                  >
                    x
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "22px",
                      color: "#F5F5F5",
                      letterSpacing: "1px",
                      lineHeight: 1,
                      marginLeft: "4px",
                    }}
                  >
                    VIT
                  </span>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px",
                    color: "#555",
                    fontSize: "18px",
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#666",
                  letterSpacing: "0.12em",
                  margin: 0,
                }}
              >
                x = independently organized TED event
              </p>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: "28px" }}>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#F5F5F5",
                  margin: "0 0 6px",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                }}
              >
                Reserve your seat.
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#555",
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                28 March 2026 · VIT Vellore
              </p>
            </div>

            {/* Accent line */}
            <div
              style={{
                height: "1px",
                background:
                  "linear-gradient(to right, rgba(230,43,30,0.4), transparent)",
                marginBottom: "28px",
              }}
            />

            <form onSubmit={handleSubmit} noValidate>
              <InputField
                label="Full Name"
                placeholder="Your full name"
                value={form.fullName}
                error={errors.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <InputField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                error={errors.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <InputField
                label="Phone Number"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phoneNumber}
                error={errors.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
              />

              {/* Seat type dropdown */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: seatOpen ? "#E62B1E" : "#888",
                    marginBottom: "8px",
                    transition: "color 0.3s ease",
                    fontFamily:
                      "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Seat Type
                </label>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setSeatOpen((v) => !v)}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${errors.seat ? "#E62B1E" : seatOpen ? "#E62B1E" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: seatOpen ? "10px 10px 0 0" : "10px",
                      color: form.seat ? "#F5F5F5" : "#555",
                      fontSize: "15px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily:
                        "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      outline: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: seatOpen
                        ? "0 0 0 3px rgba(230,43,30,0.15), 0 0 20px rgba(230,43,30,0.08)"
                        : "none",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <span>
                      {form.seat
                        ? SEATS.find((s) => s.value === form.seat)?.label
                        : "Select a seat type"}
                    </span>
                    <span style={{ fontSize: 10, color: "#555" }}>
                      {seatOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {seatOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#0F0F0F",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderTop: "none",
                        borderRadius: "0 0 10px 10px",
                        overflow: "hidden",
                        zIndex: 10,
                        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                      }}
                    >
                      {SEATS.map((s, i) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, seat: s.value });
                            setSeatOpen(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "13px 18px",
                            background:
                              form.seat === s.value
                                ? "rgba(230,43,30,0.1)"
                                : "transparent",
                            border: "none",
                            borderBottom:
                              i < SEATS.length - 1
                                ? "1px solid rgba(255,255,255,0.05)"
                                : "none",
                            color: form.seat === s.value ? "#E62B1E" : "#888",
                            fontSize: "14px",
                            textAlign: "left",
                            cursor: "pointer",
                            fontFamily:
                              "'Helvetica Neue', Helvetica, Arial, sans-serif",
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.seat && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#E62B1E",
                      marginTop: "6px",
                      fontFamily:
                        "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    }}
                  >
                    {errors.seat}
                  </p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div
                  style={{
                    background: "rgba(230,43,30,0.1)",
                    border: "1px solid rgba(230,43,30,0.3)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    color: "#E62B1E",
                    letterSpacing: "0.02em",
                    fontFamily:
                      "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  }}
                >
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: loading
                    ? "rgba(230,43,30,0.4)"
                    : "linear-gradient(135deg, #E62B1E, #b01f15)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "8px",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                {loading ? "Registering…" : "Confirm Registration"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
