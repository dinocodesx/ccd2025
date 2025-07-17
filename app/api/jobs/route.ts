import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JOBS_DJANGO_URL } from "@/lib/constants/be";
import bkFetch from "@/services/backend.services";
import { headers } from "next/headers";
export interface Root {
  jobs: Job[]
  branches: Branch[]
  job_roles: JobRole[]
}

export interface Job {
  id: number
  title: string
  description: string
  no_of_openings: any
  job_type: number
  status: number
  position_level: any
  ctc_details: any
  deleted: boolean
  closing_date: any
  created_at: string
  show_position_in_portal: any
  url: string
  unique_id: string
  show_ctc_in_portal: any
  remote: boolean
  skip_assign_requisition_for_applicants: any
  branch_id: number
  jt_job_id: any
  custom_field_attributes: CustomFieldAttributes
  preferred_remote_job_locations: string
  job_role_id: number
}

export interface CustomFieldAttributes { }

export interface Branch {
  id: number
  account_id: number
  name: string
  street: any
  city: string
  state?: string
  country_code: string
  zip?: string
  time_zone: string
  contact_info: ContactInfo
  currency?: string
  main_office: boolean
  deleted: boolean
  language?: string
  holiday_list: any[]
  location: string
  date_format: string
}

export interface ContactInfo { }

