export function isAdminAuthorized(req: Request) {
  const expected = process.env.ADMIN_CRM_KEY;
  if (!expected) return false;
  const received = req.headers.get("x-admin-key") ?? "";
  return received === expected;
}
