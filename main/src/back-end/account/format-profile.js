function formatProfile(profile) {
  //convert hobbies="jogging" to ["jogging"]
  const arrayablePropertyNames = ["hobbies", "religiousPreferences"];
  for (const propertyName of arrayablePropertyNames) {
    const value = profile[propertyName];
    if (value && !Array.isArray(value)) {
      profile[propertyName] = [value];
    }
  }

  //change all []s and ""s to null
  for (const propertyName in profile) {
    const value = profile[propertyName];
    const isArray = Array.isArray(value);
    const isEmptyString = value === "";

    if ((isArray && value.length === 0) || isEmptyString) {
      profile[propertyName] = null;
    }
  }

  //convert to numbers if possible
  for (const propertyName in profile) {
    const value = profile[propertyName];
    if (isNaN(value) || value === null) continue;
    profile[propertyName] = +value;
  }
}

module.exports = { formatProfile };
