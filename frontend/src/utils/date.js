const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateTimeFormatter.format(date);
};

export const formatDueDateLabel = (value) => {
  const formatted = formatDate(value);
  return formatted ? `До ${formatted}` : "";
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
};

export const calcProgress = (issueDate, dueDate) => {
  if (!issueDate || !dueDate) return 0;
  const start = new Date(issueDate).getTime();
  const end = new Date(dueDate).getTime();
  const now = Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  const percent = ((now - start) / (end - start)) * 100;
  return Math.min(Math.max(Math.round(percent), 0), 100);
};

export const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};
