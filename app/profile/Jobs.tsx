
import * as FeatureRule from '@/public/content/feature.rule.json'
import JobsList from './JobsList'

export default function Jobs()
{
    if(!FeatureRule.jobs)
        return <div className="py-4 text-center">
    <h3 className="text-lg sm:text-xl font-medium mb-4">Jobs Board</h3>
    <p className="text-sm text-muted-foreground">
        Jobs Board would be live during the event to meet recruiters at CCD Kolkata 2025.   
    </p>
  </div>
  else return <JobsList/>
}