export interface Project {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  status: "QUEUED" | "BUILDING" | "DEPLOYING" | "RUNNING" | "FAILED" | "CANCELLED";
  trigger: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface OrgMember {
  id: string;
  userId: string;
  email: string;
  name?: string;
  image?: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface AuthVerifyResponse {
  id: string;
  email: string;
  name?: string;
  image?: string;
}
