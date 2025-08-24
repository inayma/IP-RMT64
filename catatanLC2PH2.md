# SETUP

```bash
npm create vite@latest `project`
cd `project`
npm i react-router axios bootstrap sweetalert2 bootstrap-icons

mkdir -p /components /pages /libs
touch /components/Navbar.jsx
touch /components/Layout.jsx
touch /libs/http.js
touch /pages/HomePage.jsx
touch /pages/ProductDetail.jsx
touch /pages/AddPage.jsx
touch /pages/LoginPage.jsx
touch /pages/RegisterPage.jsx
touch /pages/DashboardPage.jsx
touch /pages/EditPage.jsx
```

## git.ignore

```bash
node_modules/
dist/
.env
```

## add bootstrap

### INDEX.HTML

```bash

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr" crossorigin="anonymous">

<script ="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q" crossorigin="anonymous"></script>

```

```bash
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JUDUL PROJECT</title>

    <!-- Bootstrap 5.3.7 CSS (CDN) -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr"
      crossorigin="anonymous"
    />
  </head>
  <body>
    <div id="root"></div>

    <!-- Your Vite bundle -->
    <script type="module" ="//main.jsx"></script>

    <!-- Bootstrap 5.3.7 JS (CDN) -->
    <script
      ="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q"
      crossorigin="anonymous"
    ></script>
  </body>
</html>
```

## clean up

- delete index.css
- delete app.css

### MAIN.JSX

- delete index.css

```bash
import "bootstrap-icons/font/bootstrap-icons.css";
```

## APP.JSX - clean up

- ref react router : https://reactrouter.com/start/modes#declarative

```bash
import { BrowserRouter, Routes, Route } from "react-router";

function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route path="/addGrocery" element={<AddPage />} />
          <Route path="/grocery/:id" element={<UpdatePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

```

## tambahkan ke semua /pages

```bash
export default function Page(){
    return(
        <h1>hi</h1>
    )
}
```

## bootstrap transform HTML to JSX

https://transform.tools/html-to-jsx

- card : https://getbootstrap.com/docs/5.3/components/card/#about
- form : className="w-50 m-auto mt-5 border p-5 rounded"

# REGISTER

## Layout page

```bash
return (
    <form
      onSubmit={handleSubmit}
      className="w-50 m-auto mt-5 border p-5 rounded"
    >
      <h1>Register Page</h1>
      <div className="mb-3">
        <label className="form-label">Email address</label>
        <input
          type="email"
          className="form-control"
          aria-describedby="emailHelp"
          //* REGISTER 2. Kita bind state ke input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div id="emailHelp" className="form-text">
          We'll never share your email with anyone else.
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
      <p className="mt-3">
        Do you have an account? 
        <Link to="/login">Login</Link>
      </p>
    </form>
  );

```

## 1. Define State

    const [email, setEmail] = useState("")

## 2. Bind state ke input

    value={email}
    onChange={(e) => setEmail(e.target.value)}

## 3. Handle ketika user submit form

    const handleSubmig
    try - catch (error)

## 4. Request axios.post - url

import axios from "axios";

## 5. Pindah ke halaman login dengan useNavigate

import { useNavigate } from "react-router";
const navigate = useNavigate()

```bash
    const handleSubmit = async (e) => {
        e.preventDefault()

        console.log("🚀 ~ RegisterPage ~ email, password:", email, password)
        try {

            await axios.post("https://api.p2.slc1.foxhub.space/register", {
                email,
                password,
            })
            navigate("/login")
        } catch (error) {
            console.log("🚀 ~ handleSubmit ~ error:", error.response.data.message);

        }
    }
```

di bagian return - form

<form 
    onSubmit={handleSubmit}
    className="w-50 m-auto mt-5 border p-5 rounded">

## 6. Tambah end point login

```bash
        <p className="mt-3">
        Do you have an account? <Link to="/login">Login</Link>
         </p>
```

# LOGIN

copy-paste dari /register

- ganti nama function
- ganti axios.post(/login)
- ganti link to=/

## butuh response berarti butuh access_token

const access_token = response.data.access_token

## save ke local storage

localStorage.setItem("access_token", access_token)

- navigate ke "/"

## sudah login, saat refresh tidak usah login lagi - navigation guard

const access_token = localStorage.getItem("access_token")
if (access_token) {
return <Navigate to="/"/>
}

# components/Navbar
