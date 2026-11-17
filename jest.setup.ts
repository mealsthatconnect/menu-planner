import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

jest.mock("@/lib/server/authz", () => ({
  requireSignedIn: jest.fn(async () => ({ ok: true, userId: "test-user", role: "Admin" })),
  requireStaffEditor: jest.fn(async () => ({ ok: true, userId: "test-user", role: "Admin" })),
  requireAdmin: jest.fn(async () => ({ ok: true, userId: "test-user", role: "Admin" })),
}));
