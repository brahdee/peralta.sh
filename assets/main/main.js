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
  function updateSong() {
    $.getJSON("/spotify/current", function (data) {
      const song = data.song;

      if (!song) {
        $("#spotify").removeClass("visible");
        $("body").css("--album-color", "");

        return;
      }

      const artwork = $("#album-art");

      if ($("#song").attr("href") !== song.url) {
        $("#spotify").removeClass("visible");

        setTimeout(function () {
          $("#song").text(song.name).attr("href", song.url);
          $("#album-art").attr("src", song.image);
          $("body").css("--album-color", song.color);
          $("#spotify").css("--album-color", song.color);

          $("#spotify").addClass("visible");
        }, 300);
      } else {
        $("#spotify").addClass("visible");
        $("#spotify").css("--album-color", song.color);
        $("body").css("--album-color", song.color);
      }
    });
  }

  updateSong();
  setInterval(updateSong, 10000);
});
