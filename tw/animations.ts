const animation = {
  shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
  ripple: "ripple 0.25s linear infinite",
  mltShdSpin: "mltShdSpin 1.7s infinite ease, round 1.7s infinite ease",
};

const keyframes = {
  shake: {
    "10%, 90%": {
      transform: "translate3d(-1px, 0, 0)",
    },

    "20%, 80%": {
      transform: "translate3d(2px, 0, 0)",
    },

    "30%, 50%, 70%": {
      transform: "translate3d(-4px, 0, 0)",
    },

    "40%, 60%": {
      transform: "translate3d(4px, 0, 0)",
    },
  },
  ripple: {
    "0%": { width: "0px", height: "0px", opacity: 0.5 },
    "100%": { width: "500px", height: "500px", opacity: 0 },
  },
  mltShdSpin: {
    "0%": {
      "box-shadow":
        "0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;",
    },
    "5%, 95%": {
      "box-shadow":
        "0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;",
    },
    "10%, 59%": {
      "box-shadow":
        "0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;",
    },
    "20%": {
      "box-shadow":
        "0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em, -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, -0.749em -0.34em 0 -0.477em;",
    },
    "38%": {
      "box-shadow":
        "0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em, -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, -0.82em -0.09em 0 -0.477em;",
    },
    "100%": {
      "box-shadow":
        "0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;",
    },
  },
  round: {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};

export { animation, keyframes };
