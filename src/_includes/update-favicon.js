const faviconTag = document.getElementById("favicon-tag");
const isDark = window.matchMedia("(prefers-color-scheme: dark)");
const isLight = window.matchMedia("(prefers-color-scheme: light)");

const changeFavicon = () => {
  if (isDark.matches) faviconTag.href = "/img/favicon/favicon-dark.svg";
  else if (isLight.matches) faviconTag.href = "/img/favicon/favicon-light.svg";
  else faviconTag.href = "/img/favicon/favicon.svg";
};

changeFavicon();

isDark.addEventListener("change", changeFavicon);
isLight.addEventListener("change", changeFavicon);