const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft, Plus, Trash2, GraduationCap, CalendarClock, Target, CheckCircle2, Sparkles } from "lucide-react";

const SubjectEntity = db.entities.Subject;

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

const commonAPCourses = [
  "AP US History", "AP Biology", "AP Calculus BC", "AP Calculus AB", "AP English Language",
  "AP English Literature", "AP Chemistry", "AP Physics 1", "AP Physics C", "AP World History",
  "AP Psychology", "AP Statistics", "AP Computer Science A", "AP Environmental Science", "AP Spanish Language",
];

const emptyDraft = { name: "", exam_date: "2026-05-08", target_score: 4, class_grade_target: "" };

function ProgressDots({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-10 bg-accent" : i < step ? "w-6 bg-accent/50" : "w-6 bg-border"}`} />
      ))}
    </div>
  );
}

function StepWelcome({ onNext }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Let's set up your <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-gradient-x">AP Command Center</span>
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Add your AP courses, exam dates and target scores. It takes about two minutes — you can always add more subjects later.
      </p>
      <Button onClick={onNext} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-base font-semibold">
        Get started <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}

function StepAddSubjects({ drafts, setDrafts, onNext, onBack }) {
  const [form, setForm] = useState(emptyDraft);

  const addDraft = () => {
    if (!form.name) return;
    setDrafts([...drafts, form]);
    setForm(emptyDraft);
  };
  const removeDraft = (idx) => setDrafts(drafts.filter((_, i) => i !== idx));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Add an AP course</h2>
      <p className="text-muted-foreground mb-6">Set the exam date and your target score. Add as many subjects as you're taking.</p>

      <Card className="p-5 sm:p-6 rounded-2xl border-border bg-card mb-6">
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Course name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. AP US History" list="ap-courses" />
            <datalist id="ap-courses">
              {commonAPCourses.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Exam date</Label>
              <Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Target class grade</Label>
              <Input value={form.class_grade_target} onChange={(e) => setForm({ ...form, class_grade_target: e.target.value })} placeholder="e.g. A or 3.8 GPA" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Target AP score</Label>
              <span className="text-sm font-bold text-accent">{form.target_score}</span>
            </div>
            <Slider value={[form.target_score]} min={1} max={5} step={1} onValueChange={(v) => setForm({ ...form, target_score: v[0] })} />
          </div>
          <Button onClick={addDraft} variant="outline" className="w-full border-accent/40 text-accent hover:bg-accent/10">
            <Plus className="w-4 h-4 mr-2" /> Add this subject
          </Button>
        </div>
      </Card>

      <div className={`space-y-2 mb-8 ${drafts.length === 0 ? "hidden" : ""}`}>
        <p className="text-sm font-semibold text-foreground mb-2">Subjects added ({drafts.length})</p>
        {drafts.map((d, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
            <div>
              <p className="font-medium text-sm text-card-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">Exam {d.exam_date} · Target {d.target_score}/5{d.class_grade_target ? ` · ${d.class_grade_target}` : ""}</p>
            </div>
            <button onClick={() => removeDraft(idx)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <Button onClick={onNext} disabled={drafts.length === 0} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6">
          Review & finish <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function StepReview({ drafts, onBack, onFinish, saving }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Review your subjects</h2>
      <p className="text-muted-foreground mb-6">Everything looks good? Finish setup to open your dashboard.</p>

      <div className="space-y-3 mb-8">
        {drafts.map((d, idx) => (
          <Card key={idx} className="p-4 rounded-2xl border-border bg-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-card-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>{d.name}</p>
              <p className="text-xs text-muted-foreground">Exam {d.exam_date} · Target AP score {d.target_score}/5{d.class_grade_target ? ` · Class target ${d.class_grade_target}` : ""}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <Button onClick={onFinish} disabled={saving} className="relative overflow-hidden bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-base font-semibold">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
          <span className="relative">{saving ? "Setting up..." : "Finish setup"}</span>
        </Button>
      </div>
    </motion.div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async () => {
    setSaving(true);
    try {
      await Promise.all(drafts.map((d) => SubjectEntity.create(d)));
    } catch (e) {}
    setSaving(false);
    navigate("/");
  };

  return (
    <div className="relative min-h-[80vh] bg-background overflow-hidden">
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" style={{ animation: 'floatA 9s ease-in-out infinite' }} />
      <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-primary/10 rounded-full blur-[110px] pointer-events-none" style={{ animation: 'floatB 8s ease-in-out 2s infinite' }} />
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <AnimatedElement>
          <ProgressDots step={step} />
        </AnimatedElement>

        <div className={step === 0 ? "" : "hidden"}><StepWelcome onNext={() => setStep(1)} /></div>
        <div className={step === 1 ? "" : "hidden"}><StepAddSubjects drafts={drafts} setDrafts={setDrafts} onNext={() => setStep(2)} onBack={() => setStep(0)} /></div>
        <div className={step === 2 ? "" : "hidden"}><StepReview drafts={drafts} onBack={() => setStep(1)} onFinish={handleFinish} saving={saving} /></div>
      </div>
    </div>
  );
}