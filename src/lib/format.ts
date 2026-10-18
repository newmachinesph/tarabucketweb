import { format, formatDistanceToNowStrict } from "date-fns";

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return format(new Date(d), "MMM d, yyyy");
}

export function timeAgo(d: Date | string | null | undefined): string {
  if (!d) return "";
  return formatDistanceToNowStrict(new Date(d), { addSuffix: true });
}
