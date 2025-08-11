import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import React  from "react";


function App() {

// const [ad, setAd] = React.useState(null);
// React.useEffect(()=>{
// fetch("http://127.0.0.1:5000/api/ads") // Change to your backend URL
//       .then((res) => res.json())
//       .then((data) => setAd(data))
//       .catch((err) => console.error("Error fetching ad:", err));
      
// },[]);


  const [showDetails, setShowDetails] = React.useState(false);
  const [videoData, setVideoData] = React.useState({
    title: "",
    duration: "",
    thumbnail: "",
    audio: { url: "", size: "" },
    video: [], // array of { resolution, url, size }
  });

  const [url, setUrl] = React.useState("");

  // Fetch video metadata from backend
  const handleDownloadClick = async () => {
    if (!url.trim()) {
      alert("Please paste a link first!");
      return;
    }

    if (showDetails) {
      setShowDetails(false);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/video-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Failed to fetch video info");

      const data = await res.json();

      setVideoData({
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail,
        audio: data.audio || { url: "", size: "" },
        video: data.video || [],
      });

      setShowDetails(true);
    } catch (err) {
      alert(err.message);
    }
  };

  // Download audio by calling backend download endpoint
  const handleAudioDownload = async () => {
    if (!url.trim()) {
      alert("Please paste a link first!");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/download/audio?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Failed to get audio URL");

      const { audio_url } = await res.json();

      handleDirectDownload(audio_url, "audio.mp3");
    } catch (err) {
      alert(err.message);
    }
  };

  // Download video by resolution
  const handleVideoDownload = async (resolution) => {
    if (!url.trim()) {
      alert("Please paste a link first!");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/download/video?url=${encodeURIComponent(url)}&res=${resolution}`
      );
      if (!res.ok) throw new Error("Failed to get video URL");

      const { video_url } = await res.json();

      handleDirectDownload(video_url, `${resolution}p-video.mp4`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Existing direct download helper
  const handleDirectDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", fileName || "file");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg  shadow-sm px-4 position-fixed z-1 w-100">
        <a className="navbar-brand fw-bold text-primary " href="#">
          <span id="save">Save</span>
          <span id="reelz">Reelz</span>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-center  items" id="navbarNav">
          <ul className="navbar-nav gap-lg-5">
            <li className="nav-item">
              <a className="nav-link text-dark" href="youtubedown">
                Youtube Downloader
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                Youtube To Mp3
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="you">
                Youtube To Mp4
              </a>
            </li>
          </ul>
          <form className="d-flex ms-md-auto my-2 my-lg-0 " role="search" style={{ maxWidth: "300px", width: "100%" }}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
              style={{ minWidth: "0" }}
            />
            <button className="btn btn-outline-success" type="submit">
              <i className="fas fa-search" style={{ color: "black" }}></i>
            </button>
          </form>
        </div>
      </nav>

      {/* Card at bottom for dsektop */}
      <section
        className="hero-section d-flex flex-column align-items-center justify-content-end text-center"
        style={{
          background: "linear-gradient(to bottom right, #2b516eff, #b8c6d1)",
          minHeight: "80vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h1 id="texty">SaveReelz</h1>

        {/* Your Existing Box */}
        <div className="custom-box mx-auto my-0 p-4" id="cus-box">
          <div className="tab-top">
            <button className="btn btn-1 text-white pt-3 fs-4">Video</button>
          </div>

          <div className="input-group my-4">
            <input
              type="url"
              className="form-control rounded-pill ps-4"
              id="input-link"
              placeholder="Paste link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              className="btn btn-info px-4 rounded-pill text-white ms-2 d-flex align-items-center"
              id="input-button"
              onClick={handleDownloadClick}
            >
              Download <i className="fa-solid fa-download ms-2"></i>
            </button>
          </div>

          <p className="text-light small text-center mb-4">
            Copyrighted content is not available for download with this tool !
          </p>

          <div className="tab-bottom">Downloader</div>

          {/* Details Section */}
          <div className={` video-details-container  mt-4  ${showDetails ? "open" : "d-none"}`}>
            <div
              className="card shadow p-3"
              style={{ background: "linear-gradient(to bottom right, #41616cff, #d7d8eeff)" }}
            >
              {/* Thumbnail + Info */}
              <div className="row align-items-center">
                <div className="col-md-4">
                  <img src={videoData.thumbnail} alt="Video Thumbnail" className="img-fluid rounded" />
                </div>
                <div className="col-md-8 text-start">
                  {/*For title video data get title (api-work)*/}
                  <h5 className="fw-bold">
                    Video Title:{" "}
                    <span
                      className="badge text-truncate text-dark text-start"
                      style={{
                        maxWidth: "100%",
                        whiteSpace: "normal",
                        lineHeight: "20px",
                        background: "linear-gradient(to bottom right, #6ecedfff, #d7d8eeff)",
                        marginTop: "10px",
                      }}
                    >
                      {videoData.title}
                    </span>
                  </h5>
                  {/*For duration video data get duration  (api-work)*/}
                  <p className="text-muted">Duration: {videoData.duration}</p>
                </div>
              </div>

              {/* Audio */}
              <h6 className="mt-3 text-start">
                {/* Ad Row */}
                   <div className="ads-section mt-2 mb-2 p-3 text-center text-md-start border rounded d-flex flex-column flex-md-row align-items-center gap-3" style={{background: "linear-gradient(to bottom right, rgba(142, 175, 135, 0.59), #d7d8eeff)"}}>
                  {/* Image */}
                  <img
                    src="ifly.png"
                    alt="Ad Banner"
                    className="img-fluid rounded"
                    style={{ maxWidth: "120px", height: "auto" }}
                  />

                  {/* Text Content */}
                  <div style={{ flex: 1 }}>
                    <h3 className="mb-1 text-primary">iFLyDown Video Downloader</h3>
                    <p style={{ fontSize: "13px", marginBottom: "8px" }}>
                      Download Youtube Video & Live & Playlist & Channel in 1080p, 2K, 4K, 8K. High quality, 30x Fast
                      Download, Supports 1000+ Sites.
                    </p>
                    <button className="btn btn-success btn-sm">
                      <i className="fas fa-download me-1"></i> Install Now
                    </button>
                  </div>
                </div>



                <i className="fas fa-music me-2 mt-3"></i>Audio:
              </h6>

              {/* Audio Row */}

              <div className="border rounded p-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span>MP3</span>
                  <span>{videoData.audio.size || "N/A"}</span>
                  <button className="btn btn-primary btn-sm" onClick={handleDirectDownload}>
                    Download <i className="fas fa-download ms-1"></i>
                  </button>
                </div>
              </div>

              {/* Video Resolutions */}
              <h6 className="mt-3 text-start">
                <i className="fas fa-video me-2"></i>Video:
              </h6>
              {videoData.video.length === 0 && <p>No video formats available</p>}
              {videoData.video.map(({ resolution, size }) => (
                <div
                  key={resolution}
                  className="d-flex justify-content-between align-items-center border rounded p-2 mt-2"
                >
                  <span>{resolution}</span>
                  <span>{size}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleVideoDownload(resolution)}>
                    Download <i className="fas fa-download ms-1"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-dark text-white text-center py-5 px-4 mt-5 mobile-res">
        <div className="background-div mx-auto"></div>
        <img src="earth image.png" alt="Earth" className="rounded-circle mb-4" />
        <h3 className="mb-3 mx-auto">YOUTUBE IS THE BIGGEST VIDEO SHARING PLATFORM</h3>
        <p className="text text-center mt-4 marg-text" style={{ maxWidth: "900px", margin: "0 auto" }}>
          YouTube is the biggest YouTube video sharing platform in the world, and provide an excellent experience for
          user to upload, view, and share videos. What it can’t provide is a YouTube video download. That is why
          SaveReelz is here to help you out! With our YouTube video downloader, you can search for and download videos,
          Shorts, and music tracks directly from YouTube – all for free! Choose from resolutions up to 4K or convert
          videos to audio formats with a single click, ensuring seamless saving and sharing .Ready to try? Paste your
          video link and start downloading instantly!
        </p>
      </section>
      {/* Search */}

      <div className="container-fluid fs-1 px-3 py-4 d-flex flex-wrap">
        <i class="fa-regular fa-circle-right me-3 pt-3"></i>
        <p style={{ paddingTop: "5px" }}>Who we serve</p>
      </div>
      {/* Group cards*/}
      <div className="container text-start pe-lg-0 me-lg-5 card-con">
        <div className="row justify-content-center align-items-start mx-auto ms-lg-4">
          {[
            {
              img: "img 1.png",
              title: "Versatility in Format",
              text: "Download YouTube videos to MP3, MP4, WEBM, and audio-less video files, catering to diverse needs such as music production, offline viewing, and professional editing.",
            },
            {
              img: "img 2.png",
              title: "No Sign-up Required",
              text: "Download YouTube videos, Shorts, and music tracks in high quality, including full HD, 1080p, 4k and even 8k.",
            },
            {
              img: "img 3.png",
              title: "High Quality Options",
              text: "Enjoy unlimited YouTube video and Shorts downloads without spending a dime. SaveReelz is committed to providing a safe and cost-free service for all users.",
            },
            {
              img: "img 4.png",
              title: "Absolutely Free",
              text: "SaveReelz offers a fast YouTube video downloading experience. Tasks are completed within seconds, providing you with high-speed downloads.",
            },
            {
              img: "img 5.png",
              title: "Fast Downloads",
              text: "SaveReelz offers a fast YouTube video downloading experience. Tasks are completed within seconds, providing you with high-speed downloads.",
            },
            {
              img: "img 6.png",
              title: "Platform Compatibility",
              text: "Download YouTube videos instantly across Mac, Android, and Windows devices through any web browser with no client installation required.",
            },
          ].map((card, index) => (
            <div className="col-12 col-md-4 col-md-4 mb-4 d-flex justify-content-center" key={index}>
              <div
                className="card h-100 flex-column text-start p-2 rounded-4 me-md-5 me-0"
                style={{ maxWidth: "23rem" }}
              >
                <img
                  src={card.img}
                  className="card-img-top"
                  alt={card.title}
                  style={{ height: "272px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h4 className="card-title">{card.title}</h4>
                  <p className="card-text">{card.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Next section*/}
      <div
        class="container-fluid"
        style={{
          background: "linear-gradient(to bottom right, #c0cacb78, #94c0c7e5,#10324F)",
          minHeight: "400px",
          maxWidth: "1440px",
          position: "relative",
          overflow: "hidden",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        <div
          class="container-fluid d-flex justify-content-center"
          style={{
            position: "relative",
            top: "4rem",
          }}
        >
          <img src="full final.png" class="img-fluid" alt="..."></img>
        </div>
        <div className="container-fluid pb-5">
          <div
            className="gradient-border-box position-relative mx-auto text-dark text-center d-flex align-items-center justify-content-center p-4"
            style={{
              bottom: "5rem",
              marginTop: "17rem",
              maxWidth: "911px",
              height: "160px",
              borderRadius: "28px",
              background: "linear-gradient(to bottom right, #9fb7bbff, #d6e6e7e5,#10324F)",
              zIndex: 1,
            }}
          >
            Our YouTube downloader is easy to use! Easily download YouTube videos, Shorts, and music. Just visit our
            website - SaveReelz.com on your device and start enjoying free content now!
          </div>
        </div>
      </div>

      {/*via save reelz text */}
      <div 
        class="conatiner-fluid"
        id="you"
        style={{
          paddingTop: "150px",
          paddingLeft: "10px",
          background: "linear-gradient(to bottom right, #ffffffff, #eceff0e5,#d6e6e7e5)",
        }}
      >
        <div class="text d-flex">
          <i class="fa-solid fa-download fs-1 pe-2 pt-1"></i>
          <h1>How to download YouTube videos online via SaveReelz</h1>
        </div>

        <div class="container-fluid  text-center pt-5 ps-lg-5">
          <div class="row ps-lg-4 pt-5 pe-2">
            <div class="col-12 col-md-6">
              <div
                class="card rounded-4 p-1 border-3"
                style={{
                  background: "linear-gradient(to bottom right, #ffffff78, #eaf0f0e5,#ffffffff)",
                }}
              >
                <div class="card-body d-flex">
                  <div
                    class="number-1 bg-primary me-2"
                    style={{
                      height: "30px",
                      width: "30px",
                      borderRadius: "6px",
                    }}
                  >
                    1
                  </div>
                  Copy the youtube link of the video and paste it into the input line.
                </div>
              </div>
              <br></br>
              <br></br>
              <div
                class="card rounded-4 p-2 border-3"
                style={{
                  background: "linear-gradient(to bottom right, #ffffff78, #eaf0f0e5,#ffffffff)",
                }}
              >
                <div class="card-body d-flex">
                  <div
                    class="number-2 bg-primary me-2"
                    style={{
                      height: "30px",
                      width: "30px",
                      borderRadius: "6px",
                    }}
                  >
                    2
                  </div>
                  Click "Download" and wait for the video to be ready.
                </div>
              </div>
              <br></br>
              <br></br>
              <div
                class="card rounded-4 p-2 border-3"
                style={{
                  background: "linear-gradient(to bottom right, #ffffff78, #eaf0f0e5,#ffffffff)",
                }}
              >
                <div class="card-body d-flex">
                  <div
                    class="number-3 bg-primary me-2"
                    style={{
                      height: "30px",
                      width: "30px",
                      borderRadius: "6px",
                    }}
                  >
                    3
                  </div>
                  Select the desired download options and click "Download".
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 mt-5">
              <img src="my pix.png" class="img-fluid h-50" alt="..."></img>
            </div>
          </div>
        </div>
        {/*Part 2 save reelz*/}
        <div class="text d-flex" id="part-2">
          <i class="fa-solid fa-download fs-1 pe-2 pt-1"></i>
          <h1 id="head">How to Use SaveReelz downloader Short Domain?</h1>
        </div>
        {/*seprate*/}
        <div className="container text-start pe-lg-0 me-lg-5 card-con">
          <div className="row justify-content-center align-items-start mx-auto ms-lg-4">
            {[
              {
                title: "1: Open Youtube URL",
                text: "Open the target video in YouTube that you want to download.",
              },
              {
                title: "2: Before the video URL",
                text: "Add rip before the video URL to start the downloading process.",
              },
              {
                title: "3: Open Youtube URL",
                text: "Open the target video in YouTube that you want to download.",
              },
            ].map((card, index) => (
              <div className="col-12 col-md-4 mb-4 d-flex justify-content-center mt-5" key={index}>
                <div
                  className="card h-100 flex-column text-start p-3 rounded-4 mt-5 me-md-5 me-0"
                  style={{ maxWidth: "23rem" }}
                >
                  <div className="card-body" style={{ borderColor: "grey", height: "15rem" }}>
                    <h4
                      className="card-title p-2 rounded-4"
                      style={{
                        border: "3px",
                        background: "linear-gradient(to bottom right, #ffffff78, #d3dad9ff,#ffffffff)",
                        marginBottom: "2rem",
                      }}
                    >
                      {card.title}
                    </h4>
                    <p className="card-text fs-5">{card.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*footer style*/}
        <div
          class="conatiner-fluid footer-style d-block d-md-block "
          style={{
            height: "35rem",
            borderTopRightRadius: "100%",
            borderBottomRightRadius: "10%",
            marginTop: "20rem",
            borderTopLeftRadius: "30px",
            background: "#10324F",
          }}
        >
          <div class="text ms-3 pt-2 fs-1 pt-sm-4">
            <span id="save">Save</span>
            <span id="reelz">Reelz</span>
          </div>
          <h1 id="texty" style={{ margin: "0", marginLeft: "20px" }}>
            Save
          </h1>
          {/*card*/}
          <div
            class="card"
            style={{
              width: "540px",
              height: "550px",
              left: "40rem",
              bottom: "30rem",
            }}
          >
            <div class="card-body">
              <h5 class="card-title text-center fs-1 text-primary">Quicks Links</h5>
              {/*card-links*/}
              <div class="container text-center">
                <div class="row" style={{ marginTop: "5rem" }}>
                  <div class="col-6 quick-links">
                    <i class="fa-solid fa-link text-primary"></i>
                    <a href="#" class="quick-links" style={{ paddingRight: "70px" }}>
                      Home
                    </a>
                  </div>
                  <div class="col-6 quick-links">
                    <i class="fa-solid fa-link text-primary"></i>
                    <a href="#" class="quick-links">
                      Terms of Use
                    </a>
                  </div>

                  <div class="col-6 quick-links">
                    <i class="fa-solid fa-link text-primary"></i>
                    <a href="#" class="quick-links">
                      Youtube To Mp3
                    </a>
                  </div>
                  <div class="col-6 quick-links">
                    <i class="fa-solid fa-link text-primary"></i>
                    <a href="#" class="quick-links" style={{ paddingRight: "20px" }}>
                      Copyright
                    </a>
                  </div>

                  <div class="col-6 quick-links">
                    <i class="fa-solid fa-link text-primary"></i>
                    <a href="#" class="quick-links">
                      Youtube To Mp4
                    </a>
                  </div>
                  <div class="col-6 quick-links">
                    <i class="fa-solid fa-link text-primary"></i>
                    <a href="#" class="quick-links">
                      Privacy Policy
                    </a>
                  </div>
                </div>
                {/*Input*/}
                <div
                  className="d-flex align-items-center mx-auto px-2"
                  style={{
                    width: "300px",
                    height: "50px",
                    background: "#d3dcdfff", // you can change background color
                    borderRadius: "8px",
                  }}
                >
                  <input
                    type="email"
                    placeholder="Type your email"
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      height: "100%",
                      paddingLeft: "10px",
                      fontSize: "1rem",
                      background: "#d3dcdfff",
                    }}
                  />
                  <button class="btn " style={{ borderRadius: "20px", backgroundColor: "#ebeff3ff" }}>
                    <i className="fa-regular fa-message fs-4"></i>Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*final footer finishing */}
        <div class="container text-center mt-5 pb-5">
          <div class="row">
            <div class="col-12 col-md-6">
              <i className="fa-regular fa-copyright ms-2" aria-hidden="true" style={{ fontSize: "1rem" }}></i>
              2020 Lift Media. All rights reserved.
            </div>
            <div class="col-12 col-md-6 mt-4 mt-md-0">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark"
                aria-label="Facebook"
              >
                {" "}
                <i className="fab fa-facebook-f fa-lg me-3"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram fa-lg me-3"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter fa-lg"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
