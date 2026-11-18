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
    $.getJSON("/spotify/current")
      .done(function (data) {
        const song = data.song;

        if (!song) {
          $("#spotify").removeClass("visible");
          $("body").css("--album-color", "rgb(43, 43, 44)");
          $("#main").css("--album-color", "rgb(43, 43, 44)");
          return;
        }

        if ($("#song").attr("href") !== song.url) {
          $("#spotify").removeClass("visible");
          $("body").css("--album-color", song.color);
          $("#main").css("--album-color", song.color);

          setTimeout(function () {
            $("#spotify").css("--album-color", song.color);

            $("#song").text(song.name).attr("href", song.url);
            $("#album-art").attr("src", song.image);
            $("#artist").text(song.artist);

            $("#spotify").addClass("visible");
          }, 400);
        } else {
          $("#spotify").addClass("visible");
          $("#spotify").css("--album-color", song.color);
          $("body").css("--album-color", song.color);
          $("#main").css("--album-color", song.color);
        }
      })
      .always(function () {
        setTimeout(updateSong, 1000);
      });
  }

  updateSong();
});
