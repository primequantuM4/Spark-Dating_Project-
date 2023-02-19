class userCard {
  constructor({ id, firstName, lastName, age, religion, bio, imageUrl }) {
    this.html = `<div class="user-card">
        <div class="user-card__title">${firstName} ${lastName}</div>
        <div class="user-card__img"><img src="${imageUrl}" alt=""></div>
        <div class="user-card__location">Age ${age}</div>
        <div class="user-card__religion">Religion: ${religion}</div>
        <div class="user-card__hobbys">Bio: ${bio}</div>
        <div>
            <button id="likeButton">&#10084;</button>
            <button id="hateButton">&#10005;</button>
            </div>
            </div>`;
  }
}

const userContainer = document.querySelector("#userContainer");
let current = 0;
let users = [];

updateDisplay();

async function handleLike() {
  const { id } = users[current];
  current += 1;
  const result = await fetch("/api/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id }),
  });
  const data = await result.json();
  console.log(data);

  updateDisplay();
}

async function handleHate() {
  const { id } = users[current];
  current += 1;
  const result = await fetch("/api/dislikes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id }),
  });
  const data = await result.json();
  console.log(data);

  updateDisplay();
}

async function updateDisplay() {
  if (current === users.length) {
    await setNewSuggestions();
    if (users.length === 0) {
      userContainer.innerHTML = "<p>Its like a desert in here...</p>";
      return;
    }
  }
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
