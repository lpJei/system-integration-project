const BASE_API_URL = "http://localhost:3000/api/github";

async function fetchWithAuth(url) {
    const response = await fetch(url, {
        headers: {
        Accept: "application/vnd.github.v3+json",
        },
    });

    if (response.status === 403) {
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
        if (rateLimitRemaining === "0") {
        const reset = response.headers.get("X-RateLimit-Reset");
        const resetTime = new Date(reset * 1000).toLocaleTimeString();
        throw new Error(`GitHub API rate limit exceeded. Try again at ${resetTime}`);
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response;
}

async function getGitHubProfile(username, elementId) {
    try {
        const response = await fetchWithAuth(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);

        const data = await response.json();

        const profileElement = document.getElementById(elementId);
        if (profileElement) {
        profileElement.innerHTML = `
            <a href="${
            data.html_url
            }" target="_blank" class="flex items-center gap-2 text-gray-700 hover:text-indigo-600">
            <img src="${data.avatar_url}" alt="${
            data.login
        }" class="rounded-full w-12 h-12">
            <div class="info">
                <span class="font-semibold">${data.name || data.login}</span>
                <span>Public Repos: ${data.public_repos}</span>
                <span>Followers: ${data.followers}</span>
                <span>Following: ${data.following}</span>
            </div>
            </a>
        `;
        }
    } catch (error) {
        console.error(
        `Error fetching GitHub profile for ${username}:`,
        error
        );
        const profileElement = document.getElementById(elementId);
        if (profileElement) {
        profileElement.innerHTML = `<p class="text-red-500 text-sm">Could not load GitHub profile for ${username}. Trying to load repositories...</p>`;
        // Try to fetch repositories anyway
        fetchRepositoriesForMember(username);
        }
    }
    }

    async function openModal(username, portfolioLink = null) {
    const modalBodyContent = document.getElementById("modal-body-content");
    modalBodyContent.innerHTML = "<p>Loading GitHub profile...</p>"; // Loading message
    try {
        const userResponse = await fetchWithAuth(`https://api.github.com/users/${username}`);
        const reposResponse = await fetchWithAuth(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        
        const userData = await userResponse.json(); // Use the fetched user data
        const reposData = await reposResponse.json(); // Use the fetched repos data

        let reposHtml = "";
        if (reposData.length > 0) {
            reposHtml = `
                <div class="github-repos">
                    <h3>Recent Repositories</h3>
                    ${reposData.map(repo => `
                        <div class="github-repo-item">
                            <h4>${repo.name}</h4>
                            <p>${repo.description || "No description provided."}</p>
                            <p>Language: ${repo.language || "N/A"}</p>
                            <a href="${repo.html_url}" target="_blank" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-1 px-3 rounded-lg transition duration-300 inline-block mt-2">
                                View Repository
                            </a>
                        </div>
                    `).join("")}
                </div>
            `;
        } else {
            reposHtml = '<p class="text-center text-gray-600 mt-4">No recent public repositories found.</p>';
        }

        let portfolioHtml = "";
            if (portfolioLink) {
            const screenshotApiUrl = `https://image.thum.io/get/width/800/crop/400/${portfolioLink}`;
            portfolioHtml = `
                <div class="portfolio-section">
                <h3>Portfolio</h3>
                <div class="portfolio-preview">
                    <img src="${screenshotApiUrl}" alt="Portfolio Preview of ${portfolioLink}">
                </div>
                <a href="${portfolioLink}" target="_blank" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300">
                    View Portfolio
                </a>
                </div>
            `;
            }

        modalBodyContent.innerHTML = `
            <div class="github-modal-profile">
                <img src="${userData.avatar_url}" alt="${userData.login}" onerror="this.src='https://via.placeholder.com/150'">
                <h2>${userData.name || userData.login}</h2>
                <p class="username">@${userData.login}</p>
                ${userData.bio ? `<p class="bio">${userData.bio}</p>` : ""}
                <div class="github-stats">
                    <div><strong>${userData.public_repos}</strong><span>Repositories</span></div>
                    <div><strong>${userData.followers}</strong><span>Followers</span></div>
                    <div><strong>${userData.following}</strong><span>Following</span></div>
                </div>
                <a href="${userData.html_url}" target="_blank" class="mt-4 inline-block bg-gray-900 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition duration-300">
                    View GitHub Profile
                </a>
            </div>
            ${reposHtml}
            ${portfolioHtml}
        `;

        const modal = document.getElementById("profileModal");
        modal.style.display = "flex";
        setTimeout(() => {
            modal.classList.add("show");
        }, 10);
    } catch (error) {
        console.error(`Error fetching GitHub profile for ${username}:`, error);
        modalBodyContent.innerHTML = `<p class="text-red-500 text-center">Failed to load GitHub profile for ${username}. Please try again later.</p>`;
        document.getElementById("profileModal").style.display = "flex";
    }
    }
    window.openModal = openModal;

    // Function to close the modal
    function closeModal() {
    const modal = document.getElementById("profileModal");
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.display = "none";
        document.getElementById("modal-body-content").innerHTML = "";
    }, 300);
    }
    window.closeModal = closeModal;

    // Close the modal if the user clicks outside of it
    window.onclick = function (event) {
    const modal = document.getElementById("profileModal");
    if (event.target == modal) {
        closeModal();
    }
    };

    const teamMembers = [
    { username: "lpJei", name: "Loisse Joy Parot" },
    { username: "rclunas", name: "Arcy Lunas" },
    { username: "andrei-214", name: "John Andrei Balbin" },
    { username: "lisondrasheene11", name: "Sheene Joshua Lisondra" }
    ];

    teamMembers.forEach((member) => {
    getGitHubProfile(member.username, `github-profile-${member.username}`);
    });

    // Portfolio data for the Netflix-style carousel
    const portfolioData = [
    {
        image:
        "components/team.jpg",
        link: "https://github.com/lpJei/krm-services", // Group 1 project
        title: "Team Collaboration",
        description:
        "A project showcasing collaborative efforts in design and development.",
    },
    {
        image:
        "components/lj.jpg",
        link: "https://lpjei.github.io/eljei/", // Loisse Joy Parot's portfolio
        title: "Loisse Joy Parot's Portfolio",
        description:
        "Explore full-stack development and documentation projects by Loisse Joy.",
    },
    {
        image:
        "components/arcy.jpg",
        link: "https://rclunas.github.io/arcy_lunas.github.io/", // Arcy Lunas's portfolio
        title: "Arcy Lunas's UI/UX Designs",
        description:
        "Discover captivating front-end and UI design projects from Arcy Lunas.",
    },
    {
        image:
        "components/andrei.jpg",
        link: "https://andrei-214.github.io/andrei.github.io/", // John Andrei Balbin's portfolio
        title: "John Andrei Balbin's Documentation",
        description:
        "Detailed documentation and information architecture projects by John Andrei.",
    },
    {
        image:
        "components/sheene.jpg",
        link: "https://lisondrasheene11.github.io/sheenelisondra.github.io/", // Sheene Joshua Lisondra's portfolio
        title: "Sheene Joshua Lisondra's Back-end Work",
        description:
        "Dive into robust back-end development solutions by Sheene Joshua.",
    },
    ];

    let currentSlide = 0;
    const carouselInner = document.getElementById("carousel-inner");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const viewPortfolioLink = document.getElementById("viewPortfolioLink");
    const portfolioTitle = document.getElementById("portfolio-title");
    const portfolioDescription = document.getElementById(
    "portfolio-description"
    );
    let slideInterval;

    // Function to load carousel items
    function loadCarouselItems() {
    carouselInner.innerHTML = portfolioData
        .map(
        (item) => `
            <div class="carousel-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="carousel-item-overlay">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            </div>
        `
        )
        .join("");
    }

    // Function to show a specific slide and update details
    function showSlide(index) {
    if (index >= portfolioData.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = portfolioData.length - 1;
    } else {
        currentSlide = index;
    }
    carouselInner.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update the "View Portfolio" link and text details
    viewPortfolioLink.href = portfolioData[currentSlide].link;
    portfolioTitle.textContent = portfolioData[currentSlide].title;
    portfolioDescription.textContent =
        portfolioData[currentSlide].description;
    }

    // Function for automatic sliding
    function startAutoSlide() {
    slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 4000); // Change image every 4 seconds for a more relaxed pace
    }

    // Event listeners for navigation buttons
    prevBtn.addEventListener("click", () => {
    clearInterval(slideInterval);
    showSlide(currentSlide - 1);
    startAutoSlide();
    });

    nextBtn.addEventListener("click", () => {
    clearInterval(slideInterval);
    showSlide(currentSlide + 1);
    startAutoSlide();
    });

    // Add this new function
    function setupSmoothScrollingAndActiveNav() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]"); // Get all sections with an ID

    function highlightNavLink() {
        let current = "";

        sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Adjust offset to trigger highlight a bit before the section fully enters view
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute("id");
        }
        });

        navLinks.forEach((link) => {
        link.classList.remove("text-indigo-600"); // Remove active color
        link.classList.add("text-gray-700"); // Add default color
        if (link.href.includes(current)) {
            link.classList.add("text-indigo-600"); // Add active color
            link.classList.remove("text-gray-700"); // Remove default color
        }
        });
    }

    // Add event listener for scroll
    window.addEventListener("scroll", highlightNavLink);

    // Call it once on load to set initial active link
    highlightNavLink();

    // Smooth scroll for navigation links (already handled by CSS, but this ensures it)
    navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            window.scrollTo({
            top: targetSection.offsetTop,
            behavior: "smooth",
            });
        }
        });
    });
    }

    // Initial load and start auto-slide
    document.addEventListener("DOMContentLoaded", () => {
    loadCarouselItems();
    showSlide(currentSlide);
    startAutoSlide();
    setupSmoothScrollingAndActiveNav(); // Call the new function here
    });

    // Fetch repositories for a single team member
    async function fetchRepositoriesForMember(username) {
    const profileElement = document.getElementById(`github-profile-${username}`);
    if (!profileElement) return;

    try {
        const response = await fetchWithAuth(`https://api.github.com/users/${username}/repos?sort=updated`);

        if (!response.ok) throw new Error("Failed to fetch repos");
        const repos = await response.json();

        if (repos.length > 0) {
        const reposHtml = repos
            .slice(0, 3)
            .map(
            (repo) => `
            <div class="mt-2 text-sm">
            <a href="${
                repo.html_url
            }" target="_blank" class="text-indigo-600 hover:underline">
                ${repo.name}
            </a>
            ${
                repo.description
                ? `<p class="text-gray-500">${repo.description}</p>`
                : ""
            }
            </div>
        `
            )
            .join("");
        profileElement.insertAdjacentHTML("beforeend", reposHtml);
        }
    } catch (error) {
        console.error(`Error fetching repos for ${username}:`, error);
    }
    }

    // Fetch all team repositories
    async function fetchAllRepos() {
    const reposContainer = document.getElementById("team-repos");
    reposContainer.innerHTML =
        '<p class="text-center">Loading repositories...</p>';

    try {
        let allRepos = [];

        // Fetch repos for each team member
        for (const member of teamMembers) {
        const response = await fetchWithAuth(
            `https://api.github.com/users/${member.username}/repos`
        );
        if (!response.ok) continue;

        const repos = await response.json();
        repos.forEach((repo) => {
            repo.memberName = member.name;
            allRepos.push(repo);
        });
        }

        // Sort by most recently updated
        allRepos.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );

        // Display repos
        if (allRepos.length > 0) {
        reposContainer.innerHTML = allRepos
            .map(
            (repo) => `
            <div class="repo-card">
            <div class="repo-content">
                <h3 class="text-xl font-semibold text-gray-800">${
                repo.name
                }</h3>
                <p class="text-gray-600 mt-2">${
                repo.description || "No description"
                }</p>
                <div class="repo-stats">
                <span>⭐ ${repo.stargazers_count}</span>
                <span>📝 ${repo.language || "N/A"}</span>
                <span>👤 ${repo.memberName}</span>
                </div>
                <a href="${repo.html_url}" target="_blank" 
                class="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300">
                View Repository
                </a>
            </div>
            </div>
        `
            )
            .join("");
        } else {
        reposContainer.innerHTML =
            '<p class="text-center text-gray-600">No repositories found.</p>';
        }
    } catch (error) {
        console.error("Error fetching repositories:", error);
        reposContainer.innerHTML =
        '<p class="text-center text-red-500">Error loading repositories. Please try again later.</p>';
    }
    }

    // Fetch recent activity (5 most recent repos per member)
    async function fetchRecentActivity() {
    const activityContainer = document.getElementById("recent-activity");
    activityContainer.innerHTML =
        '<p class="text-center">Loading activity...</p>';

    try {
        let allActivity = [];

        // Fetch recent repos for each team member
        for (const member of teamMembers) {
        const response = await fetchWithAuth(
            `https://api.github.com/users/${member.username}/repos?sort=updated&per_page=5`
        );
        if (!response.ok) continue;

        const repos = await response.json();
        repos.forEach((repo) => {
            repo.memberName = member.name;
            repo.memberAvatar = `https://github.com/${member.username}.png`;
            allActivity.push(repo);
        });
        }

        // Sort by most recently updated
        allActivity.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );

        // Display activity
        if (allActivity.length > 0) {
        activityContainer.innerHTML = allActivity
            .map(
            (repo) => `
            <div class="activity-card">
            <div class="activity-header">
                <img src="${repo.memberAvatar}" alt="${repo.memberName}">
                <div>
                <h3 class="font-semibold">${repo.memberName}</h3>
                <p class="text-indigo-600">${repo.name}</p>
                </div>
            </div>
            <p class="text-gray-600">${
                repo.description || "No description"
            }</p>
            <div class="activity-date">
                Last updated: ${new Date(
                repo.updated_at
                ).toLocaleDateString()}
            </div>
            <a href="${repo.html_url}" target="_blank" 
                class="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300">
                View Repository
            </a>
            </div>
        `
            )
            .join("");
        } else {
        activityContainer.innerHTML =
            '<p class="text-center text-gray-600">No recent activity found.</p>';
        }
    } catch (error) {
        console.error("Error fetching activity:", error);
        activityContainer.innerHTML =
        '<p class="text-center text-red-500">Error loading activity. Please try again later.</p>';
    }
    }

    // Load repositories and activity when page loads
    fetchAllRepos();
    fetchRecentActivity();