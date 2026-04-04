function getTaxYears() {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    const end = currentYear - i;
    const start = end - 1;
    years.push(`${start}-${end}`);
  }
  return years;
}
function getCurrentTaxYear() {
  return getTaxYears()[0];
}
export {
  getCurrentTaxYear as a,
  getTaxYears as g
};
