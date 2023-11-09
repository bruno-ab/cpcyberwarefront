import Button from '../buttons/Buttons.jsx';
export function Header(){
    return (
    <div>
        <h1 className="cyberpunk"><a href="/">Cyberpunk 2077 w0d</a></h1>
        <Button path={"/characters"} text={"Characters"} />
        <Button path={"/cyberware"}  text={"CyberWare"}/>
        <Button path={"/rules"}  text={"Rules" }/>
        <Button path={"/account"}  text={"Account"}/>
    </div>
    )
}

export default Header