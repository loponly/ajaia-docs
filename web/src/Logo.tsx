import { navigate } from "./nav";

export function Logo() {
  return (
    <a
      className="logo"
      href="/"
      onClick={(e) => {
        e.preventDefault();
        navigate("/");
      }}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M6 2h12l8 8v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="var(--primary)" />
        <path d="M18 2l8 8h-6a2 2 0 0 1-2-2z" fill="var(--primary-dark)" />
        <path d="M9 15h10M9 19h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>Ajaia Docs</span>
    </a>
  );
}
