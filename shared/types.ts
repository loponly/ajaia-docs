// API contract shared by server and web.
export type Role = "viewer" | "editor";
export type Access = "owner" | Role;

export type DocListItem = {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  role: Access;
  updatedAt: string;
};

export type ShareEntry = { userId: string; email: string; name: string; role: Role };

// Returned by every single-document endpoint.
export type DocView = DocListItem & { html: string; shares: ShareEntry[] };
