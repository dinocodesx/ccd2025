"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ExternalLink, MapPin, Clock, Briefcase, Calendar, Building2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  fresher: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
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
  const [count, setCount] = useState(0); // Track total jobs count
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Store all jobs for filtering
  const [recruiters, setRecruiters] = useState<Record<number, Recruiter>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const topRef = useRef<HTMLDivElement>(null);

  // Add filter state
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [experienceFilter, setExperienceFilter] = useState<string>("");

  // Unique options for filters (from jobs data)
  const locationOptions = Array.from(new Set(jobs.map(j => j.location))).filter(Boolean);
  const experienceOptions = Array.from(new Set(jobs.map(j => j.experience_level))).filter(Boolean);

  const PAGE_SIZE = 20;

  // Fetch all recruiters in one go
  const fetchAllRecruiters = async () => {
    try {
      const response = await fetch("/api/recruiters", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch recruiters");
      }
      const data = await response.json();
      // Map recruiters by id
      const recruiterMap: Record<number, Recruiter> = {};
      data.results.forEach((rec: Recruiter) => {
        recruiterMap[rec.id] = rec;
      });
      setRecruiters(recruiterMap);
    } catch (err) {
      // Optionally handle recruiter fetch error
      setRecruiters({});
    }
  };

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      // Build URL with only the page param
      let url = "/api/jobs";
      if (page > 1) {
        url += `?page=${page}`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data: JobsResponse = await response.json();
      setCount(data.count);
      setJobs(data.results);
      setAllJobs(data.results); // Store all jobs for filtering
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search query and filters
  const filteredJobs = allJobs.filter(job => {
    if (!searchQuery.trim() && !locationFilter && !experienceFilter) return true;

    const query = searchQuery.toLowerCase();
    const recruiter = recruiters[job.recruiter];

    // Search in job title
    if (searchQuery && job.title.toLowerCase().includes(query)) return true;
    // Search in company name
    if (searchQuery && recruiter?.company_name.toLowerCase().includes(query)) return true;
    // Search in recruiter name
    if (searchQuery && recruiter?.name?.toLowerCase().includes(query)) return true;
    // Search in experience level
    if (searchQuery && job.experience_level.toLowerCase().includes(query)) return true;
    // Search in location
    if (searchQuery && job.location.toLowerCase().includes(query)) return true;
    // Search in job type
    if (searchQuery && job.type.toLowerCase().includes(query)) return true;

    // Filter by location
    if (locationFilter && job.location !== locationFilter) return false;
    // Filter by experience
    if (experienceFilter && job.experience_level !== experienceFilter) return false;

    // If no search, but filters match
    if (!searchQuery && (!locationFilter || job.location === locationFilter) && (!experienceFilter || job.experience_level === experienceFilter)) return true;

    return false;
  });

  // On mount, set state from URL params and fetch jobs for that page
  useEffect(() => {
    const pageParam = searchParams?.get("page");
    const searchParam = searchParams?.get("search");
    const locationParam = searchParams?.get("location");
    const experienceParam = searchParams?.get("experience");
    let initialPage = 1;
    if (pageParam) {
      setCurrentPage(Number(pageParam));
      initialPage = Number(pageParam);
    }
    if (searchParam) setSearchQuery(searchParam);
    if (locationParam) setLocationFilter(locationParam);
    if (experienceParam) setExperienceFilter(experienceParam);
    fetchAllRecruiters();
    fetchJobs(initialPage);
  }, []);

  // Update URL params when page, search, or filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (currentPage > 1) {
      params.set("page", String(currentPage));
    } else {
      params.delete("page");
    }
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    if (locationFilter) {
      params.set("location", locationFilter);
    } else {
      params.delete("location");
    }
    if (experienceFilter) {
      params.set("experience", experienceFilter);
    } else {
      params.delete("experience");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [currentPage, searchQuery, locationFilter, experienceFilter]);

  // Reset to first page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [locationFilter, experienceFilter]);

  // Helper to extract page number from a URL
  const getPageFromUrl = (url: string | null): number | undefined => {
    if (!url) return undefined;
    try {
      const u = new URL(url, window.location.origin);
      const page = u.searchParams.get("page");
      return page ? parseInt(page, 10) : undefined;
    } catch {
      return undefined;
    }
  };

  // Pagination handlers
  const handlePageChange = (targetUrl: string | null, pageOverride?: number) => {
    let page = pageOverride;
    if (!page && targetUrl) {
      page = getPageFromUrl(targetUrl);
    }
    if (typeof page === 'number' && !isNaN(page)) {
      setCurrentPage(page);
      fetchJobs(page);
      // Scroll to top of jobs list after page change
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page on new search
    setCurrentPage(1);
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
            <GeminiIcon className="animate-spin invert dark:invert-0 size-6" />
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
      <div ref={topRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">Job Opportunities</h2>
         
          <p className="text-muted-foreground">
            Discover exciting career opportunities in the tech industry.
            <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-100 dark:border-blue-800">
              <svg className="w-3 h-3 mr-1 text-blue-400 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 016 6c0 3.866-3.582 7.418-5.293 8.995a1 1 0 01-1.414 0C7.582 15.418 4 11.866 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
              Available jobs: {count}
            </span>
          </div>
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
        <label htmlFor="location-filter" className="block text-xs font-medium text-muted-foreground mb-1">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search jobs by title, company, experience level, location, or type..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--google-blue] focus:border-google-blue dark:border-gray-600 dark:bg-[#131313] dark:text-white"
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

      {/* Filters - always side by side, wrap on small screens */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2 mb-4 max-w-2xl">
        <div className="max-w-sm">
          <label htmlFor="location-filter" className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
          <select
            id="location-filter"
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="w-full  px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#131313] text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[--google-blue]"
          >
            <option value="">All</option>
            {locationOptions.map(loc => (
              <option key={loc} value={loc}>{getLocationDisplay(loc)}</option>
            ))}
          </select>
        </div>
        <div className="max-w-sm">
          <label htmlFor="experience-filter" className="block text-xs font-medium text-muted-foreground mb-1">Experience</label>
          <select
            id="experience-filter"
            value={experienceFilter}
            onChange={e => setExperienceFilter(e.target.value)}
            className="w-full  px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#131313] text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[--google-blue]"
          >
            <option value="">All</option>
            {experienceOptions.map(exp => (
              <option key={exp} value={exp}>{getExperienceLevelDisplay(exp)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const recruiter = recruiters[job.recruiter];

          return (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                      {recruiter?.logo && (
                        <div className="flex-shrink-0 mb-2 sm:mb-0">
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
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 break-words">
                          {job.title}
                        </h3>
                        {recruiter && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-muted-foreground mb-2">
                            <div className="flex items-start md:items-center gap-1 text-base">
                              <Building2 className="w-4 h-4 mt-1" />
                              <span className="font-medium break-words">{recruiter.company_name}</span>
                            </div>
                            {recruiter.name && (
                              <div className="flex items-center gap-1">
                                <span className="hidden sm:inline">•</span>
                                <span>Posted by {recruiter.name}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-xs font-medium ${experienceLevelColors[job.experience_level as keyof typeof experienceLevelColors] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
                      >
                        {getExperienceLevelDisplay(job.experience_level)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-xs font-medium ${locationColors[job.location as keyof typeof locationColors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"}`}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {getLocationDisplay(job.location)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-xs font-medium ${typeColors[job.type as keyof typeof typeColors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"}`}
                      >
                        <Briefcase className="w-3 h-3 mr-1" />
                        {getTypeDisplay(job.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2  bg-foreground text-background w-full sm:w-auto text-sm sm:text-base py-3 sm:py-2 px-4 shadow-lg ring-0"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply
                    </a>

                  </div>
                </div>
              </CardHeader>
              <CardBody className="hidden sm:inline-block">
                <div className="hidden sm:flex flex-row sm:items-center  text-sm text-muted-foreground gap-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Posted: {formatDate(job.created_at)}</span>
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
      {!searchQuery && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-2">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Showing page {currentPage} of {totalPages} ({count} job{count !== 1 ? 's' : ''})
          </div>
          <div className="flex items-center gap-2 ">
            {/* Previous page button with arrow */}
            {previousPage && (
              <Button
                variant="outline"
                onClick={() => handlePageChange(previousPage)}
                disabled={loading || currentPage === 1}
                className="flex items-center gap-2 px-2"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {/* Page number boxes */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                onClick={() => handlePageChange(null, pageNum)}
                disabled={loading || pageNum === currentPage}
                className={`px-3 py-1 rounded border text-sm font-medium transition-colors
                  ${pageNum === currentPage
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
                `}
                aria-current={pageNum === currentPage ? "page" : undefined}
              >
                {pageNum}
              </Button>
            ))}
            {/* Next page button with arrow */}
            {nextPage && (
              <Button
                variant="outline"
                onClick={() => handlePageChange(nextPage)}
                disabled={loading || currentPage === totalPages}
                className="flex items-center gap-2 px-2"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
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