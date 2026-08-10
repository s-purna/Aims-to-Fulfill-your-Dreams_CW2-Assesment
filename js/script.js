(function () {
  "use strict";

  const $ = window.jQuery;

  // Mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-list");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Current year
  document.querySelectorAll(".current-year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Reveal animation using jQuery when available
  function revealElements() {
    document.querySelectorAll(".reveal").forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 60) {
        el.classList.add("visible");
      }
    });
  }
  if ($) {
    $(window).on("scroll load", revealElements);
    $(".accordion-button").on("click", function () {
      const item = $(this).closest(".accordion-item");
      item.toggleClass("open");
      $(this).attr("aria-expanded", item.hasClass("open"));
    });
  } else {
    window.addEventListener("scroll", revealElements);
    window.addEventListener("load", revealElements);
    document.querySelectorAll(".accordion-button").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".accordion-item");
        item.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(item.classList.contains("open")));
      });
    });
  }

  // Destination filters
  const filterButtons = document.querySelectorAll(".filter-btn");
  const destinationCards = document.querySelectorAll("[data-category]");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      destinationCards.forEach(card => {
        card.style.display = filter === "all" || card.dataset.category === filter ? "" : "none";
      });
    });
  });

  // Package detail toggles
  document.querySelectorAll(".details-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const details = button.closest(".card").querySelector(".package-details");
      const open = details.classList.toggle("open");
      button.textContent = open ? "Hide details" : "View details";
      button.setAttribute("aria-expanded", String(open));
    });
  });

  // Booking form validation + localStorage
  const form = document.getElementById("bookingForm");
  const notice = document.getElementById("formNotice");

  const validators = {
    fullName: value => value.trim().length >= 3 ? "" : "Please enter at least 3 characters.",
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Please enter a valid email address.",
    phone: value => /^[0-9+\-\s]{7,15}$/.test(value.trim()) ? "" : "Please enter a valid phone number.",
    destination: value => value ? "" : "Please select a destination.",
    travelDate: value => {
      if (!value) return "Please select a travel date.";
      const selected = new Date(value + "T00:00:00");
      const today = new Date();
      today.setHours(0,0,0,0);
      return selected >= today ? "" : "Travel date cannot be in the past.";
    },
    travellers: value => Number(value) >= 1 && Number(value) <= 20 ? "" : "Travellers must be between 1 and 20.",
    message: value => value.trim().length >= 10 ? "" : "Please provide at least 10 characters."
  };

  function showError(field, message) {
    const error = document.getElementById(field.id + "Error");
    field.classList.toggle("invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
  }

  if (form) {
    Object.keys(validators).forEach(id => {
      const field = document.getElementById(id);
      field.addEventListener("blur", () => showError(field, validators[id](field.value)));
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      let valid = true;

      Object.keys(validators).forEach(id => {
        const field = document.getElementById(id);
        const error = validators[id](field.value);
        showError(field, error);
        if (error) valid = false;
      });

      const consent = document.getElementById("consent");
      const consentError = document.getElementById("consentError");
      if (!consent.checked) {
        consentError.textContent = "Please confirm that the details are correct.";
        valid = false;
      } else {
        consentError.textContent = "";
      }

      if (!valid) {
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const booking = {
        name: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        destination: document.getElementById("destination").value,
        date: document.getElementById("travelDate").value,
        travellers: document.getElementById("travellers").value,
        message: document.getElementById("message").value.trim(),
        createdAt: new Date().toISOString()
      };

      const bookings = JSON.parse(localStorage.getItem("dreamTravelBookings") || "[]");
      bookings.push(booking);
      localStorage.setItem("dreamTravelBookings", JSON.stringify(bookings));

      notice.className = "notice success";
      notice.textContent = `Thank you, ${booking.name}. Your request for ${booking.destination} has been saved successfully.`;
      form.reset();
      renderSavedBookings();
      notice.focus();
    });
  }

  function renderSavedBookings() {
    const list = document.getElementById("savedBookings");
    if (!list) return;
    const bookings = JSON.parse(localStorage.getItem("dreamTravelBookings") || "[]");
    list.innerHTML = "";
    if (!bookings.length) {
      list.innerHTML = "<li>No saved booking requests yet.</li>";
      return;
    }
    bookings.slice(-5).reverse().forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} — ${item.destination} on ${item.date} (${item.travellers} traveller${Number(item.travellers) === 1 ? "" : "s"})`;
      list.appendChild(li);
    });
  }
  renderSavedBookings();

  const clearButton = document.getElementById("clearBookings");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      localStorage.removeItem("dreamTravelBookings");
      renderSavedBookings();
    });
  }
})();
