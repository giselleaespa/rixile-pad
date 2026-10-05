import Hero from '../sections/Hero'
import StatsSection from '../sections/StatsSection'
import LaunchesSection from '../sections/LaunchesSection'
import HowItWorks from '../sections/HowItWorks'
import CTA from '../sections/CTA'

export default function HomePage() {
  return (
    <div className="page-enter">
      <Hero />
      <StatsSection />
      <LaunchesSection />
      <HowItWorks />
      <CTA />
    </div>
  )
}
