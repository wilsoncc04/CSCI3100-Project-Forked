const getTimesAgo = (dateString) => {
  if (!dateString) return "";
  const postedDate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - postedDate);
  const diffhours = Math.floor(diffTime / (1000 * 60 * 60));

  if (diffhours < 24)
    if (diffhours === 0) return "Just now";
    else return `${diffhours}h ago`;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  if (diffMonths > 0) return `${diffMonths}m ago`;

  return diffDays === 0 ? "Today" : `${diffDays}d ago`;
};

export default getTimesAgo;
