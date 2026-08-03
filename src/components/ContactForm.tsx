import { useState } from "react";
import { submissions } from "@wix/forms";

interface FormField {
  label: string;
  target: string;
  required: boolean;
  componentType: string;
  identifier?: string;
  options?: { value: string; label: string }[];
}

interface ContactFormProps {
  formId: string;
  fields: FormField[];
}

/** Kakinada-local plain English for common contact targets. */
const LOCAL_LABELS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  phone: "Mobile number",
  message: "Monthly bill / roof notes",
};

const LOCAL_PLACEHOLDERS: Record<string, string> = {
  first_name: "e.g. Ravi",
  last_name: "e.g. Kumar",
  email: "you@example.com",
  phone: "98765 43210",
  message:
    "Approx. monthly electricity bill, roof size or facing, and any questions…",
};

function fieldLabel(field: FormField): string {
  return LOCAL_LABELS[field.target] ?? field.label ?? field.target;
}

function isTextArea(field: FormField): boolean {
  return field.identifier === "TEXT_AREA" || field.target === "message";
}

function isPhone(field: FormField): boolean {
  return field.componentType === "PHONE_INPUT" || field.target === "phone";
}

export default function ContactForm({ formId, fields }: ContactFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setFieldErrors({});

    try {
      const result = await submissions.createSubmission({
        formId,
        submissions: formData,
      });

      if (result.status === "PENDING" || result.status === "CONFIRMED") {
        setStatus("success");
        setFormData({});
      } else {
        setStatus("error");
      }
    } catch (err: unknown) {
      const violations =
        (err as { details?: { validationError?: { fieldViolations?: unknown[] } } })
          ?.details?.validationError?.fieldViolations ?? [];
      const errorMap: Record<string, string> = {};

      for (const v of violations) {
        const fieldErrs: { errorPath?: string; errorMessage?: string }[] =
          (v as { data?: { errors?: { errorPath?: string; errorMessage?: string }[] } })
            ?.data?.errors ?? [];
        for (const fe of fieldErrs) {
          if (fe.errorPath && !errorMap[fe.errorPath]) {
            errorMap[fe.errorPath] = fe.errorMessage ?? "Invalid value";
          }
        }
      }

      if (Object.keys(errorMap).length > 0) {
        setFieldErrors(errorMap);
        setStatus("idle");
      } else {
        setStatus("error");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        We'll call you back.
        <span className="form-success-note">
          Thanks — your message reached our Kakinada team. Expect a call on your
          mobile number shortly.
        </span>
      </div>
    );
  }

  const nameFields = fields.filter(
    (f) => f.target === "first_name" || f.target === "last_name",
  );
  const otherFields = fields.filter(
    (f) => f.target !== "first_name" && f.target !== "last_name",
  );

  const renderField = (field: FormField) => (
    <div key={field.target} className="form-field">
      <label className="form-label" htmlFor={`field-${field.target}`}>
        {fieldLabel(field)}
        {field.required && <span className="required">*</span>}
      </label>
      {field.componentType === "DROPDOWN" && field.options ? (
        <select
          id={`field-${field.target}`}
          required={field.required}
          value={formData[field.target] ?? ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [field.target]: e.target.value }))
          }
          className={`form-select${fieldErrors[field.target] ? " form-input-error" : ""}`}
        >
          <option value="">Select an option</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : isTextArea(field) ? (
        <textarea
          id={`field-${field.target}`}
          required={field.required}
          value={formData[field.target] ?? ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [field.target]: e.target.value }))
          }
          rows={4}
          placeholder={LOCAL_PLACEHOLDERS[field.target]}
          className={`form-textarea${fieldErrors[field.target] ? " form-input-error" : ""}`}
        />
      ) : (
        <input
          id={`field-${field.target}`}
          type={
            field.target === "email"
              ? "email"
              : isPhone(field)
                ? "tel"
                : "text"
          }
          required={field.required}
          value={formData[field.target] ?? ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [field.target]: e.target.value }))
          }
          placeholder={LOCAL_PLACEHOLDERS[field.target]}
          className={`form-input${fieldErrors[field.target] ? " form-input-error" : ""}`}
          {...(isPhone(field) ? { inputMode: "tel" as const, autoComplete: "tel" } : {})}
        />
      )}
      {fieldErrors[field.target] && (
        <p className="form-field-error">{fieldErrors[field.target]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="form-container contact-form" noValidate={false}>
      {nameFields.length > 0 && (
        <div className="form-row">{nameFields.map(renderField)}</div>
      )}
      {otherFields.map(renderField)}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="form-button"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>

      {status === "error" && (
        <p className="form-error">
          Something went wrong. Please try again, or call us if it keeps failing.
        </p>
      )}
    </form>
  );
}
