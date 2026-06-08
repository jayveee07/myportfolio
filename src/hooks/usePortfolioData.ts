import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExperience, getSkills, getEducation, getProjects,
  getTestimonials, getAllTestimonials, approveTestimonial, deleteTestimonial,
  getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost,
  getProfile,
} from '../lib/supabase-data';
import type { Experience, SkillGroup, Education, Project, Testimonial, BlogPost, Profile } from '../types/portfolio';

export const useProfile = () =>
  useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 2,
  });

export const useExperience = () =>
  useQuery<Experience[]>({
    queryKey: ['experience'],
    queryFn: getExperience,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 2,
  });

export const useSkills = () =>
  useQuery<SkillGroup[]>({
    queryKey: ['skills'],
    queryFn: getSkills,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 2,
  });

export const useEducation = () =>
  useQuery<Education[]>({
    queryKey: ['education'],
    queryFn: getEducation,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 2,
  });

export const useProjects = () =>
  useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 2,
  });

export const useTestimonials = () =>
  useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: getTestimonials,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 2,
  });

export const useAllTestimonials = () =>
  useQuery<Testimonial[]>({
    queryKey: ['testimonials', 'all'],
    queryFn: getAllTestimonials,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 2,
  });

export const useApproveTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'all'] });
    },
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials', 'all'] });
    },
  });
};

export const useBlogPosts = () =>
  useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: getBlogPosts,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 2,
  });

export const useBlogPost = (id: string | undefined) =>
  useQuery<BlogPost | null>({
    queryKey: ['blog-post', id],
    queryFn: () => getBlogPostById(id!),
    enabled: !!id,
    staleTime: 10 * 1000,
    retry: 2,
  });

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, post }: { id: string; post: Partial<BlogPost> }) => updateBlogPost(id, post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });
};
