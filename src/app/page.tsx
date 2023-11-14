import Image from 'next/image'
import cpProductImage from '../../public/cp_product_image.jpg';
import cpProductImage2 from '../../public/cp_product_image2.jpg';
import cpProductImage3 from '../../public/cp_product_image3.jpg';
import Header from './header/Header'

export default function Home() {
  return (
      <div className='app-skeleton'>
      <section className="cyberpunk">
          <Header />
          <section className="cyberpunk black">
            
          <ul className="cyberpunk">
              <li className="glitched">Cyberpunk is a subgenre of science fiction in a dystopian <a href="#">futuristic setting that</a> tends to
                focus on a "combination of low-life and high tech"</li>
          </ul>
          
          <p className="cyberpunk inverse dotted">Cyberpunk is a subgenre of science fiction in a dystopian <a href="#">futuristic
                setting that</a> tends to focus on a "combination of low-life and high tech"[1] featuring advanced
            technological and scientific achievements, such as artificial intelligence and cybernetics, juxtaposed with a
            degree of breakdown or radical change in the social order.[2] Much of cyberpunk is rooted in the New Wave
            science fiction movement of the 1960s and 1970s, when writers like Philip K. Dick, Roger Zelazny, John Brunner,
            J. G. Ballard, Philip José Farmer and Harlan Ellison examined the impact of drug culture, technology, and the
            sexual revolution while avoiding the utopian tendencies of earlier science fiction.</p>
          </section>
          <section className="cyberpunk">
            <Image className="cyberpunk dotted" src={cpProductImage} alt="Cyberpunk2077.exe" />
            <Image className="cyberpunk dotted" src={cpProductImage2} alt="Cyberpunk2077.exe" />
            <Image className="cyberpunk dotted" src={cpProductImage3} alt="Cyberpunk2077.exe" />
          </section>
      </section>
      </div>
  )
}
