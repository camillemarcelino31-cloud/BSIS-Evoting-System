import { useEffect, useState, type FormEvent } from "react";
import {
  Vote,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
  TrendingUp,
  Menu,
  X,
  ArrowRight,
  Star,
  Lock,
  Zap,
  Globe,
  Calendar,
  ChevronDown,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

type View = "landing" | "student-login" | "admin-login" | "dashboard";
type UserRole = "admin" | "student";
type Account = {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
  studentId?: string;
  yearLevel?: string;
};
type AuthMode = "login" | "register";
type AuthForm = { username: string; password: string; confirmPassword: string; studentId: string; yearLevel: string; };

const adminAccount: Account = {
  username: "Admin",
  password: "Admin123",
  role: "admin",
  displayName: "Administrator",
};

function getStoredAccounts(): Account[] {
  if (typeof window === "undefined") return [adminAccount];

  try {
    const saved = window.localStorage.getItem("votesync-accounts");
    if (saved) {
      const parsed = JSON.parse(saved) as Account[];
      return parsed.length > 0 ? parsed : [adminAccount];
    }
  } catch {}

  return [adminAccount];
}

function getStoredSession(): Account | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem("votesync-session");
    return saved ? (JSON.parse(saved) as Account) : null;
  } catch {
    return null;
  }
}

const turnoutData = [
  { month: "Jan", voters: 142 },
  { month: "Feb", voters: 198 },
  { month: "Mar", voters: 267 },
  { month: "Apr", voters: 310 },
  { month: "May", voters: 289 },
  { month: "Jun", voters: 374 },
];

const electionResults = [
  { name: "Candidate A", votes: 187 },
  { name: "Candidate B", votes: 143 },
  { name: "Candidate C", votes: 98 },
  { name: "Candidate D", votes: 62 },
];

const pieColors = ["#6d28d9", "#a78bfa", "#c4b5fd", "#ddd6fe"];

const activeElections = [
  {
    id: 1,
    title: "Student Council President 2025",
    candidates: 4,
    votes: 312,
    total: 520,
    ends: "Jul 5, 2025",
    status: "active",
  },
  {
    id: 2,
    title: "BSIS Department Representative",
    candidates: 3,
    votes: 189,
    total: 520,
    ends: "Jul 8, 2025",
    status: "active",
  },
  {
    id: 3,
    title: "Sports & Recreation Officer",
    candidates: 2,
    votes: 520,
    total: 520,
    ends: "Jun 28, 2025",
    status: "ended",
  },
];

const recentActivity = [
  { action: "New voter registered", user: "Maria Santos", time: "2 min ago", type: "register" },
  { action: "Vote cast", user: "Juan dela Cruz", time: "5 min ago", type: "vote" },
  { action: "Election created", user: "Admin", time: "1 hr ago", type: "create" },
  { action: "Candidate approved", user: "Admin", time: "2 hr ago", type: "approve" },
  { action: "Vote cast", user: "Anna Reyes", time: "3 hr ago", type: "vote" },
];

