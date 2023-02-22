async function saveLocationIfPossible(formData, allowLocationCheckBox) {
  console.log("--in save location if possible --");
  let latitude = "";
  let longitude = "";

  if (allowLocationCheckBox.checked) {
    const coordinates = await getLatAndLong();
    latitude = coordinates.latitude + Math.random() * 1000; //will erase random soon
    longitude = coordinates.longitude + Math.random() * 1000; //will erase random soon
  }
  console.log("location", latitude, longitude);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);

  console.log(...formData);
}

async function getLatAndLong() {
  return new Promise((succ, fail) => {
    const extractCoordAndSend = (position) => {
      console.log(position);
      const coordinates = position.coords;
      succ(coordinates);
    };
    navigator.geolocation.getCurrentPosition(extractCoordAndSend, fail);
  });
}
