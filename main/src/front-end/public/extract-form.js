function extractForm(form) {
  const formData = new FormData(form);
  const formAsJson = {};
  for (let [key, value] of formData) {
    console.log(value);
    if (value === "") {
      value = null;
    }
    value = getNumberIfPossible(value);

    const isArray = Array.isArray(formAsJson[key]);
    if (formAsJson[key] && isArray) {
      formAsJson[key].push(value);
    } else if (formAsJson[key]) {
      formAsJson[key] = [formAsJson[key], value];
    } else {
      formAsJson[key] = value;
    }
  }

  return formAsJson;
}

function getNumberIfPossible(value) {
  if (isNaN(value) || value === null) {
    //ah javascript
    return value;
  } else {
    return +value;
  }
}
