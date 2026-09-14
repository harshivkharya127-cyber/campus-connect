"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage, SelectField, TextAreaField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { uploadNoteAction } from "@/lib/actions/notes";
import { SEMESTERS, initialActionState } from "@/lib/types";

export function NoteUploadForm({ demoMode }: { demoMode: boolean }) {
  const [state, formAction] = useActionState(uploadNoteAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <TextField
        label="Title"
        name="title"
        placeholder="Data Structures — Unit 3: trees & heaps"
        required
        maxLength={160}
      />
      <TextAreaField
        label="Description"
        name="description"
        placeholder="What is covered, is it handwritten or typed, anything else useful."
        maxLength={1000}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Subject" name="subject" placeholder="Computer Science" required maxLength={80} />
        <TextField label="Course code" name="courseCode" placeholder="CS201" maxLength={20} />
        <SelectField label="Semester" name="semester" options={SEMESTERS} defaultValue="Semester 3" />
      </div>

      <div>
        <label className="label" htmlFor="file">
          File <span className="text-brand-300">*</span>
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg"
          className="input file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-100"
        />
        <p className="mt-1 text-xs text-slate-500">PDF, Office or image files up to 10 MB.</p>
      </div>

      {demoMode ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
          Demo mode: the metadata row is saved in memory, but the file itself needs Supabase Storage. Connect your project
          to store and share real files.
        </p>
      ) : null}

      <FormMessage ok={state.ok} message={state.message} />
      <SubmitButton className="btn-primary w-full" pendingText="Uploading…">
        Upload notes
      </SubmitButton>
    </form>
  );
}