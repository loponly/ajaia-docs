export type User = { id: string; email: string; name: string };

// Mocked auth: the only accounts that exist.
export const USERS: User[] = [
  { id: "alice", email: "alice@ajaia.test", name: "Alice Chen" },
  { id: "bob", email: "bob@ajaia.test", name: "Bob Diaz" },
  { id: "carol", email: "carol@ajaia.test", name: "Carol Park" },
];

export const findUser = (id: string) => USERS.find((u) => u.id === id);
export const findUserByEmail = (email: string) =>
  USERS.find((u) => u.email === email.trim().toLowerCase());
