const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, TrendingUp, GraduationCap, Info, Save, ClipboardCheck, CalendarClock } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const SubjectEntity = db.entities.Subject;
const ScoreEntryEntity = db.entities.ScoreEntry;
const ClassGradeEntryEntity = db.entities.ClassGradeEntry;

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
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`}>
      {children}
    </div>
  );
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const staticSubjects = [
  { id: "s1", name: "AP US History", exam_date: "2026-05-08", target_score: 5, current_predicted_score: 4 },
  { id: "s2", name: "AP Biology", exam_date: "2026-05-11", target_score: 5, current_predicted_score: 4 },
  { id: "s3", name: "AP Calculus BC", exam_date: "2026-05-12", target_score: 4, current_predicted_score: 3 },
  { id: "s4", name: "AP English Language", exam_date: "2026-05-06", target_score: 4, current_predicted_score: 4 },
];

const staticScores = [
  { id: "sc1", subject_name: "AP US History", type: "Quiz", raw_score: 8, max_score: 10, estimated_AP_score: 3, date: "2025-10-05" },
  { id: "sc2", subject_name: "AP US History", type: "Test", raw_score: 42, max_score: 50, estimated_AP_score: 4, date: "2025-11-12" },
  { id: "sc3", subject_name: "AP US History", type: "Mock/Practice Exam", raw_score: 75, max_score: 100, estimated_AP_score: 4, date: "2026-01-15" },
];

const staticGrades = [
  { id: "g1", subject_name: "AP US History", grading_period: "Q1", grade: "A-", date: "2025-10-15" },
  { id: "g2", subject_name: "AP US History", grading_period: "Q2", grade: "A", date: "2026-01-10" },
];

function HeroSection() {
  return (
    <section className="relative bg-primary text-primary-foreground">
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-accent/20 rounded-full blur-[110px] pointer-events-none" style={{ animation: 'floatA 9s ease-in-out infinite' }} />
      <div className="absolute -bottom-20 -left-20 w-[340px] h-[340px] bg-primary-foreground/10 rounded-full blur-[100px] pointer-events-none" style={{ animation: 'floatB 8s ease-in-out 2s infinite' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground/70">Evidence, not assumptions</span>
          </div>
          <h1 className="font-bold tracking-tight leading-[0.95] text-3xl sm:text-5xl mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Score & <span className="bg-gradient-to-r from-accent via-orange-300 to-accent bg-clip-text text-transparent animate-gradient-x">Grade Tracker</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-xl text-base sm:text-lg">
            Log every quiz, test and mock exam. Watch your trajectory toward your target AP score.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function DisclaimerBanner() {
  return (
    <AnimatedElement>
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted border border-border">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          This is a planning estimate based on the evidence you enter, not an official College Board prediction.
        </p>
      </div>
    </AnimatedElement>
  );
}

function SubjectTabs({ subjects, active, setActive }) {
  return (
    <AnimatedElement>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.name)}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
              active === s.name ? "bg-primary text-primary-foreground border-primary" : "bg-card text-card-foreground border-border hover:border-accent/50"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </AnimatedElement>
  );
}

function PredictedScoreCard({ subject, onUpdate }) {
  const [value, setValue] = useState(subject?.current_predicted_score ?? subject?.target_score ?? 3);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setValue(subject?.current_predicted_score ?? subject?.target_score ?? 3); setSaved(false); }, [subject?.id, subject?.name]);

  const save = () => {
    onUpdate(subject.id, Number(value));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-card-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Current predicted AP score</h3>
      </div>
      <div className="flex items-center gap-3">
        <Select value={String(value)} onValueChange={setValue}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">out of 5 · Target {subject?.target_score ?? "—"}</span>
        <Button onClick={save} size="sm" className="ml-auto bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="w-3.5 h-3.5 mr-1.5" /> {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </Card>
  );
}

function ScoreChartCard({ entries }) {
  const data = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date)).map((e) => ({
    date: formatDate(e.date), score: e.estimated_AP_score ?? null,
  }));
  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-card-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Estimated AP score trend</h3>
      </div>
      <div className={`h-56 ${data.length === 0 ? "hidden" : ""}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-sm text-muted-foreground py-10 text-center ${data.length === 0 ? "" : "hidden"}`}>No score entries yet. Add your first quiz or test below.</p>
    </Card>
  );
}

function ScoreEntriesCard({ subjectName, entries, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "Quiz", raw_score: "", max_score: "", estimated_AP_score: 3, date: new Date().toISOString().slice(0, 10) });

  const submit = () => {
    onAdd({ subject_name: subjectName, type: form.type, raw_score: Number(form.raw_score) || 0, max_score: Number(form.max_score) || 0, estimated_AP_score: Number(form.estimated_AP_score), date: form.date });
    setForm({ type: "Quiz", raw_score: "", max_score: "", estimated_AP_score: 3, date: new Date().toISOString().slice(0, 10) });
    setOpen(false);
  };

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-card-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Score entries</h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-accent/40 text-accent hover:bg-accent/10"><Plus className="w-4 h-4 mr-1" /> Add score</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle style={{ fontFamily: "'Outfit', sans-serif" }}>Add a score entry</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="mb-1.5 block">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="Mock/Practice Exam">Mock/Practice Exam</SelectItem>
                    <SelectItem value="FRQ Practice">FRQ Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1.5 block">Raw score</Label><Input type="number" value={form.raw_score} onChange={(e) => setForm({ ...form, raw_score: e.target.value })} /></div>
                <div><Label className="mb-1.5 block">Max score</Label><Input type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">Est. AP score</Label>
                  <Select value={String(form.estimated_AP_score)} onValueChange={(v) => setForm({ ...form, estimated_AP_score: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="mb-1.5 block">Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <Button onClick={submit} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className={`space-y-2 ${sorted.length === 0 ? "hidden" : ""}`}>
        {sorted.map((e) => (
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60">
            <Badge variant="secondary" className="shrink-0">{e.type}</Badge>
            <div className="flex-1 text-sm text-card-foreground">{e.raw_score}/{e.max_score} <span className="text-muted-foreground">raw</span></div>
            <div className="text-sm font-semibold text-accent">{e.estimated_AP_score}/5</div>
            <div className="text-xs text-muted-foreground w-14 text-right shrink-0">{formatDate(e.date)}</div>
            <button onClick={() => onDelete(e.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <p className={`text-sm text-muted-foreground py-6 text-center ${sorted.length === 0 ? "" : "hidden"}`}>No entries yet.</p>
    </Card>
  );
}

function ClassGradeCard({ subjectName, entries, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ grading_period: "", grade: "", date: new Date().toISOString().slice(0, 10) });

  const submit = () => {
    if (!form.grading_period || !form.grade) return;
    onAdd({ subject_name: subjectName, grading_period: form.grading_period, grade: form.grade, date: form.date });
    setForm({ grading_period: "", grade: "", date: new Date().toISOString().slice(0, 10) });
    setOpen(false);
  };

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-card-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>Class grade history</h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-accent/40 text-accent hover:bg-accent/10"><Plus className="w-4 h-4 mr-1" /> Add grade</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle style={{ fontFamily: "'Outfit', sans-serif" }}>Add a class grade</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label className="mb-1.5 block">Grading period</Label><Input value={form.grading_period} onChange={(e) => setForm({ ...form, grading_period: e.target.value })} placeholder="e.g. Q1, Midterm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1.5 block">Grade</Label><Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="e.g. A- or 91%" /></div>
                <div><Label className="mb-1.5 block">Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <Button onClick={submit} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save grade</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className={`space-y-2 ${sorted.length === 0 ? "hidden" : ""}`}>
        {sorted.map((g) => (
          <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60">
            <Badge variant="secondary" className="shrink-0">{g.grading_period}</Badge>
            <div className="flex-1 text-sm font-semibold text-card-foreground">{g.grade}</div>
            <div className="text-xs text-muted-foreground w-14 text-right shrink-0">{formatDate(g.date)}</div>
            <button onClick={() => onDelete(g.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <p className={`text-sm text-muted-foreground py-6 text-center ${sorted.length === 0 ? "" : "hidden"}`}>No grade history yet.</p>
    </Card>
  );
}

export default function ScoreTracker() {
  const [subjects, setSubjects] = useState([]);
  const [scores, setScores] = useState([]);
  const [grades, setGrades] = useState([]);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      SubjectEntity.list().catch(() => []),
      ScoreEntryEntity.list().catch(() => []),
      ClassGradeEntryEntity.list().catch(() => []),
    ]).then(([s, sc, g]) => {
      setSubjects(s || []);
      setScores(sc || []);
      setGrades(g || []);
      const list = (s && s.length > 0) ? s : staticSubjects;
      if (list.length > 0) setActive(list[0].name);
    }).finally(() => setLoading(false));
  }, []);

  const subjectsData = subjects.length > 0 ? subjects : staticSubjects;
  const scoresData = scores.length > 0 ? scores : staticScores;
  const gradesData = grades.length > 0 ? grades : staticGrades;

  const activeSubject = subjectsData.find((s) => s.name === active) || subjectsData[0];
  const subjectScores = scoresData.filter((e) => e.subject_name === activeSubject?.name);
  const subjectGrades = gradesData.filter((e) => e.subject_name === activeSubject?.name);

  const updatePredicted = async (id, value) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, current_predicted_score: value } : s)));
    try { await SubjectEntity.update(id, { current_predicted_score: value }); } catch (e) {}
  };
  const addScore = async (data) => {
    try {
      const created = await ScoreEntryEntity.create(data);
      setScores((prev) => [...prev, created]);
    } catch (e) {}
  };
  const deleteScore = async (id) => {
    setScores((prev) => prev.filter((s) => s.id !== id));
    try { await ScoreEntryEntity.delete(id); } catch (e) {}
  };
  const addGrade = async (data) => {
    try {
      const created = await ClassGradeEntryEntity.create(data);
      setGrades((prev) => [...prev, created]);
    } catch (e) {}
  };
  const deleteGrade = async (id) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
    try { await ClassGradeEntryEntity.delete(id); } catch (e) {}
  };

  return (
    <div className={loading ? "opacity-95" : ""}>
      <HeroSection />
      <section className="bg-background py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <DisclaimerBanner />
          <SubjectTabs subjects={subjectsData} active={active} setActive={setActive} />

          <div className={activeSubject ? "space-y-6" : "hidden"}>
            <AnimatedElement delay={60}>
              <PredictedScoreCard subject={activeSubject} onUpdate={updatePredicted} />
            </AnimatedElement>
            <AnimatedElement delay={120}>
              <ScoreChartCard entries={subjectScores} />
            </AnimatedElement>
            <AnimatedElement delay={180}>
              <ScoreEntriesCard subjectName={activeSubject?.name} entries={subjectScores} onAdd={addScore} onDelete={deleteScore} />
            </AnimatedElement>
            <AnimatedElement delay={240}>
              <ClassGradeCard subjectName={activeSubject?.name} entries={subjectGrades} onAdd={addGrade} onDelete={deleteGrade} />
            </AnimatedElement>
          </div>
        </div>
      </section>
    </div>
  );
}