import './App.css';
import axios from "axios";
import { useEffect } from 'react';

function App() {

  const login = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: "/auth/login",
        data: {
          username: "heinminhtun",
          password: "33954425"
        },
        withCredentials: true
      });
      console.log(res);
    } catch (e) {
      console.log(e.response);
    }
  }

  const signup = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: "/auth/register",
        data: {
          username: "heinminhtun3",
          email: "heinminhtun273@gmail.com",
          password: "33954425"
        },
        withCredentials: true
      });
      console.log(res);
    } catch (e) {
      console.log(e.response);
    }
  }

  const logout = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: "/auth/logout",
        withCredentials: true
      });
      console.log(res);
    } catch (e) {
      console.log(e.response);
    }
  }

  const checkStatus = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: "/auth/is_authenticated",
        withCredentials: true
      })
      console.log(res);
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="App">
      <button onClick={login} >Login</button>
      <button onClick={signup} >SignUp</button>
      <button onClick={logout} >Logout</button>
      <button onClick={checkStatus} >Check</button>
    </div>
  );
}

export default App;