export interface JobRole {
  id: number
  name: string
  deleted: boolean
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.access) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Construct the full URL with query parameters
    const jobsUrl = queryString
      ? `${JOBS_DJANGO_URL}?${queryString}`
      : JOBS_DJANGO_URL;

    const response = await bkFetch(jobsUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch jobs" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Jobs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// export async function POST(request: NextRequest) {
//   try {

//     // Get query parameters from the request
//     const { searchParams } = new URL(request.url);
//     const queryString = searchParams.toString();

//     // Construct the full URL with query parameters
//     const jobsUrl = queryString
//       ? `${JOBS_DJANGO_URL}?${queryString}`
//       : JOBS_DJANGO_URL;


//       const data = [

//         {
//             "title": ".Net Core Developer-Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=uKhe8SLIAjOz",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Azure Data Engineer",
//             "link": "https://www.indusnet.co.in/career/?jobId=G4Vbq3AH049p",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Azure Integration Services",
//             "link": "https://www.indusnet.co.in/career/?jobId=Bm9l8HtYRGLP",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Backend Developer (Golang)",
//             "link": "https://www.indusnet.co.in/career/?jobId=sFW1Hc5nI1Pf",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Backend Tech Lead(GoLang)",
//             "link": "https://www.indusnet.co.in/career/?jobId=Oz87hBCghhCb",
//             "experience_level": "senior",
//             "location": "hybrid",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Business Analyst",
//             "link": "https://www.indusnet.co.in/career/?jobId=l4tIh9VdoAoh",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Business Analyst_Pune",
//             "link": "https://www.indusnet.co.in/career/?jobId=GvjYSkZPinx_",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Business Development Manager",
//             "link": "https://www.indusnet.co.in/career/?jobId=UDijegO1unW9",
//             "experience_level": "senior",
//             "location": "hybrid",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Business Development Manager (Mumbai)",
//             "link": "https://www.indusnet.co.in/career/?jobId=VWbnYg-LmNtl",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Confluence Administrator",
//             "link": "https://www.indusnet.co.in/career/?jobId=CWsIa5ZmQpaj",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Consulting Business Partner",
//             "link": "https://www.indusnet.co.in/career/?jobId=3H_N-clLiOdb",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Consulting Business Representative",
//             "link": "https://www.indusnet.co.in/career/?jobId=bBtodN8Z8U8S",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Consulting Business Representative",
//             "link": "https://www.indusnet.co.in/career/?jobId=EriZ7e_M355r",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Consulting Business Representative-Breeze Sales",
//             "link": "https://www.indusnet.co.in/career/?jobId=mvGQ4qaWatgT",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Data Analyst (Power BI)_Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=9GQBC78v9oz_",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Data Analyst_Pune",
//             "link": "https://www.indusnet.co.in/career/?jobId=bVNwCA-MbcNc",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Database Administrator",
//             "link": "https://www.indusnet.co.in/career/?jobId=LRrMk1HvKPvj",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "DevOps Engineer",
//             "link": "https://www.indusnet.co.in/career/?jobId=VwdF42nz70qu",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Dot Net Developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=egIJJOjcL7ii",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Dot Net Developer - Mid-level",
//             "link": "https://www.indusnet.co.in/career/?jobId=jh4ZKsQyVrpQ",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Drupal Developer_Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=oM5PPgM9U46l",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Front End Developer (Remote)",
//             "link": "https://www.indusnet.co.in/career/?jobId=7EKvLuRmJU66",
//             "experience_level": "mid",
//             "location": "remote",
//             "type": "contract",
//             "recruiter": 9
//         },
//         {
//             "title": "Full-Stack Developer (WordPress + Shopify)",
//             "link": "https://www.indusnet.co.in/career/?jobId=fxWtu8dup9-d",
//             "experience_level": "senior",
//             "location": "remote",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Fullstack Developer (JAVA + Angular)",
//             "link": "https://www.indusnet.co.in/career/?jobId=8f50xLlelokF",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Fullstack Developer (MERN)",
//             "link": "https://www.indusnet.co.in/career/?jobId=SxyLd2zWEpIE",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Generative AI Engineer",
//             "link": "https://www.indusnet.co.in/career/?jobId=qPnAlPlSYuAm",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Java Developer-Pune",
//             "link": "https://www.indusnet.co.in/career/?jobId=5wphfajctwaO",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Java Fullstack Developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=sNzKoQTFfih4",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Java Lead",
//             "link": "https://www.indusnet.co.in/career/?jobId=Xf9b7uFhGH-e",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Jr. Software Engineer - Node.JS and Strapi",
//             "link": "https://www.indusnet.co.in/career/?jobId=E-2P8veADlG1",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Linux Engineer",
//             "link": "https://www.indusnet.co.in/career/?jobId=QHBmqYNYuFye",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Microsoft 365 Cloud Engineer",
//             "link": "https://www.indusnet.co.in/career/?jobId=s0074_MTxcZl",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Mobile Application Developer_Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=6_JLvMKwmbKp",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "MSOC - IT & Network Security Engineer",
//             "link": "https://www.indusnet.co.in/career/?jobId=Eumkq1jRcW3i",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "NodeJs Developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=kaC-PX3Np-ai",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "PHP Lead - Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=hA6iT0sR_oEj",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "PL SQL Developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=bboG0jtEPUbJ",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Power BI",
//             "link": "https://www.indusnet.co.in/career/?jobId=4e6eGcN9dSd1",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "powerApps Tester",
//             "link": "https://www.indusnet.co.in/career/?jobId=stOOnGkL8qxz",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Process Manager (Quality)",
//             "link": "https://www.indusnet.co.in/career/?jobId=5YA2CpP2Kaob",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Project Manager",
//             "link": "https://www.indusnet.co.in/career/?jobId=dQSH9UDT9bAB",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Project Manager (Technical)_Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=2ymHkiURnZKG",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Quality Engineer - Automation Testing",
//             "link": "https://www.indusnet.co.in/career/?jobId=fc0axe21pg8G",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "React Native Developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=ulUn6Bt6Bdb9",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Sales Development Representative",
//             "link": "https://www.indusnet.co.in/career/?jobId=egFv6HuEp0DD",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Sales Operations Manager",
//             "link": "https://www.indusnet.co.in/career/?jobId=R-hDwi_NKy0H",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Senior Blockchain/Backend Developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=hkeSgrHoJYJ6",
//             "experience_level": "senior",
//             "location": "hybrid",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Senior Dot Net Core Developer_Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=u68sVyef9Jf2",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Senior Fullstack Backend Developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=60vTBmJRnZqJ",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Senior Springboot Developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=h6D8YXGrriUj",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Sharepoint developer",
//             "link": "https://www.indusnet.co.in/career/?jobId=HnWLB2Y2NIwv",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Sharepoint Server Engineer",
//             "link": "https://www.indusnet.co.in/career/?jobId=mgi6VGEYPp9h",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Sitecore Consultant",
//             "link": "https://www.indusnet.co.in/career/?jobId=hp8wHUzFfs_6",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Software Developer - Dot Net Core (Kolkata)",
//             "link": "https://www.indusnet.co.in/career/?jobId=sVOGp7uVWpi_",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Sr UI UX Designer",
//             "link": "https://www.indusnet.co.in/career/?jobId=faYhEAWCBDaQ",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Sr. .Net Developer/Technical Lead - .NET",
//             "link": "https://www.indusnet.co.in/career/?jobId=7zHa5Gs5cdHS",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Sr. Sales Account Managers",
//             "link": "https://www.indusnet.co.in/career/?jobId=LwwqRrzgC93c",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Tech Lead/Principal Engineer, Backend",
//             "link": "https://www.indusnet.co.in/career/?jobId=nZkR-KRYW0K8",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Technical Lead - Dot Net - Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=bpyoryrzsd6H",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Technical Project Manager - Kolkata",
//             "link": "https://www.indusnet.co.in/career/?jobId=BylQJumfrfpf",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Techno Functional Project Coordinator",
//             "link": "https://www.indusnet.co.in/career/?jobId=t9_c58s2cwSB",
//             "experience_level": "senior",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         },
//         {
//             "title": "Video Editor",
//             "link": "https://www.indusnet.co.in/career/?jobId=uYUXvjQajEd4",
//             "experience_level": "mid",
//             "location": "onsite",
//             "type": "full_time",
//             "recruiter": 9
//         }
//     ]

//     try {
//       const res = await Promise.all(
//         data.map(async d => {
//           const res = await bkFetch(jobsUrl, {
//             method: "POST",
//             body: JSON.stringify(d),
//             headers:{
              
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyODMxMTM5LCJpYXQiOjE3NTI3NDQ3MzksImp0aSI6IjkxYjhlMTJlNDNjZDQ3MTdiOTBhZjc2MWM5YzFkNjhjIiwidXNlcl9pZCI6MzkwfQ.z_XtPtWz8_C3G-t9DYcu8pt2Pi14wXBW0l-udU5z6jE`,
//                 'Accept': 'application/json',
//                 // Add other headers as needed
            
//             }
//           });
//           return await res.json();
//         })
//       );
//       return NextResponse.json(res);
//     } catch (err) {
//       console.error("Error posting jobs:", err);
//       return NextResponse.json({ error: "Failed to post jobs" }, { status: 500 });
//     }
//   } catch (error) {
//     console.error("Jobs API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// } 