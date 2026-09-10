import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, TrendingUp, Plus, ClipboardList, Flag, CalendarClock, ArrowRight } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-background/90 backdrop-blur-lg border-b border-border shadow-sm" 
          : "bg-background/50 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-md">
            <span className="text-primary-foreground font-black text-sm tracking-tighter">AP</span>
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight hidden sm:block">
            Track APs
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-foreground/80 hover:text-accent transition-colors flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/ScoreTracker" className="text-sm font-semibold text-foreground/80 hover:text-accent transition-colors flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Score & Grades
          </Link>
          <a href="#" className="text-sm font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-2 cursor-not-allowed">
            <ClipboardList className="w-4 h-4" /> Assignments
          </a>
          <a href="#" className="text-sm font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-2 cursor-not-allowed">
            <Flag className="w-4 h-4" /> Units
          </a>
        </nav>

        <div className="hidden sm:flex items-center gap-4">
          <Link to="/Login" className="text-sm font-semibold text-foreground hover:text-accent transition-colors">
            Sign in
          </Link>
          <Link to="/Onboarding">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 py-5 font-bold shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              Start planning <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-muted/50 rounded-full">
              <Menu className="h-6 w-6 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-l border-border">
            <nav className="flex flex-col gap-6 mt-12">
              <Link to="/" className="text-lg font-bold text-foreground flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors">
                <LayoutDashboard className="w-5 h-5 text-accent" /> Dashboard
              </Link>
              <Link to="/ScoreTracker" className="text-lg font-bold text-foreground flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors">
                <TrendingUp className="w-5 h-5 text-accent" /> Score & Grades
              </Link>
              <a href="#" className="text-lg font-bold text-muted-foreground/50 flex items-center gap-3 p-2">
                <ClipboardList className="w-5 h-5" /> Assignments <span className="text-xs bg-muted px-2 py-1 rounded-md">Soon</span>
              </a>
              <a href="#" className="text-lg font-bold text-muted-foreground/50 flex items-center gap-3 p-2">
                <Flag className="w-5 h-5" /> Units <span className="text-xs bg-muted px-2 py-1 rounded-md">Soon</span>
              </a>
              <div className="h-px bg-border my-4" />
              <Link to="/Login" className="text-lg font-bold text-foreground p-2">
                Sign in
              </Link>
              <Link to="/Onboarding">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full py-6 font-bold text-lg shadow-lg shadow-accent/20 mt-2">
                  Start planning <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}