exports.hasChanged = (submittedValue, existingValue) => {
  if (!existingValue && submittedValue) return true;
  return submittedValue?.trim() !== existingValue?.trim();
};
