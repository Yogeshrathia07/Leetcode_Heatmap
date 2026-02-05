const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Fetch complete profile + calendar
app.get("/leetcode/:username", async (req, res) => {
  const username = req.params.username;

  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          userAvatar
          ranking
          reputation
          starRating
          aboutMe
          school
          countryName
          company
          skillTags
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        badges {
          id
          displayName
          icon
        }
        userCalendar {
          submissionCalendar
          totalActiveDays
          streak
        }
      }
    }
  `;

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://leetcode.com",
        "Referer": "https://leetcode.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    const data = await response.json();

    if (!data.data || !data.data.matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = data.data.matchedUser;

    res.json({
      username: user.username,
      profile: user.profile,
      badges: user.badges,
      submitStats: user.submitStats,
      calendar: {
        submissionCalendar: JSON.parse(user.userCalendar.submissionCalendar),
        totalActiveDays: user.userCalendar.totalActiveDays,
        streak: user.userCalendar.streak
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
