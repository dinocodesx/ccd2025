
import FeatureRule from '@/public/content/feature.rule.json'
import JobsList from './JobsList'

import bkFetch from '@/services/backend.services'
import { USERS_DJANGO_URL } from '@/lib/constants/be'


export default async function Jobs() {
  try {
    const userRes = await bkFetch(USERS_DJANGO_URL, { method: "GET" })
    const profile = await userRes.json();

    if (!FeatureRule.showJobs || !profile?.is_checked_in)
      return <div className="py-4 text-center">
        <h3 className="text-lg sm:text-xl font-medium mb-4">Jobs Board</h3>
        <p className="text-sm text-muted-foreground">
          Jobs Board would be live during the event to meet recruiters at CCD Kolkata 2025.
        </p>
      </div>
    else return <JobsList />
  } catch (error) {
    return <div className="py-8 text-center text-red-600 dark:text-red-400">
      <h3 className="text-lg sm:text-xl font-medium mb-4">Jobs Board</h3>
      <p className="text-sm">Failed to load jobs. Please try again later.</p>
    </div>
  }
}