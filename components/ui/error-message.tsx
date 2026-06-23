type ErrorMessageProps = {
  message: string;
};

export const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <div
    className="border border-negative/30 bg-red-50 px-4 py-3 text-sm text-negative"
    role="alert"
    style={{ borderRadius: "var(--radius-editorial)" }}
  >
    {message}
  </div>
);
