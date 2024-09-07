let currentSong = new Audio();
let currFolder;
let songs;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Convert to integer seconds using Math.floor
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Format minutes and seconds with leading zeros if necessary
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to play a single song and return a promise that resolves when the song ends
function playSong(track, pause = false) {
  currentSong.src = `/${currFolder}/` + track + ".mp3";
  // Play the song
  if (!pause) {
    currentSong.play();
    play.src = "img/pauseButton.svg";
  }

  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

function extractSongName(url) {
  // Get the last part of the URL after the last '/'
  const fileName = url.substring(url.lastIndexOf("/") + 1);
  // Remove the file extension by finding the first '.' and extracting the text before it
  const songName = fileName.split(".")[0].replaceAll("%20", " ");

  return songName;
}
// Path to your songs folder
async function getSongs(folder) {
  currFolder = folder;
  const response = await fetch(`http://127.0.0.1:3000/${currFolder}/`);
  const res = await response.text();

  let div = document.createElement("div");
  div.innerHTML = res;
  let aS = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < aS.length; i++) {
    const element = aS[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }

  let Songs = songs.map(extractSongName);
  playSong(Songs[0], true);

  let songsUl = document
    .querySelector(".song-list")
    .getElementsByTagName("ul")[0];

  songsUl.innerHTML = "";
  for (const song of Songs) {
    songsUl.innerHTML =
      songsUl.innerHTML +
      `<li>
                <img  class="invert" src="img/music.svg" alt="">
                <div class="song-info">
                  <div>${song}</div>
                </div>
                  <div class="playnow">
                     <span>Play Now</span>
                     <img  id="playButton" src="img/playButton.svg" alt="">
                </div>
              </li>`;
  }

  // addEvent listener to playmusic of each song by clicking
  Array.from(
    document.querySelector(".song-list").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playSong(e.querySelector(".song-info").firstElementChild.innerHTML);
    });
  });

  return Songs;
}

async function displayAlbums() {
  const response = await fetch("http://127.0.0.1:3000/Songs/");
  const res = await response.text();
  let div = document.createElement("div");
  div.innerHTML = res;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cards");
  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    if (array[i].href.includes("/Songs/")) {
      let folder = array[i].href.split("/").splice(-2)[0];
      const a = await fetch(`http://127.0.0.1:3000/Songs/${folder}/info.json`);
      const albumInfo = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
            <img src="${albumInfo.imageUrl}" alt="" />
            <div class="greenIcon">
              <img src="img/green.svg" alt="" />
            </div>
            <h3>${albumInfo.heading}</h3>
            <p>${albumInfo.title}</p>
          </div>`;
    }
  }
  // add event listener on playlist to load songs
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let Songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  // array of songs
  let Songs = await getSongs("Songs/ncs");

  //  Display all albums on the page
  displayAlbums();

  // add event listener to play, pause , prev, next button
  let play = document.getElementById("play");

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pauseButton.svg";
    } else {
      currentSong.pause();
      play.src = "img/playButton.svg";
    }
  });

  // addEventListener for time update
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;
    document.querySelector(".seekbar-circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // addeventlistner on seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    // web APIs  = getBoundingClientRect()
    let width = document
      .querySelector(".seekbar")
      .getBoundingClientRect().width;

    document.querySelector(".seekbar-circle").style.left =
      (e.offsetX / width) * 100 + "%";
    currentSong.currentTime = (e.offsetX / width) * currentSong.duration;
  });

  // addEventListener on volume range
  range.addEventListener("change", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  // addEventListener for hamburger
  document.querySelector(".hamBurger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // addEventListener for prev and next button

  next.addEventListener("click", (e) => {
    currentSong.pause();
    let index = Songs.indexOf(
      currentSong.src
        .split("/")
        .slice(-1)[0]
        .replaceAll("%20", " ")
        .replaceAll(".mp3", "")
    );

    if (index + 1 < Songs.length) {
      playSong(Songs[index + 1]);
    }
  });

  // prev
  prev.addEventListener("click", (e) => {
    currentSong.pause();
    let index = Songs.indexOf(
      currentSong.src
        .split("/")
        .slice(-1)[0]
        .replaceAll("%20", " ")
        .replaceAll(".mp3", "")
    );

    if (index - 1 >= 0) {
      playSong(Songs[index - 1]);
    }
  });

  // addEventListener on volume , if clicked shows the mute.svg
 
  console.log(range);

  volume.addEventListener("click", () => {
    if (volume.src.includes("volume.svg")) {
      console.log(volume.src);
     volume.src = volume.src.replace("volume.svg","mute.svg")
      currentSong.volume = 0;
      range.value = 0;
    } else {
      console.log(volume.src);
       volume.src = volume.src.replace("mute.svg", "volume.svg");
       currentSong.volume = 0.10;
       range.value = 10;
    }
  });
}

main();
