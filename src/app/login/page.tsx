import Header from '../header/Header';
import { cyberpunk } from './login';
import styles from './Login.module.css';

export function Login(){
    return (
     <form class="cyberpunk" action="" method="get">
    <div class="cyberpunk"></div>
    <div class="cyberpunk">
      <input id="email" type="text" class="cyberpunk" placeholder=" " />
      <label class="cyberpunk" for="email">Email</label>
    </div>
    <div class="cyberpunk">
      <input id="pasword" type="password" class="input__element" placeholder=" " />
      <label class="cyberpunk" for="password">Password</label>
    </div>
    <button type="button" class="cyberpunk red">
      <div class="button__label">Login</div>
      <div class="button__icon"></div>
    </button>
  </form>
    )
}


export default Login;