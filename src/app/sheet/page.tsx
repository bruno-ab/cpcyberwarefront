import Header from '../header/Header'
import Attributes from './attributes'
import Abilities from './abilities'
import CyberPunkResource from './resource'
import CHeader from './cHeader'
export function Sheet(){
    return (
    <section className="cyberpunk">
        <Header />
        <CHeader />
        <h3 class="cyberpunk">Attributes</h3>
        <Attributes />
        <h3 class="cyberpunk">Abilities</h3>
        <Abilities />
        <h3 class="cyberpunk">Resources</h3>
        <CyberPunkResource />
    </section>
    )
}

export default Sheet