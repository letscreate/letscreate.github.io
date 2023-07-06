const Mirum = () => {
  const ANIMATION_DURATION = 2000;

  const messageElements = ".mirum-imessage, .left-speech-bubble, .mirum-typing";
  let numberOfMessages = $(messageElements).length;
  let totalDuration = ANIMATION_DURATION * numberOfMessages;
  let hasSkipped = false;
  let playerLineInterval = null;
  return {
    init: () => {
      addBubblesIframe();
      hideScrollInfo();
      enableScroll();

      //scroll to top
      window.scrollTo(0, 0);

      disableScroll();
      addPlayerLine();
      $(messageElements).addClass(
        "mirum-transition-all mirum-max-height mirum-hide"
      );
      $(".mirum-skip-btn").click(() => {
        hasSkipped = true;
        $(".mirum-input-field").addClass("mirum-hide");
        $(messageElements).removeClass("mirum-hide");
        $(".mirum-typing").addClass("mirum-hide");
        enableScroll();
        onIMessageStoryFinished();
        scrollSmoothlyTo(".skip-target", 0.2);
      });

      $(".btn-what-we-do").click(() => {
        hasSkipped = true;
        $(".btn-what-we-do").addClass("mirum-hide");
        $(".mirum-input-field").addClass("mirum-hide");
        $(messageElements).removeClass("mirum-hide");
        $(".mirum-typing").addClass("mirum-hide");
        enableScroll();
        onIMessageStoryFinished();
        scrollSmoothlyTo(".key-points", 0.1);
      });
    },
    startAnim: () => {
      if (hasSkipped) {
        return false;
      }

      $(".mirum-input-field").addClass("mirum-hide");

      //Add a staggered delay to each element
      $("body")
        .find(messageElements)
        .each((index, element) => {
          let animationDelay = index * ANIMATION_DURATION;
          setTimeout(() => {
            if (hasSkipped) {
              return;
            }
            $(element).removeClass("mirum-hide");
            $(element).addClass("animate__animated animate__fadeInUp");

            //If the element is a typing indicator, fadeOut after 1 second
            if ($(element).hasClass("mirum-typing")) {
              setTimeout(() => {
                $(element).addClass("mirum-hide");
              }, ANIMATION_DURATION);
            }

            //Increase the player line width by pecentage
            // let playerLine = $(".player-line");
            // playerLine.css(
            //   "width",
            //   `${(index + 1) * (100 / numberOfMessages)}%`
            // );
          }, animationDelay);
        });

      //After anim finished, enable scroll
      setTimeout(() => {
        enableScroll();
      }, totalDuration);
    },
    startPlayer: () => {
      let elapsedTime = 0;

      let intervalTime = 100;

      let playerLineDuration = totalDuration + ANIMATION_DURATION * 2; //The + ANIM offset to cater for intial anim + some more

      playerLineInterval = setInterval(() => {
        elapsedTime += intervalTime;
        let playerLine = $(".player-line");
        playerLine.css("width", `${(elapsedTime / playerLineDuration) * 100}%`);
        if (elapsedTime >= playerLineDuration) {
          onIMessageStoryFinished();
        }
      }, intervalTime);
    },
  };

  function completePlayerLine() {
    if (playerLineInterval) {
      clearInterval(playerLineInterval);
    }
    let playerLine = $(".player-line");
    playerLine.css("width", "100%");
  }

  function onIMessageStoryFinished() {
    completePlayerLine();

    //Show scroll info
    showScrollInfo();

    //Hide skip button
    $(".mirum-skip-btn").addClass("mirum-fade-out");
  }
};

$(document).ready(() => {
  enableScroll();
  window.scrollTo(0, 0);
  var mirum = null;
  mirum = Mirum();
  mirum.init();
  mirum.startPlayer();
  //Start the anims after the initial typed text is done
  $(".typedjs-simple").each((i, e) => {
    let text = e.innerHTML + "";
    e.innerHTML = ""; //Clear it before starting otherwise creates issues
    //Only types strings one time
    var typed = new Typed(e, {
      strings: [text],
      typeSpeed: 50, // typing speed
      backSpeed: 50, // erasing speed
      onComplete: () => setTimeout(mirum.startAnim, 1000),
    });
  });
});

function enableScroll() {
  console.log("enableScroll");
  $("body").css("overflow", "auto");
}

function disableScroll() {
  console.log("disableScroll", document.body.scrollTop);
  //Disable scroll as long user is at top of page
  if (document.body.scrollTop === 0) {
    $("body").css("overflow", "hidden");
  } else {
    console.log("not disablign scroll - not at top");
  }
}

function hideScrollInfo() {
  console.log("hideScrollInfo");
  $(".mirum-scroll-info-holder").addClass("mirum-fade-out");
}

function showScrollInfo() {
  console.log("showScrollInfo");
  $(".mirum-scroll-info-holder").addClass("mirum-fade-in");
}

function addPlayerLine() {
  let playerLineHolder = document.createElement("div");
  $(playerLineHolder).addClass("player-line-holder");

  let playerLine = document.createElement("div");
  $(playerLine).addClass("player-line");
  playerLineHolder.appendChild(playerLine);
  let scrollLine = document.createElement("div");
  $(scrollLine).addClass("scroll-line");
  playerLineHolder.appendChild(scrollLine);
  document.body.appendChild(playerLineHolder);
}

// When the user scrolls the page, execute myFunction
window.onscroll = function () {
  myFunction();
};

function myFunction() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;

  let playerLine = $(".scroll-line");
  playerLine.css("width", `${scrolled}%`);
}

$(window).on("beforeunload", function () {
  $(".preloader-cover").css("opacity", 1);
  $(window).scrollTop(0);
});

function addBubblesIframe() {
  var iframe = document.createElement("iframe");
  iframe.src = "https://staging.themirum.co.uk/bubbles";
  iframe.frameBorder = 0;
  iframe.className = "mirum-bubbles";
  $("body").prepend(iframe);

  // <iframe
  //   class="mirum-bubbles"
  //   src="https://localhost.letscreate.zone:8443/bubbles"
  //   frameborder="0"
  // ></iframe>;
}

function scrollSmoothlyTo(elementId, heightOffset) {
  console.log("scroll to", elementId, heightOffset);
  $("html, body").animate(
    {
      scrollTop: $(elementId).offset().top - $(window).height() * heightOffset,
    },
    2000
  );
}
