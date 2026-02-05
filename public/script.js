async function fetchUserData() {
  const username = document.getElementById("username").value.trim();
  const status = document.getElementById("status");

  if (!username) {
    status.innerText = "Enter username!";
    return;
  }

  status.innerText = "Loading...";

  try {
    const res = await fetch(`http://localhost:3000/leetcode/${username}`);
    const data = await res.json();

    if (data.error) {
      status.innerText = "User not found!";
      return;
    }

    status.innerText = "Loaded!";

    showStats(data.submitStats);
    showBadges(data.badges);
    generateHeatmap(data.calendar);

  } catch (e) {
    status.innerText = "Backend not running!";
  }
}

function showStats(stats) {
  const easy = stats.acSubmissionNum.find(s => s.difficulty === "Easy");
  const med = stats.acSubmissionNum.find(s => s.difficulty === "Medium");
  const hard = stats.acSubmissionNum.find(s => s.difficulty === "Hard");

  document.getElementById("easy").innerText = easy.count;
  document.getElementById("medium").innerText = med.count;
  document.getElementById("hard").innerText = hard.count;

  const total = easy.count + med.count + hard.count;
  document.getElementById("totalSolved").innerText = total;

  new Chart(document.getElementById("progressChart"), {
    type: "doughnut",
    data: {
      labels: ["Easy", "Medium", "Hard"],
      datasets: [{
        data: [easy.count, med.count, hard.count],
        backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"]
      }]
    }
  });
}

function showBadges(badges) {
  const div = document.getElementById("badgeSection");

  div.innerHTML = "";

  badges.forEach(b => {
    div.innerHTML += `<div class="badge">${b.displayName}</div>`;
  });

  if (badges.length)
    document.getElementById("recentBadge").innerText =
      "Most Recent: " + badges[0].displayName;
}

function getLevel(c) {
  if (c === 0) return 0;
  if (c <= 2) return 1;
  if (c <= 5) return 2;
  if (c <= 10) return 3;
  return 4;
}

function generateHeatmap(calendar) {

  const heatmap = document.getElementById("heatmap");
  const monthLabels = document.getElementById("monthLabels");

  heatmap.innerHTML = "";
  monthLabels.innerHTML = "";

  const data = calendar.submissionCalendar;

  document.getElementById("activeDaysText").innerText =
    calendar.totalActiveDays;

  document.getElementById("streakText").innerText =
    calendar.streak;

  const total = Object.values(data).reduce((a,b) => a + b, 0);

  document.getElementById("submissionText").innerText =
    `${total} submissions in the past one year`;

  let now = new Date();

  // Use UTC dates only
  let endUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  let startUTC = new Date(endUTC);
  startUTC.setUTCDate(endUTC.getUTCDate() - 364);

  // Align to Sunday (like LeetCode)
  let alignedStart = new Date(startUTC);
  alignedStart.setUTCDate(
    startUTC.getUTCDate() - startUTC.getUTCDay()
  );

  let months = {};

  const totalDays = 371;   // 53 weeks

  for (let i = 0; i < totalDays; i++) {

    let date = new Date(alignedStart);
    date.setUTCDate(alignedStart.getUTCDate() + i);

    // EXACT UTC MIDNIGHT timestamp
    let timestamp = Math.floor(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      ) / 1000
    );

    let count = data[timestamp] || 0;

    let div = document.createElement("div");
    div.className = "day";

    let level = getLevel(count);
    if (level) div.classList.add("level-" + level);

    div.title = `${date.toDateString()} : ${count}`;

    heatmap.appendChild(div);

    // Month labels
    let month = date.toLocaleString("default", { month: "short" });

    let week = Math.floor(i / 7);

    if (!months[month]) {
      months[month] = week;
    }
  }

  // Render month labels
  for (let [month, pos] of Object.entries(months)) {
    let m = document.createElement("div");
    m.className = "month";
    m.innerText = month;
    m.style.gridColumnStart = pos + 1;
    monthLabels.appendChild(m);
  }
}
