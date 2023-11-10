import Header from '../header/Header'
import Attributes from './attributes'
import Abilities from './abilities'
import CyberPunkResource from './resource'
import CHeader from './cHeader'
import styles from './page.module.css'
export function Sheet(){
    return (
    <section>
        <Header />
        <CHeader />
        <h3 className={styles.attributesSection}>Attributes</h3>
        <Attributes />
        <h3 className={styles.attributesSection}>Abilities</h3>
        <Abilities />
        <h3 className={styles.attributesSection}>Resources</h3>
        <CyberPunkResource />
    </section>
    )
}

export default Sheet