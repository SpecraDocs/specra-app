import { apiRequest } from "./client";
import type { Organization, OrgMember } from "./types";

export async function getOrgs(): Promise<Organization[]> {
  return apiRequest<Organization[]>("/api/organizations");
}

export async function createOrg(data: {
  name: string;
  slug: string;
}): Promise<Organization> {
  return apiRequest<Organization>("/api/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMembers(orgId: string): Promise<OrgMember[]> {
  return apiRequest<OrgMember[]>(`/api/organizations/${orgId}/members`);
}

export async function inviteMember(
  orgId: string,
  email: string,
  role: string = "member"
): Promise<void> {
  await apiRequest(`/api/organizations/${orgId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export async function removeMember(
  orgId: string,
  memberId: string
): Promise<void> {
  await apiRequest(`/api/organizations/${orgId}/members/${memberId}`, {
    method: "DELETE",
  });
}