function LandingPage({
  onEnter,
  authMode,
  onSetAuthMode,
  authForm,
  onAuthFieldChange,
  onSubmit,
  authError,
  onAdminLoginPage,
}: {
  onEnter: () => void;
  authMode: AuthMode;
  onSetAuthMode: (mode: AuthMode) => void;
  authForm: AuthForm;
  onAuthFieldChange: (field: keyof AuthForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  authError: string;
  onAdminLoginPage: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-700 flex items-center justify-center">
              <Vote size={16} className="text-white" />
            </div>
            <span className="font-bold text-violet-900 text-lg tracking-tight">VoteSync</span>
            <span className="hidden sm:inline text-xs text-violet-400 font-medium ml-1 border border-violet-200 rounded-full px-2 py-0.5">BSIS</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-violet-700">
            <a href="#features" className="hover:text-violet-900 transition-colors">Features</a>
            <a href="#how" className="hover:text-violet-900 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-violet-900 transition-colors">Stats</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onEnter();
              }}
              className="hidden md:flex items-center gap-1.5 bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Go to Dashboard
              <ArrowRight size={14} />
            </button>
            <button
              className="md:hidden p-2 text-violet-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-violet-100 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-medium text-violet-700">
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#stats" onClick={() => setMobileOpen(false)}>Stats</a>
            <button
              onClick={() => {
                onEnter();
                setMobileOpen(false);
              }}
              className="flex items-center gap-1.5 bg-violet-700 text-white font-semibold px-4 py-2 rounded-lg w-fit"
            >
              Dashboard <ArrowRight size={14} />
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-800 to-violet-600 text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #a78bfa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c4b5fd 0%, transparent 50%)"
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-5"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-violet-200 font-medium mb-6">
                <Star size={12} className="fill-violet-300 text-violet-300" />
                Official BSIS Student Organization Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                Your Vote,<br />
                <span className="text-violet-300">Your Voice.</span>
              </h1>
              <p className="text-violet-200 text-lg leading-relaxed mb-8 max-w-lg">
                A secure, transparent, and accessible digital voting system built exclusively for BSIS student organization elections. Participate from anywhere, anytime.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    onEnter();
                  }}
                  className="flex items-center gap-2 bg-white text-violet-800 hover:bg-violet-50 font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-violet-900/30"
                >
                  Enter Dashboard
                  <ArrowRight size={16} />
                </button>
                <a
                  href="#how"
                  className="flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Learn More
                  <ChevronDown size={16} />
                </a>
              </div>

              <div className="mt-8 grid gap-6 lg:max-w-lg">
                <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-violet-950/10 ring-1 ring-violet-100">
                  <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-violet-950">Student Login</h2>
                    <p className="mt-2 text-sm text-violet-500">Hey, enter your details to sign in to your account.</p>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-4">
                    <label className="block text-sm font-semibold text-violet-700">Email</label>
                    <input
                      type="email"
                      value={authForm.username}
                      onChange={(event) => onAuthFieldChange("username", event.target.value)}
                      placeholder="example@email.com"
                      className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />

                    <div className="flex items-center justify-between gap-4">
                      <label className="block text-sm font-semibold text-violet-700">Password</label>
                      <button type="button" className="text-xs text-violet-500 hover:text-violet-700 transition-colors">Forgot password?</button>
                    </div>
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(event) => onAuthFieldChange("password", event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />

                    {authMode === "register" ? (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-violet-700">Student ID</label>
                          <input
                            type="text"
                            value={authForm.studentId}
                            onChange={(event) => onAuthFieldChange("studentId", event.target.value)}
                            placeholder="BSIS-2024-123"
                            className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-violet-700">Year Level</label>
                          <select
                            value={authForm.yearLevel}
                            onChange={(event) => onAuthFieldChange("yearLevel", event.target.value)}
                            className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                          >
                            <option value="">Select year level</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>

                        <input
                          type="password"
                          value={authForm.confirmPassword}
                          onChange={(event) => onAuthFieldChange("confirmPassword", event.target.value)}
                          placeholder="Confirm password"
                          className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                      </>
                    ) : null}

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
                    >
                      {authMode === "login" ? "Login" : "Create account"}
                    </button>

                    {authError ? <p className="text-sm text-rose-500">{authError}</p> : null}
                  </form>

                  <div className="mt-5 border-t border-violet-100 pt-4 text-sm text-violet-500">
                    {authMode === "login" ? (
                      <span>
                        Don&apos;t have account?{' '}
                        <button type="button" onClick={() => onSetAuthMode("register")} className="font-semibold text-violet-700 hover:text-violet-900">Create new account</button>
                      </span>
                    ) : (
                      <span>
                        Already have an account?{' '}
                        <button type="button" onClick={() => onSetAuthMode("login")} className="font-semibold text-violet-700 hover:text-violet-900">Login instead</button>
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl bg-violet-950 p-6 text-white ring-1 ring-violet-900/10">
                  <div className="text-sm uppercase tracking-[0.24em] text-violet-300 font-semibold mb-3">Admin access</div>
                  <p className="text-sm text-violet-200 mb-5">Use the administrator account to manage elections and voters.</p>
                  <div className="rounded-3xl bg-white/10 p-4 mb-5">
                    <div className="text-xs text-violet-200 mb-2">Username</div>
                    <div className="text-sm font-semibold">Admin</div>
                    <div className="text-xs text-violet-200 mt-4 mb-2">Password</div>
                    <div className="text-sm font-semibold">Admin123</div>
                  </div>
                  <button
                    type="button"
                    onClick={onAdminLoginPage}
                    className="w-full rounded-2xl bg-white text-violet-950 py-3 font-semibold transition hover:bg-violet-100"
                  >
                    Admin Login
                  </button>
                </div>
              </div>

              <div className="mt-8 flex gap-8">
                {[
                  { value: "520+", label: "Registered Voters" },
                  { value: "12", label: "Elections Held" },
                  { value: "98.4%", label: "System Uptime" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="text-violet-300 text-xs font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero card mockup */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs text-violet-300 font-medium mb-1">ACTIVE ELECTION</div>
                    <div className="font-bold text-white">Student Council President 2025</div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">Live</span>
                </div>

                {[
                  { name: "Maria Santos", votes: 187, pct: 60 },
                  { name: "Jose Reyes", votes: 143, pct: 46 },
                  { name: "Ana Lim", votes: 98, pct: 31 },
                ].map((c, i) => (
                  <div key={c.name} className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-violet-100 font-medium">{c.name}</span>
                      <span className="text-violet-300 font-semibold">{c.votes} votes</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.pct}%`,
                          background: i === 0 ? "#a78bfa" : i === 1 ? "#7c3aed" : "#c4b5fd"
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-violet-300">
                  <span className="flex items-center gap-1"><Clock size={11} /> Ends Jul 5, 2025</span>
                  <span className="flex items-center gap-1"><Users size={11} /> 312 / 520 voted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }} />
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block text-violet-700 text-xs font-bold tracking-widest uppercase mb-3">Platform Features</div>
            <h2 className="text-4xl font-extrabold text-violet-950 tracking-tight">Built for student democracy</h2>
            <p className="text-violet-500 mt-3 max-w-xl mx-auto text-base">
              Every feature designed with fairness, transparency, and ease of use at its core.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield size={22} />,
                title: "Secure Voting",
                desc: "End-to-end encryption ensures every ballot is private and tamper-proof.",
              },
              {
                icon: <Lock size={22} />,
                title: "Verified Identity",
                desc: "Only registered BSIS students can cast votes using their official credentials.",
              },
              {
                icon: <Eye size={22} />,
                title: "Real-time Results",
                desc: "Live vote tallying visible to all stakeholders as ballots come in.",
              },
              {
                icon: <Zap size={22} />,
                title: "Instant Notifications",
                desc: "Automated alerts for election start, reminders, and result announcements.",
              },
              {
                icon: <Globe size={22} />,
                title: "Vote Anywhere",
                desc: "Fully responsive — vote from your phone, tablet, or desktop at any time.",
              },
              {
                icon: <BarChart3 size={22} />,
                title: "Analytics Dashboard",
                desc: "Detailed turnout reports and demographic breakdowns for organization officers.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group p-6 border border-violet-100 rounded-2xl hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 transition-all cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4 group-hover:bg-violet-700 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-violet-950 mb-2">{f.title}</h3>
                <p className="text-violet-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-violet-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block text-violet-400 text-xs font-bold tracking-widest uppercase mb-3">Process</div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">How It Works</h2>
            <p className="text-violet-400 mt-3 max-w-xl mx-auto text-base">
              Three simple steps to exercise your right to vote.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-violet-800" />

            {[
              {
                step: "01",
                icon: <Users size={28} />,
                title: "Register & Verify",
                desc: "Sign up with your student ID. Admin verifies your enrollment in the BSIS program.",
              },
              {
                step: "02",
                icon: <Vote size={28} />,
                title: "Cast Your Vote",
                desc: "Browse active elections, review candidates, and submit your encrypted ballot.",
              },
              {
                step: "03",
                icon: <CheckCircle2 size={28} />,
                title: "View Results",
                desc: "Watch results update in real-time. Official results published after election closes.",
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="w-20 h-20 rounded-2xl bg-violet-800 border border-violet-700 flex items-center justify-center text-violet-300 mx-auto mb-5 relative z-10">
                  {s.icon}
                </div>
                <div className="text-violet-600 text-xs font-bold tracking-widest mb-2">{s.step}</div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-violet-400 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block text-violet-700 text-xs font-bold tracking-widest uppercase mb-3">By the Numbers</div>
              <h2 className="text-4xl font-extrabold text-violet-950 tracking-tight mb-6">
                Trusted by the<br />BSIS community
              </h2>
              <p className="text-violet-500 text-base leading-relaxed mb-8">
                Since its launch, VoteSync has been the official e-voting platform for all BSIS student organization elections — delivering secure, reliable, and transparent results every semester.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "520", label: "Registered Students", sub: "AY 2024–2025" },
                  { value: "12", label: "Elections Completed", sub: "Across 3 semesters" },
                  { value: "374", label: "Peak Voters", sub: "June 2025 election" },
                  { value: "4", label: "Officer Positions", sub: "Per academic year" },
                ].map((s) => (
                  <div key={s.label} className="p-5 rounded-2xl bg-violet-50 border border-violet-100">
                    <div className="text-3xl font-extrabold text-violet-700 mb-1">{s.value}</div>
                    <div className="text-violet-900 font-semibold text-sm">{s.label}</div>
                    <div className="text-violet-400 text-xs mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-violet-950 rounded-2xl p-8">
              <div className="text-violet-400 text-xs font-bold tracking-widest uppercase mb-1">Voter Turnout</div>
              <div className="text-white font-bold text-xl mb-6">Monthly Participation (2025)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={turnoutData} barSize={32}>
                  <XAxis dataKey="month" tick={{ fill: "#a78bfa", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7c6fa0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1a0a2e", border: "1px solid #4c1d95", borderRadius: 8, color: "#e9d5ff" }}
                    cursor={{ fill: "rgba(167,139,250,0.1)" }}
                  />
                  <Bar dataKey="voters" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-700 to-violet-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Ready to vote?</h2>
          <p className="text-violet-300 mb-8 text-lg">
            Your participation shapes the future of the BSIS organization. Every vote counts.
          </p>
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-2 bg-white text-violet-800 hover:bg-violet-50 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-xl shadow-violet-900/40 text-lg"
          >
            Open Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-violet-950 text-violet-500 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet-700 flex items-center justify-center">
              <Vote size={12} className="text-white" />
            </div>
            <span className="text-violet-300 font-semibold">VoteSync</span>
            <span className="text-violet-600">— BSIS Student Organization</span>
          </div>
          <span>&copy; 2025 BSIS Student Organization. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

function StudentLoginPage({
  onBack,
  authMode,
  authForm,
  onAuthFieldChange,
  onSetAuthMode,
  onSubmit,
  authError,
  onAdminLoginPage,
}: {
  onBack: () => void;
  authMode: AuthMode;
  authForm: AuthForm;
  onAuthFieldChange: (field: keyof AuthForm, value: string) => void;
  onSetAuthMode: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  authError: string;
  onAdminLoginPage: () => void;
}) {
  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-violet-950/10 ring-1 ring-violet-100">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-violet-950">Student Login</h2>
          <p className="mt-2 text-sm text-violet-500">Sign in or create your account to access the dashboard.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-violet-700 mb-2">Email</label>
            <input
              type="email"
              value={authForm.username}
              onChange={(event) => onAuthFieldChange("username", event.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-violet-700 mb-2">Password</label>
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => onAuthFieldChange("password", event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {authMode === "register" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-violet-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={authForm.studentId}
                  onChange={(event) => onAuthFieldChange("studentId", event.target.value)}
                  placeholder="BSIS-2024-123"
                  className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-700 mb-2">Year Level</label>
                <select
                  value={authForm.yearLevel}
                  onChange={(event) => onAuthFieldChange("yearLevel", event.target.value)}
                  className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="">Select year level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-violet-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(event) => onAuthFieldChange("confirmPassword", event.target.value)}
                  placeholder="Confirm password"
                  className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            {authMode === "login" ? "Login" : "Create account"}
          </button>

          {authError ? <p className="text-sm text-rose-500">{authError}</p> : null}
        </form>

        <div className="mt-5 border-t border-violet-100 pt-4 text-sm text-violet-500">
          {authMode === "login" ? (
            <span>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => onSetAuthMode("register")} className="font-semibold text-violet-700 hover:text-violet-900">
                Create new account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={() => onSetAuthMode("login")} className="font-semibold text-violet-700 hover:text-violet-900">
                Login instead
              </button>
            </span>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-violet-500">
          <button type="button" onClick={onAdminLoginPage} className="font-semibold text-violet-700 hover:text-violet-900">
            Login as Admin
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-violet-500">
          <button type="button" onClick={onBack} className="font-semibold text-violet-700 hover:text-violet-900">
            Back to Landing
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminLoginPage({
  onBack,
  authForm,
  onAuthFieldChange,
  onSubmit,
  authError,
}: {
  onBack: () => void;
  authForm: AuthForm;
  onAuthFieldChange: (field: keyof AuthForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  authError: string;
}) {
  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-violet-950/10 ring-1 ring-violet-100">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-violet-950">Admin Login</h2>
          <p className="mt-2 text-sm text-violet-500">Sign in with the administrator account to access the dashboard.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-violet-700 mb-2">Username</label>
            <input
              type="text"
              value={authForm.username}
              onChange={(event) => onAuthFieldChange("username", event.target.value)}
              placeholder="Admin"
              className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-violet-700 mb-2">Password</label>
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => onAuthFieldChange("password", event.target.value)}
              placeholder="Admin123"
              className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            Login as Admin
          </button>

          {authError ? <p className="text-sm text-rose-500">{authError}</p> : null}
        </form>

        <div className="mt-6 text-center text-sm text-violet-500">
          <button type="button" onClick={onBack} className="font-semibold text-violet-700 hover:text-violet-900">
            Back to Student Login
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onBack, currentUser }: { onBack: () => void; currentUser: Account | null; }) {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = currentUser?.displayName ?? currentUser?.username ?? "Student";
  const roleLabel = currentUser?.role === "admin" ? "Administrator" : "Student Account";

  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "elections", label: "Elections", icon: <Vote size={18} /> },
    { id: "voters", label: "Voters", icon: <Users size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-violet-50 flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-violet-950 flex flex-col z-30
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 border-b border-violet-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Vote size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">VoteSync</div>
              <div className="text-violet-400 text-xs">BSIS Org Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activePage === item.id
                  ? "bg-violet-700 text-white shadow-lg shadow-violet-900/50"
                  : "text-violet-400 hover:text-white hover:bg-violet-800/60"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-violet-800 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{userName}</div>
              <div className="text-violet-400 text-xs truncate">{roleLabel}</div>
              {currentUser?.studentId ? (
                <div className="text-violet-300 text-xs truncate">{currentUser.studentId}</div>
              ) : null}
              {currentUser?.yearLevel ? (
                <div className="text-violet-300 text-xs truncate">{currentUser.yearLevel}</div>
              ) : null}
            </div>
          </div>
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-violet-400 hover:text-white hover:bg-violet-800/60 transition-all"
          >
            <LogOut size={18} />
            Back to Landing
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-violet-100 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-violet-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="font-bold text-violet-950 text-base capitalize">{activePage}</div>
              <div className="text-violet-400 text-xs hidden sm:block">BSIS Student Organization &mdash; AY 2024–2025</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-violet-500 hover:text-violet-700 transition-colors">
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-white text-xs font-bold">
              {userName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activePage === "overview" && <OverviewPage />}
          {activePage === "elections" && <ElectionsPage />}
          {activePage === "voters" && <VotersPage />}
          {activePage === "analytics" && <AnalyticsPage />}
          {activePage === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm hover:shadow-md hover:shadow-violet-100 transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <TrendingUp size={14} className="text-emerald-500 mt-1" />
      </div>
      <div className="text-2xl font-extrabold text-violet-950 mb-0.5">{value}</div>
      <div className="text-violet-900 text-sm font-semibold">{label}</div>
      <div className="text-violet-400 text-xs mt-0.5">{sub}</div>
    </div>
  );
}

function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Registered Voters" value="520" sub="+12 this week" icon={<Users size={18} className="text-violet-700" />} color="bg-violet-100" />
        <StatCard label="Active Elections" value="2" sub="Ends by Jul 8" icon={<Vote size={18} className="text-indigo-700" />} color="bg-indigo-100" />
        <StatCard label="Votes Cast Today" value="48" sub="Across all elections" icon={<CheckCircle2 size={18} className="text-emerald-700" />} color="bg-emerald-100" />
        <StatCard label="Avg Turnout" value="72%" sub="+8% vs last election" icon={<BarChart3 size={18} className="text-violet-700" />} color="bg-violet-100" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Turnout chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-violet-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-bold text-violet-950">Voter Turnout</div>
              <div className="text-violet-400 text-xs">Monthly participation trend</div>
            </div>
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">2025</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={turnoutData}>
              <CartesianGrid stroke="#f3e8ff" strokeDasharray="4 4" />
              <XAxis dataKey="month" tick={{ fill: "#a78bfa", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7c6fa0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #ddd6fe", borderRadius: 8 }}
                labelStyle={{ color: "#4c1d95", fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="voters" stroke="#6d28d9" strokeWidth={2.5} dot={{ fill: "#7c3aed", strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm">
          <div className="font-bold text-violet-950 mb-1">Current Election</div>
          <div className="text-violet-400 text-xs mb-4">Student Council President 2025</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={electionResults} dataKey="votes" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={36}>
                {electionResults.map((_, i) => (
                  <Cell key={i} fill={pieColors[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #ddd6fe", borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {electionResults.map((r, i) => (
              <div key={r.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pieColors[i] }} />
                <span className="text-violet-700 flex-1">{r.name}</span>
                <span className="font-bold text-violet-950">{r.votes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm">
        <div className="font-bold text-violet-950 mb-4">Recent Activity</div>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-violet-50 last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                a.type === "vote" ? "bg-violet-100 text-violet-700"
                : a.type === "register" ? "bg-emerald-100 text-emerald-700"
                : "bg-violet-100 text-violet-600"
              }`}>
                {a.user.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-violet-900 text-sm font-medium">{a.action}</span>
                <span className="text-violet-400 text-sm"> — {a.user}</span>
              </div>
              <span className="text-violet-300 text-xs flex-shrink-0 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ElectionsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const filtered = filter === "all" ? activeElections : activeElections.filter(e => e.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-violet-950">Elections</h2>
          <p className="text-violet-400 text-sm">Manage and monitor all elections</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors self-start">
          + Create Election
        </button>
      </div>

      <div className="flex gap-2">
        {(["all", "active", "ended"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-violet-700 text-white" : "bg-white text-violet-600 border border-violet-200 hover:border-violet-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(e => (
          <div key={e.id} className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="font-bold text-violet-950">{e.title}</div>
                <div className="text-violet-400 text-sm mt-0.5">{e.candidates} candidates · ends {e.ends}</div>
              </div>
              <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
                e.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-violet-50 text-violet-500 border border-violet-200"
              }`}>
                {e.status === "active" ? "Live" : "Ended"}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-violet-500 mb-1.5">
                <span>Voter turnout</span>
                <span className="font-semibold text-violet-700">{e.votes} / {e.total} ({Math.round(e.votes / e.total * 100)}%)</span>
              </div>
              <div className="h-2.5 bg-violet-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all"
                  style={{ width: `${(e.votes / e.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 transition-colors">
                <Eye size={13} /> View Results
              </button>
              <span className="text-violet-200">·</span>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 transition-colors">
                <Users size={13} /> Manage Voters
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VotersPage() {
  const voters = [
    { name: "Maria Santos", id: "BSIS-2021-001", year: "4th Year", voted: true, registered: "Jan 12, 2025" },
    { name: "Juan Dela Cruz", id: "BSIS-2021-002", year: "4th Year", voted: true, registered: "Jan 12, 2025" },
    { name: "Ana Reyes", id: "BSIS-2022-015", year: "3rd Year", voted: false, registered: "Feb 3, 2025" },
    { name: "Carlo Mendoza", id: "BSIS-2022-019", year: "3rd Year", voted: true, registered: "Feb 3, 2025" },
    { name: "Pia Lim", id: "BSIS-2023-041", year: "2nd Year", voted: false, registered: "Jun 10, 2025" },
    { name: "Rico Torres", id: "BSIS-2023-044", year: "2nd Year", voted: true, registered: "Jun 10, 2025" },
    { name: "Bea Navarro", id: "BSIS-2024-088", year: "1st Year", voted: false, registered: "Jun 15, 2025" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-violet-950">Registered Voters</h2>
          <p className="text-violet-400 text-sm">520 students enrolled</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors self-start">
          + Add Voter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50 text-violet-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Student</th>
                <th className="text-left px-5 py-3.5 hidden sm:table-cell">Student ID</th>
                <th className="text-left px-5 py-3.5 hidden md:table-cell">Year Level</th>
                <th className="text-left px-5 py-3.5 hidden lg:table-cell">Registered</th>
                <th className="text-left px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((v, i) => (
                <tr key={v.id} className={`border-t border-violet-50 hover:bg-violet-50/50 transition-colors ${i % 2 === 0 ? "" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                        {v.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-violet-950">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-violet-500 hidden sm:table-cell" style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{v.id}</td>
                  <td className="px-5 py-3.5 text-violet-600 hidden md:table-cell">{v.year}</td>
                  <td className="px-5 py-3.5 text-violet-400 hidden lg:table-cell">{v.registered}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      v.voted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-violet-50 text-violet-500 border border-violet-200"
                    }`}>
                      {v.voted ? "Voted" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-violet-950">Analytics</h2>
        <p className="text-violet-400 text-sm">Participation insights and election performance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm">
          <div className="font-bold text-violet-950 mb-1">Votes by Candidate</div>
          <div className="text-violet-400 text-xs mb-5">Student Council President 2025</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={electionResults} layout="vertical" barSize={22}>
              <XAxis type="number" tick={{ fill: "#a78bfa", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#6d28d9", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ddd6fe", borderRadius: 8 }} />
              <Bar dataKey="votes" fill="#7c3aed" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm">
          <div className="font-bold text-violet-950 mb-1">Monthly Turnout</div>
          <div className="text-violet-400 text-xs mb-5">Voters across all elections</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={turnoutData} barSize={28}>
              <CartesianGrid stroke="#f3e8ff" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#a78bfa", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7c6fa0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ddd6fe", borderRadius: 8 }} />
              <Bar dataKey="voters" fill="#6d28d9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Highest Turnout", value: "72%", sub: "June 2025 · Council Pres.", color: "text-violet-700" },
          { label: "Avg. Vote Time", value: "2m 14s", sub: "Per voter session", color: "text-violet-700" },
          { label: "Abstained Voters", value: "146", sub: "28% of registered", color: "text-violet-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm">
            <div className="text-violet-400 text-xs font-semibold mb-1">{s.label}</div>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-violet-400 text-xs mt-1">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-violet-950">Settings</h2>
        <p className="text-violet-400 text-sm">System configuration and preferences</p>
      </div>

      {[
        {
          section: "Organization",
          fields: [
            { label: "Organization Name", value: "BSIS Student Organization", type: "text" },
            { label: "Academic Year", value: "2024–2025", type: "text" },
            { label: "Election Officer Email", value: "bsis.org@university.edu.ph", type: "email" },
          ],
        },
        {
          section: "Voting Rules",
          fields: [
            { label: "Minimum Turnout Required (%)", value: "30", type: "number" },
            { label: "Max Candidates Per Position", value: "6", type: "number" },
          ],
        },
      ].map(group => (
        <div key={group.section} className="bg-white rounded-2xl p-6 border border-violet-100 shadow-sm">
          <div className="font-bold text-violet-950 mb-4">{group.section}</div>
          <div className="space-y-4">
            {group.fields.map(f => (
              <div key={f.label}>
                <label className="block text-violet-700 text-sm font-semibold mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={f.value}
                  className="w-full bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5 text-violet-950 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="bg-violet-700 hover:bg-violet-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
        Save Changes
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [accounts, setAccounts] = useState<Account[]>(() => getStoredAccounts());
  const [currentUser, setCurrentUser] = useState<Account | null>(() => getStoredSession());
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthForm>({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("votesync-accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentUser) {
      window.localStorage.setItem("votesync-session", JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem("votesync-session");
    }
  }, [currentUser]);

  useEffect(() => {
    const sessionUser = getStoredSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      setView("dashboard");
    }
  }, []);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    const trimmedUsername = authForm.username.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUsername);
    const authEmail = emailValid
      ? trimmedUsername
      : `${trimmedUsername.replace(/\s+/g, "").toLowerCase()}@bsis.local`;

    if (authMode === "register") {
      if (!trimmedUsername || !authForm.password || !authForm.confirmPassword || !authForm.studentId.trim() || !authForm.yearLevel.trim()) {
        setAuthError("Please complete all fields to create an account.");
        return;
      }

      if (!emailValid) {
        setAuthError("Please enter a valid email address.");
        return;
      }

      if (authForm.password !== authForm.confirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }

      const existing = accounts.find((account) => account.username.toLowerCase() === trimmedUsername.toLowerCase());
      if (existing) {
        setAuthError("That email is already taken.");
        return;
      }

      try {
        const credential = await createUserWithEmailAndPassword(auth, authEmail, authForm.password);
        const userDoc = doc(db, "users", credential.user.uid);
        const profile = {
          username: trimmedUsername,
          displayName: trimmedUsername,
          studentId: authForm.studentId.trim(),
          yearLevel: authForm.yearLevel.trim(),
          role: "student" as UserRole,
          email: authEmail,
        };

        await setDoc(userDoc, profile);

        const newAccount: Account = {
          username: trimmedUsername,
          password: authForm.password,
          role: "student",
          displayName: trimmedUsername,
          studentId: authForm.studentId.trim(),
          yearLevel: authForm.yearLevel.trim(),
        };

        setAccounts((prev) => [...prev, newAccount]);
        setCurrentUser({ ...newAccount, password: "" });
        setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
        setView("dashboard");
      } catch (error) {
        console.error("Firebase registration failed", error);
        let message = "Registration failed. Please try again.";
        if (error instanceof Error) {
          message = error.message;
        }
        setAuthError(message);
      }

      return;
    }

    if (!trimmedUsername || !authForm.password) {
      setAuthError("Please enter your email or student ID and password.");
      return;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, authEmail, authForm.password);
      const profileDoc = await getDoc(doc(db, "users", credential.user.uid));

      if (profileDoc.exists()) {
        const data = profileDoc.data() as Omit<Account, "password"> & { email?: string };
        setCurrentUser({
          username: data.username,
          password: "",
          role: data.role,
          displayName: data.displayName,
          studentId: data.studentId,
          yearLevel: data.yearLevel,
        });
        setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
        setView("dashboard");
        return;
      }

      const foundAccount = accounts.find(
        (account) => account.username.toLowerCase() === trimmedUsername.toLowerCase() && account.password === authForm.password
      );

      if (foundAccount) {
        setCurrentUser(foundAccount);
        setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
        setView("dashboard");
        return;
      }
    } catch {
      const foundAccount = accounts.find(
        (account) => account.username.toLowerCase() === trimmedUsername.toLowerCase() && account.password === authForm.password
      );

      if (foundAccount) {
        setCurrentUser(foundAccount);
        setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
        setView("dashboard");
        return;
      }
    }

    if (trimmedUsername === adminAccount.username && authForm.password === adminAccount.password) {
      setCurrentUser(adminAccount);
      setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
      setView("dashboard");
      return;
    }

    setAuthError("Invalid username or password.");
  };

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    setCurrentUser(null);
    setView("landing");
    setAuthError("");
    setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
  };

  return view === "landing"
    ? (
        <LandingPage
          onEnter={() => {
            setView("student-login");
            setAuthMode("login");
            setAuthError("");
            setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
          }}
          authMode={authMode}
          onSetAuthMode={setAuthMode}
          authForm={authForm}
          onAuthFieldChange={(field, value) => setAuthForm((prev) => ({ ...prev, [field]: value }))}
          onSubmit={handleAuthSubmit}
          authError={authError}
          onAdminLoginPage={() => {
            setView("admin-login");
            setAuthMode("login");
            setAuthError("");
            setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
          }}
        />
      )
    : view === "admin-login"
      ? (
          <AdminLoginPage
            onBack={() => {
              setView("landing");
              setAuthError("");
              setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
            }}
            authForm={authForm}
            onAuthFieldChange={(field, value) => setAuthForm((prev) => ({ ...prev, [field]: value }))}
            onSubmit={(event) => {
              event.preventDefault();
              setAuthError("");

              const trimmedUsername = authForm.username.trim();
              if (!trimmedUsername || !authForm.password) {
                setAuthError("Please enter username and password.");
                return;
              }

              if (trimmedUsername === adminAccount.username && authForm.password === adminAccount.password) {
                setCurrentUser(adminAccount);
                setAuthForm({ username: "", password: "", confirmPassword: "", studentId: "", yearLevel: "" });
                setView("dashboard");
                return;
              }

              setAuthError("Invalid admin credentials.");
            }}
            authError={authError}
          />
        )
      : <Dashboard onBack={handleLogout} currentUser={currentUser} />;
}
