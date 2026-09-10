const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, CalendarClock, Flag, Target, Layers, GraduationCap, Plus, CheckCircle2, Circle, Trash2, Sparkles, BookOpen, ClipboardList, ChevronRight, ArrowDown } from "lucide-react";

const SubjectEntity = db.entities.Subject;
const UnitEntity = db.entities.Unit;
const AssignmentEntity = db.entities.Assignment;
const CheckpointEntity = db.entities.Checkpoint;

const AnimatedElement = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setIsVisible(true); return; }
    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); setTimeout(() => setIsVisible(true), delay); observer.unobserve(el); }
    }, { threshold: 0.05, rootMargin: '0px 0px 200px 0px' });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-[800ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className || ''}`}>
      {children}
    </div>
  );
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const confidenceClass = {
  "Confident": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Average": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Needs Practice": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Not Learnt": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const staticSubjects = [
  { id: "s1", name: "AP US History", exam_date: "2026-05-08", target_score: 5, current_predicted_score: 4 },
  { id: "s2", name: "AP Biology", exam_date: "2026-05-11", target_score: 5, current_predicted_score: 4 },
  { id: "s3", name: "AP Calculus BC", exam_date: "2026-05-12", target_score: 4, current_predicted_score: 3 },
  { id: "s4", name: "AP English Language", exam_date: "2026-05-06", target_score: 4, current_predicted_score: 4 },
];

const staticUnits = [
  { id: "u1", subject_name: "AP US History", title: "Period 5: 1844-1877", confidence_status: "Needs Practice", flagged_for_revision: true },
  { id: "u2", subject_name: "AP US History", title: "Period 8: 1945-1980", confidence_status: "Not Learnt", flagged_for_revision: true },
  { id: "u3", subject_name: "AP Biology", title: "Cellular Energetics", confidence_status: "Needs Practice", flagged_for_revision: true },
  { id: "u4", subject_name: "AP Biology", title: "Gene Expression & Regulation", confidence_status: "Not Learnt", flagged_for_revision: true },
];

const staticAssignments = [
  { id: "a1", subject_name: "AP US History", title: "DBQ Practice: Reconstruction Era", type: "DBQ/FRQ Practice", status: "Draft", due_date: "2026-02-20", notes: "" },
  { id: "a2", subject_name: "AP Biology", title: "Enzyme Lab Report", type: "Lab", status: "Awaiting Feedback", due_date: "2026-02-15", notes: "" },
];

const staticCheckpoints = [
  { id: "c1", assignment_title: "DBQ Practice: Reconstruction Era", subject_name: "AP US History", title: "Write body paragraphs", due_date: "2026-02-17", done: false },
];

function HeroSection({ subjects, units, assignments, checkpoints }) {
  const nearestExam = subjects.filter((s) => s.exam_date).sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))[0];
  const daysToExam = nearestExam ? daysUntil(nearestExam.exam_date) : null;
  const predicted = subjects.map((s) => s.current_predicted_score ?? s.target_score).filter((n) => typeof n === "number");
  const avgPredicted = predicted.length ? (predicted.reduce((a, b) => a + b, 0) / predicted.length).toFixed(1) : "—";

  const upcomingItems = [
    ...assignments.filter((a) => a.status !== "Done" && a.due_date).map((a) => ({ label: a.title, date: a.due_date, subject: a.subject_name, kind: "Assignment" })),
    ...checkpoints.filter((c) => !c.done && c.due_date).map((c) => ({ label: c.title, date: c.due_date, subject: c.subject_name, kind: "Checkpoint" })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  const topPriority = upcomingItems[0];
  const flaggedCount = units.filter((u) => u.flagged_for_revision).length;

  return (
    <section className="relative bg-background pt-24 pb-32 selection:bg-accent/20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/4" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 -translate-y-1/2" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,_hsl(var(--border))_1px,_transparent_1px)] bg-[length:32px_32px] opacity-[0.15] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Text Content */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Built for high schoolers</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-foreground mb-6">
              The <br/>
              <span className="text-accent bg-clip-text text-transparent bg-gradient-to-r from-accent to-orange-400">command <br/>center</span> <br/>
              for your APs.
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 font-medium">
              Bring your subjects, coursework, deadlines, grades, and revision into one connected workspace—so you always know what matters next.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/Onboarding" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-14 px-8 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-bold text-lg shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group">
                  Start planning <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-lg border-2 border-border hover:bg-muted transition-all duration-300">
                See how it works <Plus className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Floating Cards UI Mockup */}
          <div className="relative h-[500px] lg:h-[600px] w-full hidden sm:block perspective-1000 z-10">
            {/* Ambient Glow behind cards */}
            <div className="absolute inset-1/4 bg-accent/20 blur-[100px] rounded-full animate-pulse-slow pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
              className="absolute top-10 left-[10%] w-[260px] animate-floatA z-20">
              <Card className="bg-background/90 backdrop-blur-xl border-border/50 p-6 rounded-[2rem] shadow-2xl shadow-primary/5 hover:scale-105 transition-transform duration-300 cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Subjects Tracked</p>
                <p className="text-4xl font-black text-foreground">{subjects.length}</p>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span>Across {units.length} units</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Active</Badge>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
              className="absolute top-[35%] right-[5%] w-[280px] animate-floatB z-30">
              <Card className="bg-background/90 backdrop-blur-xl border-border/50 p-6 rounded-[2rem] shadow-2xl shadow-accent/5 hover:scale-105 transition-transform duration-300 cursor-default ring-1 ring-accent/20">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <Badge className="bg-accent text-accent-foreground font-bold shadow-md shadow-accent/20">Next up</Badge>
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Top Priority</p>
                <p className="text-xl font-bold text-foreground leading-tight truncate mb-2">{topPriority?.label || "All caught up"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> {topPriority ? formatDate(topPriority.date) : "Nothing due"}
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}
              className="absolute bottom-10 left-[20%] w-[300px] animate-floatA animation-delay-2000 z-10">
              <Card className="bg-background/90 backdrop-blur-xl border-border/50 p-6 rounded-[2rem] shadow-2xl shadow-primary/5 hover:scale-105 transition-transform duration-300 cursor-default">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Avg Predicted</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-black text-foreground">{avgPredicted}</p>
                      <span className="text-sm font-bold text-muted-foreground">/ 5</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Flagged topics</span>
                    <span className="text-amber-600">{flaggedCount} needs review</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-1/3" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Mobile Fallback Grid */}
          <div className="sm:hidden grid grid-cols-2 gap-4 mt-8">
            <Card className="bg-card p-4 rounded-2xl border-border/50 shadow-sm">
              <Layers className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-black">{subjects.length}</p>
              <p className="text-xs text-muted-foreground font-semibold">Subjects</p>
            </Card>
            <Card className="bg-card p-4 rounded-2xl border-border/50 shadow-sm">
              <GraduationCap className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-black">{avgPredicted}</p>
              <p className="text-xs text-muted-foreground font-semibold">Avg Score</p>
            </Card>
            <Card className="bg-card p-4 rounded-2xl border-border/50 shadow-sm col-span-2">
              <div className="flex justify-between items-center mb-2">
                <Target className="w-5 h-5 text-accent" />
                <Badge className="bg-accent/10 text-accent hover:bg-accent/20">Priority</Badge>
              </div>
              <p className="text-lg font-bold truncate">{topPriority?.label || "All caught up"}</p>
              <p className="text-xs text-muted-foreground font-semibold">{topPriority ? formatDate(topPriority.date) : "Nothing due"}</p>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}

function ScrollIndicator() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 opacity-50 bg-background">
      <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3">Scroll to explore</span>
      <ArrowDown className="w-4 h-4 text-muted-foreground animate-bounce" />
    </div>
  );
}

function SubjectsOverviewSection({ subjects, units, assignments }) {
  return (
    <AnimatedElement>
      <section className="bg-background py-16 sm:py-24 border-t border-border/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase mb-4 block">01 · Command Center</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
              See the <span className="text-accent relative inline-block">whole picture<svg className="absolute -bottom-2 left-0 w-full h-3 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none"/></svg></span> at once.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              Your subjects, core requirements, deadlines and daily workload come together in one clear view.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex flex-wrap justify-center gap-2 sm:gap-6 p-2 rounded-full bg-muted/50 border border-border/50">
              {['SUBJECTS', 'CORE', 'DEADLINES', 'GRADES'].map((tab, i) => (
                <button key={tab} className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${i === 0 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${subjects.length === 0 ? "hidden" : ""}`}>
            {subjects.map((s, idx) => {
              const subjectUnits = units.filter((u) => u.subject_name === s.name);
              const flaggedCount = subjectUnits.filter((u) => u.flagged_for_revision).length;
              const openAssignments = assignments.filter((a) => a.subject_name === s.name && a.status !== "Done").length;
              const days = daysUntil(s.exam_date);
              
              return (
                <AnimatedElement key={s.id || idx} delay={idx * 100}>
                  <Card className="group relative overflow-hidden bg-card border-border p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] transition-transform group-hover:scale-110" />
                    
                    <h3 className="text-xl font-black text-foreground mb-2 relative z-10">{s.name}</h3>
                    <p className="text-sm font-semibold text-muted-foreground mb-6 relative z-10">
                      Exam: {formatDate(s.exam_date)} {days != null ? <span className="text-accent">({days}d)</span> : ""}
                    </p>
                    
                    <div className="space-y-4 relative z-10">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-muted-foreground">Predicted Score</span>
                          <span className="text-foreground">{s.current_predicted_score ?? s.target_score ?? "—"} / 5</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: `${((s.current_predicted_score ?? 0) / 5) * 100}%` }} 
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-primary rounded-full" 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                        <div className="bg-muted/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                          <ClipboardList className="w-4 h-4 text-primary mb-1" />
                          <span className="text-lg font-black text-foreground">{openAssignments}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tasks</span>
                        </div>
                        <div className={`rounded-xl p-3 flex flex-col items-center justify-center text-center ${flaggedCount > 0 ? 'bg-amber-500/10' : 'bg-muted/50'}`}>
                          <Flag className={`w-4 h-4 mb-1 ${flaggedCount > 0 ? 'text-amber-500' : 'text-primary'}`} />
                          <span className={`text-lg font-black ${flaggedCount > 0 ? 'text-amber-600' : 'text-foreground'}`}>{flaggedCount}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Flagged</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimatedElement>
              );
            })}
          </div>

          <Card className={`p-12 text-center rounded-[2rem] border-dashed border-2 border-border/60 bg-muted/30 ${subjects.length === 0 ? "" : "hidden"}`}>
            <Layers className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No subjects tracked yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Start mapping out your AP journey by adding your first subject and exam date.</p>
            <Link to="/Onboarding">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 font-bold shadow-lg">
                Add your first subject <Plus className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </AnimatedElement>
  );
}

