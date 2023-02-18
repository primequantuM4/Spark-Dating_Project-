let form;
function get(name, value) {
  let element;
  if (value) {
    element = form.querySelector(`[name="${name}"][value="${value}"]`);
  } else {
    element = form.querySelector(`[name="${name}"]`);
  }

  return element;
}

function fillForm(data, toBeFilledForm) {
  form = toBeFilledForm;
  for (const name in data) {
    const value = data[name];
    if (!value) continue;

    const isArray = Array.isArray(value);
    if (isArray) {
      const innerValues = value;
      for (const innerValue of innerValues) {
        const element = get(name, innerValue);
        element?.setAttribute("checked", "checked");
      }
      continue;
    }
    const isCheckBox = get(name, value) !== null;
    if (isCheckBox) {
      const element = get(name, value);
      element?.setAttribute("checked", "checked");
    } else {
      const element = get(name);
      element?.setAttribute("value", value);
    }
  }
}
