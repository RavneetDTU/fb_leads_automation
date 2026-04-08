import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Label } from '../../ui/label';
import { leadsService } from '../../../services/leads';

export const QuestionsTab = forwardRef(function QuestionsTab({ leadId }, ref) {
  const [questions, setQuestions] = useState({
    crowdedSituations: '',
    peopleMumble: '',
    watchFaces: '',
    howCanWeHelp: '',
    benefitCheck: false,
    audiogram: false,
    bookAppointment: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      try {
        const data = await leadsService.getLeadAnswers(leadId);
        setQuestions((prev) => ({
          ...prev,
          crowdedSituations: data.difficulty_crowded ? 'yes' : data.difficulty_crowded === false ? 'no' : '',
          peopleMumble: data.mumble_or_muffled ? 'yes' : data.mumble_or_muffled === false ? 'no' : '',
          watchFaces: data.watch_face ? 'yes' : data.watch_face === false ? 'no' : '',
        }));
      } catch (err) {
        console.error('Failed to load answers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, [leadId]);

  // Expose save() to parent so the fixed footer can trigger it
  useImperativeHandle(ref, () => ({
    save: async () => {
      await leadsService.updateLeadAnswers(leadId, {
        difficulty_crowded: questions.crowdedSituations === 'yes',
        mumble_or_muffled: questions.peopleMumble === 'yes',
        watch_face: questions.watchFaces === 'yes',
      });
    },
    isLoading: loading,
  }), [questions, leadId, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading answers…</span>
      </div>
    );
  }

  const selectClassName = "flex h-9 w-40 rounded-md border border-border bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)]";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="crowdedSituations">Do you have difficulty in crowed or noisy situations?</Label>
        <div className="flex items-center gap-2">
          <select
            id="crowdedSituations"
            value={questions.crowdedSituations}
            onChange={(e) => setQuestions({ ...questions, crowdedSituations: e.target.value })}
            className={selectClassName}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {questions.crowdedSituations && (
            <span className="text-emerald-500">✓</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="peopleMumble">Do you think that other people mumble or sound muffled?</Label>
        <div className="flex items-center gap-2">
          <select
            id="peopleMumble"
            value={questions.peopleMumble}
            onChange={(e) => setQuestions({ ...questions, peopleMumble: e.target.value })}
            className={selectClassName}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {questions.peopleMumble && (
            <span className="text-emerald-500">✓</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="watchFaces">Do you intently watch peoples face when they speak to you?</Label>
        <div className="flex items-center gap-2">
          <select
            id="watchFaces"
            value={questions.watchFaces}
            onChange={(e) => setQuestions({ ...questions, watchFaces: e.target.value })}
            className={selectClassName}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {questions.watchFaces && (
            <span className="text-emerald-500">✓</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="howCanWeHelp">how can we help you?</Label>
        <textarea
          id="howCanWeHelp"
          placeholder="Type your response here..."
          value={questions.howCanWeHelp}
          onChange={(e) => setQuestions({ ...questions, howCanWeHelp: e.target.value })}
          rows={5}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-slate-400 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,0,0,0.08)] resize-none"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={questions.benefitCheck}
            onChange={(e) => setQuestions({ ...questions, benefitCheck: e.target.checked })}
            className="w-4 h-4 rounded border-border text-foreground focus:ring-2 focus:ring-[rgba(0,0,0,0.08)]"
          />
          <span className="text-foreground">we can do a benefit check on your behalf?</span>
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={questions.audiogram}
            onChange={(e) => setQuestions({ ...questions, audiogram: e.target.checked })}
            className="w-4 h-4 rounded border-border text-foreground focus:ring-2 focus:ring-[rgba(0,0,0,0.08)]"
          />
          <span className="text-foreground">do you have an audiogram not older than 6 months?</span>
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={questions.bookAppointment}
            onChange={(e) => setQuestions({ ...questions, bookAppointment: e.target.checked })}
            className="w-4 h-4 rounded border-border text-foreground focus:ring-2 focus:ring-[rgba(0,0,0,0.08)]"
          />
          <span className="text-foreground">would you like to book an appointment for a full diagnostic?</span>
        </label>
      </div>
    </div>
  );
});
