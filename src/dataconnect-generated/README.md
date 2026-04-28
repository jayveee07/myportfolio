# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPublicProjects*](#listpublicprojects)
  - [*GetMyProfile*](#getmyprofile)
- [**Mutations**](#mutations)
  - [*CreateNewSkill*](#createnewskill)
  - [*UpdateMyProject*](#updatemyproject)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPublicProjects
You can execute the `ListPublicProjects` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPublicProjects(options?: ExecuteQueryOptions): QueryPromise<ListPublicProjectsData, undefined>;

interface ListPublicProjectsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicProjectsData, undefined>;
}
export const listPublicProjectsRef: ListPublicProjectsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPublicProjects(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPublicProjectsData, undefined>;

interface ListPublicProjectsRef {
  ...
  (dc: DataConnect): QueryRef<ListPublicProjectsData, undefined>;
}
export const listPublicProjectsRef: ListPublicProjectsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPublicProjectsRef:
```typescript
const name = listPublicProjectsRef.operationName;
console.log(name);
```

### Variables
The `ListPublicProjects` query has no variables.
### Return Type
Recall that executing the `ListPublicProjects` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPublicProjectsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListPublicProjects`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPublicProjects } from '@dataconnect/generated';


// Call the `listPublicProjects()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPublicProjects();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPublicProjects(dataConnect);

console.log(data.projects);

// Or, you can use the `Promise` API.
listPublicProjects().then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

### Using `ListPublicProjects`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPublicProjectsRef } from '@dataconnect/generated';


// Call the `listPublicProjectsRef()` function to get a reference to the query.
const ref = listPublicProjectsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPublicProjectsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.projects);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

## GetMyProfile
You can execute the `GetMyProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyProfile(options?: ExecuteQueryOptions): QueryPromise<GetMyProfileData, undefined>;

interface GetMyProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyProfileData, undefined>;
}
export const getMyProfileRef: GetMyProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyProfileData, undefined>;

interface GetMyProfileRef {
  ...
  (dc: DataConnect): QueryRef<GetMyProfileData, undefined>;
}
export const getMyProfileRef: GetMyProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyProfileRef:
```typescript
const name = getMyProfileRef.operationName;
console.log(name);
```

### Variables
The `GetMyProfile` query has no variables.
### Return Type
Recall that executing the `GetMyProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyProfile } from '@dataconnect/generated';


// Call the `getMyProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyProfile(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getMyProfile().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetMyProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyProfileRef } from '@dataconnect/generated';


// Call the `getMyProfileRef()` function to get a reference to the query.
const ref = getMyProfileRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyProfileRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewSkill
You can execute the `CreateNewSkill` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewSkill(vars: CreateNewSkillVariables): MutationPromise<CreateNewSkillData, CreateNewSkillVariables>;

interface CreateNewSkillRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewSkillVariables): MutationRef<CreateNewSkillData, CreateNewSkillVariables>;
}
export const createNewSkillRef: CreateNewSkillRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewSkill(dc: DataConnect, vars: CreateNewSkillVariables): MutationPromise<CreateNewSkillData, CreateNewSkillVariables>;

interface CreateNewSkillRef {
  ...
  (dc: DataConnect, vars: CreateNewSkillVariables): MutationRef<CreateNewSkillData, CreateNewSkillVariables>;
}
export const createNewSkillRef: CreateNewSkillRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewSkillRef:
```typescript
const name = createNewSkillRef.operationName;
console.log(name);
```

