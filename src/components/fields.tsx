import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from "react";

/** Small labelled-field primitives shared by every form in the app. */

type BaseFieldProps = {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
};

export function TextField({
  label,
  name,
  hint,
  required,
  ...props
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required ? <span className="text-accent-700"> *</span> : null}
      </label>
      <input id={name} name={name} required={required} className="input" {...props} />
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  hint,
  required,
  ...props
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required ? <span className="text-accent-700"> *</span> : null}
      </label>
      <textarea id={name} name={name} required={required} rows={4} className="input" {...props} />
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  hint,
  required,
  options,
  ...props
}: BaseFieldProps & { options: readonly string[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required ? <span className="text-accent-700"> *</span> : null}
      </label>
      <select id={name} name={name} required={required} className="input" {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function FormMessage({ ok, message }: { ok: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p
      className={
        ok
          ? "rounded-md border border-positive/25 bg-positive/5 px-3.5 py-2.5 text-meta text-positive"
          : "rounded-md border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-meta text-danger"
      }
      role={ok ? "status" : "alert"}
    >
      {message}
    </p>
  );
}

export function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}