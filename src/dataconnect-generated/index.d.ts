import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewSkillData {
  skill_insert: Skill_Key;
}

export interface CreateNewSkillVariables {
  name: string;
}

export interface GetMyProfileData {
  user?: {
    id: UUIDString;
    displayName: string;
    email: string;
    bio?: string | null;
    photoUrl?: string | null;
    resumeUrl?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    websiteUrl?: string | null;
    createdAt: TimestampString;
    userSkills_on_user: ({
      skill: {
        name: string;
      };
    })[];
      projects_on_user: ({
        id: UUIDString;
        title: string;
        description: string;
        isPublic: boolean;
        thumbnailUrl?: string | null;
      } & Project_Key)[];
  } & User_Key;
}

export interface ListPublicProjectsData {
  projects: ({
    id: UUIDString;
    title: string;
    description: string;
    thumbnailUrl?: string | null;
    liveUrl?: string | null;
    repoUrl?: string | null;
    projectType?: string | null;
    createdAt: TimestampString;
    user?: {
      displayName: string;
    };
      projectImages_on_project: ({
        imageUrl: string;
        caption?: string | null;
        displayOrder?: number | null;
      })[];
        skills_via_ProjectSkill: ({
          name: string;
        })[];
  } & Project_Key)[];
}

export interface ProjectImage_Key {
  id: UUIDString;
  __typename?: 'ProjectImage_Key';
}

export interface ProjectSkill_Key {
  projectId: UUIDString;
  skillId: UUIDString;
  __typename?: 'ProjectSkill_Key';
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Skill_Key {
  id: UUIDString;
  __typename?: 'Skill_Key';
}

export interface UpdateMyProjectData {
  project_update?: Project_Key | null;
}

export interface UpdateMyProjectVariables {
  projectId: UUIDString;
  title?: string | null;
  description?: string | null;
  isPublic?: boolean | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  thumbnailUrl?: string | null;
  projectType?: string | null;
}

export interface UserSkill_Key {
  userId: UUIDString;
  skillId: UUIDString;
  __typename?: 'UserSkill_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListPublicProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPublicProjectsData, undefined>;
  operationName: string;
}
export const listPublicProjectsRef: ListPublicProjectsRef;

export function listPublicProjects(options?: ExecuteQueryOptions): QueryPromise<ListPublicProjectsData, undefined>;
export function listPublicProjects(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPublicProjectsData, undefined>;

interface GetMyProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyProfileData, undefined>;
  operationName: string;
}
export const getMyProfileRef: GetMyProfileRef;

export function getMyProfile(options?: ExecuteQueryOptions): QueryPromise<GetMyProfileData, undefined>;
export function getMyProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyProfileData, undefined>;

interface CreateNewSkillRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewSkillVariables): MutationRef<CreateNewSkillData, CreateNewSkillVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewSkillVariables): MutationRef<CreateNewSkillData, CreateNewSkillVariables>;
  operationName: string;
}
export const createNewSkillRef: CreateNewSkillRef;

export function createNewSkill(vars: CreateNewSkillVariables): MutationPromise<CreateNewSkillData, CreateNewSkillVariables>;
export function createNewSkill(dc: DataConnect, vars: CreateNewSkillVariables): MutationPromise<CreateNewSkillData, CreateNewSkillVariables>;

interface UpdateMyProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyProjectVariables): MutationRef<UpdateMyProjectData, UpdateMyProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMyProjectVariables): MutationRef<UpdateMyProjectData, UpdateMyProjectVariables>;
  operationName: string;
}
export const updateMyProjectRef: UpdateMyProjectRef;

export function updateMyProject(vars: UpdateMyProjectVariables): MutationPromise<UpdateMyProjectData, UpdateMyProjectVariables>;
export function updateMyProject(dc: DataConnect, vars: UpdateMyProjectVariables): MutationPromise<UpdateMyProjectData, UpdateMyProjectVariables>;

