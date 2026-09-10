import { Link } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Plus, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <span className="text-accent-foreground font-bold text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>AP</span>
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>Command Center</span>
            </Link>
            <p className="text-sm text-primary-foreground/60 max-w-xs">
              One connected workspace for your AP subjects, coursework, deadlines and grades.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-4 text-sm uppercase tracking-wide text-primary-foreground/50">Workspace</p>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors flex items-center gap-2"><LayoutDashboard className="w-3.5 h-3.5" /> Dashboard</Link>
              <Link to="/ScoreTracker" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Score & Grade Tracker</Link>
              <Link to="/Onboarding" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Add a subject</Link>
            </nav>
          </div>

          <div>
            <p className="font-semibold mb-4 text-sm uppercase tracking-wide text-primary-foreground/50">Coming soon</p>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-sm text-primary-foreground/60">Assignment Tracker</a>
              <a href="#" className="text-sm text-primary-foreground/60">Unit Confidence Tracker</a>
              <a href="#" className="text-sm text-primary-foreground/60">Study Planner</a>
              <a href="#" className="text-sm text-primary-foreground/60">Deadline Tracker</a>
            </nav>
          </div>

          <div>
            <p className="font-semibold mb-4 text-sm uppercase tracking-wide text-primary-foreground/50">Legal</p>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Privacy</a>
              <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Terms</a>
              <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Contact</a>
              <a href="mailto:hello@apcommandcenter.com" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> hello@apcommandcenter.com</a>
            </nav>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-primary-foreground/50">© AP Command Center 2026</p>
          <p className="text-xs text-primary-foreground/50 max-w-xl">
            AP Command Center is an independent student-planning tool and is not affiliated with or endorsed by the College Board or the Advanced Placement Program.
          </p>
        </div>
      </div>
    </footer>
  );
}