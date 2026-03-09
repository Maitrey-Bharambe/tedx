"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 43, 30, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

function InputField({ label, type, placeholder, value, onChange }) {
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
          border: `1px solid ${focused ? "#E62B1E" : "rgba(255,255,255,0.1)"}`,
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
    </div>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [mounted, setMounted] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverGoogle, setHoverGoogle] = useState(false);
  const [hoverForgot, setHoverForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/");
    }
  }

  async function handleGoogle() {
    setError("");
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0B0B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      {/* Radial red glow — bottom-left variant for visual distinction */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(circle, rgba(230,43,30,0.10) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "-80px",
          left: "-80px",
          width: "350px",
          height: "350px",
          background:
            "radial-gradient(circle, rgba(230,43,30,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Particles />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "440px",
          background: "rgba(15,15,15,0.85)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          padding: "48px 44px",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 80px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              marginBottom: "4px",
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
        <div style={{ marginBottom: "36px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#F5F5F5",
              margin: "0 0 6px 0",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
            }}
          >
            Welcome back.
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#555",
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Ideas that resonate beyond words
          </p>
        </div>

        {/* Accent line */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(to right, rgba(230,43,30,0.4), transparent)",
            marginBottom: "32px",
          }}
        />

        {/* Form */}
        <form onSubmit={handleLogin}>
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* Forgot password */}
          <div
            style={{
              textAlign: "right",
              marginTop: "-8px",
              marginBottom: "24px",
            }}
          >
            <span
              onMouseEnter={() => setHoverForgot(true)}
              onMouseLeave={() => setHoverForgot(false)}
              style={{
                fontSize: "12px",
                color: hoverForgot ? "#E62B1E" : "#555",
                cursor: "pointer",
                transition: "color 0.2s ease",
                letterSpacing: "0.03em",
              }}
            >
              Forgot password?
            </span>
          </div>

          {/* Error message */}
          {error && (
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
              }}
            >
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            style={{
              width: "100%",
              padding: "15px",
              background: loading
                ? "rgba(230,43,30,0.4)"
                : hoverBtn
                  ? "linear-gradient(135deg, #ff3b2e, #E62B1E)"
                  : "linear-gradient(135deg, #E62B1E, #b01f15)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "14px",
              transition: "all 0.3s ease",
              transform: hoverBtn && !loading ? "scale(1.015)" : "scale(1)",
              boxShadow:
                hoverBtn && !loading
                  ? "0 8px 30px rgba(230,43,30,0.45)"
                  : "0 4px 16px rgba(230,43,30,0.2)",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        {/* OR divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <span
            style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em" }}
          >
            OR
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.08)",
            }}
          />
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogle}
          onMouseEnter={() => setHoverGoogle(true)}
          onMouseLeave={() => setHoverGoogle(false)}
          style={{
            width: "100%",
            padding: "14px",
            background: hoverGoogle ? "rgba(255,255,255,0.07)" : "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px",
            color: "#F5F5F5",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.3s ease",
            marginBottom: "28px",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#555",
            margin: 0,
          }}
        >
          New here?{" "}
          <Link
            href="/auth/signup"
            style={{
              color: "#E62B1E",
              textDecoration: "none",
              fontWeight: 600,
              borderBottom: "1px solid rgba(230,43,30,0.3)",
              paddingBottom: "1px",
              transition: "border-color 0.2s",
            }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
