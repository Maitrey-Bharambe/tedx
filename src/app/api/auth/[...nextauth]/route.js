import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    // ── Google OAuth ─────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ── Email / Password ─────────────────────────────────────────────────────
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        // Fetch user WITH password (select: false on schema means we must be explicit)
        const user = await User.findOne({ email: credentials.email }).select(
          "+password",
        );

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (!user.password) {
          throw new Error(
            "This account was created with Google. Please sign in with Google.",
          );
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  // ── Callbacks ──────────────────────────────────────────────────────────────
  callbacks: {
    /**
     * signIn — runs for every provider login.
     * For Google we upsert the user so their data lives in MongoDB.
     * If MongoDB is unreachable we still allow the sign-in (resilient mode)
     * so the user is never shown AccessDenied due to a DB hiccup.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            // Merge Google data into existing record
            await User.findByIdAndUpdate(existingUser._id, {
              googleId: profile.sub,
              image: profile.picture,
              provider: "google",
              isVerified: profile.email_verified ?? true,
              lastLogin: new Date(),
              // Only overwrite name if it's missing
              ...(existingUser.name ? {} : { name: profile.name }),
            });
          } else {
            // Create a brand-new Google user
            await User.create({
              name: profile.name,
              email: profile.email,
              googleId: profile.sub,
              image: profile.picture,
              provider: "google",
              isVerified: profile.email_verified ?? true,
              lastLogin: new Date(),
            });
          }
        } catch (err) {
          // DB is unreachable — log it but still allow Google sign-in.
          // The user record will be upserted on the next successful connection.
          console.error(
            "⚠️  Google signIn: MongoDB unavailable, sign-in allowed without DB persist.",
            err.message,
          );
        }
        // Always return true for Google — never show AccessDenied for a valid OAuth token
        return true;
      }

      return true; // allow credentials login
    },

    /**
     * jwt — add custom fields to the token after sign-in.
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // For Google logins, attach the DB record's id & role on first call
      if (account?.provider === "google" && !token.id) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }

      return token;
    },

    /**
     * session — expose token fields to the client session.
     */
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  // ── Pages ──────────────────────────────────────────────────────────────────
  pages: {
    signIn: "/auth/login",
    error: "/auth/login", // redirect auth errors back to login page with ?error=
  },

  // ── Session strategy ───────────────────────────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
