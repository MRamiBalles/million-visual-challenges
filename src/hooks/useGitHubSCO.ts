import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Experiment {
  name: string;
  path: string;
  type: string;
  downloadUrl?: string;
}

interface Engine {
  name: string;
  path: string;
  type: string;
}

interface Commit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
  defaultBranch: string;
}

interface FileContent {
  name: string;
  path: string;
  content: string;
  size: number;
  sha: string;
}

export function useGitHubSCO() {
  const [loading, setLoading] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('github-sco', {
        body: { action: 'list-experiments' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setExperiments(data.experiments || []);
      return data.experiments;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch experiments';
      setError(message);
      toast({
        title: 'Error fetching experiments',
        description: message,
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchEngines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('github-sco', {
        body: { action: 'list-engines' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setEngines(data.engines || []);
      return data.engines;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch engines';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('github-sco', {
        body: { action: 'get-commits' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setCommits(data.commits || []);
      return data.commits;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch commits';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRepoInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('github-sco', {
        body: { action: 'get-repo-info' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setRepoInfo(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch repo info';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFileContent = useCallback(async (path: string): Promise<FileContent | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('github-sco', {
        body: { action: 'get-file', path }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch file';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchExperiments(),
      fetchEngines(),
      fetchCommits(),
      fetchRepoInfo()
    ]);
    setLoading(false);
  }, [fetchExperiments, fetchEngines, fetchCommits, fetchRepoInfo]);

  return {
    loading,
    error,
    experiments,
    engines,
    commits,
    repoInfo,
    fetchExperiments,
    fetchEngines,
    fetchCommits,
    fetchRepoInfo,
    fetchFileContent,
    fetchAll
  };
}
