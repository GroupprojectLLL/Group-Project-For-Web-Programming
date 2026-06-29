export default function Field({
  label,
  type = 'text',
  placeholder,
  defaultValue,
  required = true,
  minLength,
  value,
  onChange,
  autoComplete,
}) {
  const valueProps = value === undefined ? { defaultValue } : { value, onChange };

  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        {...valueProps}
      />
    </label>
  );
}
