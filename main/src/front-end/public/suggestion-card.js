class userCard {
  constructor({ id, firstName, lastName, age, religion, bio, photoUrl }) {
    this.html = `<div class="card d-flex flex-column p-3 justify-content-between align-items-center rounded-5">
        <img class="card-img-top m-0" src="${photoUrl}" alt="" width=260 height=200>
        <div class="title mb-0 mt-5 py-0">${firstName} ${lastName}</div>
        <hr class="m-0 w-100">
        <div class="user-card__location my-2 mt-3">Age ${age}</div>
        <div class="user-card__religion my-2">Religion: ${religion}</div>
        <div class="user-card__hobbys my-2">Bio: ${bio}</div>
        <div class="align-self-start w-100 mt-3 d-flex flex-row buttonse">
            <button class="btn w-50 m-1" id="likeButton">&#10084;</button>
            <button class="btn w-50 m-1" id="hateButton">&#10005;</button>
            </div>
            </div>`;
  }
}

const userContainer = document.querySelector("#userContainer");
let current = 0;
let users = [];

updateDisplay();

async function handleLike() {
  userContainer.innerHTML = "<p>Loading...</p>";

  const { id } = users[current];
  current += 1;
  const result = await fetch("/api/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id }),
  });
  const data = await result.json();
  updateDisplay();
  console.log(data);
}

async function handleHate() {
  userContainer.innerHTML = "<p>Loading...</p>";

  const { id } = users[current];
  current += 1;
  const result = await fetch("/api/dislikes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id }),
  });
  const data = await result.json();
  updateDisplay();
  console.log(data);
}

async function updateDisplay() {
  if (current === users.length) {
    userContainer.innerHTML = "<p>Loading...</p>";
    await setNewSuggestions();
    if (users.length === 0) {
      userContainer.innerHTML = "<p>Its like a desert in here...</p>";
      return;
    }
  }
  userContainer.innerHTML = "<p>Loading...</p>";
  const user = new userCard(users[current]);
  userContainer.innerHTML = user.html;
  userContainer
    .querySelector("#likeButton")
    .addEventListener("click", handleLike);
  userContainer
    .querySelector("#hateButton")
    .addEventListener("click", handleHate);
}

async function setNewSuggestions() {
  const result = await fetch("/api/suggestions");
  console.log("searching for suggestions");
  if (!result.ok) {
    console.log(result);
    if (result.status === 401) {
      alert("please login");
    }
  }
  const suggestedUsers = await result.json();
  console.log(suggestedUsers);
  users = suggestedUsers;
  current = 0;
}
