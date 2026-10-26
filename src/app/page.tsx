'use client';

import { PageFrame } from '../components/layout/PageFrame';
import { HomeAmbientGags } from '../components/home/HomeAmbientGags';
import { HomeLanding } from '../components/home/HomeLanding';

const Home = () => (
  <PageFrame landing>
    <HomeLanding />
    <HomeAmbientGags />
  </PageFrame>
);

export default Home;
