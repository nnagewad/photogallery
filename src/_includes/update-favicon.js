const faviconTag = document.getElementById("favicon-tag");
const isDark = window.matchMedia("(prefers-color-scheme: dark)");

const changeFavicon = () => {
  if (isDark.matches) faviconTag.href = "/img/favicon/favicon-dark.svg";
  else faviconTag.href = "/img/favicon/favicon-light.svg";
};

changeFavicon();

isDark.addEventListener("change", changeFavicon);