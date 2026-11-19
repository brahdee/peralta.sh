setInterval(() => {
  $("#clock").text(
    new Date().toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    }),
  );
}, 1000);

$(document).ready(function () {
  const defaultColor = "rgb(43, 43, 44)";

  let lastProgressUpdate = 0;
  let lastPlaying = false;
  let lastSongUrl = "";
  let lastUpdateTime = 0;

  function updateSong() {
    $.getJSON("/spotify/current")
      .done(function (data) {
        const song = data.song;

        // When a song stops playing, reset everything
        if (!song) {
          $("#spotify").removeClass("visible");
          $("body").css("--album-color", defaultColor);

          $("#bar .fill").stop().css({
            transition: "none",
            width: "0%",
          });

          return;
        }

        if ($("#song").attr("href") !== song.url) {
          // Fade current song display out
          $("#spotify").removeClass("visible");

          // Set colors of other dynamic elements
          $("body").css("--album-color", song.color);

          // Set song display to new values and then show div after short delay
          setTimeout(function () {
            $("#spotify").css("--album-color", song.color);
            $("#song").text(song.name).attr("href", song.url);
            $("#album-art").attr("src", song.image);
            $("#artist").text(song.artist);
            $("#spotify").addClass("visible");

            updateProgress(song);
          }, 400);
        } else {
          // If the same song is still playing, edit css either way in case a browser refresh/connection is made
          $("#spotify").addClass("visible");
          $("#spotify").css("--album-color", song.color);
          $("body").css("--album-color", song.color);
          updateProgress(song);
        }
      })
      .always(function () {
        setTimeout(updateSong, 1000);
      });
  }

  function updateProgress(song) {
    const fill = $("#bar .fill");

    if (!song.duration || song.duration <= 0) return;

    const now = Date.now();

    // Estimate where the bar should currently be
    const estimatedProgress =
      lastProgressUpdate + (lastPlaying ? now - lastUpdateTime : 0);

    const drift = Math.abs(song.progress - estimatedProgress);
    const songChanged = song.url !== lastSongUrl;
    const playbackChanged = song.isPlaying !== lastPlaying;

    // Update animation only if:
    // - drift is too much
    // - song changed
    // - song was paused/unpaused

    if (songChanged || playbackChanged || drift > 3000) {
      const progress = Math.min(100, (song.progress / song.duration) * 100);

      fill.css({
        transition: "none",
        width: progress + "%",
      });

      if (song.isPlaying && song.progress < song.duration) {
        const remaining = song.duration - song.progress;

        fill[0].offsetWidth;

        fill.css({
          transition: `width ${remaining}ms linear`,
          width: "100%",
        });
      }
    }

    lastProgressUpdate = song.progress;
    lastPlaying = song.isPlaying;
    lastSongUrl = song.url;

    lastUpdateTime = now;
  }

  updateSong();
});
