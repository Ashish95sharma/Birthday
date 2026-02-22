import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRef, useState } from "react";
import "./App.css";
import CelebrationPage from "./components/CelebrationPage";
import Countdown from "./components/Countdown";
import Effects from "./components/Effects";
import Gallery from "./components/Gallery";
import Hearts from "./components/Hearts";
import MessageCard from "./components/MessageCard";
import MusicPlayer from "./components/MusicPlayer";

gsap.registerPlugin(ScrollToPlugin);

const VALID_PASSWORD = "2024ec1068"; // also accepts 2024EC1068 (case-insensitive)

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [currentPage, setCurrentPage] = useState(1); // Start at 1 for Countdown page

  // ⚠️ FOR TESTING: Comment out lines 18-21 to reset on every reload
  // Check localStorage to persist birthday reached state
  const [birthdayReached, setBirthdayReached] = useState(() => {
    const saved = localStorage.getItem("birthdayReached");
    return saved === "true";
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const value = passwordInput.trim();
    if (value.toLowerCase() === VALID_PASSWORD.toLowerCase()) {
      setPasswordError("");
      setUnlocked(true);
    } else {
      setPasswordError("Wrong password. Try again.");
    }
  };

  // ✅ FOR TESTING: Uncomment this line to always show countdown on reload
  // const [birthdayReached, setBirthdayReached] = useState(false);

  const [showEffects, setShowEffects] = useState(false);

  const page1Ref = useRef(null); // Countdown page
  const page2Ref = useRef(null); // Celebration Page
  const page3Ref = useRef(null); // MessageCard
  const page4Ref = useRef(null); // Gallery
  const musicPlayerRef = useRef(null); // Music player control

  const goToPage = (pageNumber) => {
    const refs = { 1: page1Ref, 2: page2Ref, 3: page3Ref, 4: page4Ref };
    const currentPageRef = refs[currentPage];
    const nextPageRef = refs[pageNumber];

    const isForward = pageNumber > currentPage;

    // Animate out current page with a subtle 3D tilt
    gsap.to(currentPageRef.current, {
      x: isForward ? "-100%" : "100%",
      opacity: 0,
      rotateY: isForward ? -25 : 25,
      transformOrigin: "50% 50%",
      duration: 0.6,
      ease: "power2.inOut",
    });

    // Prepare next page entering from the opposite side with depth
    gsap.set(nextPageRef.current, {
      x: isForward ? "100%" : "-100%",
      opacity: 0,
      rotateY: isForward ? 25 : -25,
      visibility: "visible",
    });

    // Animate in next page, gently straightening it
    gsap.to(nextPageRef.current, {
      x: "0%",
      opacity: 1,
      rotateY: 0,
      duration: 0.6,
      ease: "power2.inOut",
      delay: 0.2,
      onComplete: () => {
        setCurrentPage(pageNumber);
        // Reset current page position
        gsap.set(currentPageRef.current, { x: "0%", visibility: "hidden" });

        // Smooth scroll to top
        gsap.to(window, { duration: 0.3, scrollTo: { y: 0 } });
      },
    });
  };

  const handleBirthdayReached = () => {
    setBirthdayReached(true);
    localStorage.setItem("birthdayReached", "true"); // Persist to localStorage
    setShowEffects(true);
    // Stop effects after some time
    setTimeout(() => setShowEffects(false), 10000);
  };

  if (!unlocked) {
    return (
      <div className="app password-gate">
        <div className="password-card">
          <h1 className="password-title">🎂 Enter password</h1>
          <p className="password-hint">This surprise is just for you.</p>
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <input
              type="password"
              className="password-input"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError("");
              }}
              autoComplete="current-password"
              aria-label="Password"
            />
            <button type="submit" className="password-btn">
              Unlock
            </button>
          </form>
          {passwordError && <p className="password-error">{passwordError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <MusicPlayer ref={musicPlayerRef} />
      <Hearts />

      {/* PAGE 1: Countdown Timer */}
      <div
        ref={page1Ref}
        className={`page ${currentPage === 1 ? "active" : ""}`}
        style={{ visibility: currentPage === 1 ? "visible" : "hidden" }}
      >
        <div className="page-card page-card-countdown">
          <section className="hero">
            <h1 id="heroTitle">
              {birthdayReached ? (
                <>
                  Happy Birthday <span className="highlight">Shruti</span> 🎂
                </>
              ) : (
                <>
                  Counting down to <span className="highlight">[Name]'s</span>{" "}
                  special day 🎂
                </>
              )}
            </h1>
            <p>Your personalized message goes here 💗</p>
          </section>

          <Countdown
            onBirthdayReached={handleBirthdayReached}
            birthdayReached={birthdayReached}
          />

          <section className="teaser">
            <h2 id="teaserHeading">
              {birthdayReached
                ? "💖 Ready for your surprise! 💖"
                : "✨ A special celebration awaits you at midnight... ✨"}
            </h2>
            <p className="teaser-hint">
              Something magical is about to unfold 💫
            </p>
          </section>

          <button
            id="surpriseBtn"
            className="celebrate-btn"
            disabled={!birthdayReached}
            onClick={() => goToPage(2)}
          >
            🎀 Let's Celebrate
          </button>
        </div>
      </div>

      {/* PAGE 2: Celebration/QNA Page */}
      <div
        ref={page2Ref}
        className={`page ${currentPage === 2 ? "active" : ""}`}
        style={{ visibility: currentPage === 2 ? "visible" : "hidden" }}
      >
        <div className="page-card page-card-celebration">
          <CelebrationPage
            onComplete={() => goToPage(3)}
            musicPlayerRef={musicPlayerRef}
          />
        </div>
      </div>

      {/* PAGE 3: Message Card */}
      <div
        ref={page3Ref}
        className={`page ${currentPage === 3 ? "active" : ""}`}
        style={{ visibility: currentPage === 3 ? "visible" : "hidden" }}
      >
        <div className="page-card page-card-message">
          <button className="back-btn" onClick={() => goToPage(2)}>
            ← Back
          </button>
          <MessageCard isActive={currentPage === 3} />
          <button className="page-nav-btn" onClick={() => goToPage(4)}>
            📸 View Our Memories
          </button>
        </div>
      </div>

      {/* PAGE 4: Gallery */}
      <div
        ref={page4Ref}
        className={`page ${currentPage === 4 ? "active" : ""}`}
        style={{ visibility: currentPage === 4 ? "visible" : "hidden" }}
      >
        <div className="page-card page-card-gallery">
          <button className="back-btn" onClick={() => goToPage(3)}>
            ← Back
          </button>
          <Gallery isActive={currentPage === 4} />
          <section className="final">
            <h2 className="final-message">💖  Happy Birthday Shruti 💖</h2>
           
          </section>
        </div>
      </div>

      {/* Effects */}
      {showEffects && <Effects />}
    </div>
  );
}

export default App;
