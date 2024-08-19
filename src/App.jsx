import { useState } from "react";
import "./App.css";

function App() {
  const [userDetails, setUserDetails] = useState(null);

  return (
    <div className="app-container">
      <Form setUserDetails={setUserDetails} />
      {userDetails && (
        <div className="card">
          <Avatar avatarUrl={userDetails.avatar_url} />
          <div className="intro">
            <Intro name={userDetails.name} bio={userDetails.bio} />
          </div>
          <div className="languages">
            <Languages reposUrl={userDetails.repos_url} />
          </div>
        </div>
      )}
    </div>
  );
}

function Form({ setUserDetails }) {
  const [userId, setUserId] = useState("");

  async function getUserDetails(e) {
    e.preventDefault();

    try {
      const res = await fetch(`https://api.github.com/users/${userId}`, {
        headers: {
          Authorization: `token ${import.meta.env.VITE_PAT}`,
        },
      });
      const data = await res.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <form className="form" onSubmit={getUserDetails}>
      <input
        type="text"
        placeholder="Enter your GitHub userId"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button className="form-btn" type="submit">
        Get Profile Card
      </button>
    </form>
  );
}

function Avatar({ avatarUrl }) {
  return <img src={avatarUrl} alt="User Avatar" className="avatar" />;
}

function Intro({ name, bio }) {
  return (
    <div className="intro-text">
      <h2>{name}</h2>
      <p>{bio}</p>
    </div>
  );
}

function Languages({ reposUrl }) {
  const [languages, setLanguages] = useState([]);

  async function fetchLanguages() {
    try {
      const reposRes = await fetch(reposUrl, {
        headers: {
          Authorization: `token ${import.meta.env.VITE_PAT}`,
        },
      });
      const repos = await reposRes.json();

      const languagePromises = repos.map((repo) =>
        fetch(repo.languages_url, {
          headers: {
            Authorization: `token ${import.meta.env.VITE_PAT}`,
          },
        }).then((res) => res.json())
      );

      const languagesData = await Promise.all(languagePromises);

      const languageSet = new Set();
      languagesData.forEach((langData) => {
        Object.keys(langData).forEach((lang) => languageSet.add(lang));
      });

      setLanguages(Array.from(languageSet));
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  }

  if (reposUrl && languages.length === 0) {
    fetchLanguages();
  }

  return (
    <div className="language-boxes">
      {languages.map((lang, index) => (
        <div
          key={index}
          className="language-box"
          style={{ backgroundColor: getRandomColor() }}
        >
          {lang}
        </div>
      ))}
    </div>
  );
}

// Utility function to generate random colors
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default App;
