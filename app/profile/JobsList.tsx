"use client";

import { useEffect, useState } from "react";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ExternalLink, MapPin, Clock, Briefcase, Calendar, Building2, Search, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import GeminiIcon from "@/components/GeminiIcon";

interface Recruiter {
  id: number;
  name: string;
  company_name: string;
  logo?: string;
  website?: string;
}

interface Job {
  id: number;
  title: string;
  link: string;
  experience_level: string;
  location: string;
  type: string;
  created_at: string;
  updated_at: string;
  recruiter: number;
}

interface JobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

const experienceLevelColors = {
  junior: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  mid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  senior: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  lead: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

const locationColors = {
  remote: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  onsite: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  hybrid: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
};

const typeColors = {
  full_time: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  part_time: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  contract: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  internship: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
};

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Store all jobs for filtering
  const [recruiters, setRecruiters] = useState<Record<number, Recruiter>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRecruiter = async (recruiterId: number): Promise<Recruiter | null> => {
    try {
      const response = await fetch(`/api/recruiters/${recruiterId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch recruiter ${recruiterId}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn(`Error fetching recruiter ${recruiterId}:`, error);
      return null;
    }
  };

  const fetchRecruitersForJobs = async (jobsList: Job[]) => {
    const recruiterIds = [...new Set(jobsList.map(job => job.recruiter))];
    const newRecruiters: Record<number, Recruiter> = {};

    // Fetch recruiters that we haven't already loaded
    const recruiterPromises = recruiterIds
      .filter(id => !recruiters[id])
      .map(async (id) => {
        const recruiter = await fetchRecruiter(id);
        if (recruiter) {
          newRecruiters[id] = recruiter;
        }
      });

    await Promise.all(recruiterPromises);

    // Update recruiters state with new data
    if (Object.keys(newRecruiters).length > 0) {
      setRecruiters(prev => ({ ...prev, ...newRecruiters }));
    }
  };

  const fetchJobs = async (url?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url || "/api/jobs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data: JobsResponse = await response.json();
      setJobs(data.results);
      setAllJobs(data.results); // Store all jobs for filtering
      setNextPage(data.next);
      setPreviousPage(data.previous);

      // Fetch recruiter details for the jobs
      await fetchRecruitersForJobs(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search query
  const filteredJobs = allJobs.filter(job => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const recruiter = recruiters[job.recruiter];
    
    // Search in job title
    if (job.title.toLowerCase().includes(query)) return true;
    
    // Search in company name
    if (recruiter?.company_name.toLowerCase().includes(query)) return true;
    
    // Search in recruiter name
    if (recruiter?.name?.toLowerCase().includes(query)) return true;
    
    // Search in experience level
    if (job.experience_level.toLowerCase().includes(query)) return true;
    
    // Search in location
    if (job.location.toLowerCase().includes(query)) return true;
    
    // Search in job type
    if (job.type.toLowerCase().includes(query)) return true;
    
    return false;
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePageChange = (url: string) => {
    fetchJobs(url);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExperienceLevelDisplay = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getLocationDisplay = (location: string) => {
    return location.charAt(0).toUpperCase() + location.slice(1);
  };

  const getTypeDisplay = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
           <GeminiIcon className="animate-spin invert dark:invert-0 size-6"/>
            <span className="text-muted-foreground">Loading jobs...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Image
                src="/images/cfs/smile.svg"
                alt="Error"
                width={48}
                height={48}
                className="mb-4 opacity-50"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Unable to load jobs
              </h3>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <Button
                onClick={() => fetchJobs()}
                className="bg-primary hover:bg-primary/90 text-white dark:text-black"
              >
                Try Again
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Job Opportunities</h2>
          <p className="text-muted-foreground">
            Discover exciting career opportunities in the tech industry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/images/cfs/gemini.svg"
            alt="Jobs"
            width={24}
            height={24}
            className="dark:invert"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search jobs by title, company, experience level, location, or type..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--google-blue] focus:border-google-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-muted-foreground">
            Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const recruiter = recruiters[job.recruiter];
          
          return (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      {recruiter?.logo && (
                        <div className="flex-shrink-0">
                          <Image
                            src={recruiter.logo}
                            alt={recruiter.company_name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {job.title}
                        </h3>
                        {recruiter && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{recruiter.company_name}</span>
                            {recruiter.name && (
                              <>
                                <span>•</span>
                                <span>Posted by {recruiter.name}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span 
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${experienceLevelColors[job.experience_level as keyof typeof experienceLevelColors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"}`}
                      >
                        {getExperienceLevelDisplay(job.experience_level)}
                      </span>
                      <span 
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${locationColors[job.location as keyof typeof locationColors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"}`}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {getLocationDisplay(job.location)}
                      </span>
                      <span 
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[job.type as keyof typeof typeColors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"}`}
                      >
                        <Briefcase className="w-3 h-3 mr-1" />
                        {getTypeDisplay(job.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full bg-[--google-blue] text-[--white] hover:bg-[--blue50] focus:ring-[--google-blue] px-4 py-2 text-base cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply
                    </a>
                    {recruiter?.website && (
                      <a
                        href={recruiter.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 px-4 py-2 text-sm cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Company
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Posted: {formatDate(job.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Updated: {formatDate(job.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* No Search Results */}
      {searchQuery && filteredJobs.length === 0 && (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No jobs found
              </h3>
              <p className="text-muted-foreground mb-4">
                No jobs match your search for "{searchQuery}"
              </p>
              <Button
                onClick={clearSearch}
                className="bg-primary hover:bg-primary/90 text-white dark:text-black"
              >
                Clear Search
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Pagination - Only show when not searching */}
      {!searchQuery && (nextPage || previousPage) && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            {previousPage && (
              <Button
                variant="outline"
                onClick={() => handlePageChange(previousPage)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                Previous
              </Button>
            )}
            {nextPage && (
              <Button
                variant="outline"
                onClick={() => handlePageChange(nextPage)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Empty State - Only show when not searching */}
      {!loading && !searchQuery && jobs.length === 0 && (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Image
                src="/images/cfs/smile.svg"
                alt="No jobs"
                width={64}
                height={64}
                className="mb-4 opacity-50"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No jobs available
              </h3>
              <p className="text-muted-foreground">
                Check back later for new opportunities!
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
} 