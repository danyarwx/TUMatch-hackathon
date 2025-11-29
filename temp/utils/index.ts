export function createPageUrl(pageName: string): string {
  // In a real app, this would create proper routes
  // For now, return a hash-based routing or pathname
  return `/${pageName.toLowerCase()}`;
}
