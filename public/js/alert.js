// setTimeout(() => {
//     const alert = document.querySelector('.alert');
//     if (alert) alert.remove();
// }, 2000);


document.addEventListener("scroll", () => {
    const filtersSection = document.querySelector(".filtersSection"); // Adjust the class to match your filters section
    const greetBox = document.querySelector(".greet");
    const searchForm = document.querySelector(".searchForm");

    if (filtersSection) {
      const filtersTop = filtersSection.getBoundingClientRect().top;

      if (filtersTop <= 90) { // 80px equivalent to 5rem
        greetBox.style.display = "none"; // Hide the greeting box
        searchForm.style.transition = "transform 0.3s ease";
        searchForm.style.transform = "translateY(-1.25rem)"; // Adjust the search box position
      } else {
        greetBox.style.display = "block"; // Show the greeting box
        searchForm.style.transform = "translateY(0)"; // Reset the search box position
      }
    }
  });