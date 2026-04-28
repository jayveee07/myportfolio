import { ListPublicProjectsData, GetMyProfileData, CreateNewSkillData, CreateNewSkillVariables, UpdateMyProjectData, UpdateMyProjectVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListPublicProjects(options?: useDataConnectQueryOptions<ListPublicProjectsData>): UseDataConnectQueryResult<ListPublicProjectsData, undefined>;
export function useListPublicProjects(dc: DataConnect, options?: useDataConnectQueryOptions<ListPublicProjectsData>): UseDataConnectQueryResult<ListPublicProjectsData, undefined>;

export function useGetMyProfile(options?: useDataConnectQueryOptions<GetMyProfileData>): UseDataConnectQueryResult<GetMyProfileData, undefined>;
export function useGetMyProfile(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyProfileData>): UseDataConnectQueryResult<GetMyProfileData, undefined>;

export function useCreateNewSkill(options?: useDataConnectMutationOptions<CreateNewSkillData, FirebaseError, CreateNewSkillVariables>): UseDataConnectMutationResult<CreateNewSkillData, CreateNewSkillVariables>;
export function useCreateNewSkill(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewSkillData, FirebaseError, CreateNewSkillVariables>): UseDataConnectMutationResult<CreateNewSkillData, CreateNewSkillVariables>;

export function useUpdateMyProject(options?: useDataConnectMutationOptions<UpdateMyProjectData, FirebaseError, UpdateMyProjectVariables>): UseDataConnectMutationResult<UpdateMyProjectData, UpdateMyProjectVariables>;
export function useUpdateMyProject(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateMyProjectData, FirebaseError, UpdateMyProjectVariables>): UseDataConnectMutationResult<UpdateMyProjectData, UpdateMyProjectVariables>;
