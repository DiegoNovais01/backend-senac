export function getPagination(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function formatMeta(page, limit, total) {
  const pages = Math.ceil(total / limit) || 1;
  return { page, limit, total, pages };
}
