console.error(
  "404 Error: The user attempted to access:",
  window.location.pathname,
);

const btn = document.querySelector("button");
btn.addEventListener("mouseover", () => {
  btn.style.transform = "scale(1.05)";
});

btn.addEventListener("mouseout", () => {
  btn.style.transform = "scale(1)";
});

setTimeout(() => {
  console.log("Redirecting in 10 seconds...");
}, 5000);
