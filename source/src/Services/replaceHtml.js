const replaceHtml = (val) => {
  if (!val || !val.trim()) return;
  return val
    .replaceAll("[/u]", "</u>")
    .replaceAll("[u]", "<u>")
    .replaceAll("[/img]", "</img>")
    .replaceAll("[img]", "<img>")
    .replaceAll("[b]", "<b>")
    .replaceAll("[/b]", "</b>")
    .replaceAll("[i]", "<i>")
    .replaceAll("[/i]", "</i>")
    .replace(/<img>(.*?)<\/img>/g, function (match, g1) {
      return `<br/><img src=${g1} />`;
    });
};

export default replaceHtml;