function DashboardSplitSection({ subjects, units, assignments, checkpoints, onToggleCheckpoint, onToggleFlag, onDeleteUnit, onAddUnit, onAddAssignment }) {
  const [unitOpen, setUnitOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [unitForm, setUnitForm] = useState({ subject_name: "", title: "", confidence_status: "Average", flagged_for_revision: false });
  const [assignForm, setAssignForm] = useState({ subject_name: "", title: "", type: "Reading", status: "Not Started", due_date: "", notes: "" });

  const submitUnit = () => { if (unitForm.subject_name && unitForm.title) { onAddUnit(unitForm); setUnitForm({ subject_name: "", title: "", confidence_status: "Average", flagged_for_revision: false }); setUnitOpen(false); } };
  const submitAssignment = () => { if (assignForm.subject_name && assignForm.title) { onAddAssignment(assignForm); setAssignForm({ subject_name: "", title: "", type: "Reading", status: "Not Started", due_date: "", notes: "" }); setAssignOpen(false); } };

  const allDeadlines = [
    ...subjects.filter(s => s.exam_date).map(s => ({ label: `${s.name} Exam`, date: s.exam_date, subject: s.name, kind: "Exam", id: `exam-${s.id}` })),
    ...assignments.filter(a => a.status !== "Done" && a.due_date).map(a => ({ label: a.title, date: a.due_date, subject: a.subject_name, kind: "Task", id: a.id })),
    ...checkpoints.filter(c => !c.done && c.due_date).map(c => ({ label: c.title, date: c.due_date, subject: c.subject_name, kind: "Checkpoint", id: c.id }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6);

  const flaggedUnits = units.filter((u) => u.flagged_for_revision);

  return (
    <section className="bg-secondary/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Deadlines Col */}
          <AnimatedElement delay={100} className="h-full">
            <Card className="bg-background border-border/40 rounded-[2rem] shadow-xl shadow-primary/5 p-6 sm:p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-foreground mb-1">Upcoming Deadlines</h3>
                  <p className="text-sm font-medium text-muted-foreground">Keep your workload flowing.</p>
                </div>
                <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full shrink-0 border-2 hover:border-accent hover:text-accent transition-colors"><Plus className="w-5 h-5" /></Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader><DialogTitle className="text-2xl font-black">Add Task</DialogTitle></DialogHeader>
                    {/* Simplified Dialog Content for brevity in code generation, matching original functionality */}
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2"><Label>Subject</Label><Select value={assignForm.subject_name} onValueChange={(v) => setAssignForm({ ...assignForm, subject_name: v })}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Title</Label><Input value={assignForm.title} onChange={e => setAssignForm({...assignForm, title: e.target.value})} placeholder="e.g. Chapter 12 Notes"/></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Type</Label><Select value={assignForm.type} onValueChange={(v) => setAssignForm({ ...assignForm, type: v })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Lab">Lab</SelectItem><SelectItem value="Reading">Reading</SelectItem><SelectItem value="Project">Project</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={assignForm.due_date} onChange={e => setAssignForm({...assignForm, due_date: e.target.value})}/></div>
                      </div>
                      <Button onClick={submitAssignment} className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl font-bold py-6 mt-4">Add Task</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 flex-1">
                {allDeadlines.length > 0 ? allDeadlines.map((item, idx) => {
                  const d = daysUntil(item.date);
                  const isOverdue = d != null && d < 0;
                  return (
                    <div key={item.id + idx} className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-transparent hover:border-border transition-all">
                      <button onClick={() => item.kind === "Checkpoint" && onToggleCheckpoint(item.id)} className={`shrink-0 ${item.kind === "Checkpoint" ? "cursor-pointer" : "cursor-default opacity-50"}`}>
                        <Circle className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{item.label}</p>
                        <p className="text-xs font-semibold text-muted-foreground truncate">{item.subject} <span className="mx-1">•</span> {item.kind}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isOverdue ? 'text-rose-500' : 'text-foreground'}`}>{formatDate(item.date)}</p>
                        <Badge variant="outline" className={`mt-1 border-0 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold ${isOverdue ? 'bg-rose-500/10 text-rose-600' : d <= 3 ? 'bg-amber-500/10 text-amber-600' : 'bg-secondary text-secondary-foreground'}`}>
                          {d != null ? (d === 0 ? "Today" : d < 0 ? "Overdue" : `${d}d left`) : ""}
                        </Badge>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <CalendarClock className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">No upcoming deadlines.</p>
                  </div>
                )}
              </div>
            </Card>
          </AnimatedElement>

          {/* Revision Col */}
          <AnimatedElement delay={200} className="h-full">
            <Card className="bg-background border-border/40 rounded-[2rem] shadow-xl shadow-primary/5 p-6 sm:p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-foreground mb-1 flex items-center gap-2">Needs Revision <Badge variant="destructive" className="rounded-full bg-amber-500 hover:bg-amber-600 border-0">{flaggedUnits.length}</Badge></h3>
                  <p className="text-sm font-medium text-muted-foreground">Topics requiring your attention.</p>
                </div>
                <Dialog open={unitOpen} onOpenChange={setUnitOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full shrink-0 border-2 hover:border-accent hover:text-accent transition-colors"><Plus className="w-5 h-5" /></Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader><DialogTitle className="text-2xl font-black">Track Unit</DialogTitle></DialogHeader>
                     {/* Simplified Dialog Content */}
                     <div className="space-y-4 pt-4">
                      <div className="space-y-2"><Label>Subject</Label><Select value={unitForm.subject_name} onValueChange={(v) => setUnitForm({ ...unitForm, subject_name: v })}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label>Unit Title</Label><Input value={unitForm.title} onChange={e => setUnitForm({...unitForm, title: e.target.value})} placeholder="e.g. Thermodynamics"/></div>
                      <div className="space-y-2"><Label>Confidence</Label><Select value={unitForm.confidence_status} onValueChange={(v) => setUnitForm({ ...unitForm, confidence_status: v })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Confident">Confident</SelectItem><SelectItem value="Average">Average</SelectItem><SelectItem value="Needs Practice">Needs Practice</SelectItem><SelectItem value="Not Learnt">Not Learnt</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between pt-2"><Label className="font-bold">Flag for review</Label><Switch checked={unitForm.flagged_for_revision} onCheckedChange={(v) => setUnitForm({ ...unitForm, flagged_for_revision: v })} /></div>
                      <Button onClick={submitUnit} className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl font-bold py-6 mt-4">Track Unit</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 flex-1">
                {flaggedUnits.length > 0 ? flaggedUnits.map((u) => (
                  <div key={u.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-transparent hover:border-border transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{u.title}</p>
                      <p className="text-xs font-semibold text-muted-foreground truncate">{u.subject_name}</p>
                    </div>
                    <Badge variant="outline" className={`px-2 py-1 rounded-md text-xs font-bold border ${confidenceClass[u.confidence_status] || confidenceClass["Average"]}`}>
                      {u.confidence_status}
                    </Badge>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => onToggleFlag(u.id, false)} className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-full" title="Unflag">
                        <Flag className="w-4 h-4 fill-current" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteUnit(u.id)} className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-full" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mb-4 opacity-20 text-emerald-500" />
                    <p className="font-medium">No flagged topics. Great job!</p>
                  </div>
                )}
              </div>
            </Card>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <AnimatedElement>
      <section className="bg-primary text-primary-foreground py-24 sm:py-32 relative overflow-hidden">
        {/* Dynamic dark background styling matching the screenshot's bottom section */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_hsl(var(--accent))_0%,_transparent_50%)] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary))_0%,_transparent_50%)] opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase mb-6 block">Explore the system</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-primary-foreground mb-6">
              Make your APs feel <br/><span className="text-accent relative z-10">manageable.</span>
            </h2>
            <p className="text-xl text-primary-foreground/70 mb-10 font-medium max-w-lg">
              Give every subject, deadline, and objective a place in one connected workspace—then move forward with a clear next step.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link to="/Register">
                <Button className="h-14 px-8 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-bold text-lg shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all duration-300">
                  Create your account <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/ScoreTracker" className="text-sm font-bold text-primary-foreground hover:text-accent transition-colors flex items-center">
                Explore the Score Tracker <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="w-full max-w-md hidden lg:block relative">
             <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full animate-pulse-slow pointer-events-none" />
             {/* Mock visual representation of the app in dark mode to match screenshot vibe */}
             <div className="relative bg-[#0F172A] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden aspect-[4/3] flex flex-col p-6 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-8">
                   <div className="w-1/2 h-4 bg-white/10 rounded-full" />
                   <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                     <Target className="w-4 h-4 text-accent" />
                   </div>
                </div>
                <div className="space-y-4 flex-1">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-md bg-white/5 shrink-0" />
                        <div className="flex-1 space-y-2">
                           <div className="w-full h-3 bg-white/10 rounded-full" />
                           <div className="w-1/3 h-2 bg-white/5 rounded-full" />
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between">
                   <div className="w-1/4 h-8 bg-white/5 rounded-lg" />
                   <div className="w-1/4 h-8 bg-accent/20 rounded-lg" />
                </div>
             </div>
          </div>

        </div>
      </section>
    </AnimatedElement>
  );
}

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    Promise.all([
      SubjectEntity.list().catch(() => []),
      UnitEntity.list().catch(() => []),
      AssignmentEntity.list().catch(() => []),
      CheckpointEntity.list().catch(() => []),
    ]).then(([s, u, a, c]) => {
      setSubjects(s || []);
      setUnits(u || []);
      setAssignments(a || []);
      setCheckpoints(c || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const subjectsData = subjects.length > 0 ? subjects : staticSubjects;
  const unitsData = units.length > 0 ? units : staticUnits;
  const assignmentsData = assignments.length > 0 ? assignments : staticAssignments;
  const checkpointsData = checkpoints.length > 0 ? checkpoints : staticCheckpoints;

  const toggleFlag = async (id, value) => {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, flagged_for_revision: value } : u)));
    try { await UnitEntity.update(id, { flagged_for_revision: value }); } catch (e) {}
  };
  const deleteUnit = async (id) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
    try { await UnitEntity.delete(id); } catch (e) {}
  };
  const toggleCheckpoint = async (id) => {
    setCheckpoints((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
    try {
      const cp = checkpoints.find((c) => c.id === id);
      await CheckpointEntity.update(id, { done: !(cp ? cp.done : false) });
    } catch (e) {}
  };
  const addUnit = async (data) => {
    try { const created = await UnitEntity.create(data); setUnits((prev) => [...prev, created]); } catch (e) {}
  };
  const addAssignment = async (data) => {
    try { const created = await AssignmentEntity.create(data); setAssignments((prev) => [...prev, created]); } catch (e) {}
  };

  return (
    <div className={`min-h-screen bg-background font-sans ${loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatA { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(2deg); } }
        @keyframes floatB { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-2deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .animate-floatA { animation: floatA 8s ease-in-out infinite; }
        .animate-floatB { animation: floatB 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}} />
      
      <HeroSection subjects={subjectsData} units={unitsData} assignments={assignmentsData} checkpoints={checkpointsData} />
      
      <ScrollIndicator />

      <SubjectsOverviewSection subjects={subjectsData} units={unitsData} assignments={assignmentsData} />

      <DashboardSplitSection 
        subjects={subjectsData} 
        units={unitsData} 
        assignments={assignmentsData} 
        checkpoints={checkpointsData} 
        onToggleCheckpoint={toggleCheckpoint}
        onToggleFlag={toggleFlag}
        onDeleteUnit={deleteUnit}
        onAddUnit={addUnit}
        onAddAssignment={addAssignment}
      />

      <CTASection />
    </div>
  );
}