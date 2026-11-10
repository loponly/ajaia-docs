import { useEffect, useState } from "react";

let show: (message: string) => void = () => {};

export const showToast = (message: string) => show(message);

export function Toast() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    show = setMessage;
    return () => {
      show = () => {};
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);
  return message ? (
    <div className="toast" data-testid="toast" role="alert">
      {message}
    </div>
  ) : null;
}
