# ComiC WorlD

A premium, full-stack comic application featuring a high-performance Next.js frontend and a robust Django backend.

## Developed By
**Nikhil Kumar Singh**
*Final Year Undergraduate at IIIT Agartala*

---

<div align="center">
  <p align="center">
    A Comic Website using Django and Next.js frameworks!
    <br />
    <a href="https://github.com/DarkGod04/ComiC_WorlD"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/DarkGod04/ComiC_WorlD">View Demo</a>
    ·
    <a href="https://github.com/DarkGod04/ComiC_WorlD/issues">Report Bug</a>
    ·
    <a href="https://github.com/DarkGod04/ComiC_WorlD/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

A full-stack webtoon, manhua, manga website, manhwa website, comics website using Next.js | React.js framework as Front-end and Django-rest-framework as Back-end that allows users to post and read comics online, utilize pre-rendering which dramatically increases page performance.

- **High-Performance Rendering**: Next.js pre-rendering is utilized with on-demand Incremental Static Regeneration (ISR) to optimize loading times, achieving near-perfect Lighthouse scores.
- **Dynamic Caching**: Admins can re-create new caches whenever they add/update data on the back-end, ensuring that changes are immediately reflected on the front-end.
- **Stripe Payment Integration**: Secure and streamlined payment processing for purchasing user coins and unlocking premium chapters.
- **Google OAuth Login**: Fully authorized logins using Google OAuth credentials.
- **Cohesive Viewer Themes**: Unified, premium reader backgrounds, custom scrollbars, dropdowns, and comment sections matching **Dark, Light, and Sepia** viewer themes.
- **Smooth Auto Scroll**: Frame-rate independent auto-scrolling loop using `requestAnimationFrame` and time-delta physics.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- Python >=3.9
- Node.js >=14.x
- MySQL (configured for backend database storage)

### Technologies

- Back-end Rest Apis using Django-rest-framework
- Front-end using Nextjs framework with Tailwind CSS

### Functionality

- [x] Login, logout, signup
- [x] Google OAuth Login Integration
- [x] Comic Views
- [x] Webtoon & Manga (Paged) reader layouts
- [x] Cohesive Viewer Themes (Dark, Light, Sepia)
- [x] Smooth Auto Scroll (requestAnimationFrame render loop)
- [x] User Comment, nested reply, and spoiler controls
- [x] User bookmarking & rating
- [x] Stripe Wallet Checkout
- [x] Update User Profile
- [x] Chapter Coin Unlocking
- [ ] Local reading history
- [ ] Chapter Free timer (Free after a specific interval time, Ex: 1 week)

### Installation Back-end using Scripts

1. Clone the repo

   ```sh
   git clone https://github.com/DarkGod04/ComiC_WorlD.git
   ```

2. Configure your MySQL connection settings (username, password, port) in `settings.py`:
   [django-apis/comicapis/comicapis/settings.py](file:///c:/Users/Nikhil%20kumar%20singh/Desktop/fullstack-comic-app/django-apis/comicapis/comicapis/settings.py)

3. Run the first-time initialization scripts to create virtual environment, migrate the database, install package requirements, and setup a Django superuser:
   ```sh
   cd django-apis
   ./scripts/init.sh
   ```

---

### Installation Front-end

1. Move to the `nextjs-comic` folder:
   ```sh
   cd nextjs-comic
   ```

2. Set up your local environment file (`.env.local`) with Google OAuth credentials and backend API urls:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Install dependencies and start the Next.js dev server:
   ```sh
   npm install
   npm run dev
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

> For back-end apis:

1. Running project using `run.sh`:

   ```sh
   ./run.sh
   ```

2. Manage data using the Django admin page: `http://localhost:8000/admin`
   - Default credentials: `admin` / `123456`

3. View API list documentation: `http://localhost:8000/swagger`

> For front-end:
- Open `http://localhost:3000` to view the homepage.
- Read premium chapters by acquiring user coins on the wallet page and checking out via Stripe.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

**Nikhil Kumar Singh** - nikhilkumarsingh004@gmail.com

Project Link: [https://github.com/DarkGod04/ComiC_WorlD](https://github.com/DarkGod04/ComiC_WorlD)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/DarkGod04/ComiC_WorlD.svg?style=for-the-badge
[contributors-url]: https://github.com/DarkGod04/ComiC_WorlD/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/DarkGod04/ComiC_WorlD.svg?style=for-the-badge
[forks-url]: https://github.com/DarkGod04/ComiC_WorlD/network/members
[stars-shield]: https://img.shields.io/github/stars/DarkGod04/ComiC_WorlD.svg?style=for-the-badge
[stars-url]: https://github.com/DarkGod04/ComiC_WorlD/stargazers
[issues-shield]: https://img.shields.io/github/issues/DarkGod04/ComiC_WorlD.svg?style=for-the-badge
[issues-url]: https://github.com/DarkGod04/ComiC_WorlD/issues
[license-shield]: https://img.shields.io/github/license/DarkGod04/ComiC_WorlD.svg?style=for-the-badge
[license-url]: https://github.com/DarkGod04/ComiC_WorlD/blob/master/LICENSE