### Variables
The `CreateNewSkill` mutation requires an argument of type `CreateNewSkillVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewSkillVariables {
  name: string;
}
```
### Return Type
Recall that executing the `CreateNewSkill` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewSkillData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewSkillData {
  skill_insert: Skill_Key;
}
```
### Using `CreateNewSkill`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewSkill, CreateNewSkillVariables } from '@dataconnect/generated';

// The `CreateNewSkill` mutation requires an argument of type `CreateNewSkillVariables`:
const createNewSkillVars: CreateNewSkillVariables = {
  name: ..., 
};

// Call the `createNewSkill()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewSkill(createNewSkillVars);
// Variables can be defined inline as well.
const { data } = await createNewSkill({ name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewSkill(dataConnect, createNewSkillVars);

console.log(data.skill_insert);

// Or, you can use the `Promise` API.
createNewSkill(createNewSkillVars).then((response) => {
  const data = response.data;
  console.log(data.skill_insert);
});
```

### Using `CreateNewSkill`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewSkillRef, CreateNewSkillVariables } from '@dataconnect/generated';

// The `CreateNewSkill` mutation requires an argument of type `CreateNewSkillVariables`:
const createNewSkillVars: CreateNewSkillVariables = {
  name: ..., 
};

// Call the `createNewSkillRef()` function to get a reference to the mutation.
const ref = createNewSkillRef(createNewSkillVars);
// Variables can be defined inline as well.
const ref = createNewSkillRef({ name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewSkillRef(dataConnect, createNewSkillVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.skill_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.skill_insert);
});
```

## UpdateMyProject
You can execute the `UpdateMyProject` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateMyProject(vars: UpdateMyProjectVariables): MutationPromise<UpdateMyProjectData, UpdateMyProjectVariables>;

interface UpdateMyProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyProjectVariables): MutationRef<UpdateMyProjectData, UpdateMyProjectVariables>;
}
export const updateMyProjectRef: UpdateMyProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMyProject(dc: DataConnect, vars: UpdateMyProjectVariables): MutationPromise<UpdateMyProjectData, UpdateMyProjectVariables>;

interface UpdateMyProjectRef {
  ...
  (dc: DataConnect, vars: UpdateMyProjectVariables): MutationRef<UpdateMyProjectData, UpdateMyProjectVariables>;
}
export const updateMyProjectRef: UpdateMyProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMyProjectRef:
```typescript
const name = updateMyProjectRef.operationName;
console.log(name);
```

### Variables
The `UpdateMyProject` mutation requires an argument of type `UpdateMyProjectVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateMyProject` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMyProjectData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMyProjectData {
  project_update?: Project_Key | null;
}
```
### Using `UpdateMyProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMyProject, UpdateMyProjectVariables } from '@dataconnect/generated';

// The `UpdateMyProject` mutation requires an argument of type `UpdateMyProjectVariables`:
const updateMyProjectVars: UpdateMyProjectVariables = {
  projectId: ..., 
  title: ..., // optional
  description: ..., // optional
  isPublic: ..., // optional
  liveUrl: ..., // optional
  repoUrl: ..., // optional
  thumbnailUrl: ..., // optional
  projectType: ..., // optional
};

// Call the `updateMyProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMyProject(updateMyProjectVars);
// Variables can be defined inline as well.
const { data } = await updateMyProject({ projectId: ..., title: ..., description: ..., isPublic: ..., liveUrl: ..., repoUrl: ..., thumbnailUrl: ..., projectType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMyProject(dataConnect, updateMyProjectVars);

console.log(data.project_update);

// Or, you can use the `Promise` API.
updateMyProject(updateMyProjectVars).then((response) => {
  const data = response.data;
  console.log(data.project_update);
});
```

### Using `UpdateMyProject`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMyProjectRef, UpdateMyProjectVariables } from '@dataconnect/generated';

// The `UpdateMyProject` mutation requires an argument of type `UpdateMyProjectVariables`:
const updateMyProjectVars: UpdateMyProjectVariables = {
  projectId: ..., 
  title: ..., // optional
  description: ..., // optional
  isPublic: ..., // optional
  liveUrl: ..., // optional
  repoUrl: ..., // optional
  thumbnailUrl: ..., // optional
  projectType: ..., // optional
};

// Call the `updateMyProjectRef()` function to get a reference to the mutation.
const ref = updateMyProjectRef(updateMyProjectVars);
// Variables can be defined inline as well.
const ref = updateMyProjectRef({ projectId: ..., title: ..., description: ..., isPublic: ..., liveUrl: ..., repoUrl: ..., thumbnailUrl: ..., projectType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMyProjectRef(dataConnect, updateMyProjectVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.project_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.project_update);
});
```

